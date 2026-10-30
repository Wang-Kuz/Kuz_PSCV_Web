import http from 'node:http';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile, rename, stat, open, unlink, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { HttpError, validatePortfolio, mediaNamePattern } from './schema.mjs';
import { syncGithub } from '../scripts/sync-github.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_UPLOAD = 250 * 1024 * 1024;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.woff2': 'font/woff2' };
const readJson = async file => JSON.parse(await readFile(file, 'utf8'));
async function atomicJson(file, value) {
  const temp = `${file}.${randomUUID()}.tmp`;
  try { await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' }); await rename(temp, file); }
  catch (error) { await unlink(temp).catch(() => {}); throw error; }
}
function json(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); }
async function requestJson(req) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw new HttpError(415, 'Expected application/json');
  if (Number(req.headers['content-length']) > 2 * 1024 * 1024) throw new HttpError(413, 'Content exceeds 2 MiB');
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 2 * 1024 * 1024) throw new HttpError(413, 'Content exceeds 2 MiB'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new HttpError(400, 'Invalid JSON'); }
}
function checkSignature(bytes, ext) {
  if (ext === '.png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (ext === '.jpg' || ext === '.jpeg') return bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (ext === '.gif') return ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString());
  if (ext === '.webp') return bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  if (ext === '.webm') return bytes.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163]));
  if (ext === '.mp4' || ext === '.mov') return bytes.length >= 12 && bytes.subarray(4, 8).toString() === 'ftyp';
  return false;
}
async function upload(req, dir) {
  let original;
  try { original = decodeURIComponent(req.headers['x-filename'] || ''); } catch { throw new HttpError(400, 'Invalid filename encoding'); }
  const ext = path.extname(original).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov'].includes(ext)) throw new HttpError(400, 'Supported: JPG, PNG, WebP, GIF, MP4, WebM, MOV');
  if (Number(req.headers['content-length']) > MAX_UPLOAD) throw new HttpError(413, 'Upload exceeds 250 MiB');
  const id = randomUUID(); const file = `${id}${ext}`; const temp = path.join(dir, `${id}.tmp`);
  const handle = await open(temp, 'wx'); let size = 0; let signature = Buffer.alloc(0);
  try {
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_UPLOAD) throw new HttpError(413, 'Upload exceeds 250 MiB');
      if (signature.length < 32) signature = Buffer.concat([signature, chunk.subarray(0, 32 - signature.length)]);
      await handle.writeFile(chunk);
    }
    if (!checkSignature(signature, ext)) throw new HttpError(400, 'File contents do not match the supported media format');
    await handle.close(); await rename(temp, path.join(dir, file));
  } catch (error) { await handle.close().catch(() => {}); await unlink(temp).catch(() => {}); throw error; }
  const title = path.basename(original, ext).slice(0, 200);
  return { id, type: ['.mp4', '.webm', '.mov'].includes(ext) ? 'video' : 'image', url: `/media/${file}`, title: { zh: title, en: title }, chapters: [] };
}
async function sendFile(req, res, file, media = false) {
  let info;
  try { info = await stat(file); } catch (error) { if (error.code === 'ENOENT') throw new HttpError(404, 'File not found'); throw error; }
  if (!info.isFile()) throw new HttpError(404, 'File not found');
  const headers = { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control': media ? 'private, max-age=3600' : 'no-cache' };
  let start = 0; let end = info.size - 1; let status = 200;
  if (media) headers['Accept-Ranges'] = 'bytes';
  if (media && req.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    let invalid = !match || (!match[1] && !match[2]) || info.size === 0;
    if (!invalid) {
      if (!match[1]) { const suffix = Number(match[2]); invalid = !Number.isSafeInteger(suffix) || suffix < 1; start = Math.max(0, info.size - suffix); }
      else { start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), info.size - 1) : info.size - 1; }
      invalid ||= !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size;
    }
    if (invalid) { res.writeHead(416, { 'Content-Range': `bytes */${info.size}` }); res.end(); return; }
    status = 206; headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`; headers['Content-Length'] = end - start + 1;
  }
  res.writeHead(status, headers);
  if (req.method === 'HEAD' || info.size === 0) { res.end(); return; }
  const stream = createReadStream(file, { start, end }); stream.on('error', () => res.destroy()); res.on('close', () => stream.destroy()); stream.pipe(res);
}

export async function createApp({ root = projectRoot, dataDir = path.join(root, 'local-data'), sync = syncGithub } = {}) {
  const uploads = path.join(dataDir, 'uploads'); const backups = path.join(dataDir, 'backups'); const runtime = path.join(dataDir, 'portfolio.json');
  await Promise.all([mkdir(uploads, { recursive: true }), mkdir(backups, { recursive: true })]);
  const token = randomBytes(32).toString('hex'); let queue = Promise.resolve(); let syncInProgress = false;
  const current = async () => { try { return await readJson(runtime); } catch (error) { if (error.code !== 'ENOENT') throw error; return readJson(path.join(root, 'data', 'portfolio.seed.json')); } };
  const serialize = fn => { const operation = queue.then(fn); queue = operation.catch(() => {}); return operation; };
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer'); res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' blob:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    try {
      const port = server.address()?.port;
      const allowedHosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`]);
      if (!allowedHosts.has(req.headers.host)) throw new HttpError(403, 'Unexpected Host');
      const origin = req.headers.origin;
      if (origin && origin !== `http://${req.headers.host}`) throw new HttpError(403, 'Cross-origin requests are not allowed');
      if (req.headers['sec-fetch-site'] === 'cross-site') throw new HttpError(403, 'Cross-site requests are not allowed');
      const mutation = !['GET', 'HEAD'].includes(req.method);
      if (mutation) {
        const supplied = Buffer.from(req.headers['x-csrf-token'] || ''); const expected = Buffer.from(token);
        if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new HttpError(403, 'Open the local editor again to refresh your session');
      }
      const url = new URL(req.url, `http://${req.headers.host}`); let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { throw new HttpError(400, 'Invalid URL encoding'); }
      if (req.method === 'GET' && pathname === '/api/health') return json(res, 200, { ok: true, app: 'kuz-pscv' });
      if (req.method === 'GET' && pathname === '/api/session') return json(res, 200, { token });
      if (req.method === 'GET' && pathname === '/api/portfolio') return json(res, 200, await current());
      if (req.method === 'GET' && pathname === '/api/repositories') return json(res, 200, await readJson(path.join(root, 'data', 'repositories.json')));
      if (req.method === 'PUT' && pathname === '/api/portfolio') {
        const body = validatePortfolio(await requestJson(req));
        const saved = await serialize(async () => {
          const previous = await current(); if (body.revision !== previous.revision) throw new HttpError(409, 'Content changed in another editor. Reload before saving.');
          for (const project of body.projects) for (const media of project.media) {
            try { await access(path.join(uploads, media.url.slice(7))); } catch { throw new HttpError(400, `Media file missing: ${media.id}`); }
          }
          await atomicJson(path.join(backups, `portfolio-r${previous.revision}-${Date.now()}-${randomUUID()}.json`), previous);
          const next = { ...body, revision: previous.revision + 1 }; await atomicJson(runtime, next); return next;
        });
        return json(res, 200, saved);
      }
      if (req.method === 'POST' && pathname === '/api/upload') return json(res, 201, await upload(req, uploads));
      if (req.method === 'POST' && pathname === '/api/github/sync') {
        if (syncInProgress) throw new HttpError(409, 'GitHub sync is already running');
        syncInProgress = true;
        try { return json(res, 200, await sync({ root })); } finally { syncInProgress = false; }
      }
      if (['GET', 'HEAD'].includes(req.method) && pathname.startsWith('/media/')) {
        const name = pathname.slice(7); if (!mediaNamePattern.test(name)) throw new HttpError(404, 'Media not found');
        return await sendFile(req, res, path.join(uploads, name), true);
      }
      if (['GET', 'HEAD'].includes(req.method) && !pathname.startsWith('/api/')) {
        const relative = pathname === '/' ? 'index.html' : ['/admin', '/admin/'].includes(pathname) ? 'admin.html' : pathname.slice(1);
        if (!/^[a-zA-Z0-9_./-]+$/.test(relative) || relative.split('/').some(p => p.startsWith('.')) || !Object.hasOwn(TYPES, path.extname(relative))) throw new HttpError(404, 'Not found');
        const frontend = path.join(root, 'frontend'); const file = path.resolve(frontend, relative);
        if (!file.startsWith(`${frontend}${path.sep}`)) throw new HttpError(404, 'Not found');
        return await sendFile(req, res, file);
      }
      throw new HttpError(404, 'Route not found');
    } catch (error) {
      if (res.headersSent) { res.destroy(); return; }
      const status = error.status || 500;
      if (status === 500) console.error('Request failed:', error.message);
      json(res, status, { error: status === 500 ? 'Local server error. Check the terminal log.' : error.message });
    }
  });
  server.requestTimeout = 10 * 60 * 1000; server.headersTimeout = 30000;
  return server;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4318);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be 1..65535');
  const server = await createApp();
  server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Open http://127.0.0.1:${port} or choose PORT.` : error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Kuz PSCV: http://127.0.0.1:${port}\nEditor: http://127.0.0.1:${port}/admin\nLocal files: ${path.join(projectRoot, 'local-data')}\nPress Ctrl+C to stop.`));
}
