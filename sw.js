// Essenzi uses fresh network responses for all shopping data. Only the static
// offline connection notice is cached; no page, account, stock or API data is.
const OFFLINE_CACHE='essenzi-offline-v1-'+self.registration.scope;
const OFFLINE_PAGE=new URL('./offline.html',self.registration.scope).href;
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(OFFLINE_CACHE).then(cache=>cache.add(new Request(OFFLINE_PAGE,{cache:'reload'}))));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('essenzi-offline-')&&key.endsWith(self.registration.scope)&&key!==OFFLINE_CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||request.mode!=='navigate')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 event.respondWith(fetch(request).catch(async()=>{
  const fallback=await caches.match(OFFLINE_PAGE,{cacheName:OFFLINE_CACHE});
  return fallback||new Response('Essenzi needs an internet connection. Please reconnect and reload.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
 }));
});
