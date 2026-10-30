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
