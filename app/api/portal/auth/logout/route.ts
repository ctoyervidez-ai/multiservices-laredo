import { clearPortalSessionCookies, revokePortalSession } from '@/lib/portal-auth';
import { jsonWithLimit, PayloadTooLargeError, validateBrowserMutation } from '@/lib/request-security';

export const dynamic = 'force-dynamic';

function respond(body: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({
    'cache-control': 'no-store',
    'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
    'x-content-type-options': 'nosniff',
  });
  for (const cookie of cookies) headers.append('set-cookie', cookie);
  return Response.json(body, { status, headers });
}

export async function POST(request: Request) {
  if (!validateBrowserMutation(request, 'application/json')) {
    return respond({ error: 'Solicitud no permitida.' }, 403);
  }
  try {
    const input = await jsonWithLimit<unknown>(request, 1024);
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return respond({ error: 'El formato de la solicitud no es válido.' }, 400);
    }
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return respond({ error: 'La solicitud es demasiado grande.' }, 413);
    return respond({ error: 'El formato de la solicitud no es válido.' }, 400);
  }
  await revokePortalSession(request.headers.get('cookie'), new URL(request.url).host);
  return respond({ ok: true }, 200, clearPortalSessionCookies());
}
