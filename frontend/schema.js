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
  return value;
}
