import {WORKSTATION_PAGES} from './workstation-pages.js';
export function organizeSite(site,projects=[]){
 const s=structuredClone(site);if(!s.layoutVersion){for(const p of WORKSTATION_PAGES){const found=s.pages.find(x=>x.id===p.id);if(!found)s.pages.push(structuredClone(p));else for(const b of p.blocks.filter(b=>(b.id.startsWith('section-')||b.id.startsWith('button-'))))if(!found.blocks.some(x=>x.id===b.id))found.blocks.push(structuredClone(b));}}const archive=s.pages.find(p=>p.id==='home')?.blocks.find(b=>b.id==='archive');s.pages=s.pages.filter(p=>p.id!=='workstation');
 const ws=s.pages.find(p=>p.id==='ws-index');if(ws&&!s.layoutVersion){ws.parent='';ws.name='个人工作站';}
 for(const p of s.pages){if(s.layoutVersion)continue;if(p.id==='ws-studio'){p.parent='ws-index';p.name='工具箱';}else if(p.id.startsWith('ws-tools-'))p.parent='ws-studio';else if(p.parent==='workstation')p.parent='ws-index';}
 if(!s.pages.some(p=>p.id==='projects'))s.pages.push({id:'projects',name:'项目展示',parent:'',blocks:[archive||{id:'archive',title:'',text:'',image:'',hidden:false}]});
 for(const project of projects){const id='project-'+project.id;if(!s.pages.some(p=>p.id===id))s.pages.push({id,name:project.name.zh||project.name.en,parent:'projects',blocks:[{id:'project-detail',title:'',text:'',image:'',hidden:false}]});}
 if(!s.layoutVersion){const home=s.pages.find(p=>p.id==='home');if(home)home.blocks=home.blocks.filter(b=>b.id!=='archive');s.header.links=[{label:'作品',href:'/?page=projects'},{label:'关于',href:'#about'},{label:'工作站',href:'/workstation/index.html'}];s.header.settings=false;s.header.home=false;s.layoutVersion=2;}
 return s;
}
