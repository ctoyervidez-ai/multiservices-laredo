import { ensureDatabase, getD1, getEmailConfig } from '@/db';
import { getPortalIdentityFromCookie } from '@/lib/portal-auth';
import { getPortalContext } from '@/lib/site-repository';
import { flushNotifications } from '@/lib/notifications';
import { jsonWithLimit, validateBrowserMutation } from '@/lib/request-security';

export const dynamic = 'force-dynamic';
const respond = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
async function authorize(request: Request) {
  await ensureDatabase();
  const identity = await getPortalIdentityFromCookie(request.headers.get('cookie'), new URL(request.url).host);
  const context = await getPortalContext(identity);
  return context?.authorized && context.role === 'owner' ? context : null;
}

export async function GET(request: Request) {
  try {
    const context = await authorize(request);
    if (!context) return respond({ error: 'Se requiere acceso de administrador.' }, 403);
    const db = getD1(), tenant = context.tenantId;
    const since = new Date(Date.now() - 29 * 86400_000).toISOString().slice(0, 10);
    const [inquiries, metrics, submissions, notifications] = await Promise.all([
      db.prepare(`SELECT id, reference, full_name AS fullName, company, phone, email, need, message, status, updated_at AS updatedAt, created_at AS createdAt
        FROM inquiries WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 200`).bind(tenant).all(),
      db.prepare('SELECT event, SUM(count) AS total FROM daily_metrics WHERE tenant_id = ? AND day >= ? GROUP BY event').bind(tenant, since).all(),
      db.prepare(`SELECT 'applications' AS kind, COUNT(*) AS total FROM applications WHERE tenant_id = ? AND created_at >= ?
        UNION ALL SELECT 'inquiries', COUNT(*) FROM inquiries WHERE tenant_id = ? AND created_at >= ?`).bind(tenant, since, tenant, since).all(),
      db.prepare('SELECT status, COUNT(*) AS total FROM notifications WHERE tenant_id = ? GROUP BY status').bind(tenant).all(),
    ]);
    return respond({ inquiries: inquiries.results, metrics: metrics.results, submissions: submissions.results, notifications: notifications.results, emailConfigured: Boolean(getEmailConfig()), since });
  } catch { return respond({ error: 'No pudimos cargar la información.' }, 503); }
}

export async function POST(request: Request) {
  if (!validateBrowserMutation(request, 'application/json')) return respond({ error: 'Solicitud no permitida.' }, 403);
  try {
    const data = await jsonWithLimit<{ action?: string; id?: string; status?: string; expectedUpdatedAt?: string }>(request, 4096);
    if (!data || typeof data !== 'object') return respond({ error: 'Solicitud inválida.' }, 400);
    const context = await authorize(request);
    if (!context) return respond({ error: 'Se requiere acceso de administrador.' }, 403);
    if (data.action === 'retry_notifications') {
      if (!getEmailConfig()) return respond({ error: 'Primero conecta el servicio de correo.' }, 409);
      await flushNotifications(context.tenantId);
    } else if (data.action === 'inquiry_status') {
      if (!['new', 'contacted', 'proposal', 'won', 'lost', 'archived'].includes(data.status || '') || typeof data.id !== 'string') return respond({ error: 'Estado inválido.' }, 400);
      const db = getD1(), now = new Date().toISOString();
      const [updated] = await db.batch([
        db.prepare('UPDATE inquiries SET status = ?, updated_at = ? WHERE id = ? AND tenant_id = ? AND updated_at = ?').bind(data.status, now, data.id, context.tenantId, data.expectedUpdatedAt || ''),
        db.prepare(`INSERT INTO audit_logs (id, tenant_id, actor_id, actor_email, action, entity_type, entity_id, summary, created_at)
          SELECT ?, ?, ?, ?, 'inquiry.status_changed', 'inquiry', ?, ?, ? WHERE changes() > 0 AND EXISTS (SELECT 1 FROM inquiries WHERE id = ? AND tenant_id = ?)`)
          .bind(crypto.randomUUID(), context.tenantId, context.user.userId, context.user.email, data.id, `Cambió un prospecto a ${data.status}`, now, data.id, context.tenantId),
      ]);
      if (!updated.meta.changes) return respond({ error: 'El prospecto cambió. Actualiza la lista.' }, 409);
    } else return respond({ error: 'Acción desconocida.' }, 400);
    return respond({ ok: true });
  } catch { return respond({ error: 'No pudimos completar la acción.' }, 500); }
}
