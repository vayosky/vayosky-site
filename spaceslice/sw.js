// Offline-Speicher fuer Space Slice. Version wechselt automatisch bei jeder Aenderung.
const CACHE = 'space-slice-3f9cd41cb3';
const FILES = ["./", "index.html", "manifest.webmanifest", "fonts/bungee-latin-400-normal.woff2", "fonts/nunito-latin-500-normal.woff2", "fonts/nunito-latin-700-normal.woff2", "fonts/nunito-latin-800-normal.woff2", "img/berggipfel.jpg", "img/bosse.png", "img/dschungel.jpg", "img/dschungelfluss.jpg", "img/duenen.jpg", "img/fantasie.jpg", "img/hafen.jpg", "img/hoehle.jpg", "img/icon-192.png", "img/icon-512.png", "img/icon-maskable-512.png", "img/icon.png", "img/korallen.jpg", "img/kristallhoehle.jpg", "img/mondmeer.jpg", "img/nachtmeer.jpg", "img/obstgarten.jpg", "img/packeis.jpg", "img/riff.jpg", "img/savanne.jpg", "img/schloss.jpg", "img/schuesse.png", "img/spinnenwald.jpg", "img/strand.jpg", "img/tempel.jpg", "img/tiefsee.jpg", "img/unterwasser.jpg", "img/vulkan.jpg", "img/weltraum.png", "img/wiese.jpg", "img/winterburg.jpg", "img/wueste.jpg", "img/zauberwald.jpg", "js/three.min.js"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Zuerst aus dem Speicher (schnell, offline), im Hintergrund die neue Fassung holen
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => { if (r && r.ok && new URL(e.request.url).origin === location.origin) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  })));
});
