import { getD1, getEmailConfig } from '@/db';
import { deliverEmail } from './email-delivery';
import { SITE_ORIGIN } from './site-origin';

export function notificationStatements(tenantId: string, entityId: string, reference: string, kind: 'application' | 'inquiry', email: string, language: string, now: string) {
  const db = getD1();
  const es = language !== 'en';
  const name = kind === 'application' ? 'candidato' : 'empresa';
  const teamText = `Nueva solicitud de ${name}. Folio: ${reference}.\nRevisa los datos en el portal privado: ${SITE_ORIGIN}/portal`;
  const customerText = es
    ? `Recibimos tu solicitud en Multiservices Laredo.\nFolio: ${reference}.\nEl equipo revisará tu información. Esta confirmación no garantiza contratación ni disponibilidad de servicio.`
    : `Multiservices Laredo received your request.\nReference: ${reference}.\nOur team will review your information. This confirmation does not guarantee employment or service availability.`;
  return [
    db.prepare(`INSERT INTO notifications (id, tenant_id, entity_id, recipient, subject, body, status, created_at)
      SELECT ?, ?, ?, contact_email, ?, ?, 'pending', ? FROM site_settings WHERE tenant_id = ?`)
      .bind(`${entityId}-team`, tenantId, entityId, `Nueva solicitud ${reference}`, teamText, now, tenantId),
    db.prepare(`INSERT INTO notifications (id, tenant_id, entity_id, recipient, subject, body, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`)
      .bind(`${entityId}-receipt`, tenantId, entityId, email, es ? `Recibimos tu solicitud ${reference}` : `Request received ${reference}`, customerText, now),
  ];
}

export async function flushNotifications(tenantId: string, entityId?: string) {
  const config = getEmailConfig();
  if (!config) return;
  const db = getD1();
  // An interrupted attempt is not automatically resent after the provider's 24h
  // idempotency window, since its delivery outcome may be unknown.
  await db.prepare(`UPDATE notifications SET status = 'review' WHERE tenant_id = ? AND status = 'sending' AND first_attempt_at < ?`)
    .bind(tenantId, new Date(Date.now() - 23 * 3600_000).toISOString()).run();
  const candidates = await db.prepare(`SELECT id FROM notifications WHERE tenant_id = ?
    AND (status = 'pending' OR (status = 'sending' AND attempted_at < ? AND first_attempt_at >= ?))
    AND (? IS NULL OR entity_id = ?) ORDER BY created_at LIMIT 4`)
    .bind(tenantId, new Date(Date.now() - 60_000).toISOString(), new Date(Date.now() - 23 * 3600_000).toISOString(), entityId ?? null, entityId ?? null).all<{ id: string }>();
  for (const item of candidates.results) {
    const now = new Date().toISOString();
    const row = await db.prepare(`UPDATE notifications SET status = 'sending', attempted_at = ?, first_attempt_at = COALESCE(first_attempt_at, ?)
      WHERE id = ? AND tenant_id = ? AND (status = 'pending' OR (status = 'sending' AND attempted_at < ?))
      RETURNING id, recipient, subject, body`)
      .bind(now, now, item.id, tenantId, new Date(Date.now() - 60_000).toISOString())
      .first<{ id: string; recipient: string; subject: string; body: string }>();
    if (!row) continue;
    try {
      const providerId = await deliverEmail(config, { to: row.recipient, subject: row.subject, text: row.body }, `msl-${row.id}`);
      await db.prepare(`UPDATE notifications SET status = 'accepted', provider_id = ?, accepted_at = ?, body = '' WHERE id = ? AND tenant_id = ?`)
        .bind(providerId, new Date().toISOString(), row.id, tenantId).run();
    } catch {
      // Keep the same immutable payload and key for safe retries.
      console.error('notification_attempt_failed');
    }
  }
}

export async function tryNotifications(tenantId: string, entityId: string) {
  try { await flushNotifications(tenantId, entityId); } catch { console.error('notification_queue_unavailable'); }
}
