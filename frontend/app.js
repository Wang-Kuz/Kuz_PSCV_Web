import { COPY_DEFAULTS as defaultCopy } from './copy.js';
import { mountFields } from './field.js';
import { mountMotion } from './motion.js';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const make = (tag, className, value) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
};
const append = (parent, ...children) => { children.flat().filter(Boolean).forEach(child => parent.append(child)); return parent; };
const pair = (zh, en) => ({ zh, en });

const categoryKeys = { ai: 'categoryAI', agent: 'categoryAgent', rag: 'categoryRAG', enterprise: 'categoryEnterprise', management: 'categoryManagement', software: 'categorySoftware', algorithm: 'categoryAlgorithm' };
const categories = Object.fromEntries(Object.entries(categoryKeys).map(([key, value]) => [key, defaultCopy[value]]));
let portfolio;
let inventory;
let language = (() => { try { return localStorage.getItem('kuz-language') === 'en' ? 'en' : 'zh'; } catch { return 'zh'; } })();
let filter = 'all';
let revealObserver;
let fieldCleanup;
let motionCleanup;
let lastFocus;
const localize = value => typeof value === 'string' ? value : value?.[language] ?? value?.zh ?? value?.en ?? '';
const copy = key => localize(portfolio?.copy?.[key] || defaultCopy[key] || key);
const safeGithub = value => { try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === 'github.com' ? url.href : 'https://github.com/Wang-Kuz'; } catch { return 'https://github.com/Wang-Kuz'; } };
const link = (label, href, className) => { const a = make('a', className, label); a.href = href; return a; };
const externalLink = (label, url, className) => { const a = link(label, safeGithub(url), className); a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; };
const button = (label, className, click) => { const b = make('button', className, label); b.type = 'button'; b.addEventListener('click', click); return b; };
const arrow = (symbol = '↗') => { const s = make('span', 'arrow', symbol); s.setAttribute('aria-hidden', 'true'); return s; };
const eyebrow = value => make('p', 'eyebrow', value);
const heading = (value, level = 'h2') => make(level, 'section-title', value);
const tag = value => make('span', 'tag', value);
const visibleProjects = () => portfolio.projects.filter(p => p.visible !== false);

function renderHeader() {
  const header = $('#header'); header.replaceChildren();
  const brand = link('', '#', 'brand');
  append(brand, make('span', 'brand-mark', 'K'), make('span', 'brand-word', portfolio.profile.name || 'KUZ'));
  brand.setAttribute('aria-label', `${portfolio.profile.name || 'Kuz'} — ${copy('backTop')}`);
  const nav = make('nav', 'nav-links'); nav.setAttribute('aria-label', copy('mainNavigation'));
  append(nav, link(copy('navWork'), '#work'), link(copy('navApproach'), '#expertise'), link(copy('navAbout'), '#about'));
  const languageButton = button(language === 'zh' ? 'EN' : '中文', 'language-toggle', () => {
    language = language === 'zh' ? 'en' : 'zh';
    try { localStorage.setItem('kuz-language', language); } catch { /* Local storage may be disabled. */ }
    const currentY = scrollY; render(); scrollTo(0, currentY);
  });
  languageButton.setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换到中文');
  append(header, brand, nav, append(make('div', 'nav-actions'), languageButton, externalLink(`${copy('githubLabel')} ↗`, portfolio.profile.github, 'nav-github')));
}

