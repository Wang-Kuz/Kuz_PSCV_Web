import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import http from 'node:http';
import { createApp } from '../backend/server.mjs';
import { syncGithub } from '../scripts/sync-github.mjs';

const bi = value => ({ zh: value, en: value });
test('public configuration includes default workstation pages and preserves explicit visibility',async t=>{
 const f=await fixture(t);const p=await fetch(f.base+'/api/portfolio').then(r=>r.json());
 const excel=p.site.pages.find(page=>page.id==='ws-tools-excel-tool');
 assert.ok(excel,'fresh public API must include the spreadsheet page');
 assert.ok(p.site.pages.some(page=>page.id==='aigc'));
 excel.hidden=true;assert.equal((await f.save(p)).status,200);
 const saved=await fetch(f.base+'/api/portfolio').then(r=>r.json());
 assert.equal(saved.site.pages.find(page=>page.id===excel.id).hidden,true);
});
test('engineering contact and dual images persist with revision and reject missing media',async t=>{
 const f=await fixture(t);const upload=await fetch(`${f.base}/api/upload`,{method:'POST',headers:{...f.headers,'Content-Type':'image/png','X-Filename':'concept.png'},body:Buffer.from([137,80,78,71,13,10,26,10,0,0])});
 assert.equal(upload.status,201);const media=await upload.json();const p=seed();
 p.site={header:{links:[]},contact:{email:'a@example.com',wechat:'test',qr:media.url},pages:[{id:'aigc',name:'AIGC',parent:'',blocks:[{id:'service-rag',title:'RAG',text:'Test',image:media.url,businessImage:media.url,autoplay:false,slideSeconds:10}]}]};
 assert.equal((await f.save(p)).status,200);const saved=await fetch(`${f.base}/api/portfolio`).then(r=>r.json());assert.equal(saved.site.pages[0].blocks[0].businessImage,media.url);assert.equal(saved.site.contact.qr,media.url);
 saved.site.pages[0].blocks[0].businessImage='/media/00000000-0000-4000-8000-000000000000.png';assert.equal((await f.save(saved)).status,400);
});
const seed = () => ({ schemaVersion: 1, revision: 0, profile: { name: 'Kuz', role: bi('Engineer'), headline: bi('Build'), intro: bi('Hello'), availability: bi('Open'), github: 'https://github.com/Wang-Kuz' }, copy: {}, projects: [{ id: 'demo', name: bi('Demo'), tagline: bi('Demo'), summary: bi('Demo'), role: bi('Dev'), problem: bi('Problem'), solution: bi('Solution'), outcome: bi('Observed'), status: bi('Prototype'), categories: ['software'], tech: ['Node'], github: 'https://github.com/Wang-Kuz/demo', featured: true, visible: true, delivered: false, evidence: bi('Source review'), media: [] }] });
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'pscv-test-'));
  await mkdir(path.join(root, 'data')); await mkdir(path.join(root, 'frontend'));
  await writeFile(path.join(root, 'data', 'portfolio.seed.json'), JSON.stringify(seed()));
  await writeFile(path.join(root, 'data', 'repositories.json'), JSON.stringify({ owner: 'Wang-Kuz', repositories: [] }));
  await writeFile(path.join(root, 'frontend', 'index.html'), '<title>Test</title>');
  const server = await createApp({ root, dataDir: path.join(root, 'local-data') });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const { token } = await fetch(`${base}/api/session`).then(r => r.json());
  const headers = { 'Content-Type': 'application/json', 'X-CSRF-Token': token, Origin: base };
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(root, { recursive: true, force: true }); });
  return { root, server, base, headers, save: body => fetch(`${base}/api/portfolio`, { method: 'PUT', headers, body: JSON.stringify(body) }) };
}
test('local API serves seed and atomically persists edits with backup and revision', async t => {
  const f = await fixture(t); const body = await fetch(`${f.base}/api/portfolio`).then(r => r.json());
  body.profile.name = 'Edited'; const result = await f.save(body); assert.equal(result.status, 200);
  const saved = await result.json(); assert.equal(saved.revision, 1);
  assert.equal(JSON.parse(await readFile(path.join(f.root, 'local-data', 'portfolio.json'), 'utf8')).profile.name, 'Edited');
  assert.equal((await readdir(path.join(f.root, 'local-data', 'backups'))).length, 1);
  assert.equal((await fetch(`${f.base}/api/portfolio`).then(r => r.json())).profile.name, 'Edited');
  assert.equal((await f.save(body)).status, 409);
});
test('concurrent writes cannot both accept the same revision', async t => {
  const f = await fixture(t); const results = await Promise.all([f.save(seed()), f.save(seed())]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
});
test('foreign origins, missing tokens and forged hosts cannot mutate content', async t => {
  const f = await fixture(t);
  for (const headers of [{ 'Content-Type': 'application/json' }, { ...f.headers, Origin: 'https://evil.example' }]) {
    assert.equal((await fetch(`${f.base}/api/portfolio`, { method: 'PUT', headers, body: JSON.stringify(seed()) })).status, 403);
  }
  const forged = await new Promise((resolve, reject) => { const req = http.get(`${f.base}/api/session`, { headers: { Host: 'evil.example' } }, res => { res.resume(); resolve(res.statusCode); }); req.on('error', reject); });
  assert.equal(forged, 403);
  assert.equal((await fetch(`${f.base}/api/session`, { headers: { Origin: 'https://evil.example' } })).status, 403);
});
test('invalid categories, unsafe URLs and malformed fields are rejected', async t => {
  const f = await fixture(t);
  for (const mutate of [p => p.profile.github = 'javascript:alert(1)', p => p.projects[0].categories = ['invented'], p => p.projects[0].name = 'bad', p => p.projects.push({ ...p.projects[0] }), p => p.revision = -1]) {
    const p = seed(); mutate(p); assert.equal((await f.save(p)).status, 400);
  }
});
test('media upload validates signature and supports playback byte ranges and suffixes', async t => {
  const f = await fixture(t); const bytes = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from('ftypisom'), Buffer.alloc(120)]);
  const upload = await fetch(`${f.base}/api/upload`, { method: 'POST', headers: { ...f.headers, 'Content-Type': 'video/mp4', 'X-Filename': 'demo.mp4' }, body: bytes });
  assert.equal(upload.status, 201); const media = await upload.json(); assert.equal(media.type, 'video');
  const range = await fetch(`${f.base}${media.url}`, { headers: { Range: 'bytes=4-11' } });
  assert.equal(range.status, 206); assert.equal(range.headers.get('content-range'), `bytes 4-11/${bytes.length}`); assert.equal(await range.text(), 'ftypisom');
  const suffix = await fetch(`${f.base}${media.url}`, { headers: { Range: 'bytes=-5' } }); assert.equal((await suffix.arrayBuffer()).byteLength, 5);
  assert.equal((await fetch(`${f.base}${media.url}`, { headers: { Range: 'bytes=9999-' } })).status, 416);
  const head = await fetch(`${f.base}${media.url}`, { method: 'HEAD' }); assert.equal(Number(head.headers.get('content-length')), bytes.length);
  const p = seed(); p.projects[0].media.push({ ...media, chapters: [{ time: 1.25, title: bi('Part') }] }); assert.equal((await f.save(p)).status, 200);
});
test('unsupported and spoofed uploads leave no usable files', async t => {
  const f = await fixture(t);
  for (const name of ['payload.svg', 'fake.png']) {
    const r = await fetch(`${f.base}/api/upload`, { method: 'POST', headers: { ...f.headers, 'Content-Type': 'image/png', 'X-Filename': name }, body: '<script>alert(1)</script>' });
    assert.equal(r.status, 400);
  }
  assert.equal((await readdir(path.join(f.root, 'local-data', 'uploads'))).length, 0);
});
test('source, configuration and traversal paths are not served', async t => {
  const f = await fixture(t);
  for (const url of ['/backend/server.mjs', '/data/portfolio.seed.json', '/media/%2e%2e%2fportfolio.json', '/.git/config']) {
    const r = await fetch(`${f.base}${url}`); assert.ok([400, 404].includes(r.status), `${url}: ${r.status}`);
  }
  assert.equal((await fetch(`${f.base}/api/health`).then(r => r.json())).app, 'kuz-pscv');
});
test('a fresh server instance reads saved local content rather than resetting to seed', async t => {
  const f = await fixture(t); const p = seed(); p.profile.name = 'Persistent owner'; await f.save(p);
  const restarted = await createApp({ root: f.root }); restarted.listen(0, '127.0.0.1'); await once(restarted, 'listening');
  t.after(() => new Promise(resolve => restarted.close(resolve)));
  const result = await fetch(`http://127.0.0.1:${restarted.address().port}/api/portfolio`).then(r => r.json());
  assert.equal(result.profile.name, 'Persistent owner'); assert.equal(result.revision, 1);
});
test('GitHub public fallback preserves known private repositories and custom content', async t => {
  const f = await fixture(t); const privateRepo = { name: 'PrivateProject', url: 'https://github.com/Wang-Kuz/PrivateProject', visibility: 'private', defaultBranch: 'main', size: 1 };
  await writeFile(path.join(f.root, 'data', 'repositories.json'), JSON.stringify({ owner: 'Wang-Kuz', repositories: [privateRepo] }));
  await writeFile(path.join(f.root, 'README.md'), 'Before\n<!-- REPOSITORIES:START -->old<!-- REPOSITORIES:END -->\nAfter');
  const edited = seed(); edited.profile.name = 'Keep my edit'; await f.save(edited);
  const result = await syncGithub({ root: f.root, loadAuthenticated: async () => { throw new Error('gh unavailable'); }, loadPublic: async () => [{ name: 'PublicProject', url: 'https://github.com/Wang-Kuz/PublicProject', visibility: 'public', defaultBranch: 'main', size: 10 }] });
  assert.equal(result.coverage, 'partial'); assert.equal(result.repositories.length, 2);
  assert.ok(result.repositories.some(r => r.name === 'PrivateProject'));
  const readme = await readFile(path.join(f.root, 'README.md'), 'utf8'); assert.ok(readme.startsWith('Before\n')); assert.ok(readme.endsWith('\nAfter')); assert.ok(readme.includes('PublicProject'));
  assert.equal((await fetch(`${f.base}/api/portfolio`).then(r => r.json())).profile.name, 'Keep my edit');
});
test('failed sync and malformed README markers preserve inventory', async t => {
  const f = await fixture(t); const file = path.join(f.root, 'data', 'repositories.json'); const before = await readFile(file, 'utf8');
  await assert.rejects(syncGithub({ root: f.root, loadAuthenticated: async () => { throw new Error('offline'); }, loadPublic: async () => { throw new Error('offline'); } }));
  assert.equal(await readFile(file, 'utf8'), before);
  await writeFile(path.join(f.root, 'README.md'), 'No markers');
  await assert.rejects(syncGithub({ root: f.root, loadAuthenticated: async () => [{ name: 'Demo', url: 'https://github.com/Wang-Kuz/Demo', visibility: 'private' }] }), /markers/);
  assert.equal(await readFile(file, 'utf8'), before);
});

