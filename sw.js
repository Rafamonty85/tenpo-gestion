// Service worker de la cáscara PWA de Tenpo Gestión.
// Solo guarda los archivos propios de la cáscara. No toca nada de Google ni tus datos.
const CACHE = 'tenpo-gestion-v1';
const ARCHIVOS = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'maskable-192.png', 'maskable-512.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(ARCHIVOS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.filter(function (c) { return c !== CACHE; })
        .map(function (c) { return caches.delete(c); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  // Solo archivos propios de la cáscara; todo lo de Google pasa directo sin tocarse.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Primero intenta internet (versión más nueva); si no hay señal, usa la copia guardada.
  event.respondWith(
    fetch(req).then(function (resp) {
      const copia = resp.clone();
      caches.open(CACHE).then(function (cache) { cache.put(req, copia); });
      return resp;
    }).catch(function () { return caches.match(req); })
  );
});
