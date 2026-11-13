/* Meta · app do produtor — service worker
   Rede primeiro (sempre a versão mais nova quando há internet); cache só como reserva offline.
   Firebase e demais serviços externos passam direto, sem cache. */
var CACHE = "meta-produtor-v3";
var BASE = ["./app-produtor.html", "./manifest-produtor.json", "./produtor-icon-192.png", "./produtor-icon-512.png", "./produtor-apple-touch-180.png", "./produtor-favicon-64.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASE).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE && k.indexOf("meta-produtor") === 0; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  var fonte = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== self.location.origin && !fonte) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (r) {
      var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put("./app-produtor.html", cp); }); return r;
    }).catch(function () { return caches.match("./app-produtor.html"); }));
    return;
  }
  e.respondWith(fetch(req).then(function (r) {
    if (r && (r.ok || r.type === "opaque")) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, cp); }); }
    return r;
  }).catch(function () { return caches.match(req); }));
});
