import {organizeSite} from './page-structure.js';
import {navigation} from './navigation.js';
import {WORKSTATION_PAGES} from './workstation-pages.js';
export const base=location.pathname.startsWith('/kuzpscv/')?'/kuzpscv':'';
export const defaults=()=>({header:{visible:true,autoHide:true,logo:'',brand:'KUZ',home:true,settings:true,links:[{label:'作品',href:'#work'},{label:'关于',href:'#about'},{label:'工作站',href:'/?page=workstation'}]},pages:[{id:'home',name:'个人门户',parent:'',blocks:['home','manifest','numbers','expertise','work','archive','about'].map(id=>({id,title:'',text:'',image:'',hidden:false}))},{id:'workstation',name:'个人工作站',parent:'home',blocks:[{id:'intro',title:'Personal Workstation',text:'个人成长、作品与浏览器工具，在同一处继续探索。',image:'',hidden:false}]},...structuredClone(WORKSTATION_PAGES)]});
export const localUrl=u=>u?.startsWith('/media/')?base+u:u?.startsWith('/?')||u?.startsWith('/#')||u==='/'?base+u:u||'#';
const node=(t,c,s)=>{const n=document.createElement(t);if(c)n.className=c;if(s!==undefined)n.textContent=s;return n;};
let previous=0,autoHide=false;
addEventListener('scroll',()=>{const y=scrollY;document.querySelector('#header')?.classList.toggle('header-hidden',autoHide&&y>100&&y>previous);previous=y;},{passive:true});
export function applySite(portfolio){
 const site=organizeSite(portfolio.site||defaults(),portfolio.projects),pageId=new URL(location.href).searchParams.get('page')||'home';
 if(pageId==='workstation'){location.replace('/workstation/index.html'+(location.search.includes('preview')?'?preview=1':''));return;}
 const page=site.pages.find(p=>p.id===pageId),main=document.querySelector('#main'),header=document.querySelector('#header');
 if(!page||page.hidden){main.replaceChildren(node('section','cms-page','此页面暂未开放。'));return;}
 if(page.legacy){location.replace(page.legacy+location.search);return;}
 const languageButton=header.querySelector('.language-toggle,.unified-language');const h=page.header||site.header;autoHide=h.autoHide;header.classList.remove('header-hidden');navigation(header,h,{base,pageId,pages:site.pages,languageButton});
 if(pageId!=='home'&&pageId!=='projects'&&!pageId.startsWith('project-')){
  main.replaceChildren();const wrap=node('div','cms-page');wrap.append(node('p','eyebrow','KUZ / '+page.name),node('h1','section-title',page.name));
  for(const b of page.blocks){if(b.hidden)continue;const s=node('section','cms-block');s.id=b.id;s.dataset.editBlock=b.id;if(b.title)s.append(node('h2','',b.title));if(b.text)s.append(node('p','',b.text));if(b.image){const img=node('img','cms-image');img.loading=b.id==='home'?'eager':'lazy';img.decoding='async';img.src=localUrl(b.image);img.alt=b.title;img.style.objectFit=b.fit||'contain';s.append(img);}wrap.append(s);}
  const children=site.pages.filter(p=>p.parent===page.id&&!p.hidden);if(children.length){const links=node('div','cms-tools');for(const p of children){const a=node('a','cms-tool',p.name);a.href=p.legacy?p.legacy:base+'/?page='+encodeURIComponent(p.id);links.append(a);}wrap.append(links);}
  main.append(wrap);
 }else{
  const allowed=new Set(page.blocks.map(b=>b.id));for(const id of pageId==='home'?['home','manifest','numbers','expertise','work','projects-guide','workstation-guide','archive','about']:[]){const target=document.getElementById(id);if(target&&!allowed.has(id))(id==='home'?target.parentElement:target).remove();}
  for(const b of page.blocks){let s=document.getElementById(b.id);if(!s){s=node('section','cms-block');s.id=b.id;main.append(s);}s.dataset.editBlock=b.id;if(b.hidden){(b.id==='home'?s.parentElement:s).hidden=true;continue;}if(b.title){const title=s.querySelector('h1,h2');if(title)title.textContent=b.title;else s.prepend(node('h2','',b.title));}if(b.text){const p=s.querySelector('.hero-intro,.section-description,.manifest-caption,p');if(p)p.textContent=b.text;else s.append(node('p','',b.text));}if(b.image){const img=node('img','cms-image');img.loading=b.id==='home'?'eager':'lazy';img.decoding='async';img.src=localUrl(b.image);img.alt=b.title;img.style.objectFit=b.fit||'contain';if(b.id==='home'){const art=s.querySelector('.hero-art');art?.replaceChildren(img);}else if(s.querySelector('.gateway-art'))s.querySelector('.gateway-art').replaceChildren(img);else s.append(img);}}
 }
 for(const b of page.blocks){if(b.href&&b.buttonLabel&&!b.hidden){const target=document.getElementById(b.id);if(target){const existing=target.querySelector('[data-gateway-action]');if(existing){existing.textContent=b.buttonLabel;existing.href=localUrl(b.href);}else{const a=node('a','button-primary',b.buttonLabel);a.href=localUrl(b.href);target.append(a);}}}}
 document.querySelectorAll('[data-edit-block]').forEach(s=>s.addEventListener('click',e=>{if(parent===window||!new URL(location.href).searchParams.has('preview'))return;e.preventDefault();e.stopPropagation();parent.postMessage({type:'kuz-select',page:pageId,block:s.dataset.editBlock,project:e.target.closest('[id^=project-]')?.id.slice(8)},location.origin);},true));
 if(!new URL(location.href).searchParams.has('preview')){
  const key='kuz-visit:'+pageId;const last=Number(sessionStorage.getItem(key)||0);if(Date.now()-last>30000){sessionStorage.setItem(key,String(Date.now()));fetch(base+'/api/visit?page='+encodeURIComponent(pageId)).catch(()=>{});}
 }
}
