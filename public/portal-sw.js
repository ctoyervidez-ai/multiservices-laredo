// Do not cache portal HTML, API responses, credentials, CVs, or applicant data.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(() => new Response(
    '<!doctype html><html lang="es"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin conexión</title><body style="font:18px system-ui;padding:32px;color:#082f57"><h1>Necesitas conexión a internet.</h1><p>Conéctate para consultar y guardar información actualizada del portal.</p><a href="/portal">Volver a intentar</a></body></html>',
    {status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}}
  )));
});
