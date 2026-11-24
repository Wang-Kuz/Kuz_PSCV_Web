// One event-driven camera controller. Natural browser scrolling remains untouched.
import {mountTitleParticles} from './title-particles.js';
const clamp = n => Math.max(0, Math.min(1,n));
// One thumb-sized chapter control for long features. Titles come from the published page.
function chapterDial(root) {
  if (new URL(location.href).searchParams.has('preview')) return null;
  const sections = [...root.querySelectorAll('.project-story[id], .engineering-service[id]')];
  const entries = sections.filter(section => section.getClientRects().length).map(section => ({
    section, title: section.querySelector('.story-copy .eyebrow,.engineering-copy .eyebrow')?.textContent.replace(/^\d+\s*\/\s*/, '').trim()
  })).filter(entry => entry.title);
  if (entries.length < 2) return null;
  const dial = document.createElement('label');
  dial.className = 'chapter-dial';
  dial.hidden = true;
  const number = document.createElement('span');
  number.className = 'chapter-position';
  number.setAttribute('aria-hidden','true');
  const select = document.createElement('select');
  select.setAttribute('aria-label',document.documentElement.lang.startsWith('zh') ? '跳转到章节' : 'Jump to chapter');
  const meter = document.createElement('i');
  meter.setAttribute('aria-hidden','true');
  entries.forEach(({section,title}) => select.add(new Option(title,section.id)));
  select.onchange = () => {
    const section = entries[select.selectedIndex].section;
    if (location.hash === '#' + section.id) section.scrollIntoView();
    else location.hash = section.id;
  };
  dial.append(number,select,meter);
  document.body.append(dial);
  let current = -1;
  return {
    update() {
      const line = innerHeight * .43;
      const bounds = entries.map(({section}) => section.getBoundingClientRect());
      dial.hidden = bounds[0].top > line || bounds.at(-1).bottom <= line;
      if (dial.hidden) return;
      const index = bounds.findLastIndex(rect => rect.top <= line);
      if (index !== current) {
        current = index;
        select.selectedIndex = index;
        number.textContent = String(index+1).padStart(2,'0') + ' / ' + String(entries.length).padStart(2,'0');
      }
      const rect = bounds[index];
      meter.style.transform = 'scaleX(' + clamp((line-rect.top)/Math.max(rect.height,1)) + ')';
    },
    remove() { dial.remove(); }
  };
}
export function mountMotion(root=document){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const listeners=[];
  const listen=(target,event,fn,options)=>{target.addEventListener(event,fn,options);listeners.push(()=>target.removeEventListener(event,fn,options));};
  let frame=0;
  const stage=root.querySelector('.hero-stage');
  const disposeInk=mountTitleParticles(root,reduced);
  const dial=chapterDial(root);
  const layers=[...root.querySelectorAll('.hero-stage ~ section .gateway-art,.hero-stage ~ section .project-art,.hero-stage ~ section .about-visual')];
  const stories=[...root.querySelectorAll('.project-story')];
  const manifest=root.querySelector('.manifest-section');
  const words=[...root.querySelectorAll('.manifest-word')];
  const update=()=>{
    frame=0;
    dial?.update();
    if(stage){
      const p=clamp(-stage.getBoundingClientRect().top/Math.max(innerHeight*.65,stage.offsetHeight-innerHeight));
      stage.style.setProperty('--camera-progress',reduced.matches?0:p);
    }
    stories.forEach(story=>{
      const r=story.getBoundingClientRect();
      if(r.bottom<0||r.top>innerHeight)return;
      const p=clamp((innerHeight-r.top)/(innerHeight+r.height));
      story.style.setProperty('--scene-progress',reduced.matches ? .5 : p);
    });
    for(const layer of layers){
      const rect=layer.parentElement.getBoundingClientRect();
      if(rect.bottom<0 || rect.top>innerHeight)continue;
      const arrival=clamp((innerHeight*.60-(rect.top+Math.min(rect.height,innerHeight)/2))/(innerHeight*.10));
      layer.style.setProperty('--arrival-scale',reduced.matches?1:1+(1-arrival)*.075);
    }
    if(manifest){
      const r=manifest.getBoundingClientRect();
      const p=clamp((innerHeight*.60-r.top-Math.min(r.height,innerHeight)/2)/(innerHeight*.10));
      words.forEach((word,i)=>word.style.setProperty('--lit',reduced.matches?1:clamp(p*(words.length+2)-i)));
    }
    const progress=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
    root.querySelector('.scroll-progress')?.style.setProperty('transform',`scaleX(${progress})`);
    root.querySelector('#header')?.classList.toggle('scrolled',scrollY>30);
    const active=[...root.querySelectorAll('main section[id]')].filter(s=>s.getBoundingClientRect().top<innerHeight*.4).at(-1)?.id;
    root.querySelectorAll('.nav-links a').forEach(a=>{if(a.hash===`#${active}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  listen(window,'scroll',schedule,{passive:true});listen(window,'resize',schedule,{passive:true});listen(reduced,'change',schedule);

  const targets=[...root.querySelectorAll('.project-art,.expertise-item,.project-story,.about-visual')];
  targets.forEach(element=>{
    let pointerFrame=0,pending=null;
    const apply=()=>{pointerFrame=0;if(!pending)return;const {x,y}=pending;element.style.setProperty('--spot-x',`${x*100}%`);element.style.setProperty('--spot-y',`${y*100}%`);element.style.setProperty('--tilt-x',`${(y-.5)*-5}deg`);element.style.setProperty('--tilt-y',`${(x-.5)*7}deg`);};
    listen(element,'pointermove',e=>{if(!fine.matches||reduced.matches)return;const r=element.getBoundingClientRect();pending={x:clamp((e.clientX-r.left)/r.width),y:clamp((e.clientY-r.top)/r.height)};if(!pointerFrame)pointerFrame=requestAnimationFrame(apply);},{passive:true});
    const reset=()=>{cancelAnimationFrame(pointerFrame);pointerFrame=0;pending=null;element.style.setProperty('--spot-x','50%');element.style.setProperty('--spot-y','50%');element.style.setProperty('--tilt-x','0deg');element.style.setProperty('--tilt-y','0deg');};
    listen(element,'pointerleave',reset);listen(reduced,'change',reset);listeners.push(()=>cancelAnimationFrame(pointerFrame));
  });
  root.querySelectorAll('.button-primary').forEach(element=>{
    listen(element,'pointermove',e=>{if(!fine.matches||reduced.matches)return;const r=element.getBoundingClientRect();element.style.setProperty('--magnet-x',`${((e.clientX-r.left)/r.width-.5)*6}px`);element.style.setProperty('--magnet-y',`${((e.clientY-r.top)/r.height-.5)*5}px`);},{passive:true});
    const reset=()=>{element.style.setProperty('--magnet-x','0px');element.style.setProperty('--magnet-y','0px');};
    listen(element,'pointerleave',reset);listen(reduced,'change',reset);
  });
  update();
  return()=>{cancelAnimationFrame(frame);disposeInk();dial?.remove();listeners.forEach(fn=>fn());};
}
