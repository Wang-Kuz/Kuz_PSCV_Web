export function navigation(root,h,{base='',pageId='home',pages=[],languageButton}={}){
 const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text)n.textContent=text;return n;};
 const href=url=>url?.startsWith('/media/')||url?.startsWith('/?')||url==='/'?base+url:url?.startsWith('#')&&pageId!=='home'?base+'/'+url:url||'#';
 const en=document.documentElement.lang==='en';const labels={'作品':'Projects','关于':'About','工作站':'Workstation','返回个人品宣':'Portfolio','项目作品':'Projects','个人品宣':'Portfolio'};
 const anchor=(label,url,cls)=>{if(en)label=labels[label]||label;const a=make('a',cls,label);a.href=href(url);return a;};
 root.replaceChildren();root.classList.add('unified-header');root.hidden=h.visible===false;
 const brand=anchor(h.brand||'KUZ','/','unified-brand');if(h.logo){brand.textContent='';const img=make('img');img.src=href(h.logo);img.alt=h.brand||'KUZ';brand.append(img);}else brand.prepend(make('span','unified-mark','K'));
 const primary=make('nav','unified-links');primary.setAttribute('aria-label','网站导航');
 for(const l of h.links||[])if(!l.hidden)primary.append(anchor(l.label,l.href));
 const pagesMenu=make('details','page-menu'),summary=make('summary','', '页面导航');pagesMenu.append(summary);const list=make('div','page-menu-list');
 const visit=(parent,depth)=>{for(const p of pages.filter(x=>x.parent===parent&&!x.hidden)){const a=anchor(p.name,p.legacy||'/?page='+encodeURIComponent(p.id));a.style.paddingLeft=(16+depth*12)+'px';if(p.id===pageId)a.setAttribute('aria-current','page');list.append(a);visit(p.id,depth+1);}};visit('',0);pagesMenu.append(list);if(pageId.startsWith('ws-'))primary.append(pagesMenu);
 const actions=make('div','unified-actions');if(languageButton){languageButton.className='unified-language';languageButton.style.cssText='';languageButton.setAttribute('aria-label','切换语言 / Switch language');actions.append(languageButton);}if(h.home&&pageId!=='home')actions.append(anchor('返回个人品宣','/','home-action'));if(h.settings&&pageId.startsWith('ws-'))actions.append(anchor('配置与服务','/Home/','settings-action'));
 const toggle=make('button','unified-menu',en?'Menu':'菜单');toggle.type='button';toggle.setAttribute('aria-expanded','false');toggle.onclick=()=>{const open=root.classList.toggle('menu-open');toggle.setAttribute('aria-expanded',String(open));};actions.append(toggle);
 root.append(brand,primary,actions);root.onkeydown=e=>{if(e.key==='Escape'){root.classList.remove('menu-open');pagesMenu.open=false;toggle.setAttribute('aria-expanded','false');toggle.focus();}};
 primary.addEventListener('click',e=>{if(e.target.closest('a')){root.classList.remove('menu-open');pagesMenu.open=false;toggle.setAttribute('aria-expanded','false');}});
}
