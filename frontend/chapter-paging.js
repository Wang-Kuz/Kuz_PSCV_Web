// Compatibility for cached app.js versions that still import this module.
// The marker prevents those clients from installing the legacy scroll controller.
export function mountChapterPaging() {
    document.documentElement.classList.add('chapter-paging');
    return () => document.documentElement.classList.remove('chapter-paging');
}
