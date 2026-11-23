import test from 'node:test';
import assert from 'node:assert/strict';
import {getStats,text,guideProjects} from '../frontend/lib.js';
test('statistics count visible unique cases, overlapping categories and actual evidenced deliveries separately',()=>{
  const projects=[{visible:true,categories:['ai','agent','enterprise'],delivered:true},{visible:true,categories:['ai','algorithm'],delivered:false},{visible:false,categories:['ai','rag'],delivered:true}];
  const s=getStats({projects},{repositories:[{}, {}, {}, {}]});
  assert.equal(s.repositories,4);assert.equal(s.projects,2);assert.equal(s.aiAgent,2);assert.equal(s.ai,2);assert.equal(s.agent,1);assert.equal(s.rag,0);assert.equal(s.delivered,1);
});
test('bilingual copy preserves intentionally empty text and falls back only when missing',()=>{
  assert.equal(text({zh:'中文',en:'English'},'en'),'English');assert.equal(text({zh:'中文',en:''},'en'),'');assert.equal(text({zh:'中文'},'en'),'中文');
});

test('home project guide respects published order, hidden details and replacement artwork',()=>{
  const projects=['a','b','c','d','e'].map((id,i)=>({id,featured:i>1,visible:id!=='c'}));
  const guide={id:'projects-guide'};
  const pages=[{id:'home',blocks:[guide]},{id:'projects',blocks:[{id:'archive'}]},
    ...projects.map(p=>({id:'project-'+p.id,hidden:p.id==='d',blocks:[{id:'project-detail'}]}))];
  const data={site:{pages},projects};
  assert.deepEqual(guideProjects(data).map(p=>p.id),['e','a','b']);
  pages.at(-1).blocks[0].hidden=true;
  assert.deepEqual(guideProjects(data).map(p=>p.id),['a','b']);
  guide.image='/media/cover.webp';assert.deepEqual(guideProjects(data),[]);
  delete guide.image;guide.buttonHidden=true;assert.deepEqual(guideProjects(data),[]);
});
