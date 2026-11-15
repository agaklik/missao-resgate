// Missão Resgate: deixa o jogo funcionar como app, até sem internet.
const CACHE='missao-resgate-v38';
const CORE=['./','./index.html','./3d/','./3d/index.html','./manifest.webmanifest','./3d/manifest.webmanifest',
  './icons/icon-192.png','./icons/icon-512.png','./icons/icon3d-192.png','./icons/icon3d-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // páginas do jogo: tenta a internet primeiro (pra pegar a versão nova); sem internet, usa a guardada
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;})
      .catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match(u.pathname.includes('/3d')?'./3d/':'./'))));
    return;
  }
  // ícones, three.js e fontes: usa o guardado e atualiza por trás
  if(u.origin===location.origin||u.hostname==='cdnjs.cloudflare.com'||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    e.respondWith(caches.match(r).then(m=>{
      const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}return res;}).catch(()=>m);
      return m||net;
    }));
  }
});
