const CACHE_NAME = 'mediscan-v7';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (event.request.method !== 'GET') return;
  if (url.includes('/api/') || url.includes('openfoodfacts') || url.includes('giygas') || url.includes('vedielaute') || url.includes('openbeautyfacts') || url.includes('openpetfoodfacts')) return;

  if (url.endsWith('/') || url.includes('.html')) {
    event.respondWith(
      fetch(event.request).then(r => {
        if (r.ok) { const cl = r.clone(); caches.open(CACHE_NAME).then(c => c.put(event.request, cl)); }
        return r;
      }).catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(r => {
          if (r.ok) { const cl = r.clone(); caches.open(CACHE_NAME).then(c => c.put(event.request, cl)); }
          return r;
        });
      })
    );
  }
});