test('site configuration persists, hierarchy rejects cycles, analytics reports real requests', async t => {
  const f=await fixture(t);const body=seed();
  body.site={header:{links:[{label:'首页',href:'/'}],logo:''},pages:[{id:'home',name:'首页',parent:'',blocks:[{id:'hero',title:'测试标题',text:'正文',image:'',hidden:true}]},{id:'child',name:'子页',parent:'home',blocks:[]}]};
  assert.equal((await f.save(body)).status,200);
  const stored=await fetch(f.base+'/api/portfolio').then(r=>r.json());assert.equal(stored.site.pages[0].blocks.find(b=>b.id==='hero').hidden,true);
  stored.site.pages[0].parent='child';assert.equal((await f.save(stored)).status,400);
  stored.site.pages[0].parent='';stored.site.header.links[0].href='javascript:alert(1)';assert.equal((await f.save(stored)).status,400);
  assert.equal((await fetch(f.base+'/api/visit?page=child')).status,200);
  const a=await fetch(f.base+'/api/analytics').then(r=>r.json());assert.equal(Object.values(a.counts).reduce((x,y)=>x+y,0),1);assert.ok(Object.keys(a.counts)[0].endsWith('|child'));
});

 test('cross-site document navigation works while cross-site API access stays blocked',async t=>{
 const f=await fixture(t);
 const request=(route,mode)=>new Promise((resolve,reject)=>{http.get(f.base+route,{headers:{'sec-fetch-site':'cross-site','sec-fetch-mode':mode}},res=>{res.resume();resolve(res.statusCode);}).on('error',reject);});
 assert.equal(await request('/','navigate'),200);
 assert.equal(await request('/api/session','navigate'),403);
 assert.equal(await request('/api/portfolio','cors'),403);
 });

