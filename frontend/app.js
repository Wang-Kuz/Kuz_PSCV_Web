import { COPY_DEFAULTS as defaultCopy } from './copy.js';
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
let heroCleanup;
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
  const hero = make('section', 'hero'); hero.id = 'home';
  const back = make('div', 'hero-backdrop'); back.setAttribute('aria-hidden', 'true');
  append(back, make('div', 'hero-grid'), make('span', 'hero-watermark', 'KUZ'));
  const body = make('div', 'hero-content');
  const status = make('div', 'hero-status'); append(status, make('span', 'status-dot'), make('span', '', localize(portfolio.profile.availability)));
  append(body, status, eyebrow(copy('heroEyebrow')));
  const title = make('h1', 'hero-title', localize(portfolio.profile.headline) || '把智能，\n带入现实。');
  append(body, title, make('p', 'hero-intro', localize(portfolio.profile.intro)));
  const actions = make('div', 'hero-actions');
  append(actions, append(link(copy('heroAction'), '#work', 'button-primary'), arrow('↓')), append(externalLink(copy('heroSecondary'), portfolio.profile.github, 'text-link'), arrow()));
  append(body, actions);
  const art = make('div', 'hero-art'); art.setAttribute('aria-hidden', 'true');
  const canvas = make('canvas', 'orb-canvas');
  const orbit = make('div', 'orbit-system');
  append(orbit, make('div', 'orbit-halo'), make('div', 'orbit-ring ring-one'), make('div', 'orbit-ring ring-two'), make('div', 'orbit-ring ring-three'), make('div', 'orbit-core'), make('div', 'orbit-reflection'));
  const coordinates = append(make('div', 'orbit-coordinates'), make('span', '', copy('conceptSystem')), make('span', '', copy('conceptMotto')));
  append(art, canvas, orbit, coordinates, make('div', 'orbit-label', copy('orbitLabel')), make('div', 'orbit-caption', copy('orbitCaption')));
  const base = make('div', 'hero-base');
  const roles = make('div', 'hero-roles', localize(portfolio.profile.role));
  append(base, roles, append(link(copy('heroFootnote'), '#numbers', 'scroll-hint'), make('span', 'scroll-line')));
  append(hero, back, body, art, base);
  return hero;
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
  const art = make('div', `project-art art-${index % 4}`); art.setAttribute('aria-hidden', 'true');
  const window = make('div', 'concept-window');
  const top = append(make('div', 'concept-toolbar'), make('span', 'window-dots', '● ● ●'), make('span', '', project.tech?.slice(0, 2).join(' / ') || copy('conceptDesign')), make('span', '', '↗'));
  const graph = make('div', 'concept-graph');
  const center = make('div', 'graph-center', project.categories?.includes('agent') ? copy('conceptAgent') : project.categories?.includes('algorithm') ? copy('conceptModel') : project.categories?.includes('ai') ? copy('conceptAI') : copy('conceptBuild'));
  append(graph, make('div', 'graph-orbit graph-orbit-one'), make('div', 'graph-orbit graph-orbit-two'), make('div', 'graph-line line-a'), make('div', 'graph-line line-b'), make('div', 'graph-line line-c'), center);
  const words = project.tech?.length ? project.tech.slice(0, 4) : [copy('conceptInput'), copy('conceptProcess'), copy('conceptOutput')];
  words.forEach((word, i) => { const node = make('div', `graph-node graph-node-${i}`, word); append(node, make('span', 'node-light')); graph.append(node); });
  const bottom = append(make('div', 'concept-bottom'), make('span', '', `0${index + 1} / ${copy('conceptConnections')}`), make('span', 'concept-bars', '▂▅▃▆▇▅▃'));
  append(window, top, graph, bottom);
  append(art, make('div', 'art-aura'), window, make('span', 'art-corner', copy('conceptEngineering')), make('p', 'concept-caption', copy('conceptLabel')));
  return art;
}

function renderWork() {
  const section = make('section', 'work-section'); section.id = 'work';
  const inner = make('div', 'section-inner');
  append(inner, append(make('div', 'work-intro reveal'), eyebrow(copy('workEyebrow')), heading(copy('workTitle')), make('p', 'section-description', copy('workIntro'))));
  const featured = visibleProjects().filter(p => p.featured);
  featured.forEach((project, i) => {
    const story = make('article', `project-story story-${i % 4} reveal`); story.id = `project-${project.id}`;
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

function startOrb() {
  heroCleanup?.();
  const canvas = $('.orb-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame; let visible = true; let width; let height;
  const points = Array.from({ length: 90 }, (_, i) => ({ angle: i * 2.399963, y: 1 - 2 * (i + .5) / 90, size: i % 5 === 0 ? 1.6 : .8 }));
  const resize = () => { const box = canvas.getBoundingClientRect(); width = box.width; height = box.height; const scale = Math.min(devicePixelRatio || 1, 2); canvas.width = width * scale; canvas.height = height * scale; ctx.setTransform(scale, 0, 0, scale, 0, 0); };
  const draw = time => {
    if (visible) {
      ctx.clearRect(0, 0, width, height);
      const phase = reduced ? .6 : time * .00009; const radius = Math.min(width, height) * .37;
      points.forEach(point => {
        const r = Math.sqrt(1 - point.y * point.y); const x = Math.cos(point.angle + phase) * r; const z = Math.sin(point.angle + phase) * r;
        const perspective = 1 + z * .15; const px = width / 2 + x * radius * perspective; const py = height / 2 + point.y * radius * perspective;
        ctx.fillStyle = `rgba(204,255,138,${.15 + (z + 1) * .22})`; ctx.beginPath(); ctx.arc(px, py, point.size * perspective, 0, Math.PI * 2); ctx.fill();
      });
    }
    if (!reduced && visible && !document.hidden) frame = requestAnimationFrame(draw);
  };
  const schedule = () => { cancelAnimationFrame(frame); if (visible && !document.hidden) frame = requestAnimationFrame(draw); };
  const io = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }); io.observe(canvas);
  const ro = new ResizeObserver(() => { resize(); schedule(); }); ro.observe(canvas); resize(); schedule();
  document.addEventListener('visibilitychange', schedule);
  heroCleanup = () => { cancelAnimationFrame(frame); io.disconnect(); ro.disconnect(); document.removeEventListener('visibilitychange', schedule); };
}

function render() {
  Object.entries(categoryKeys).forEach(([key, copyKey]) => { categories[key] = portfolio?.copy?.[copyKey] || defaultCopy[copyKey]; });
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = `${portfolio.profile.name || 'KUZ'} — ${copy('documentTitle')}`;
  renderHeader();
  $('#main').replaceChildren(renderHero(), renderStats(), renderExpertise(), renderWork(), renderArchive(), renderAbout());
  renderFooter(); observeReveals(); startOrb();
}

let scrollPending = false;
addEventListener('scroll', () => {
  if (scrollPending) return; scrollPending = true;
  requestAnimationFrame(() => {
    const progress = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    $('.scroll-progress').style.transform = `scaleX(${progress})`;
    $('#header').classList.toggle('scrolled', scrollY > 24);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches && scrollY < innerHeight * 1.2) $('.hero-art')?.style.setProperty('--scroll', String(scrollY / innerHeight));
    scrollPending = false;
  });
}, { passive: true });

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
