// PlantillaAR Service Worker
// Cambiar este número cada vez que se sube una nueva versión:
const CACHE_VERSION = 'plantillaar-v7';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap'
];

// Instalación: descarga y guarda todo lo necesario para funcionar offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Si algún recurso externo falla (ej. sin internet en la primera carga),
        // seguimos igual con lo que se pudo cachear
      });
    })
  );
});

// Activación: limpia versiones viejas del cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Estrategia: red primero, si falla usa el cache (funciona offline)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la red funciona, actualizamos el cache con la versión fresca
        const responseClone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Sin red: devolvemos lo que tengamos guardado
        return caches.match(event.request);
      })
  );
});

// Permite que la app fuerce la activación inmediata de la nueva versión
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