function renderHero() {
  const stage = make('div', 'hero-stage');
  const hero = make('section', 'hero'); hero.id = 'home';
  const back = make('div', 'hero-backdrop'); back.setAttribute('aria-hidden', 'true');
  append(back, make('div', 'hero-grid'), make('div', 'hero-light'));
  const body = make('div', 'hero-content');
  const status = append(make('div', 'hero-status'), make('span', 'status-dot'), make('span', '', localize(portfolio.profile.availability)));
  const roles = make('p', 'hero-roles', localize(portfolio.profile.role));
  const title = make('h1', 'hero-title');
  const lines = localize(portfolio.profile.headline).split('\n');
  lines.forEach(line => title.append(make('span', 'hero-line', line)));
  append(body, status, roles, title, make('p', 'hero-intro', localize(portfolio.profile.intro)));
  const actions = append(make('div', 'hero-actions'),
    append(link(copy('heroAction'), '#work', 'button-primary'), arrow('↓')),
    append(externalLink(copy('heroSecondary'), portfolio.profile.github, 'text-link'), arrow()));
  body.append(actions);
  const art = make('div', 'hero-art'); art.setAttribute('aria-hidden', 'true');
  const canvas = make('canvas', 'field-canvas'); canvas.dataset.field = 'sculpture';
  append(art, make('div', 'field-glow'), canvas,
    append(make('div', 'field-coordinate'), make('span', '', copy('fieldTitle')), make('span', '', copy(matchMedia('(hover: hover)').matches ? 'fieldInteraction' : 'fieldTouchInteraction'))));
  const base = append(make('div', 'hero-base'), make('p', '', copy('heroEyebrow')),
    append(link(copy('heroFootnote'), '#manifest', 'scroll-hint'), make('span', 'scroll-line')));
  append(hero, back, body, art, base);stage.append(hero);
  return stage;
}

function renderManifest() {
  const section=make('section','manifest-section'); section.id='manifest';
  const inner=make('div','manifest-inner');
  const title=make('h2','manifest-title');
  const value=copy('manifestTitle');
  const segments=typeof Intl.Segmenter==='function'
    ? [...new Intl.Segmenter(language,{granularity:'word'}).segment(value)].map(s=>s.segment)
    : value.split(/(\s+)/);
  segments.forEach(segment=>{
    if(segment.includes('\n'))title.append(make('br'));
    else if(segment.trim())title.append(make('span','manifest-word',segment));
    else title.append(document.createTextNode(segment));
  });
  append(inner,eyebrow(copy('manifestEyebrow')),title,make('p','manifest-caption',copy('manifestCaption')));
  section.append(inner);return section;
}

function renderStats() {
  const section = make('section', 'stats-section light-section'); section.id = 'numbers';
  const inner = make('div', 'section-inner');
  const intro = make('div', 'section-intro reveal');
  append(intro, eyebrow(copy('statsEyebrow')), heading(copy('statsTitle')), make('p', 'section-description', copy('statsIntro')));
  const projects = visibleProjects();
  const count = category => projects.filter(p => p.categories?.includes(category)).length;
  const stats = [
    ['statsRepositories', inventory.repositories?.length || 0, ''], ['statsAI', projects.filter(p => p.categories?.some(c => ['ai', 'agent', 'rag'].includes(c))).length, '01'],
    ['statsEnterprise', count('enterprise'), '02'], ['statsManagement', count('management'), '03'], ['statsSoftware', count('software'), '04'], ['statsAlgorithm', count('algorithm'), '05'],
  ];
  const grid = make('div', 'stats-grid reveal');
  stats.forEach(([key, value, number], index) => {
    const item = make('div', `stat-item ${index === 0 ? 'stat-primary' : ''}`);
    const valueElement = make('strong', 'stat-number', String(value)); valueElement.dataset.count = value;
    append(item, make('span', 'stat-index', number || '∑'), valueElement, make('span', 'stat-label', copy(key)));
    if (index === 0) append(item, make('span', 'stat-snapshot', inventory.fetchedAt?.slice(0, 10) || 'GITHUB'));
    grid.append(item);
  });
  append(inner, intro, grid, make('p', 'stats-note reveal', `${copy('statsProjects')}: ${projects.length} · ${copy('statsNote')}`));
  if (projects.some(p => p.delivered)) append(inner, make('p', 'delivery-note', `${copy('statsDelivered')}: ${projects.filter(p => p.delivered).length}`));
  append(section, inner);
  return section;
}

function renderExpertise() {
  const section = make('section', 'expertise-section'); section.id = 'expertise';
  const inner = make('div', 'section-inner');
  const intro = append(make('div', 'expertise-intro reveal'), eyebrow(copy('expertiseEyebrow')), heading(copy('expertiseTitle')), make('p', 'section-description', copy('expertiseIntro')));
  const list = make('div', 'expertise-list');
  [['Full', '⌘', '01'], ['Agent', '✳', '02'], ['Algorithm', '∿', '03'], ['FDE', '↗', '04']].forEach(([key, symbol, number]) => {
    const item = make('div', 'expertise-item reveal');
    append(item, make('span', 'expertise-icon', symbol), make('span', 'expertise-number', number), make('h3', '', copy(`skill${key}Title`)), make('p', '', copy(`skill${key}Body`)));
    list.append(item);
  });
  append(inner, intro, list); append(section, inner); return section;
}

