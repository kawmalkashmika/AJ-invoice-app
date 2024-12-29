// (PART A) LOAD FILE FROM CACHE, FALLBACK TO NETWORK IF NOT FOUND
self.addEventListener("fetch", e => e.respondWith(
  caches.match(e.request).then(r => r || fetch(e.request))
));