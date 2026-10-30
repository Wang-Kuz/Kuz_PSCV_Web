# Implementation contract

Local-only Node >=22 application, zero runtime dependencies. Editable dirs: frontend/, backend/, scripts/, data/, docs/, tests/. HTTP listens 127.0.0.1:4318 only. Frontend native ES modules, no build required. No production deployment.

## Data
`data/portfolio.seed.json` is versioned curated seed. `local-data/portfolio.json` is ignored persistent runtime override. `data/repositories.json` is metadata inventory. `local-data/uploads/` and `local-data/backups/` ignored. Never overwrite runtime edits on launch or GitHub sync.

Portfolio object: `{schemaVersion:1, revision:0, profile:{name:string, role:{zh,en}, headline:{zh,en}, intro:{zh,en}, availability:{zh,en}, github:string}, copy:{[key]:{zh,en}}, projects:Project[]}`. Additional keys allowed. All display text strings rendered as text, no HTML interpolation.

Project: `{id:slug, name:{zh,en}, tagline:{zh,en}, summary:{zh,en}, role:{zh,en}, problem:{zh,en}, solution:{zh,en}, outcome:{zh,en}, status:{zh,en}, categories:string[], tech:string[], github:string, featured:boolean, visible:boolean, delivered:boolean, evidence:{zh,en}, media:Media[]}`. Categories allowed: `ai, agent, rag, enterprise, management, software, algorithm`. Verified tags only; delivered only with evidence. Null/unverified numbers must not become achievements. Source inventory count separate from showcased projects and delivered count. Media: `{id:string,type:'image'|'video',url:'/media/<uuid>.<ext>',title:{zh,en},chapters:[{time:number,title:{zh,en}}]}`. Chapters nonnegative finite seconds, sorted in UI.

## HTTP
- GET /api/portfolio -> portfolio; GET /api/repositories -> inventory.
- GET /api/session -> `{token:string}` (local session capability). All mutations require `X-CSRF-Token` and same-origin check; reject foreign Origin and unexpected Host.
- PUT /api/portfolio -> whole portfolio including current revision; validates schema, optimistic revision conflict 409; atomic write with previous backup; returns updated portfolio.
- POST /api/upload with raw body, X-Filename URL-encoded original filename, Content-Type; stream max 250 MiB, whitelist jpg/png/webp/gif/mp4/webm/mov and magic validation; returns `{id,type,url,title:{zh,en},chapters:[]}`. Uploaded files not added to project until portfolio save.
- GET/HEAD /media/<file> -> media with HTTP single Range support; reject traversal.
- POST /api/github/sync -> reads through gh CLI (existing auth) or public GitHub API; updates metadata inventory and README generated markers only, no fabricated case studies or runtime data overwrite; returns inventory. GitHub read only (no push from backend).
- GET /api/health -> `{ok:true,app:'kuz-pscv'}`.
- GET / -> frontend/index.html; GET /admin -> frontend/admin.html.

Frontend app.js/style.css and index.html are public UI owned by frontend worker. admin.html/admin.js/admin.css owned by root. Shared frontend/lib.js owned by root: exports `text(value,lang='zh')`, `el(tag,attrs={},...children)`, `api(path,options={})`, `getStats(portfolio,inventory)`; api auto retrieves token for mutation. No other shared frontend dependencies.

README repository table markers `<!-- REPOSITORIES:START -->` and `<!-- REPOSITORIES:END -->`. Sync lists all repos and visibility; private links need viewer permission. Public repository contains only curated summaries/metadata, never private source or customer data.

Validation source is frontend/schema.js shared by the browser editor and backend/schema.mjs re-export. Initial delivered=true means a documented deployment, not customer acceptance; use the accurate label in UI.
