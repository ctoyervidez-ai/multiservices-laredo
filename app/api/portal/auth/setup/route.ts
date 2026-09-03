import { createInitialPortalAdmin, PortalAuthError, type PortalSetupInput } from '@/lib/portal-auth';
import { jsonWithLimit, PayloadTooLargeError, validateBrowserMutation } from '@/lib/request-security';

export const dynamic = 'force-dynamic';

function respond(body: unknown, status = 200, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  headers.set('cache-control', 'no-store');
  headers.set('content-security-policy', "default-src 'none'; frame-ancestors 'none'");
  headers.set('x-content-type-options', 'nosniff');
  return Response.json(body, { status, headers });
}

export async function POST(request: Request) {
  if (!validateBrowserMutation(request, 'application/json')) {
    return respond({ error: 'Solicitud no permitida.' }, 403);
  }

  let input: PortalSetupInput;
  try {
    input = await jsonWithLimit<PortalSetupInput>(request, 4 * 1024);
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return respond({ error: 'La solicitud es demasiado grande.' }, 413);
    return respond({ error: 'El formato de la solicitud no es válido.' }, 400);
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return respond({ error: 'El formato de la solicitud no es válido.' }, 400);
  }

  try {
    const result = await createInitialPortalAdmin(request, input);
    return respond({ ok: true, user: result.identity }, 201, { 'set-cookie': result.setCookie });
  } catch (error) {
    if (error instanceof PortalAuthError) {
      const headers = error.retryAfter ? { 'retry-after': String(error.retryAfter) } : undefined;
      return respond({ error: error.message, code: error.code }, error.status, headers);
    }
    console.error('portal_setup_route_failed');
    return respond({ error: 'El acceso del portal no está disponible en este momento.' }, 503);
  }
}
