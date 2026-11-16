import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist');
function walk(dir) { return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
const files = walk(root).filter(p => !p.endsWith('/sw.js')).map(p => '/'+path.relative(root,p).replaceAll('\\','/'));
const sw = `const CACHE='farmaconsulta-shell-v1';
const ASSETS=${JSON.stringify(files)};
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', e => {const url=new URL(e.request.url);if(e.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return; if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html')));return;}e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));});
`;
fs.writeFileSync(path.join(root,'sw.js'), sw);
console.log('SW creado con',files.length,'recursos precargados');
