// A single frame reads all visible target geometry before any entrance mutates the DOM.
const watchers=new Map();
let frame=0, resizer;
function schedule(){if(!frame)frame=requestAnimationFrame(measure);}
function measure(){
    frame=0;
    const changes=new Map(),center=innerHeight/2;
    for(const [node,listeners] of watchers){
        const rect=node.getBoundingClientRect();
        // Tall chapters can enter from either end once most of a reading screen is in view.
        const margin=Math.max(0,(rect.height-innerHeight*.8)/2)+innerHeight*.09;
        const visible=rect.width>0 && rect.height>0 && rect.right>0 && rect.left<innerWidth &&
            Math.abs(rect.top+rect.height/2-center)<=margin;
        for(const [listener,previous] of listeners){
            if(previous===visible)continue;
            listeners.set(listener,visible);
            if(!changes.has(listener))changes.set(listener,[]);
            changes.get(listener).push({target:node,isIntersecting:visible});
        }
    }
    for(const [listener,entries] of changes)listener(entries);
}
export function centerObserver(callback){
    const targets=new Set();
    function observe(node){
        if(targets.has(node))return;
        if(!watchers.size){
            resizer=new ResizeObserver(schedule);
            document.addEventListener('scroll',schedule,{capture:true,passive:true});
            window.addEventListener('resize',schedule);
        }
        if(!watchers.has(node)){watchers.set(node,new Map());resizer.observe(node);}
        watchers.get(node).set(callback,null);targets.add(node);schedule();
    }
    function unobserve(node){
        if(!targets.delete(node))return;
        const listeners=watchers.get(node);
        listeners.delete(callback);
        if(!listeners.size){watchers.delete(node);resizer.unobserve(node);}
        if(!watchers.size){
            resizer.disconnect();cancelAnimationFrame(frame);frame=0;
            document.removeEventListener('scroll',schedule,true);window.removeEventListener('resize',schedule);
        }
    }
    return {observe,unobserve,disconnect(){for(const node of targets)unobserve(node);}};
}

// Observe individual columns, including when image and copy stack on a phone.
export function mountReadingEntrances(nodes, {art, onEnter} = {}) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return () => {};
    const pending = new Set(), visible = new Set(), active = new Map();
    const compact = matchMedia('(max-width: 700px)');
    let frame = 0, previousY = scrollY;
    const observer = new IntersectionObserver(entries => {
        for (const {target, isIntersecting} of entries) {
            if (isIntersecting && pending.has(target)) visible.add(target);
            else visible.delete(target);
        }
        schedule();
    });

    function show(node, animate) {
        if (!pending.delete(node)) return;
        visible.delete(node);
        observer.unobserve(node);
        if (animate) {
            node.dataset.readingEntrance = 'entering';
            const picture = art && node.matches(art);
            const from = {opacity:.18, translate:compact.matches ? '0 6px' : '0 12px'};
            if (picture) from.scale = compact.matches ? 1.012 : 1.025;
            const animation = node.animate([from, {}], {
                duration:compact.matches ? 650 : picture ? 960 : 820,
                easing:'cubic-bezier(.25,.55,.28,1)'
            });
            active.set(node, animation);
            animation.onfinish = () => {
                delete node.dataset.readingEntrance;
                active.delete(node);
            };
            onEnter?.(node);
        } else {
            delete node.dataset.readingEntrance;
        }
    }
    function measure() {
        frame = 0;
        const height = innerHeight, center = height / 2, y = scrollY;
        const bottom = document.documentElement.scrollHeight - height;
        const ready = [];
        for (const node of visible) {
            const r = node.getBoundingClientRect();
            if (!r.width || !r.height || r.bottom <= 0 || r.top >= height) continue;
            const midpoint = r.top + r.height / 2;
            const offset = midpoint - center;
            // A long column begins when its first readable screenful is centered.
            const band = height * .055 + Math.max(0, r.height - height * .78) / 2;
            const crossed = offset * (offset + y - previousY) <= 0;
            if (Math.abs(offset) <= band || crossed ||
                (y <= 1 && offset < 0) || (y >= bottom - 1 && offset > 0)) ready.push(node);
        }
        previousY = y;
        for (const node of ready) show(node, true);
    }
    function schedule() {
        if (!frame && pending.size) frame = requestAnimationFrame(measure);
    }
    function focus(event) {
        for (let node = event.target; node instanceof Element; node = node.parentElement) {
            show(node, false);
            active.get(node)?.finish();
        }
    }
    function dispose() {
        cancelAnimationFrame(frame);
        observer.disconnect();
        document.removeEventListener('scroll',schedule,true);
        document.removeEventListener('focusin',focus);
        window.removeEventListener('resize',schedule);
        reduced.removeEventListener('change',preference);
        for (const node of pending) delete node.dataset.readingEntrance;
        for (const [node,animation] of active) {
            delete node.dataset.readingEntrance;
            animation.cancel();
        }
        pending.clear(); visible.clear(); active.clear();
    }
    function preference() { if (reduced.matches) dispose(); }

    // Read once before writing any styles. Lead copy and restored reading positions stay legible.
    const fresh = [...new Set(nodes)].filter(node => {
        const r = node.getBoundingClientRect();
        return !(r.width && r.bottom > 0 && r.top < innerHeight && r.top + r.height / 2 <= innerHeight * .555);
    });
    for (const node of fresh) {
        node.dataset.readingEntrance = 'waiting';
        pending.add(node);
        observer.observe(node);
    }
    document.addEventListener('scroll',schedule,{capture:true,passive:true});
    document.addEventListener('focusin',focus);
    window.addEventListener('resize',schedule,{passive:true});
    reduced.addEventListener('change',preference);
    return dispose;
}
