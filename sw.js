const CACHE_NAME = 'kbtracker-v3';
// Every entry must exist on the server: cache.addAll() rejects the whole
// install if a single file 404s.
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/muscles.js',
  './js/seed-movements.js',
  './js/seed-activities.js',
  './js/seed-program.js',
  './js/coverage.js',
  './js/warnings.js',
  './js/bodymap.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

// cache: 'reload' bypasses the browser's HTTP cache (GitHub Pages lets it
// keep files for ~10 minutes), so a new version is never installed with the
// previous version's files.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first: always fetch the latest version when online (so a single
// reload shows updates), fall back to cache only when offline at the gym.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
