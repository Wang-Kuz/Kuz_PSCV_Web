import {readdir,readFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validatePortfolio} from '../backend/schema.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
let checked=0;
for(const dir of ['backend','frontend','scripts','tests']){
  for(const file of await readdir(path.join(root,dir),{recursive:true})){
    if(!/\.(?:mjs|js)$/.test(file))continue;
    const result=spawnSync(process.execPath,['--check',path.join(root,dir,file)],{encoding:'utf8'});
    if(result.status!==0)throw new Error(result.stderr);
    checked++;
  }
}
const portfolio=validatePortfolio(JSON.parse(await readFile(path.join(root,'data/portfolio.seed.json'),'utf8')));
const inventory=JSON.parse(await readFile(path.join(root,'data/repositories.json'),'utf8'));
const known=new Set(inventory.repositories.map(r=>r.url.replace(/\/$/,'')));
for(const p of portfolio.projects)if(!known.has(p.github.replace(/\/$/,'')))throw new Error(`Project not in source inventory: ${p.id}`);
const indexed=new Set();
for(const p of portfolio.projects){
  const url=p.github.replace(/\/$/,'');
  if(indexed.has(url))throw new Error(`Duplicate project repository: ${url}`);
  if(!p.visible)throw new Error(`Seed inventory entry is hidden: ${p.id}`);
  indexed.add(url);
}
for(const url of known)if(!indexed.has(url))throw new Error(`Repository needs a reviewed bilingual project entry: ${url}`);
const readme=await readFile(path.join(root,'README.md'),'utf8');
for(const r of inventory.repositories)if(!readme.includes(`](${r.url})`))throw new Error(`README missing repository: ${r.name}`);
let links=0;
for(const dir of ['.','docs'])for(const file of await readdir(path.join(root,dir))){
  if(!file.endsWith('.md'))continue;
  const source=await readFile(path.join(root,dir,file),'utf8');
  for(const match of source.matchAll(/\]\(([^)]+)\)/g)){
    const target=match[1].split('#')[0];if(!target||/^[a-z]+:/.test(target))continue;
    await access(path.resolve(root,dir,decodeURIComponent(target)));links++;
  }
}
console.log(`Checked ${checked} JavaScript files, portfolio schema (${portfolio.projects.length} cases), ${inventory.repositories.length} repository links, ${links} local documentation links.`);
