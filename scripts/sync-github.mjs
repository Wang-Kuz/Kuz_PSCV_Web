import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const run = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OWNER = 'Wang-Kuz';
const START = '<!-- REPOSITORIES:START -->'; const END = '<!-- REPOSITORIES:END -->';
async function atomicWrite(file, content) {
  const temp = `${file}.${randomUUID()}.tmp`;
  try { await writeFile(temp, content, { flag: 'wx' }); await rename(temp, file); }
  catch (error) { await unlink(temp).catch(() => {}); throw error; }
}
function normalize(repo) {
  if (!repo || repo.owner?.login?.toLowerCase() !== OWNER.toLowerCase() || !/^[\w.-]+$/.test(repo.name)) return null;
  return { name: repo.name, url: `https://github.com/${OWNER}/${repo.name}`, visibility: repo.private ? 'private' : 'public', defaultBranch: repo.default_branch, size: Number(repo.size) || 0, updatedAt: repo.pushed_at || repo.updated_at || null };
}
async function authenticatedInventory() {
  const { stdout } = await run('gh', ['api', '--paginate', '--slurp', '/user/repos?affiliation=owner&per_page=100'], { windowsHide: true, timeout: 90000, maxBuffer: 16 * 1024 * 1024 });
  const pages = JSON.parse(stdout);
  if (!Array.isArray(pages) || pages.some(p => !Array.isArray(p))) throw new Error('Unexpected GitHub response');
  return pages.flat().map(normalize).filter(Boolean);
}
async function publicInventory() {
  const repositories = [];
  for (let page = 1; page <= 100; page++) {
    const response = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100&page=${page}`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'Kuz-PSCV-local' }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`GitHub public API returned ${response.status}`);
    const batch = await response.json(); if (!Array.isArray(batch)) throw new Error('Unexpected GitHub response');
    repositories.push(...batch.map(normalize).filter(Boolean)); if (batch.length < 100) return repositories;
  }
  throw new Error('Pagination safety limit reached; existing inventory retained');
}
export function repositoryTable(inventory) {
  return [START, '', `仓库索引更新：${inventory.fetchedAt} · ${inventory.repositories.length} 个仓库 · ${inventory.coverage === 'partial' ? '部分刷新（公开仓库；保留先前记录）' : '账号仓库清单'}。私有仓库需要访问权限；仓库数量不等于已交付项目数量。`, '', '| 仓库 / Repository | 访问 / Visibility |', '| --- | --- |', ...inventory.repositories.map(repo => `| [${repo.name}](${repo.url}) | ${repo.visibility === 'private' ? 'Private · 需授权' : 'Public'} |`), '', END].join('\n');
}
export async function syncGithub({ root = projectRoot, loadAuthenticated = authenticatedInventory, loadPublic = publicInventory } = {}) {
  const inventoryPath = path.join(root, 'data', 'repositories.json');
  let previous = { repositories: [] };
  try { previous = JSON.parse(await readFile(inventoryPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  let repositories; let coverage = 'complete'; let source = 'gh-authenticated'; let warning;
  try { repositories = await loadAuthenticated(); }
  catch {
    const publicRepos = await loadPublic();
    const map = new Map(previous.repositories.map(r => [r.name.toLowerCase(), r]));
    for (const repo of publicRepos) map.set(repo.name.toLowerCase(), repo);
    repositories = [...map.values()]; coverage = 'partial'; source = 'github-public-api';
    warning = 'Only public repositories were refreshed. Previously known private or missing repositories were retained; authenticate gh for a complete refresh.';
  }
  if (!repositories.length && previous.repositories.length) throw new Error('GitHub returned no owned repositories; retained existing inventory');
  repositories.sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const inventory = { fetchedAt: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()), owner: OWNER, coverage, source, repositories, ...(warning ? { warning } : {}) };
  const readmePath = path.join(root, 'README.md'); let readme;
  try { readme = await readFile(readmePath, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  let nextReadme;
  if (readme !== undefined) {
    const a = readme.indexOf(START); const b = readme.indexOf(END);
    if (a < 0 || b < a || readme.indexOf(START, a + START.length) >= 0 || readme.indexOf(END, b + END.length) >= 0) throw new Error('README repository markers missing or duplicated; no files were updated');
    nextReadme = readme.slice(0, a) + repositoryTable(inventory) + readme.slice(b + END.length);
  }
  // Both outputs are individually atomic; a failed README write restores inventory.
  const oldInventory = await readFile(inventoryPath, 'utf8').catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  await atomicWrite(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`);
  try { if (nextReadme !== undefined) await atomicWrite(readmePath, nextReadme); }
  catch (error) { if (oldInventory !== null) await atomicWrite(inventoryPath, oldInventory); else await unlink(inventoryPath); throw error; }
  return inventory;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const result = await syncGithub(); console.log(`Synced ${result.repositories.length} repositories (${result.coverage}). README index updated. Curated projects and local edits were preserved.`); if (result.warning) console.log(result.warning); }
  catch (error) { console.error(`GitHub sync failed: ${error.message}`); process.exitCode = 1; }
}
