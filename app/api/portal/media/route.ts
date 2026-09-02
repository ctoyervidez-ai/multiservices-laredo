import { getChatGPTUser } from '@/app/chatgpt-auth';
import { ensureDatabase, getD1, getFilesBucket } from '@/db';
import { can } from '@/lib/portal-access';
import { getPortalContext, getPortalSnapshot } from '@/lib/site-repository';
import { formDataWithLimit, PayloadTooLargeError, validateBrowserMutation } from '@/lib/request-security';

export const dynamic = 'force-dynamic';

const slots = {
  hero: 'hero_media_id',
  transport: 'transport_media_id',
  operations: 'operations_media_id',
} as const;

function respond(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'cache-control': 'no-store' } });
}

export async function POST(request: Request) {
  let objectKey: string | null = null;
  let databaseCommitted = false;
  try {
    if (!validateBrowserMutation(request, 'multipart/form-data')) {
      return respond({ error: 'Solicitud no permitida.' }, 403);
    }
    await ensureDatabase();
    const context = await getPortalContext(await getChatGPTUser(), new URL(request.url).host);
    if (!context) return respond({ error: 'Inicia sesión para continuar.' }, 401);
    if (!context.authorized || !can(context.role, 'manageMedia')) return respond({ error: 'Sin permiso para editar fotografías.' }, 403);

    const form = await formDataWithLimit(request, 6 * 1024 * 1024);
    const file = form.get('file');
    const slot = String(form.get('slot') || '') as keyof typeof slots;
    const altEs = String(form.get('altEs') || '').trim().slice(0, 180);
    const altEn = String(form.get('altEn') || '').trim().slice(0, 180);
    if (!(file instanceof File) || !slots[slot]) return respond({ error: 'Selecciona una fotografía y su ubicación.' }, 400);
    if (file.type !== 'image/webp' || !file.name.toLowerCase().endsWith('.webp') || file.size > 5 * 1024 * 1024) {
      return respond({ error: 'La fotografía debe procesarse como WebP y pesar máximo 5 MB.' }, 400);
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!hasImageSignature(file.type, bytes)) return respond({ error: 'El archivo no contiene una imagen válida.' }, 400);

    const database = getD1();
    const previous = await database.prepare(`SELECT m.id, m.object_key AS objectKey
      FROM site_settings s LEFT JOIN media_assets m ON m.id = s.${slots[slot]} AND m.tenant_id = s.tenant_id
      WHERE s.tenant_id = ? LIMIT 1`).bind(context.tenantId).first<{ id: string | null; objectKey: string | null }>();
    if (!previous) return respond({ error: 'No encontramos la configuración del sitio.' }, 404);

    const id = crypto.randomUUID();
    objectKey = `tenants/${context.tenantId}/images/${id}.webp`;
    await getFilesBucket().put(objectKey, bytes, {
      httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=86400' },
      customMetadata: { uploadedBy: context.user.userId, slot },
    });

    const now = new Date().toISOString();
    const statements = [
      database.prepare(`INSERT INTO media_assets
        (id, tenant_id, object_key, filename, content_type, size_bytes, alt_es, alt_en, visibility, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'public', ?, ?)`)
        .bind(id, context.tenantId, objectKey, file.name.slice(0, 120), file.type, file.size, altEs, altEn, context.user.userId, now),
      database.prepare(`UPDATE site_settings SET ${slots[slot]} = ?, updated_at = ?, updated_by = ? WHERE tenant_id = ?`)
        .bind(id, now, context.user.userId, context.tenantId),
      database.prepare(`INSERT INTO audit_logs
        (id, tenant_id, actor_id, actor_email, action, entity_type, entity_id, summary, created_at)
        VALUES (?, ?, ?, ?, 'media.uploaded', 'media_asset', ?, ?, ?)`)
        .bind(crypto.randomUUID(), context.tenantId, context.user.userId, context.user.email, id, `Reemplazó la fotografía: ${slot}`, now),
    ];
    if (previous?.id) statements.push(database.prepare(`UPDATE media_assets SET visibility = 'retired' WHERE tenant_id = ? AND id = ?`).bind(context.tenantId, previous.id));
    const results = await database.batch(statements);
    if (!results[1]?.meta.changes) throw new Error('site_settings_missing');
    databaseCommitted = true;
    if (previous?.objectKey?.startsWith(`tenants/${context.tenantId}/images/`)) {
      try { await getFilesBucket().delete(previous.objectKey); } catch { /* retired in D1; cleanup can retry later */ }
    }
    return respond({ ok: true, snapshot: await getPortalSnapshot(context) }, 201);
  } catch (error) {
    if (objectKey && !databaseCommitted) {
      try { await getFilesBucket().delete(objectKey); } catch { /* best-effort cleanup */ }
    }
    if (error instanceof PayloadTooLargeError) return respond({ error: 'La fotografía es demasiado grande.' }, 413);
    console.error('media_upload_failed', error);
    return respond({ error: 'No pudimos guardar la fotografía.' }, 500);
  }
}

function hasImageSignature(contentType: string, bytes: Uint8Array) {
  const ascii = (start: number, end: number) => new TextDecoder().decode(bytes.slice(start, end));
  if (contentType === 'image/webp') return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
  return false;
}
