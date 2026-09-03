import { ensureDatabase, getD1, getFilesBucket } from '@/db';
import { can } from '@/lib/portal-access';
import { getPortalIdentityFromCookie } from '@/lib/portal-auth';
import { getPortalContext, writeAuditLog } from '@/lib/site-repository';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, route: { params: Promise<{ id: string }> }) {
  await ensureDatabase();
  const context = await getPortalContext(await getPortalIdentityFromCookie(request.headers.get('cookie'), new URL(request.url).host));
  if (!context) return new Response('Unauthorized', { status: 401 });
  if (!context.authorized || !can(context.role, 'viewApplications')) return new Response('Forbidden', { status: 403 });

  const { id } = await route.params;
  const application = await getD1().prepare(`SELECT resume_key AS resumeKey, resume_filename AS resumeFilename
    FROM applications WHERE tenant_id = ? AND id = ? LIMIT 1`)
    .bind(context.tenantId, id).first<{ resumeKey: string | null; resumeFilename: string | null }>();
  if (!application?.resumeKey || !application.resumeKey.startsWith(`tenants/${context.tenantId}/resumes/`)) return new Response(null, { status: 404 });
  const object = await getFilesBucket().get(application.resumeKey);
  if (!object) return new Response(null, { status: 404 });

  try {
    await writeAuditLog({ tenantId: context.tenantId, actorId: context.user.userId, actorEmail: context.user.email,
      action: 'application.resume_downloaded', entityType: 'application', entityId: id, summary: 'Descargó un CV' });
  } catch { /* an audit outage should not corrupt or expose a different file */ }

  const filename = (application.resumeFilename || 'curriculum.pdf').replace(/["\r\n]/g, '');
  return new Response(object.body, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'private, no-store',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; sandbox",
      'cross-origin-resource-policy': 'same-origin',
    },
  });
}
