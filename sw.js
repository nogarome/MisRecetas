const CACHE_NAME = 'mis-recetas-v1';
const ASSETS = [
  'index.html',
  'recetas.html',
  'style.css',
  'main.css',
  'pageflip.js',
  'img/bookgris.png',
  'img/papel.png',
  'img/portada.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
