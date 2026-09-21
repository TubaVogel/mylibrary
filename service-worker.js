const CACHE = "mylibrary-v22";
const OFFLINE_PAGE = "./index.html?v=22";
const APP = [
  OFFLINE_PAGE,
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-512.png",
  "./when-coffee-kale-compete.jpg",
  "./feine-freunde.jpg",
  "./the-power-of-now.jpg"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
    .then(() => self.clients.matchAll({type: "window"}))
    .then(clients => clients.forEach(client => client.postMessage({type: "APP_UPDATED", version: CACHE})))
));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(OFFLINE_PAGE, copy));
      return response;
    }).catch(() => caches.match(OFFLINE_PAGE)));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(OFFLINE_PAGE))));
});
