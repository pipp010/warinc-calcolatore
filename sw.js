// Service worker minimo: serve per poter installare il sito come app.
// Sempre prima la rete (così si vede sempre l'ultima versione); la copia salvata si usa solo offline.
const CACHE="warinc-v1";
self.addEventListener("install",e=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET"||new URL(r.url).origin!==location.origin) return;
  e.respondWith(fetch(r).then(res=>{ if(res.ok){ const c=res.clone(); caches.open(CACHE).then(k=>k.put(r,c)); } return res; })
    .catch(()=>caches.match(r).then(m=>m||caches.match("./"))));
});
