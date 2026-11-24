import {CASE_DEFAULTS,ENGINEERING_SERVICES,JOURNEY_TOPICS} from './engineering-content.js';
import {linkedCases} from './lib.js';

const ui=(zh,en)=>document.documentElement.lang.startsWith('zh')?zh:en;
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
function link(text,url){const n=el('a','journey-link',text);n.href=url;return n;}
const args=()=>new URL(location.href).searchParams;
const fromTopic=()=>JOURNEY_TOPICS.includes(args().get('topic'))?args().get('topic'):'general';
const seen=new Set();
function record(base,page,stage,topic){
 if(args().has('preview')||!JOURNEY_TOPICS.includes(topic))return;
 const key=[page,stage,topic].join('|');if(seen.has(key))return;seen.add(key);
 fetch(base+'/api/visit?'+new URLSearchParams({page,stage,topic}),{keepalive:true,cache:'no-store'}).then(r=>{if(!r.ok)seen.delete(key);}).catch(()=>seen.delete(key));
}
export function caseActions(data,topic,base,localize){
 return linkedCases(data,topic,CASE_DEFAULTS).map(p=>link(localize(p.name),base+'/?page=project-'+encodeURIComponent(p.id)+'&topic='+topic));
}
function blockVisible(data,id,key){return data.site.pages.some(p=>p.id===id&&!p.hidden&&p.blocks.some(b=>b.id===key&&!b.hidden));}
function contactLink(base,topic,project){
 const query=new URLSearchParams({topic});
 if(project)query.set('project',project.id);
 return link(project?ui('讨论类似项目','Discuss a similar project'):ui('讨论这个需求','Discuss this need'),base+'/?'+query+'#contact');
}

