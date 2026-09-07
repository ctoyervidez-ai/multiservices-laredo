import { ensureDatabase, getD1, getFilesBucket, getSiteTenantId } from '@/db';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await ensureDatabase();
    const { id } = await context.params;
    const asset = await getD1().prepare(`SELECT object_key AS objectKey, content_type AS contentType
      FROM media_assets WHERE id = ? AND tenant_id = ? AND visibility = 'public' LIMIT 1`)
      .bind(id, getSiteTenantId()).first<{ objectKey: string; contentType: string }>();
    const tenantId = getSiteTenantId();
    if (!asset || !asset.objectKey.startsWith(`tenants/${tenantId}/images/`)) return new Response(null, { status: 404 });

    const object = await getFilesBucket().get(asset.objectKey);
    if (!object) return new Response(null, { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('content-type', asset.contentType);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=86400, stale-while-revalidate=604800');
    headers.set('x-content-type-options', 'nosniff');
    return new Response(object.body, { headers });
  } catch {
    return new Response(null, { status: 503 });
  }
}
