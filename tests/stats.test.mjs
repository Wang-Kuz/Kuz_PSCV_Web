import test from 'node:test';
import assert from 'node:assert/strict';
import {getStats,text} from '../frontend/lib.js';
test('statistics count visible unique cases, overlapping categories and actual evidenced deliveries separately',()=>{
  const projects=[{visible:true,categories:['ai','agent','enterprise'],delivered:true},{visible:true,categories:['ai','algorithm'],delivered:false},{visible:false,categories:['ai','rag'],delivered:true}];
  const s=getStats({projects},{repositories:[{}, {}, {}, {}]});
  assert.equal(s.repositories,4);assert.equal(s.projects,2);assert.equal(s.aiAgent,2);assert.equal(s.ai,2);assert.equal(s.agent,1);assert.equal(s.rag,0);assert.equal(s.delivered,1);
});
test('bilingual copy preserves intentionally empty text and falls back only when missing',()=>{
  assert.equal(text({zh:'中文',en:'English'},'en'),'English');assert.equal(text({zh:'中文',en:''},'en'),'');assert.equal(text({zh:'中文'},'en'),'中文');
});
