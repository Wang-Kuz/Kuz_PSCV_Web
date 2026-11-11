import {ENGINEERING_SERVICES,CONTACT_DEFAULTS} from './engineering-content.js';
import {renderEngineeringArt,mountEngineeringArt} from './engineering-art.js';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const append=(n,...kids)=>{kids.flat().forEach(k=>n.append(k));return n;};
const button=(text,fn)=>{const b=el('button','engineering-control',text);b.type='button';b.onclick=fn;return b;};
export function renderEngineering({copy,base,site}){
 const page=el('div','engineering-page');
 const hero=el('section','engineering-hero section-inner');hero.id='engineering-hero';
 const back=el('a','text-link','← '+copy('engBack'));back.href=base+'/';
 append(hero,back,el('p','eyebrow',copy('engHeroEyebrow')),el('h1','section-title',copy('engHeroTitle')),el('p','section-description',copy('engHeroBody')));
 const catalog=el('nav','engineering-catalog');catalog.setAttribute('aria-label',copy('engHeroEyebrow'));
 const blocks=site?.pages?.find(p=>p.id==='aigc')?.blocks;
 for(const service of ENGINEERING_SERVICES){if(blocks&&!blocks.some(b=>b.id==='service-'+service.id&&!b.hidden))continue;const a=el('a','',copy('eng_'+service.id+'_title'));a.href='#service-'+service.id;catalog.append(a);}
 hero.append(catalog);page.append(hero);
 for(const [index,service]of ENGINEERING_SERVICES.entries()){
 const key='eng_'+service.id+'_',block=blocks?.find(b=>b.id==='service-'+service.id);
 if(blocks&&(!block||block.hidden))continue;
 const section=el('section','engineering-service section-inner reveal');section.id='service-'+service.id;
 const content=el('div','engineering-copy');
 append(content,el('p','eyebrow',String(index+1).padStart(2,'0')+' / '+copy(key+'title')),el('h2','section-title',copy(key+'promise')),el('h3','engineering-label',copy('engPain')),el('p','section-description',copy(key+'pain')),el('h3','engineering-label',copy('engApproach')),el('p','',copy(key+'approach')));
 const detail=button(copy('engDetail')+' ↗',()=>{});detail.disabled=true;detail.title=copy('engSoon');append(content,append(el('div','engineering-detail'),detail,el('span','',copy('engSoon'))));
 const visual=el('div','engineering-visual');visual.dataset.carousel='';visual.dataset.autoplay=String(block?.autoplay!==false);visual.dataset.seconds=String(block?.slideSeconds||7);
 const track=el('div','engineering-track');track.tabIndex=0;track.setAttribute('aria-label',copy(key+'title')+' / '+copy('engConcept')+' / '+copy('engBusiness'));
 const concept=el('figure','engineering-slide'),business=el('figure','engineering-slide business-slide');
 append(concept,el('figcaption','',copy('engConcept')));
 if(block?.image){const img=el('img','engineering-image');img.src=base+block.image;img.alt=copy(key+'title')+' — '+copy('engConcept');img.loading='lazy';img.decoding='async';img.style.objectFit=block?.fit||'contain';concept.append(img);}
 else concept.append(renderEngineeringArt(service.id,'concept',copy));
 business.append(el('figcaption','',copy('engBusiness')));
 if(block?.businessImage){const img=el('img','engineering-image');img.src=base+block.businessImage;img.alt=copy(key+'title')+' — '+copy('engBusiness');img.loading='lazy';img.decoding='async';img.style.objectFit=block?.fit||'contain';business.append(img);}
 else business.append(renderEngineeringArt(service.id,'business',copy));
 append(track,concept,business);const controls=el('div','engineering-controls');const previous=button('← '+copy('engPrevious'),()=>{}),next=button(copy('engNext')+' →',()=>{}),pause=button(copy('engPause'),()=>{}),count=el('span','','01 / 02');previous.dataset.previous='';next.dataset.next='';pause.dataset.pause='';pause.dataset.playLabel=copy('engPlay');pause.dataset.pauseLabel=copy('engPause');count.dataset.countLabel='';const zoom=button(copy('engZoom'),()=>{const slide=track.children[Math.round(track.scrollLeft/Math.max(1,track.clientWidth))]||track.children[0];const clone=slide.cloneNode(true);clone.querySelectorAll('[id]').forEach(n=>n.id='zoom-'+n.id);clone.querySelectorAll('[fill^="url(#"]').forEach(n=>n.setAttribute('fill',n.getAttribute('fill').replace('url(#','url(#zoom-')));zoomContent.replaceChildren(clone);dialog.showModal();});
 const dialog=el('dialog','engineering-zoom');dialog.setAttribute('aria-label',copy(key+'title'));const close=button(copy('engZoomClose')+' ×',()=>dialog.close()),zoomContent=el('div','engineering-zoom-content');append(dialog,close,zoomContent);dialog.addEventListener('close',()=>zoom.focus());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 append(controls,previous,count,next,pause,zoom);append(visual,track,controls,el('p','engineering-disclaimer',copy('engDisclaimer')),dialog);append(section,content,visual);page.append(section);
 }
 return page;
}
export function renderAigcGuide({copy,base}){const s=el('section','gateway-section gateway-aigc');s.id='aigc-guide';const c=el('div','gateway-copy');const a=el('a','button-primary',copy('gatewayAigcAction')+' ↗');a.href=base+'/?page=aigc';a.dataset.gatewayAction='';append(c,el('p','eyebrow',copy('gatewayAigcEyebrow')),el('h2','section-title',copy('gatewayAigcTitle')),el('p','section-description',copy('gatewayAigcBody')),a);const art=el('div','gateway-art engineering-guide-art');const canvas=el('canvas','engineering-canvas');canvas.dataset.field='agent';canvas.setAttribute('aria-hidden','true');art.append(canvas);append(s,append(el('div','section-inner gateway-grid reveal'),c,art));return s;}
export function renderContact({copy,base,site}){
 const contact={...CONTACT_DEFAULTS,...site?.contact},s=el('section','contact-section section-inner reveal');s.id='contact';append(s,el('p','eyebrow','CONTACT'),el('h2','section-title',copy('reachTitle')),el('p','section-description',copy('reachBody')));
 const row=el('div','contact-actions');if(contact.email){const email=el('a','contact-email',contact.email);email.href='mailto:'+contact.email;row.append(email);}
 if(contact.wechat||contact.qr){const dialog=el('dialog','wechat-dialog');dialog.setAttribute('aria-label',copy('reachWechat'));const close=button(copy('reachClose')+' ×',()=>dialog.close());append(dialog,close,el('h2','',copy('reachWechat')));if(contact.qr){const img=el('img');img.src=base+contact.qr;img.alt=copy('reachWechat');img.loading='lazy';dialog.append(img);}if(contact.wechat)append(dialog,el('p','',copy('reachWechatId')),el('code','',contact.wechat));const open=button(copy('reachWechat'),()=>dialog.showModal());const ns='http://www.w3.org/2000/svg',icon=document.createElementNS(ns,'svg');icon.setAttribute('viewBox','0 0 32 28');icon.setAttribute('aria-hidden','true');for(const [cx,cy,rx,ry]of [[12,11,10,8],[22,18,8,7]]){const e=document.createElementNS(ns,'ellipse');for(const [k,v]of Object.entries({cx,cy,rx,ry,fill:'none',stroke:'currentColor','stroke-width':2}))e.setAttribute(k,v);icon.append(e);}open.prepend(icon);open.classList.add('wechat-trigger');dialog.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});dialog.addEventListener('close',()=>open.focus());row.append(open,dialog);}
 s.append(row);return s;
}
export function mountEngineeringCarousels(){const cleanups=[mountEngineeringArt()];document.querySelectorAll('[data-carousel]').forEach(host=>{const track=host.querySelector('.engineering-track'),pause=host.querySelector('[data-pause]'),count=host.querySelector('[data-count-label]'),reduced=matchMedia('(prefers-reduced-motion: reduce)');let index=0,visible=false,hover=false,focused=false,playing=!reduced.matches&&host.dataset.autoplay!=='false';
 const state=()=>{pause.textContent=playing?pause.dataset.pauseLabel:pause.dataset.playLabel;pause.setAttribute('aria-pressed',String(!playing));};
 const go=(next,manual=false)=>{if(manual){playing=false;state();}index=(next+2)%2;track.scrollTo({left:index*track.clientWidth,behavior:reduced.matches?'instant':'smooth'});};
 host.querySelector('[data-previous]').onclick=()=>go(index-1,true);host.querySelector('[data-next]').onclick=()=>go(index+1,true);pause.onclick=()=>{playing=!playing;state();};
 const scroll=()=>{index=Math.round(track.scrollLeft/Math.max(1,track.clientWidth));count.textContent=String(index+1).padStart(2,'0')+' / 02';};track.addEventListener('scroll',scroll,{passive:true});
 const enter=()=>hover=true,leave=()=>hover=false,focus=()=>focused=true,blur=e=>{focused=host.contains(e.relatedTarget);};host.addEventListener('pointerenter',enter);host.addEventListener('pointerleave',leave);host.addEventListener('focusin',focus);host.addEventListener('focusout',blur);
 const observer=new IntersectionObserver(entries=>visible=entries[0].isIntersecting,{threshold:.2});observer.observe(host);const timer=setInterval(()=>{if(visible&&playing&&!hover&&!focused&&!document.hidden&&!reduced.matches)go(index+1);},Math.max(5,Math.min(30,Number(host.dataset.seconds)||7))*1000);
 const change=()=>{if(reduced.matches)playing=false;state();};reduced.addEventListener('change',change);state();cleanups.push(()=>{clearInterval(timer);observer.disconnect();reduced.removeEventListener('change',change);track.removeEventListener('scroll',scroll);host.removeEventListener('pointerenter',enter);host.removeEventListener('pointerleave',leave);host.removeEventListener('focusin',focus);host.removeEventListener('focusout',blur);});});return()=>cleanups.forEach(fn=>fn());}
