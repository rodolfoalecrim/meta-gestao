/* Meta Gestão — Minha Fazenda · service worker
   - guarda o app e as bibliotecas no celular: o app abre mesmo sem internet
   - HTML: busca na rede primeiro (pega as atualizações) e usa a cópia guardada se não houver sinal
   - bibliotecas (Firebase, gráficos, PDF, fontes): usa a cópia guardada e atualiza em segundo plano
   - recebe os avisos diários (push) e abre o app ao tocar no aviso */
const VERSAO = "mg-produtor-v4";
const APP = "./app-produtor.html";
const SHELL = [APP, "./manifest-produtor.json", "./produtor-apple-touch-180.png", "./produtor-favicon-64.png"];
const CDN = [
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
  "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-annotation/3.0.1/chartjs-plugin-annotation.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"
];
/* nunca interceptar: banco, login, funções, armazenamento, clima */
const DIRETO = /firebaseio\.com|firebasedatabase\.app|identitytoolkit|securetoken|cloudfunctions\.net|run\.app|firebasestorage|googleapis\.com\/(upload|storage)|fcmregistrations|open-meteo\.com|wa\.me/;

async function limpa(r) { /* resposta que veio de redirecionamento (cleanUrls) não pode servir navegação */
  if (!r || !r.redirected) return r;
  const b = await r.blob();
  return new Response(b, { status: r.status, statusText: r.statusText, headers: r.headers });
}
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const c = await caches.open(VERSAO);
    for (const u of SHELL) { try { const r = await fetch(new Request(u, { cache: "reload" })); if (r.ok) await c.put(u, await limpa(r)); } catch (x) {} }
    for (const u of CDN) { try { const r = await fetch(u, { mode: "no-cors" }); await c.put(u, r); } catch (x) {} }
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSAO) await caches.delete(k);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = req.url;
  if (DIRETO.test(url)) return;
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      const c = await caches.open(VERSAO);
      try {
        const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 6000);
        const r = await fetch(req, { signal: ctrl.signal }); clearTimeout(t);
        if (r && r.ok && /app-produtor|\/produtor/.test(new URL(url).pathname)) c.put(APP, await limpa(r.clone()));
        return r;
      } catch (x) {
        return (await c.match(req, { ignoreSearch: true })) || (await c.match(APP)) || Response.error();
      }
    })());
    return;
  }
  const mesmo = new URL(url).origin === self.location.origin;
  if (!mesmo && !/gstatic\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url)) return;
  e.respondWith((async () => {
    const c = await caches.open(VERSAO);
    const guardado = await c.match(req, { ignoreSearch: mesmo });
    const rede = fetch(req).then((r) => { if (r && (r.ok || r.type === "opaque")) c.put(req, r.clone()); return r; }).catch(() => guardado);
    return guardado || rede;
  })());
});

/* avisos diários */
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { data: { body: e.data && e.data.text() } }; }
  const dados = d.data || {};
  const n = d.notification || {};
  const titulo = dados.title || n.title || "Minha Fazenda";
  const corpo = dados.body || n.body || "";
  e.waitUntil(self.registration.showNotification(titulo, {
    body: corpo, icon: "produtor-apple-touch-180.png", badge: "produtor-favicon-64.png",
    tag: "mg-agenda", renotify: true, data: { url: dados.url || APP }
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const alvo = (e.notification.data && e.notification.data.url) || APP;
  e.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of abertas) { if ("focus" in w) { try { await w.navigate(alvo); } catch (x) {} return w.focus(); } }
    return self.clients.openWindow(alvo);
  })());
});
