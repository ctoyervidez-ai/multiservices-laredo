// Apply the owner's requested data change once. The audit marker preserves
// any later contact edits made through the portal, including across deploys.
export async function applyContactEmailUpdate(database: D1Database, tenantId: string, email: string, now: string) {
  const updateId = `contact-email-vacantes-2026-09-03:${tenantId}`;
  await database.batch([
    database.prepare(`UPDATE site_settings SET contact_email = ?, updated_at = ?
      WHERE tenant_id = ? AND NOT EXISTS (SELECT 1 FROM audit_logs WHERE id = ?)`)
      .bind(email, now, tenantId, updateId),
    database.prepare(`INSERT OR IGNORE INTO audit_logs
      (id, tenant_id, actor_id, actor_email, action, entity_type, entity_id, summary, created_at)
      SELECT ?, tenant_id, NULL, ?, 'settings.contact_updated', 'site_settings', tenant_id, ?, ?
      FROM site_settings WHERE tenant_id = ?`)
      .bind(updateId, 'system', 'Actualizó el correo de contacto por solicitud del propietario', now, tenantId),
  ]);
}
