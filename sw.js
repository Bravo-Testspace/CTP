'use strict';
const CACHE='crypto-lab-shell-v1';
const SHELL=['/','/index.html','/style.css','/app.js','/pwa.js','/manifest.webmanifest','/icon-192.png','/icon-512.png','/icon-maskable-512.png','/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(const path of SHELL){
    const response=await fetch(new Request(path,{cache:'reload'}));
    if(!response.ok||response.redirected||new URL(response.url).origin!==self.location.origin)throw Error('App shell not available');
    const type=response.headers.get('content-type')||'';
    if(path.endsWith('.js')&&type.includes('text/html'))throw Error('Unexpected sign-in page');
    await cache.put(path,response);
  }
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  for(const key of await caches.keys())if(key.startsWith('crypto-lab-shell-')&&key!==CACHE)await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'&&(url.pathname==='/'||url.pathname==='/index.html')){
    event.respondWith(fetch(event.request).catch(async()=>await caches.match('/index.html')||Response.error()));return;
  }
  if(SHELL.includes(url.pathname))event.respondWith((async()=>await caches.match(url.pathname)||fetch(event.request))());
});
