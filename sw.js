const CACHE_NAME = "mis-recetas-v12_1";
const ASSETS = [
  "./",
  "./index.html",
  "./recetas.html",
  "./style.css",
  "./main.css",
  "./pageflip.js",
  "./recetario.js",
  "./recetas.json",
  "./manifest.json",
  "./img/bookgris.png",
  "./img/papel.png",
  "./img/portada.png",
  "./img/icon-192.png",
  "./img/icon-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              if (
                event.request.method === "GET" &&
                fetchResponse.status === 200
              ) {
                cache.put(event.request, fetchResponse.clone());
              }
              return fetchResponse;
            });
          })
        );
      })
      .catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      }),
  );
});