function projectVisual(project, index) {
  const artByProject={datafactory:'data','personal-os':'agent','desktop-avatar':'voice','legal-operations':'enterprise','spectral-graph':'algorithm',agrotrade:'commerce'};
  const kind=artByProject[project.id] || (project.categories.includes('agent')?'agent':project.categories.includes('algorithm')?'algorithm':project.categories.includes('enterprise')?'enterprise':'data');
  const art=make('div',`project-art visual-${kind}`); art.setAttribute('aria-hidden','true');
  const canvas=make('canvas','project-canvas');canvas.dataset.field=kind;
  const label=append(make('div','art-label'),make('span','',String(index+1).padStart(2,'0')),make('span','',copy(`visual${kind[0].toUpperCase()+kind.slice(1)}`)));
  append(art,make('div','art-aura'),canvas,label,make('p','concept-caption',copy('conceptLabel')));
  return art;
}

function renderWork() {
  const section = make('section', 'work-section'); section.id = 'work';
  const inner = make('div', 'section-inner');
  append(inner, append(make('div', 'work-intro reveal'), eyebrow(copy('workEyebrow')), heading(copy('workTitle')), make('p', 'section-description', copy('workIntro'))));
  const featured = visibleProjects().filter(p => p.featured);
  featured.forEach((project, i) => {
    const story = make('article', `project-story story-${i % 6} reveal`); story.id = `project-${project.id}`;
    const top = append(make('div', 'story-topline'), make('span', '', `${String(i + 1).padStart(2, '0')} / ${copy('conceptSelected')}`), make('span', '', project.categories.map(c => localize(categories[c] || c)).join(' · ')));
    const detail = make('div', 'story-copy');
    append(detail, eyebrow(localize(project.name)), make('h3', 'story-title', localize(project.tagline) || localize(project.name)), make('p', 'story-summary', localize(project.summary)));
    const tech = make('div', 'tech-list'); project.tech.forEach(t => tech.append(tag(t))); detail.append(tech);
    append(detail, append(make('div', 'story-actions'), append(button(copy('projectExplore'), 'button-primary', () => openProject(project)), arrow('+')), append(externalLink(copy('githubLabel'), project.github, 'text-link'), arrow())));
    append(story, top, append(make('div', 'story-main'), detail, projectVisual(project, i)));
    inner.append(story);
  });
  section.append(inner); return section;
}

function renderArchive() {
  const section = make('section', 'archive-section light-section'); section.id = 'archive';
  const inner = make('div', 'section-inner');
  append(inner, append(make('div', 'archive-intro reveal'), eyebrow(copy('archiveEyebrow')), heading(copy('archiveTitle'))));
  const filters = make('div', 'filter-bar reveal'); filters.setAttribute('role', 'group'); filters.setAttribute('aria-label', copy('filterNavigation'));
  [['all', copy('archiveAll')], ...Object.entries(categories).map(([key, value]) => [key, localize(value)])].forEach(([key, label]) => {
    const b = button(label, `filter-button ${filter === key ? 'active' : ''}`, () => {
      filter = key;
      $$('.filter-button').forEach(el => { el.classList.toggle('active', el.dataset.filter === key); el.setAttribute('aria-pressed', String(el.dataset.filter === key)); });
      renderArchiveRows($('#archive-list'));
    });
    b.dataset.filter = key; b.setAttribute('aria-pressed', String(filter === key)); filters.append(b);
  });
  const rows = make('div', 'archive-list'); rows.id = 'archive-list'; rows.setAttribute('aria-live', 'polite');
  renderArchiveRows(rows);
  append(inner, filters, rows, make('p', 'archive-note', copy('privateNote'))); section.append(inner); return section;
}

