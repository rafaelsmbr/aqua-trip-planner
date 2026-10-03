/* Service worker: o roteiro abre sem internet (no avião, ou sem roaming em Paris).
   Estratégia: rede primeiro, cache como reserva. Online, sempre vem a versão nova;
   offline, vem a última que funcionou. Só vale em HTTPS - em file:// nem é registrado. */
const CACHE = "aqua-sial-v1";

// Sem "./" na lista: atrás do CloudFront o diretório puro não resolve para index.html,
// e um único 404 aqui derrubaria a instalação inteira.
const ARQUIVOS = [
  "./index.html", "./app.css", "./app.js", "./engine.js",
  "./dados/fontes.js", "./dados/corpus.js", "./dados/decisoes.js", "./dados/deslocamentos.js",
  "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (resp) {
      if (resp.ok) { var copia = resp.clone(); caches.open(CACHE).then(function (c) { c.put(req, copia); }); }
      return resp;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) {
        return r || (req.mode === "navigate" ? caches.match("./index.html") : undefined);
      });
    })
  );
});