const clauses=[
 {id:'3.1',key:'a',terms:['改签','航班','flight','change']},
 {id:'4.2',key:'b',terms:['报销','提交期限','多久','expenses','when']},
 {id:'5.3',key:'c',terms:['发票','附件','invoice','accompany']}
];
let chosenVersion=2,chosenQuestion=-1;
export function renderLab({copy,base,portfolio,localize}){
 const wrap=el('div','lab-spread section-inner');
 if(blockVisible(portfolio,'rag-lab','lab-demo')){
 const demo=el('section','lab-demo');demo.id='lab-demo';
 if(blockVisible(portfolio,'aigc','service-rag'))demo.append(link(ui('返回企业 RAG','Back to enterprise RAG'),base+'/?page=aigc#service-rag'));
 demo.append(el('p','eyebrow',ui('工程实验室 / RAG','ENGINEERING LAB / RAG')),el('h1','section-title',copy('labTitle')),el('p','section-description',copy('labIntro')));
 const desk=el('div','lab-desk'),query=el('div','lab-query'),source=el('div','lab-source');
 const versions=el('div','lab-choices'),questions=el('div','lab-questions'),answer=el('div','lab-answer');
 answer.setAttribute('aria-live','polite');
 query.append(el('h2','',ui('问一份差旅制度','Ask a travel policy')),el('p','',ui('虚构示例 · 本地条款检索与原文摘录','Fictional example · Local retrieval and extractive answers')),versions,questions,answer);
 function draw(){
  versions.replaceChildren();questions.replaceChildren();source.replaceChildren(el('h2','',ui('来源原文','Source document')+' · V'+chosenVersion));answer.replaceChildren();
  for(const v of [1,2]){const btn=el('button','',ui('制度','Policy')+' V'+v);btn.type='button';btn.setAttribute('aria-pressed',String(v===chosenVersion));btn.onclick=()=>{chosenVersion=v;draw();versions.children[v-1].focus();};versions.append(btn);}
  const prompts=[1,2,3].map(i=>copy('labQ'+i));
  prompts.forEach((q,i)=>{const btn=el('button','',q);btn.type='button';btn.setAttribute('aria-pressed',String(chosenQuestion===i));btn.onclick=()=>{chosenQuestion=i;record(base,'rag-lab','demo','rag');draw();questions.children[i].focus();};questions.append(btn);});
  const q=(prompts[chosenQuestion]||'').toLowerCase();
  const tokens=[...new Set(q.match(/[a-z]+|[\u3400-\u9fff]{2}/g)||[])].filter(t=>t.length>2||/[^a-z]/.test(t));
  const ranked=clauses.map(c=>{
   const passage=copy('labV'+chosenVersion+c.key).toLowerCase();
   const keywords=c.terms.filter(term=>q.includes(term)).length;
   return {c,score:keywords*4+tokens.filter(t=>passage.includes(t)).length};
  }).sort((a,b)=>b.score-a.score);
  const hit=ranked[0].score?ranked[0].c:null;
  for(const c of clauses){const row=el('section','lab-clause');row.id='clause-'+c.key;row.classList.toggle('matched',c===hit);row.append(el('strong','','§ '+c.id),el('p','',copy('labV'+chosenVersion+c.key)));source.append(row);}
  if(hit){answer.append(el('small','',ui('回答依据','Answer source')+' · V'+chosenVersion+' / § '+hit.id),el('p','',copy('labV'+chosenVersion+hit.key)),link(ui('定位原文','Locate source'),'#clause-'+hit.key));}
  if(hit && !matchMedia('(prefers-reduced-motion:reduce)').matches){
   source.querySelector('.matched').animate([{backgroundColor:'#54736b77'},{backgroundColor:'#a9dfd00d'}],{duration:520});
   answer.animate([{opacity:.5,translate:'0 4px'},{opacity:1,translate:'0 0'}],{duration:230});
  }
  if(!hit)answer.textContent=chosenQuestion<0?ui('选择一个问题，查看它引用了哪一条。','Choose a question to trace its source.'):ui('此问题未匹配示例条款。','No matching sample clause.');
 }
 draw();desk.append(query,source);demo.append(desk);wrap.append(demo);
 }
 if(blockVisible(portfolio,'rag-lab','lab-practice')){
 const practice=el('section','lab-practice');practice.id='lab-practice';practice.append(el('h2','',copy('labPractice')));
 const actions=caseActions(portfolio,'rag',base,localize);
 const enabled=!portfolio.site.pages.find(p=>p.id==='rag-lab').blocks.find(b=>b.id==='lab-practice').buttonHidden;
 if(enabled&&actions.length)practice.append(el('p','',copy('labRelated')),...actions);
 if(enabled&&blockVisible(portfolio,'home','contact'))practice.append(contactLink(base,'rag'));
 wrap.append(practice);
 }
 return wrap;
}