function renderArchiveRows(rows) {
  rows.replaceChildren();
  const projects = visibleProjects().filter(p => filter === 'all' || p.categories.includes(filter));
  if (!projects.length) { rows.append(make('p', 'empty-state', copy('archiveEmpty'))); return; }
  projects.forEach((project, i) => {
    const article = make('article', 'archive-row');
    const titleButton = button('', 'archive-project', () => openProject(project));
    append(titleButton, make('span', 'archive-index', String(i + 1).padStart(2, '0')), append(make('span', 'archive-name'), make('strong', '', localize(project.name)), make('span', '', localize(project.summary))));
    const tech = make('div', 'archive-tech'); project.tech.slice(0, 3).forEach(t => tech.append(tag(t)));
    const more = button('↗', 'round-button', () => openProject(project)); more.setAttribute('aria-label', `${copy('projectExplore')}: ${localize(project.name)}`);
    append(article, titleButton, tech, externalLink(`${copy('githubLabel')} ↗`, project.github, 'archive-github'), more); rows.append(article);
  });
}

function renderAbout() {
  const section = make('section', 'about-section'); section.id = 'about';
  const inner = make('div', 'section-inner about-grid');
  const visual = make('div', 'about-visual reveal'); visual.setAttribute('aria-hidden', 'true');
  append(visual, make('span', 'about-k', 'K'), make('span', 'about-orbit'), make('span', 'about-annotation', copy('aboutSignature')), make('span', 'about-year', copy('conceptCuriosity')));
  const content = make('div', 'about-copy reveal');
  append(content, eyebrow(copy('aboutEyebrow')), heading(copy('aboutTitle')), make('p', '', copy('aboutBody')), make('div', 'signature', portfolio.profile.name || 'Kuz'));
  append(inner, visual, content); section.append(inner); return section;
}

function renderFooter() {
  const footer = $('#footer'); footer.replaceChildren();
  const inner = make('div', 'section-inner');
  append(inner, append(make('div', 'footer-cta reveal'), make('h2', '', copy('contactTitle')), append(externalLink(copy('contactAction'), portfolio.profile.github, 'button-primary'), arrow())));
  const base = make('div', 'footer-base');
  const admin = link('◌', '/admin', 'admin-entry'); admin.title = copy('adminLabel'); admin.setAttribute('aria-label', copy('adminLabel'));
  append(base, make('span', '', `© ${new Date().getFullYear()} ${portfolio.profile.name || 'KUZ'} · ${copy('footerNote')}`), append(make('div', 'footer-links'), admin, link(`${copy('backTop')} ↑`, '#home')));
  append(inner, base); footer.append(inner);
}

