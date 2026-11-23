// A short-lived overlay samples the actual wrapped heading, including CMS edits.
// The semantic text remains selectable and visible throughout the sequence.
function sampleInk(title, text, width, height) {
  const density = Math.min(1, 800 / width, 260 / height);
  const mask = document.createElement('canvas');
  mask.width = Math.ceil(width * density);
  mask.height = Math.ceil(height * density);
  const ctx = mask.getContext('2d', {willReadFrequently:true});
  if (!ctx) return [];
  const css = getComputedStyle(title);
  ctx.scale(density, density);
  ctx.font = [css.fontStyle, css.fontWeight, css.fontSize, css.fontFamily].join(' ');
  const bounds = title.getBoundingClientRect();
  const range = document.createRange();
  const metrics = ctx.measureText('Mg国');
  const baseline = ((metrics.fontBoundingBoxAscent || parseFloat(css.fontSize) * .85)
                  - (metrics.fontBoundingBoxDescent || parseFloat(css.fontSize) * .15)) / 2;
  const glyphs = typeof Intl.Segmenter === 'function'
    ? [...new Intl.Segmenter(document.documentElement.lang, {granularity:'grapheme'}).segment(text.data)].map(g => g.segment)
    : Array.from(text.data);
  let offset = 0;
  for (const glyph of glyphs) {
    range.setStart(text, offset);
    offset += glyph.length;
    range.setEnd(text, offset);
    if (!glyph.trim()) continue;
    const rect = range.getBoundingClientRect();
    ctx.fillText(glyph, rect.left - bounds.left, rect.top - bounds.top + rect.height / 2 + baseline);
  }
  const {data} = ctx.getImageData(0, 0, mask.width, mask.height);
  const points = [];
  const step = Math.max(2, Math.floor(parseFloat(css.fontSize) * density / 18));
  for (let y = 1; y < mask.height; y += step) {
    for (let x = 1; x < mask.width; x += step) {
      if (data[(y * mask.width + x) * 4 + 3] > 100) points.push([x / density, y / density]);
    }
  }
  const stride = Math.max(1, Math.ceil(points.length / (innerWidth < 700 ? 640 : 1250)));
  return points.filter((_, i) => i % stride === 0);
}

function assemble(title, done) {
  const text = title.firstChild;
  const {width,height} = title.getBoundingClientRect();
  if (title.childNodes.length !== 1 || text?.nodeType !== Node.TEXT_NODE ||
      !width || !height || height > 600 || text.length > 220) return;
  const points = sampleInk(title, text, width, height);
  if (!points.length) return;
  const overlay = document.createElement('canvas');
  const ctx = overlay.getContext('2d');
  if (!ctx) return;
  const spread = Math.min(width * .25, 145);
  const pad = 48;
  const ratio = Math.min(devicePixelRatio || 1, 1.5);
  overlay.className = 'ink-particles';
  overlay.setAttribute('aria-hidden','true');
  overlay.width = Math.ceil((width + pad * 2) * ratio);
  overlay.height = Math.ceil((height + pad * 2) * ratio);
  overlay.style.inset = -pad + 'px';
  overlay.style.width = width + pad * 2 + 'px';
  overlay.style.height = height + pad * 2 + 'px';
  ctx.scale(ratio,ratio);
  ctx.translate(pad,pad);
  const ink = document.createElement('span');
  title.classList.add('assembling-title');
  ink.append(text);
  title.append(ink,overlay);
  const start = performance.now();
  let frame;
  const finish = () => {
    cancelAnimationFrame(frame);
    overlay.remove(); ink.replaceWith(text);
    title.classList.remove('assembling-title'); done();
  };
  const draw = now => {
    const t = Math.min(1, (now-start)/1150);
    ctx.clearRect(-pad,-pad,width+pad*2,height+pad*2);
    ink.style.opacity = String(.28 + .72 * Math.min(1, Math.max(0,(t-.35)/.57)));
    ctx.globalAlpha = Math.min(1,t*8,(1-t)*5);
    for (let i=0;i<points.length;i++) {
      const [x,y]=points[i];
      const phase = Math.min(1,Math.max(0,(t - .15*x/width)/.70));
      const travel = (1-phase)**3;
      const angle = i*2.39996;
      const px = x + travel * (Math.cos(angle)*spread - spread*.4);
      const py = y + travel * (Math.sin(angle)*27 + 22) + Math.sin(phase*Math.PI)*Math.cos(angle)*11;
      ctx.fillStyle = i%5===0 ? '#a2f0d2' : i%3===0 ? '#b3bcff' : '#e2ebf0';
      const size = i%5===0 ? 2.2 : 1.55;
      ctx.fillRect(px,py,size,size);
    }
    if (t===1) finish(); else frame=requestAnimationFrame(draw);
  };
  frame=requestAnimationFrame(draw);
  return finish;
}

export function mountTitleParticles(root, reduced) {
  const titles = [...root.querySelectorAll('#work .work-intro h2,#aigc-guide h2,#about h2')];
  if (!titles.length || new URL(location.href).searchParams.has('preview')) return () => {};
  const running = new Map(), seen = new Set();
  const stop = () => { for (const finish of running.values()) finish(); };
  const observer = new IntersectionObserver(entries => {
    for (const {target,isIntersecting} of entries) {
      if (!isIntersecting) { running.get(target)?.(); continue; }
      if (seen.has(target) || reduced.matches || document.hidden) continue;
      const finish=assemble(target,()=>running.delete(target));
      if (finish) running.set(target,finish);
      seen.add(target);
    }
  }, {threshold:0, rootMargin:'0px 0px -8% 0px'});
  const configure=()=>{stop();observer.disconnect();if(!document.hidden&&!reduced.matches)titles.forEach(title=>observer.observe(title));};
  reduced.addEventListener('change',configure);
  document.addEventListener('visibilitychange',configure);
  window.addEventListener('resize',stop);
  configure();
  return ()=>{observer.disconnect();stop();reduced.removeEventListener('change',configure);document.removeEventListener('visibilitychange',configure);window.removeEventListener('resize',stop);};
}
