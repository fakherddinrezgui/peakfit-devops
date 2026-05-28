// ============================================================
//  PeakFit — Service Worker
//  Cache les ressources pour fonctionner hors-ligne
// ============================================================
const CACHE_NAME = 'peakfit-v1';

// Fichiers à mettre en cache pour le mode hors-ligne
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico',
];

// Installation — mise en cache des fichiers statiques
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activation — suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — stratégie : réseau d'abord, cache en fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Requêtes API → toujours réseau (pas de cache pour les données)
  if (url.pathname.startsWith('/api/')) return;

  // Ressources statiques → réseau d'abord, sinon cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mettre à jour le cache avec la nouvelle réponse
        if (response && response.status === 200 && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Pas de réseau → retourner depuis le cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback : retourner la page principale pour les routes React
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
