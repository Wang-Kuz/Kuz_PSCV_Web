export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const fail = message => { throw new HttpError(400, message); };
const obj = value => value && typeof value === 'object' && !Array.isArray(value);
function str(value, label, max = 12000) { if (typeof value !== 'string' || value.length > max) fail(`${label}: expected text (max ${max})`); }
function bilingual(value, label) { if (!obj(value)) fail(`${label}: expected {zh,en}`); str(value.zh, `${label}.zh`); str(value.en, `${label}.en`); }
function github(value, label) { str(value, label, 250); if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)?\/?$/.test(value)) fail(`${label}: use an https://github.com/ URL`); }
export const mediaNamePattern = /^[a-f0-9-]{36}\.(?:jpg|jpeg|png|webp|gif|mp4|webm|mov)$/;
const categories = new Set(['ai', 'agent', 'rag', 'enterprise', 'management', 'software', 'algorithm']);
export function validatePortfolio(value) {
  if (!obj(value) || value.schemaVersion !== 1) fail('Unsupported schemaVersion');
  if (!Number.isSafeInteger(value.revision) || value.revision < 0) fail('Invalid revision');
  if (!obj(value.profile)) fail('Missing profile');
  str(value.profile.name, 'profile.name', 160); github(value.profile.github, 'profile.github');
  for (const key of ['role', 'headline', 'intro', 'availability']) bilingual(value.profile[key], `profile.${key}`);
  if (!obj(value.copy) || Object.keys(value.copy).length > 500) fail('Invalid copy');
  for (const [key, copy] of Object.entries(value.copy)) bilingual(copy, `copy.${key}`);
  if (!Array.isArray(value.projects) || value.projects.length > 500) fail('projects must contain at most 500 entries');
  const ids = new Set();
  for (const project of value.projects) {
    if (!obj(project) || typeof project.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(project.id) || ids.has(project.id)) fail('Project IDs must be unique safe slugs');
    ids.add(project.id);
    for (const key of ['name', 'tagline', 'summary', 'role', 'problem', 'solution', 'outcome', 'status', 'evidence']) bilingual(project[key], `${project.id}.${key}`);
    github(project.github, `${project.id}.github`);
    for (const key of ['featured', 'visible', 'delivered']) if (typeof project[key] !== 'boolean') fail(`${project.id}.${key}: expected boolean`);
    if (!Array.isArray(project.categories) || project.categories.some(c => !categories.has(c)) || new Set(project.categories).size !== project.categories.length) fail(`${project.id}: invalid categories`);
    if (!Array.isArray(project.tech) || project.tech.length > 50) fail(`${project.id}: invalid tech`);
    project.tech.forEach(s => str(s, `${project.id}.tech`, 100));
    if (project.delivered && (!project.evidence.zh.trim() || !project.evidence.en.trim())) fail(`${project.id}: delivered projects require bilingual evidence`);
    if (!Array.isArray(project.media) || project.media.length > 200) fail(`${project.id}: invalid media`);
    const mediaIds = new Set();
    for (const media of project.media) {
      if (!obj(media) || !['image', 'video'].includes(media.type) || typeof media.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(media.id) || mediaIds.has(media.id)) fail(`${project.id}: invalid media ID/type`);
      mediaIds.add(media.id);
      if (typeof media.url !== 'string' || !media.url.startsWith('/media/') || !mediaNamePattern.test(media.url.slice(7))) fail(`${project.id}: media URL must reference a local upload`);
      const video = /\.(mp4|webm|mov)$/.test(media.url);
      if (video !== (media.type === 'video')) fail(`${project.id}: media extension/type mismatch`);
      bilingual(media.title, `${project.id}.media.title`);
      if (!Array.isArray(media.chapters) || media.chapters.length > 500 || (media.type === 'image' && media.chapters.length)) fail(`${project.id}: invalid chapters`);
      for (const chapter of media.chapters) {
        if (!obj(chapter) || !Number.isFinite(chapter.time) || chapter.time < 0 || chapter.time > 604800) fail('Chapter time must be finite nonnegative seconds');
        bilingual(chapter.title, `${project.id}.chapter.title`);
      }
    }
  }
  if(value.site!==undefined){
    const site=value.site;
    if(!obj(site)||!Array.isArray(site.pages)||site.pages.length>100)fail('Invalid site pages');
    const pageIds=new Set();
    const safeUrl=u=>typeof u==='string'&&u.length<2048&&(!u||u.startsWith('#')||(/^\/(?!\/)/.test(u)&&!/[\\\x00-\x20]/.test(u)));
    const header=h=>{if(!obj(h)||!Array.isArray(h.links)||h.links.length>30)fail('Invalid header');if(h.logo&&!/^\/media\/[a-f0-9-]{36}\.(png|jpg|jpeg|gif|webp)$/.test(h.logo))fail('Invalid logo');for(const l of h.links){str(l.label,'Header label',100);if(!safeUrl(l.href))fail('Invalid navigation target');}};
    if(site.contact!==undefined){const c=site.contact;if(!obj(c))fail('Invalid contact');str(c.email,'Email',254);if(c.email&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(c.email))fail('Invalid email');str(c.wechat,'WeChat',100);if(c.qr&&!/^\/media\/[a-f0-9-]{36}\.(png|jpg|jpeg|gif|webp)$/.test(c.qr))fail('Invalid QR image');}
    header(site.header);if(site.workstationData!==undefined){const d=site.workstationData;if(!obj(d)||!obj(d.progress)||!Array.isArray(d.progress.timeline)||d.progress.timeline.length>200||!obj(d.achievements)||JSON.stringify(d).length>200000)fail('Invalid workstation data');const textValue=v=>typeof v==='string'||(obj(v)&&typeof v.zh==='string'&&typeof v.en==='string');for(const item of d.progress.timeline)if(!obj(item)||!textValue(item.title)||!textValue(item.desc)||typeof item.year!=='string')fail('Invalid timeline item');for(const items of Object.values(d.achievements))if(!Array.isArray(items)||items.length>200||items.some(item=>!obj(item)||!textValue(item.title)))fail('Invalid achievements');for(const key of ['skills','soft_skills','fitness','coding_stats']){const chart=d.progress[key];if(!obj(chart)||!Array.isArray(chart.labels)||chart.labels.length>200||chart.labels.some(x=>typeof x!=='string'))fail('Invalid chart labels');for(const [field,values]of Object.entries(chart))if(field!=='labels'&&(!Array.isArray(values)||values.length!==chart.labels.length||values.some(n=>!Number.isFinite(n))))fail('Invalid chart values');}}
    for(const p of site.pages){if(!obj(p)||!/^[-a-zA-Z0-9_]{1,100}$/.test(p.id)||pageIds.has(p.id))fail('Invalid page ID');pageIds.add(p.id);if(p.legacy&&!/^\/workstation\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html$/.test(p.legacy))fail('Invalid legacy path');str(p.name,'Page name',160);if(p.header)header(p.header);if(!Array.isArray(p.blocks)||p.blocks.length>100)fail('Invalid blocks');const ids=new Set();for(const b of p.blocks){if(!obj(b)||!/^[-a-zA-Z0-9_]{1,100}$/.test(b.id)||ids.has(b.id))fail('Invalid block');ids.add(b.id);if(b.href!==undefined&&!safeUrl(b.href))fail('Invalid block target');if(b.buttonLabel!==undefined)str(b.buttonLabel,'Button label',100);str(b.title,'Block title');str(b.text,'Block text');if(b.autoplay!==undefined&&typeof b.autoplay!=='boolean')fail('Invalid autoplay');if(b.slideSeconds!==undefined&&(!Number.isInteger(b.slideSeconds)||b.slideSeconds<5||b.slideSeconds>30))fail('Invalid carousel interval');if(b.businessImage&&!/^\/media\/[a-f0-9-]{36}\.(png|jpg|jpeg|gif|webp)$/.test(b.businessImage))fail('Invalid business image');if(b.image&&!/^\/media\/[a-f0-9-]{36}\.(png|jpg|jpeg|gif|webp)$/.test(b.image))fail('Invalid image');}}
    for(const p of site.pages){let n=p;const seen=new Set([p.id]);while(n.parent){n=site.pages.find(x=>x.id===n.parent);if(!n||seen.has(n.id))fail('Invalid page hierarchy');seen.add(n.id);}}
  }
  return value;
}
