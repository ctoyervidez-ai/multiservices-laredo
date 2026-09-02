export function validateBrowserMutation(request: Request, contentTypePrefix: string) {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  const contentType = (request.headers.get('content-type') || '').split(';', 1)[0].trim().toLowerCase();
  let sameOrigin = false;
  try {
    sameOrigin = Boolean(origin) && new URL(origin as string).origin === new URL(request.url).origin;
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin || (fetchSite && fetchSite !== 'same-origin') || contentType !== contentTypePrefix) {
    return false;
  }
  return true;
}

export class PayloadTooLargeError extends Error {
  constructor() {
    super('payload_too_large');
    this.name = 'PayloadTooLargeError';
  }
}

function declaredBodyTooLarge(request: Request, maxBytes: number) {
  const length = Number(request.headers.get('content-length') || 0);
  return Number.isFinite(length) && length > maxBytes;
}

async function readBodyWithLimit(request: Request, maxBytes: number) {
  if (declaredBodyTooLarge(request, maxBytes)) throw new PayloadTooLargeError();
  if (!request.body) return new Uint8Array();

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel('payload_too_large');
        throw new PayloadTooLargeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function formDataWithLimit(request: Request, maxBytes: number) {
  const bytes = await readBodyWithLimit(request, maxBytes);
  return new Request(request.url, {
    method: request.method,
    headers: { 'content-type': request.headers.get('content-type') || '' },
    body: bytes,
  }).formData();
}

export async function jsonWithLimit<T>(request: Request, maxBytes: number): Promise<T> {
  const bytes = await readBodyWithLimit(request, maxBytes);
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}
