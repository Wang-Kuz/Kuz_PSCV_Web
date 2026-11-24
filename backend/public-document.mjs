import {guideProjects,linkedCases,customerHeadline,publicDestination} from '../frontend/lib.js';
import {COPY_DEFAULTS} from '../frontend/copy.js';
import {ENGINEERING_SERVICES,CASE_DEFAULTS} from '../frontend/engineering-content.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraph = text => text ? '<p>'+escape(text)+'</p>' : '';
const subheading = text => text ? '<h3>'+escape(text)+'</h3>' : '';
const pageUrl = id => './?page='+encodeURIComponent(id);
const anchor = (text,url) => "<a href='"+escape(url)+"'>"+escape(text)+'</a>';

const summaries = {
  manifest:['manifestTitle','manifestCaption'], numbers:['statsTitle','statsIntro'],
  expertise:['expertiseTitle','expertiseIntro'], work:['capabilityTitle','capabilityIntro'],
  about:['aboutTitle','aboutBody'],contact:['reachTitle','reachBody'],
  'aigc-guide':['gatewayAigcTitle','gatewayAigcBody'],
  'projects-guide':['gatewayProjectsTitle','gatewayProjectsBody'],
  'workstation-guide':['gatewayWorkstationTitle','gatewayWorkstationBody'],
  'engineering-hero':['engHeroTitle','engHeroBody'],archive:['archiveTitle','']
};
const gateways = {
  'aigc-guide':['aigc','gatewayAigcAction'], 'projects-guide':['projects','gatewayProjectsAction'],
  'workstation-guide':['ws-index','gatewayWorkstationAction']
};

