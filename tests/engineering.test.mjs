import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {organizeSite} from '../frontend/page-structure.js';
import {ENGINEERING_SERVICES} from '../frontend/engineering-content.js';
import {COPY_DEFAULTS} from '../frontend/copy.js';
import {validatePortfolio} from '../frontend/schema.js';
test('engineering migration preserves custom contacts and provides bilingual service content',()=>{
 const site=organizeSite({layoutVersion:4,header:{links:[]},contact:{email:'a@example.com',wechat:'custom',qr:''},pages:[{id:'home',name:'Custom',parent:'',blocks:[]}]});
 assert.equal(site.pages.find(p=>p.id==='aigc').blocks.length,16);
 assert.equal(site.contact.wechat,'custom');assert.deepEqual(organizeSite(site),site);
 for(const service of ENGINEERING_SERVICES)for(const field of ['title','promise','pain','approach','steps','business','diagram','scene'])for(const lang of ['zh','en'])assert(COPY_DEFAULTS['eng_'+service.id+'_'+field][lang]);
 const p=JSON.parse(fs.readFileSync(new URL('../data/portfolio.seed.json',import.meta.url)));p.site=site;p.copy={...COPY_DEFAULTS,...p.copy};assert.doesNotThrow(()=>validatePortfolio(p));
 p.site.contact.email='invalid';assert.throws(()=>validatePortfolio(p));p.site.contact.email='a@example.com';
 p.site.pages.find(p=>p.id==='aigc').blocks[1].businessImage='https://example.com/image.png';assert.throws(()=>validatePortfolio(p));
});
