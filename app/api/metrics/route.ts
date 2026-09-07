import { ensureDatabase, getD1, getSiteTenantId } from '@/db';
import { jsonWithLimit, validateBrowserMutation } from '@/lib/request-security';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  if (!validateBrowserMutation(request, 'application/json')) return new Response(null, { status: 403 });
  try {
    const data = await jsonWithLimit<{ event?: string; path?: string }>(request, 1024);
    if (!data || !['page_view', 'whatsapp_click', 'email_click', 'phone_click'].includes(data.event || '') || !['/', '/vacantes', '/vacantes/detalle', '/privacidad'].includes(data.path || '')) return new Response(null, { status: 400 });
    await ensureDatabase();
    const db = getD1(), tenant = getSiteTenantId(), day = new Date().toISOString().slice(0, 10);
    const address = request.headers.get('cf-connecting-ip') || 'unknown';
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${tenant}:${day}:${address}`));
    const key = `metrics:${Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('')}`;
    const limit = await db.prepare(`INSERT INTO rate_limits (key, hits, expires_at, updated_at) VALUES (?, 1, ?, ?)
      ON CONFLICT(key) DO UPDATE SET hits = hits + 1 WHERE hits < 300 RETURNING hits`)
      .bind(key, new Date(Date.now() + 86400_000).toISOString(), new Date().toISOString()).first();
    if (!limit) return new Response(null, { status: 429 });
    await db.prepare(`INSERT INTO daily_metrics (id, tenant_id, day, event, path, count) VALUES (?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET count = count + 1`)
      .bind(`${tenant}:${day}:${data.event}:${data.path}`, tenant, day, data.event, data.path).run();
    await db.prepare('DELETE FROM rate_limits WHERE expires_at < ?').bind(new Date().toISOString()).run();
    return new Response(null, { status: 204 });
  } catch { return new Response(null, { status: 400 }); }
}