export function publicDocument(template, data, id, {lang='zh',base='./'}={}) {
  const t=(cn,en)=>lang==='en'?en:cn;
  const local=value=>typeof value==='string'?value:value?.[lang]??value?.zh??value?.en??'';

  const {profile,site,projects}=data;
  const copy=key=>local(data.copy?.[key] ?? COPY_DEFAULTS[key]);
  const pages=new Map(site.pages.map(p=>[p.id,p]));
  const page=pages.get(id);
  const project=id.startsWith('project-') ? projects.find(p=>'project-'+p.id===id && p.visible!==false) : null;
  const unavailable=!page || page.hidden || (id.startsWith('project-') && !project);
  const sections=[];
  const canRead=(id,block)=>pages.has(id)&&!pages.get(id).hidden&&pages.get(id).blocks.some(b=>b.id===block&&!b.hidden);
  const related=topic=>linkedCases(data,topic,CASE_DEFAULTS).map(p=>anchor(local(p.name),pageUrl('project-'+p.id)+'&topic='+topic)).join(' ');
  function renderBlock(block) {
    const key=block.id, [titleKey,bodyKey]=summaries[key] || [];
    let title=copy(titleKey),body=copy(bodyKey),extra='';
    if(key==='home'){
      title=customerHeadline(local(profile.headline),lang);body=local(profile.intro);
      if(!block.buttonHidden && !block.href && publicDestination(site,'aigc','engineering-hero'))extra+=anchor(t('按业务问题找方案','Explore business needs'),pageUrl('aigc'));
      if(publicDestination(site,'projects','archive'))extra+=anchor(t('查看项目作品','Browse projects'),pageUrl('projects'));
      extra+=paragraph(local(profile.role))+anchor(profile.name,profile.github);
    } else if(id==='rag-lab'&&key==='lab-demo'){
      title=copy('labTitle');body=copy('labIntro');
      for(const v of [1,2]){extra+=subheading(t('差旅制度示例 V','Travel policy example V')+v);for(const [i,k] of ['a','b','c'].entries())extra+=paragraph('§ '+['3.1','4.2','5.3'][i]+' '+copy('labV'+v+k));}
    } else if(id==='rag-lab'&&key==='lab-practice'){
      title=copy('labPractice');body=copy('labRelated');extra=block.buttonHidden?'':related('rag');
      if(!block.buttonHidden&&canRead('home','contact'))extra+=anchor(t('聊聊类似需求','Discuss this need'),'./?topic=rag#contact');
    } else if(key==='expertise'){
      for(const skill of ['Full','Agent','Algorithm','FDE']){
        extra+=subheading(copy('skill'+skill+'Title'))+paragraph(copy('skill'+skill+'Body'));
      }
    } else if(key==='work'){
      for(const capability of ['FDE','Agent','RAG','Algorithm','Fullstack','Multimodal']){
        extra+=subheading(copy('cap'+capability+'Name'))+paragraph(copy('cap'+capability+'Body'));
        if(!block.buttonHidden){if(capability==='RAG'&&canRead('rag-lab','lab-demo'))extra+=anchor(copy('labTry'),pageUrl('rag-lab'));extra+=related(capability.toLowerCase());}
      }
    } else if(key==='contact'){
      const {email,wechat}=site.contact || {};
      if(email)extra+=anchor(email,'mailto:'+email);
      if(wechat)extra+=paragraph(copy('reachWechatId')+' '+wechat);
    } else if(id==='aigc' && ENGINEERING_SERVICES.some(s=>'service-'+s.id===key)){
      const prefix='eng_'+key.slice(8)+'_';
      title=copy(prefix+'promise');body=copy(prefix+'pain');
      extra=subheading(copy(prefix+'title'))+paragraph(copy(prefix+'approach'));
      if(!block.buttonHidden){
       const topic=key.slice(8);
       if(topic==='rag'&&canRead('rag-lab','lab-demo'))extra+=anchor(copy('labTry'),pageUrl('rag-lab'));
       extra+=related(topic);if(canRead('home','contact'))extra+=anchor(t('聊聊类似需求','Discuss this need'),'./?topic='+topic+'#contact');
      }
    } else if(key==='archive' && id==='projects'){
      const items=projects.filter(p=>p.visible!==false && canRead('project-'+p.id,'project-detail'));
      extra='<ul>'+items.map(p=>'<li>'+anchor(local(p.name),pageUrl('project-'+p.id))+paragraph(local(p.summary))+'</li>').join('')+'</ul>';
    } else if(key==='project-detail' && project){
      title=local(project.name);body=local(project.summary);
      if(!block.buttonHidden&&canRead('home','contact'))extra+=anchor(t('讨论类似项目','Discuss a similar project'),'./?project='+encodeURIComponent(project.id)+'#contact');
      for(const field of ['role','problem','solution','outcome']){
        if(local(project[field]))extra+=subheading(copy(field+'Label'))+paragraph(local(project[field]));
      }
    }
    if(!block.buttonHidden){
      if(block.href && block.buttonLabel && /^(?:#|\/(?!\/))/.test(block.href)){
        const url=block.href.replace(/^\/(?=[?#]|$)/,'./');
        extra+=anchor(block.buttonLabel,url);
      }else if(gateways[key]){
        const [target,label]=gateways[key],dest=pages.get(target);
        if(dest&&!dest.hidden)extra+=anchor(copy(label),dest.legacy||pageUrl(target));
      }
    }
    if(key==='projects-guide'){
      const selected=guideProjects(data);
      if(selected.length)extra+='<ul>'+selected.map(p=>'<li>'+anchor(local(p.name),pageUrl('project-'+p.id))+'</li>').join('')+'</ul>';
    }
    title=block.title||title;body=block.text||body;
    if(!title&&!body&&!extra)return '';
    const tag=['home','engineering-hero','archive','project-detail','lab-demo'].includes(key)?'h1':'h2';
    return '<section id="'+escape(key)+'"><'+tag+'>'+escape(title)+'</'+tag+'>'+paragraph(body)+extra+'</section>';
  }
  if(!unavailable){
    if(id!=='home' && pages.get('home') && !pages.get('home').hidden)sections.push(anchor(pages.get('home').name,'./'));
    for(const block of page.blocks)if(!block.hidden)sections.push(renderBlock(block));
  }
  const detailVisible=project&&canRead(id,'project-detail');
  const localizedTitles={home:t('个人品宣','Portfolio'),projects:t('项目作品','Project portfolio'),aigc:t('AIGC工程','AIGC Engineering'),'rag-lab':t('工程实验室','Engineering lab')};
  const heading=unavailable?t('此页面暂未开放','Page unavailable'):detailVisible?local(project.name):(page.name&&page.name!==({home:'个人品宣',projects:'项目作品',aigc:'AIGC工程','rag-lab':'工程实验室'})[id]?page.name:localizedTitles[id])||page.name||profile.name;
  const main='<article class="public-reading">'+(unavailable?paragraph(heading):sections.join(''))+'</article>';
  const canonical=base+(id==='home'?(lang==='en'?'?lang=en':''):'?page='+encodeURIComponent(id)+(lang==='en'?'&lang=en':''));
  const first=page?.blocks.find(b=>!b.hidden&&['home','engineering-hero','archive','project-detail','lab-demo'].includes(b.id));
  const description=unavailable?heading:first?.text||(detailVisible?local(project.summary):first?({home:local(profile.intro),aigc:copy('engHeroBody'),projects:copy('projectSearchHint'),'rag-lab':copy('labIntro')})[id]:'')||heading;
  const cover=['home','aigc','projects'].includes(id)?id:'case';
  const meta=unavailable?'<meta name="robots" content="noindex">':[
    '<link rel="canonical" href="'+escape(canonical)+'">',
    ...Object.entries({'og:url':canonical,'og:type':'website','og:title':heading+' · '+profile.name,'og:description':description,'og:image':base+'share-'+cover+'.png','og:locale':t('zh_CN','en_US')}).map(([key,value])=>'<meta property="'+key+'" content="'+escape(value)+'">')
  ].join('\n');
  const html=template.replace('<html lang="zh-CN">','<html lang="'+t('zh-CN','en')+'">').replace(/<meta name="description"[^>]*>/,()=>'<meta name="description" content="'+escape(description)+'">'+meta).replace('<!-- PUBLIC_CONTENT -->',()=>main)
    .replace(/<title>[^<]*<\/title>/,()=>'<title>'+escape(heading)+' · '+escape(profile.name)+'</title>');
  // Only decode entities after stripping markup from our own escaped document.
  const plain=main.replace(/<\/(?:h[123]|p|a|li|section)>/g,'\n').replace(/<[^>]*>/g,'')
    .replace(/&(amp|lt|gt|quot|#39);/g,(_,name)=>({amp:'&',lt:'<',gt:'>',quot:'"', '#39':"'"}[name]));
  return {html,plain:heading+'\n\n'+plain.trim()+'\n',status:unavailable?404:200};
}
