(async()=>{
  const $=s=>document.querySelector(s);
  const frames=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const stills=new Map();
  for(const canvas of document.querySelectorAll('canvas[data-field]')){
    if(canvas.dataset.field==='sculpture'){
      const {createSculptureRenderer}=await import('/sculpture-gl.js');
      const copy=document.createElement('canvas');
      const renderer=createSculptureRenderer(copy);
      if(renderer){renderer.resize(827,778,2);renderer.draw({time:7,pointer:{x:.2,y:0},scroll:0,width:827,height:778});stills.set('sculpture',copy.toDataURL('image/png'));renderer.destroy();}
    }else{
      canvas.scrollIntoView({behavior:'instant',block:'center'});await frames();
      stills.set(canvas.dataset.field,canvas.toDataURL('image/png'));
    }
  }
  const clone=selector=>$(selector).cloneNode(true);
  const pages=[];
  function page(content,label,light=false){
    const p=document.createElement('section');p.className='book-page'+(light?' light-section':'');
    const mast=document.createElement('div');mast.className='book-mast';
    mast.innerHTML='<strong>KUZ</strong><span>个人宣传手册 / '+label+'</span>';
    p.append(mast,content);pages.push(p);return p;
  }
  const hero=clone('.hero');hero.querySelector('.hero-base').remove();
  hero.querySelector('.hero-status').textContent='个人作品集 / PORTFOLIO';
  hero.querySelector('.field-coordinate span:last-child').textContent='全栈 · AI · Agent · 算法';
  for(const a of hero.querySelectorAll('a[href^="#"]'))a.href='https://github.com/Wang-Kuz';
  page(hero,'全栈开发 · Agent 开发 · 算法工程 · FDE');
  page(clone('#manifest'),'从思考到实现');
  page(clone('#numbers'),'以作品为坐标',true);
  page(clone('#expertise'),'能力与方向');
  const intro=document.createElement('div');intro.className='book-work-intro';intro.append(clone('.work-intro'));page(intro,'精选项目');
  for(const story of document.querySelectorAll('.project-story')){
    const copy=story.cloneNode(true);copy.classList.add('book-story');
    const action=copy.querySelector('.story-actions button');
    if(action){const a=document.createElement('a');a.className=action.className;a.href=copy.querySelector('.story-actions a').href;a.textContent='查看项目仓库 ↗';action.replaceWith(a);}
    const title=copy.querySelector('.story-title'); if(title)title.textContent=title.textContent.replace('，','，\n').replace('把讲解变成可编排的体验。','把讲解变成\n可编排的体验。');
    page(copy,copy.querySelector('.eyebrow').textContent);
  }
  const rows=[...document.querySelectorAll('.archive-row')];
  for(let i=0;i<rows.length;i+=6){
    const content=document.createElement('div');content.className='book-archive';
    const head=clone('.archive-intro');head.querySelector('.section-title').textContent=i===0?'每一次探索，都有迹可循。':'持续扩展的作品集';content.append(head);
    const list=document.createElement('div');list.className='archive-list';
    rows.slice(i,i+6).forEach(r=>{const c=r.cloneNode(true);c.querySelector('.round-button')?.remove();list.append(c);});content.append(list);
    const note=document.createElement('p');note.className='archive-note';note.textContent='项目 '+(i+1)+'–'+Math.min(i+6,rows.length)+' / '+rows.length+' · 部分仓库为私有，访问需要授权。';content.append(note);
    page(content,'全部作品 '+String(i/6+1).padStart(2,'0'),true);
  }
  page(clone('#about'),'关于 Kuz');
  const footer=clone('#footer');footer.querySelector('.footer-links').remove();page(footer,'联系与合作');
  const book=document.createElement('main');book.id='brochure';pages.forEach((p,i)=>{
    const foot=document.createElement('div');foot.className='book-foot';foot.innerHTML='<span>Wang-Kuz / github.com/Wang-Kuz</span><span>'+String(i+1).padStart(2,'0')+' / '+pages.length+'</span>';p.append(foot);book.append(p);
  });
  for(const c of book.querySelectorAll('canvas')){
    const img=document.createElement('img');img.src=stills.get(c.dataset.field)||'';img.className=c.className;img.alt='技术概念图';c.replaceWith(img);
  }
  for(const el of book.querySelectorAll('[id]'))el.removeAttribute('id');
  for(const el of book.querySelectorAll('.reveal'))el.classList.add('visible');
  document.body.replaceChildren(book);document.title='Kuz 个人宣传手册';
  const style=document.createElement('style');style.textContent=`
    @page{size:15in 10in;margin:0}
    html,body{margin:0;padding:0;width:1440px;overflow:visible!important;scroll-behavior:auto}
    *{-webkit-print-color-adjust:exact;print-color-adjust:exact;animation:none!important;transition:none!important}
    .book-page{width:1440px;height:960px;position:relative;break-after:page;break-inside:avoid;background:#08090c;overflow:hidden;padding:0}
    .book-page:last-child{break-after:auto}.book-page.light-section{background:#eff1f1}
    .book-mast,.book-foot{position:absolute;left:86px;right:86px;display:flex;justify-content:space-between;align-items:center;z-index:20;font-size:14px;letter-spacing:1px;color:#96a5ac}
    .book-mast{top:32px}.book-mast strong{font-size:24px;letter-spacing:2px;color:#baf8d4}.light-section .book-mast strong{color:#1b3d31}.book-foot{bottom:28px;font-size:12px}
    .section-inner{width:1268px}.reveal{opacity:1!important;transform:none!important;filter:none!important}
    .hero{position:relative!important;height:960px;min-height:0;padding:145px 86px 95px;overflow:hidden}
    .hero-content{transform:none!important}.hero-art{transform:none!important}.hero-title{font-size:102px}.hero-roles{font-size:17px}.hero-intro{font-size:20px}
    .field-canvas{object-fit:contain}.hero-backdrop{opacity:1}.hero-status{margin-top:0}.hero-actions{margin-top:34px}
    .manifest-section{height:960px;min-height:0;display:flex;align-items:center;padding:100px 0}.manifest-inner{width:1268px;margin:auto}.manifest-title{font-size:70px}.manifest-word{color:#f0f4f5!important;--lit:1!important}
    .stats-section{height:960px;padding:110px 0 60px;border-radius:0}.stats-section .section-intro{display:grid;grid-template-columns:1fr 1fr;column-gap:80px;align-items:end}.stats-section .section-intro .eyebrow{grid-column:1/-1}.stats-section .section-description{margin:0 0 5px}.stats-section .section-title{font-size:60px}
    .stats-grid{margin-top:36px}.stat-item{min-height:143px;padding:22px 34px}.stat-primary{padding-left:0}.stat-number{font-size:64px}.stat-primary .stat-number{font-size:192px}.stat-label{margin-top:8px}.stats-note{margin-top:20px}.delivery-note{margin-top:5px}
    .expertise-section{height:960px;padding:150px 0 90px}.expertise-intro .section-title{font-size:65px}.expertise-list{margin-top:65px}.expertise-item p{font-size:19px}
    .book-work-intro{height:960px;display:flex;align-items:center;margin:0 86px}.book-work-intro .work-intro{margin:0;width:100%}.book-work-intro .section-title{font-size:88px}
    .book-story{width:1268px;height:780px;margin:110px auto 0;padding:30px 0 20px;border-top:1px solid #ffffff24}.book-story .story-grid{margin-top:60px}.project-art,.project-canvas{transform:none!important}.project-canvas{object-fit:contain}.story-title{font-size:62px}.story-summary{font-size:20px}.story-topline{font-size:14px}
    .book-archive{padding:96px 86px 60px}.archive-intro{margin-bottom:18px}.archive-intro .section-title{font-size:46px}.archive-intro .eyebrow{margin-bottom:10px}.archive-row{grid-template-columns:minmax(0,1fr) 230px 110px;gap:25px;padding:10px 0}.archive-name strong{font-size:22px}.archive-name>span{display:block;max-width:780px;overflow:visible;font-size:16px;line-height:1.45}.archive-name{gap:5px}.archive-tech .tag{font-size:13px}.archive-note{margin-top:18px}
    .about-section{height:960px;padding:200px 0 120px}.about-copy .section-title{font-size:70px}.about-copy>p:not(.eyebrow){font-size:22px}
    footer{height:960px;display:flex;align-items:center}.footer-cta{display:block;padding:0 0 65px}.footer-cta h2{font-size:88px;margin-bottom:60px}.footer-base{font-size:18px;padding-top:32px}
    .manifest-section::after{display:none}.manifest-inner{min-width:1268px}.manifest-title{max-width:1268px}
    .book-work-intro .work-intro{display:block}.book-work-intro .section-title{max-width:1180px;font-size:88px}.book-work-intro .section-description{margin-top:45px;max-width:900px}
    .hero-line:nth-child(2){color:#d6e0e7;background:none;-webkit-background-clip:initial;background-clip:initial}
    .book-story .story-title{font-size:56px;white-space:pre-line;text-wrap:initial}
    a{cursor:pointer}button{cursor:default}.book-page:has(.book-story:nth-child(2)) .story-copy{order:0}
  `;document.head.append(style);
  await Promise.all([...book.querySelectorAll('img')].map(i=>i.decode().catch(()=>{})));window.scrollTo(0,0);
  return {pages:pages.length,images:book.querySelectorAll('img').length,archive:rows.length};
})()
