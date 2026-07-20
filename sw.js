// Service Worker do App do Vendedor — Meta Gestão
// Cuida só de deixar o app instalável e cachear o "esqueleto" da página.
// Os dados (Firebase) continuam sempre buscados online, normalmente.
//
// IMPORTANTE: usa estratégia "rede primeiro" pro HTML — sempre tenta buscar
// a versão mais nova primeiro. Só usa a cópia salva se estiver genuinamente
// offline. Isso evita o app ficar preso numa versão antiga depois de uma
// atualização (o problema da versão anterior deste arquivo).

const CACHE_NAME = "meta-vendedor-v2";
const ARQUIVOS_ESSENCIAIS = [
  "./app-vendedor.html",
  "./manifest.json",
  "./meta_logo.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_ESSENCIAIS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Só intercepta o "esqueleto" do app (HTML/manifest/logo).
  // Tudo que é chamada de API/Firebase passa direto pela rede, sem interferência.
  const url = event.request.url;
  const ehArquivoDoApp = ARQUIVOS_ESSENCIAIS.some((f) => url.includes(f.replace("./", "")));
  if (!ehArquivoDoApp) return;

  // Rede primeiro: busca a versão mais nova. Só cai pro cache se a rede falhar
  // (offline de verdade) ou demorar demais.
  event.respondWith(
    fetch(event.request)
      .then((respostaRede) => {
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respostaRede.clone()));
        return respostaRede;
      })
      .catch(() => caches.match(event.request))
  );
});
