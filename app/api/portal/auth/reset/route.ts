import { completePasswordReset, requestPasswordReset, PortalAuthError } from '@/lib/portal-auth';
import { jsonWithLimit, validateBrowserMutation } from '@/lib/request-security';
export const dynamic = 'force-dynamic';
const respond = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
export async function POST(request: Request) {
  if (!validateBrowserMutation(request, 'application/json')) return respond({ error: 'Solicitud no permitida.' }, 403);
  try {
    const data = await jsonWithLimit<Record<string, unknown>>(request, 4096);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return respond({ error: 'Solicitud inválida.' }, 400);
    if (data.action === 'request') {
      await requestPasswordReset(request, data);
      return respond({ ok: true, message: 'Si el correo tiene acceso, recibirás un enlace. Revisa también spam. Si no llega, contacta a Ethrov.' });
    }
    if (data.action === 'complete') { await completePasswordReset(request, data); return respond({ ok: true }); }
    return respond({ error: 'Solicitud inválida.' }, 400);
  } catch (error) {
    if (error instanceof PortalAuthError) return respond({ error: error.message }, error.status);
    return respond({ error: 'No pudimos completar la solicitud.' }, 400);
  }
}
