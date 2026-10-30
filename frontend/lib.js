export function text(value, lang = 'zh') {
  return typeof value === 'string' ? value : value?.[lang] ?? value?.zh ?? value?.en ?? '';
}
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'className') node.className = value;
    else if (key === 'textContent') node.textContent = value;
    else if (key in node && !key.startsWith('aria-')) node[key] = value;
    else node.setAttribute(key, value === true ? '' : String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child != null && child !== false) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}
let token;
export async function api(path, options = {}) {
  const method = options.method || 'GET';
  const headers = new Headers(options.headers);
  if (!['GET','HEAD'].includes(method)) {
    token ||= (await api('/api/session')).token;
    headers.set('X-CSRF-Token', token);
  }
  const response = await fetch(path, {...options, headers});
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return result;
}
export function getStats(portfolio, inventory) {
  const projects = portfolio.projects.filter(p => p.visible !== false);
  const count = category => projects.filter(p => p.categories.includes(category)).length;
  return { repositories: inventory?.repositories?.length || 0, projects: projects.length,
    delivered: projects.filter(p => p.delivered === true).length,
    ai: count('ai'), agent:count('agent'), rag:count('rag'), enterprise:count('enterprise'),
    management:count('management'), software:count('software'), algorithm:count('algorithm'),
    aiAgent:projects.filter(p => p.categories.includes('ai') || p.categories.includes('agent')).length };
}