test('fresh install can save the complete editor draft without a preinstalled QR media file',async t=>{
 const f=await fixture(t);const p=await fetch(f.base+'/api/portfolio').then(r=>r.json());
 const {organizeSite}=await import('../frontend/page-structure.js');
 p.site=organizeSite(p.site||{header:{links:[]},pages:[{id:'home',name:'个人品宣',parent:'',blocks:[]}]},p.projects);
 const response=await f.save(p);assert.equal(response.status,200,await response.text());
});

test('web GitHub sync writes runtime inventory without modifying read-only release source',async t=>{
 const f=await fixture(t),seedPath=path.join(f.root,'data','repositories.json');const before=await readFile(seedPath,'utf8');
 const result=await syncGithub({root:f.root,runtimeDir:path.join(f.root,'local-data'),loadAuthenticated:async()=>[{name:'demo',url:'https://github.com/Wang-Kuz/demo',visibility:'public'}]});
 assert.equal(result.repositories.length,1);assert.equal(await readFile(seedPath,'utf8'),before);
 assert.equal(JSON.parse(await readFile(path.join(f.root,'local-data','repositories.json'),'utf8')).repositories.length,1);
 assert.equal((await fetch(f.base+'/api/repositories').then(r=>r.json())).repositories.length,1);
});