function openProject(project) {
  const dialog = $('#project-dialog');
  lastFocus = document.activeElement;
  dialog.replaceChildren();
  const close = button('×', 'dialog-close', () => dialog.close()); close.setAttribute('aria-label', copy('close'));
  const head = make('header', 'dialog-head');
  const title = make('h2', '', localize(project.name)); title.id = 'dialog-title';
  append(head, eyebrow(project.categories.map(c => localize(categories[c] || c)).join(' / ')), title, make('p', 'dialog-tagline', localize(project.tagline)), externalLink(`${copy('projectGithub')} · ${copy('githubLabel')} ↗`, project.github, 'text-link'));
  const intro = make('p', 'dialog-summary', localize(project.summary));
  const tech = make('div', 'tech-list'); project.tech.forEach(t => tech.append(tag(t)));
  const details = make('div', 'project-details');
  [['role', 'roleLabel'], ['problem', 'problemLabel'], ['solution', 'solutionLabel'], ['outcome', 'outcomeLabel']].forEach(([field, key]) => { if (localize(project[field])) append(details, append(make('section', 'detail-block'), make('h3', '', copy(key)), make('p', '', localize(project[field])))); });
  const gallery = make('section', 'media-gallery'); append(gallery, make('h3', 'gallery-title', copy('gallery')));
  const media = (project.media || []).filter(m => /^\/media\/[a-zA-Z0-9._-]+$/.test(m.url));
  if (!media.length) append(gallery, append(make('div', 'gallery-empty'), make('span', 'gallery-symbol', '◎'), make('h4', '', copy('galleryEmpty')), make('p', '', copy('galleryEmptyBody'))));
  const images = make('div', 'image-gallery');
  media.forEach(m => {
    const figure = make('figure', `media-item media-${m.type}`);
    if (m.type === 'video') {
      const video = make('video'); video.src = m.url; video.controls = true; video.preload = 'metadata'; video.playsInline = true;
      video.setAttribute('aria-label', localize(m.title));
      append(figure, video, make('figcaption', '', localize(m.title)));
      if (m.chapters?.length) {
        const chapters = make('div', 'video-chapters');
        append(chapters, make('p', '', copy('videoChapters')));
        [...m.chapters].sort((a, b) => a.time - b.time).forEach(chapter => {
          const seconds = Number(chapter.time); if (!Number.isFinite(seconds) || seconds < 0) return;
          const timestamp = `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
          const jump = () => { video.currentTime = Number.isFinite(video.duration) ? Math.min(seconds, video.duration) : seconds; video.play().catch(() => {}); };
          append(chapters, button(`${timestamp}  ${localize(chapter.title)}`, 'chapter-button', () => { if (video.readyState >= 1) jump(); else { video.addEventListener('loadedmetadata', jump, { once: true }); video.load(); } }));
        });
        figure.append(chapters);
      }
      gallery.append(figure);
    } else {
      const image = make('img'); image.src = m.url; image.alt = localize(m.title); image.loading = 'lazy'; image.decoding = 'async';
      const a = link('', m.url); a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', `${copy('imageOpen')}: ${localize(m.title)}`); a.append(image);
      append(figure, a, make('figcaption', '', localize(m.title))); images.append(figure);
    }
  });
  if (images.children.length) gallery.append(images);
  const evidence = make('div', 'project-evidence');
  append(evidence, make('h3', '', copy('statusLabel')), make('p', '', localize(project.status)), make('h3', '', copy('evidenceLabel')), make('p', '', localize(project.evidence)));
  append(dialog, close, head, intro, tech, details, gallery, evidence);
  dialog.showModal(); document.body.classList.add('dialog-open'); close.focus();
}

$('#project-dialog').addEventListener('close', () => { $$('#project-dialog video').forEach(v => v.pause()); document.body.classList.remove('dialog-open'); lastFocus?.focus(); });
$('#project-dialog').addEventListener('click', event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.currentTarget.close(); } });
document.addEventListener('keydown', event => { if (event.altKey && event.shiftKey && event.code === 'KeyE') location.href = '/admin'; });

function observeReveals() {
  revealObserver?.disconnect();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target);
    if (!reduced) $$('[data-count]', entry.target).forEach(element => {
      const target = Number(element.dataset.count); const start = performance.now();
      const tick = now => { const progress = Math.min(1, (now - start) / 1100); element.textContent = String(Math.round(target * (1 - (1 - progress) ** 3))); if (progress < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  }), { threshold: 0.08, rootMargin: '0px 0px 20px 0px' });
  $$('.reveal').forEach(element => revealObserver.observe(element));
}


function render() {
  fieldCleanup?.(); motionCleanup?.();
  Object.entries(categoryKeys).forEach(([key, copyKey]) => { categories[key] = portfolio?.copy?.[copyKey] || defaultCopy[copyKey]; });
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = `${portfolio.profile.name || 'KUZ'} — ${copy('documentTitle')}`;
  renderHeader();
  $('#main').replaceChildren(renderHero(), renderManifest(), renderStats(), renderExpertise(), renderWork(), renderArchive(), renderAbout());
  renderFooter(); observeReveals(); fieldCleanup = mountFields(); motionCleanup = mountMotion();
}


try {
  const responses = await Promise.all([fetch('/api/portfolio'), fetch('/api/repositories')]);
  if (responses.some(response => !response.ok)) throw new Error('Unable to load portfolio');
  [portfolio, inventory] = await Promise.all(responses.map(response => response.json()));
  render();
} catch (error) {
  const errorView = make('div', 'loading-screen');
  append(errorView, make('span', 'brand-mark', 'K'), make('h1', '', copy('loadError')), button(copy('retry'), 'button-primary', () => location.reload()));
  $('#main').replaceChildren(errorView);
  console.error(error);
}
