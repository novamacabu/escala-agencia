/* Service Worker - Escala Agência NMB */
const CACHE = 'escala-nmb-v13';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(SHELL); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  // Never intercept API calls (JSONBin) — always go to network
  if (url.origin !== location.origin) return;
  // Network-first for same-origin: get fresh version, fall back to cache offline
  e.respondWith(
    fetch(e.request).then(function (r) {
      var clone = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
      return r;
    }).catch(function () {
      return caches.match(e.request);
    })
  );
});
