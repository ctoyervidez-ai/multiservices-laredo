import { ensureDatabase, getD1 } from '@/db';
import { getPortalIdentityFromCookie } from '@/lib/portal-auth';
import { getPortalContext } from '@/lib/site-repository';
import { can } from '@/lib/portal-access';
import { editableContentFields, validateContentOverrides } from '@/lib/content-fields';
import { jsonWithLimit, validateBrowserMutation } from '@/lib/request-security';
export const dynamic = 'force-dynamic';
const respond = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
async function authorize(request: Request) {
  await ensureDatabase();
  const context = await getPortalContext(await getPortalIdentityFromCookie(request.headers.get('cookie'), new URL(request.url).host));
  return context?.authorized && can(context.role, 'editContent') ? context : null;
}
export async function GET(request: Request) {
  const context = await authorize(request);
  if (!context) return respond({ error: 'No tienes permiso para editar contenido.' }, 403);
  const row = await getD1().prepare('SELECT values_json AS content, revision FROM site_content WHERE tenant_id = ?').bind(context.tenantId).first<{ content: string; revision: number }>();
  return respond({ defaults: editableContentFields, values: row ? JSON.parse(row.content) : {}, revision: row?.revision || 0 });
}
export async function POST(request: Request) {
  if (!validateBrowserMutation(request, 'application/json')) return respond({ error: 'Solicitud no permitida.' }, 403);
  const context = await authorize(request);
  if (!context) return respond({ error: 'No tienes permiso.' }, 403);
  try {
    const data = await jsonWithLimit<{ values: unknown; revision: number }>(request, 256 * 1024);
    const values = validateContentOverrides(data.values);
    if (!Number.isSafeInteger(data.revision) || data.revision < 0) return respond({ error: 'Actualiza la página antes de guardar.' }, 400);
    const db = getD1(), now = new Date().toISOString();
    const result = await db.prepare(`INSERT INTO site_content (tenant_id, values_json, revision, updated_at, updated_by)
      SELECT ?, ?, 1, ?, ? WHERE ? = 0 OR EXISTS (SELECT 1 FROM site_content WHERE tenant_id = ?)
      ON CONFLICT(tenant_id) DO UPDATE SET values_json = excluded.values_json, revision = site_content.revision + 1, updated_at = excluded.updated_at, updated_by = excluded.updated_by WHERE site_content.revision = ?`)
      .bind(context.tenantId, JSON.stringify(values), now, context.user.userId, data.revision, context.tenantId, data.revision).run();
    if (!result.meta.changes) return respond({ error: 'Otra persona actualizó estos textos. Conservamos tu borrador; recarga los textos antes de volver a editar.' }, 409);
    await db.prepare(`INSERT INTO audit_logs (id,tenant_id,actor_id,actor_email,action,entity_type,entity_id,summary,created_at) VALUES (?,?,?,?, 'content.updated','site_content',?,'Actualizó los textos públicos',?)`).bind(crypto.randomUUID(),context.tenantId,context.user.userId,context.user.email,context.tenantId,now).run();
    return respond({ ok: true, revision: data.revision + 1 });
  } catch (e) { return respond({ error: e instanceof Error ? e.message : 'No pudimos guardar.' }, 400); }
}
