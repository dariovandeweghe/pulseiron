/* PULSEIRON GitHub Pages PWA: network-first navigation, offline fallback. */
const CACHE = 'pulseiron-pwa-v2';
const ASSETS = ['./', './index.html', './pulseiron-cloud.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('pulseiron-pwa-') && key !== CACHE).map(key => caches.delete(key)))),self.clients.claim()]));
});
self.addEventListener('fetch', event => {
  const req=event.request;
  if(req.method !== 'GET') return;
  const url=new URL(req.url);
  if(url.origin !== self.location.origin || !url.pathname.startsWith('/pulseiron/')) return;
  event.respondWith(fetch(req).then(response => {
    if(response.ok && (req.mode === 'navigate' || ASSETS.some(asset => new URL(asset,self.registration.scope).pathname === url.pathname))) {
      const copy=response.clone(); caches.open(CACHE).then(cache => cache.put(req,copy)).catch(()=>{});
    }
    return response;
  }).catch(async () => (await caches.match(req)) || (req.mode === 'navigate' ? await caches.match('./index.html') : Response.error())));
});
