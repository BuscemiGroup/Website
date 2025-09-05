// sw.js — eenvoudige offline cache

const CACHE = 'buscemi-v1';
const PRECACHE_ASSETS = [
  '/',               // homepage
  '/index.html',     // pas aan als jouw index anders heet of in submap staat
  '/nav.js',
  '/utilities.css'   // pas aan naar jouw hoofd CSS (of verwijder als je file anders heet)
];

// Helper: is same-origin?
const isSameOrigin = (url) => {
  try {
    const u = new URL(url, self.location.href);
    return u.origin === self.location.origin;
  } catch {
    return false;
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Alleen GET cachen
  if (request.method !== 'GET') return;

  // Alleen same-origin cachen
  if (!isSameOrigin(request.url)) return;

  // Navigations: network-first met cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/')))
    );
    return;
  }

  // Overige GET: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => null);
      return cached || fetchPromise;
    })
  );
});