const draft={source:'',pain:'',outcome:'',limits:''};
function brief(section,env,initialTopic){
 const {base,copy,portfolio}=env;
 const details=el('details','brief-disclosure');const project=portfolio.projects.find(p=>p.id===args().get('project') && p.visible!==false && blockVisible(portfolio,'project-'+p.id,'project-detail'));
 details.open=!!project || initialTopic!=='general';details.append(el('summary','',ui('带着需求联系我','Prepare a project brief')));
 const form=el('form','brief-form');
 form.append(el('p','',ui('在本页整理摘要，再复制到微信或打开邮件草稿。','Build a brief here, then copy it to WeChat or open an email draft.')));
 const field=(label,input)=>{const line=el('label','',label);line.append(input);form.append(line);};
 if(project)form.append(el('p','brief-project',ui('参考项目 · ','Reference project · ')+env.localize(project.name)));
 const topic=el('select');const topics=[...new Set([initialTopic,'general',...JOURNEY_TOPICS])];
 for(const id of topics){const service=ENGINEERING_SERVICES.find(s=>s.id===id);const label=service?copy('eng_'+id+'_title'):id==='general'?ui('其他方向','Other'):id.toUpperCase();topic.add(new Option(label,id));}
 field(ui('合作方向','Area of interest'),topic);
 for(const [id,zh,en] of [['source','资料或系统在哪里？','Where does the material live?'],['pain','现在最费时间的是哪一步？','Which step takes the most time?'],['outcome','希望得到什么结果？','What outcome do you need?'],['limits','有哪些部署或数据限制？','What constraints apply?']]){
  const input=el('textarea');input.rows=2;input.maxLength=600;input.required=false;input.value=draft[id];input.oninput=()=>draft[id]=input.value;field(ui(zh,en),input);
 }
 const submit=el('button','engineering-control',ui('生成需求摘要','Build brief'));submit.type='submit';const result=el('div','brief-result');
 form.append(submit,result);const reset=()=>result.replaceChildren();form.addEventListener('input',reset);
 form.onsubmit=event=>{
  event.preventDefault();
  const text=[topic.selectedOptions[0].text,...(project?[env.localize(project.name)]:[]),...[...form.querySelectorAll('textarea')].filter(n=>n.value.trim()).map(n=>n.parentNode.firstChild.textContent+'\n'+n.value.trim())].join('\n\n');
  const output=el('textarea');output.readOnly=true;output.rows=7;output.value=text;output.setAttribute('aria-label',ui('需求摘要','Project brief'));
  const copyButton=el('button','engineering-control',ui('复制摘要','Copy brief'));copyButton.type='button';
  const message=el('span');message.setAttribute('role','status');
  copyButton.onclick=async()=>{try{await navigator.clipboard.writeText(text);message.textContent=ui('已复制，可粘贴到微信或邮件。','Copied. Paste into WeChat or email.');}catch{output.focus();output.select();message.textContent=ui('已选中摘要，请复制。','Brief selected. Copy it now.');}};
  result.replaceChildren(output,copyButton,message);
  const email=section.querySelector('.contact-email');if(email){const mail=link(ui('在邮件中打开','Open email draft'),email.href+'?subject='+encodeURIComponent(topic.selectedOptions[0].text)+'&body='+encodeURIComponent(text));mail.onclick=()=>record(base,env.route,'contact',topic.value);result.append(mail);}
 };
 details.append(form);section.append(details);
 return ()=>topic.value;
}

export function mountJourney(env){
 const {base,route,portfolio,copy}=env;
 if(!portfolio.site.pages.some(p=>p.id===route&&!p.hidden))return ()=>{};
 const contact=document.querySelector('#contact:not([hidden])');
 const topic=route==='rag-lab'?'rag':fromTopic();
 const page=portfolio.site.pages.find(p=>p.id===route);
 if(contact&&!page.blocks.find(b=>b.id==='contact')?.buttonHidden){const current=brief(contact,env,topic);for(const action of contact.querySelectorAll('.wechat-trigger,.contact-email'))action.addEventListener('click',()=>record(base,route,'contact',current()));}
 if(route.startsWith('project-')&&document.querySelector('#project-detail:not([hidden])')){
  record(base,route,'case',topic);
  if(!page.blocks.find(b=>b.id==='project-detail')?.buttonHidden&&blockVisible(portfolio,'home','contact'))document.querySelector('#project-detail').append(contactLink(base,topic,portfolio.projects.find(p=>'project-'+p.id===route)));
 }
 const sections=[...document.querySelectorAll('.engineering-service:not([hidden]),.project-story')].filter(n=>n.getClientRects().length);
 for(const s of sections.filter(s=>s.id.startsWith('service-'))){
  const id=s.id.slice(8),row=el('div','service-journey');
  if(id==='rag'&&blockVisible(portfolio,'rag-lab','lab-demo'))row.append(link(copy('labTry'),base+'/?page=rag-lab&topic=rag'));
  const related=caseActions(portfolio,id,base,env.localize);
  if(related.length){const examples=el('div','case-references');examples.append(el('small','',id==='rag'?copy('labRelated'):copy('capabilityProjects')),...related);row.append(examples);}
  if(blockVisible(portfolio,'home','contact'))row.append(contactLink(base,id));
  if(!portfolio.site.pages.find(p=>p.id===route).blocks.find(b=>b.id===s.id)?.buttonHidden)s.querySelector('.engineering-copy')?.append(row);
 }
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){const id=entry.target.id.replace(/^(service-|capability-)/,'');record(base,route,'view',id);observer.unobserve(entry.target);}}},{rootMargin:'-15% 0px -30% 0px'});
 sections.forEach(s=>observer.observe(s));
 return ()=>observer.disconnect();
}
