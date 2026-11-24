// The browser owns direct scrolling. Align a completed gesture to a reading position.
export function mountChapterPaging(selector) {
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const sections = () => [...document.querySelectorAll(selector)].filter(node => node.getBoundingClientRect().height > 1);
    if (new URL(location.href).searchParams.has('preview') || sections().length < 2) return () => {};
    root.classList.add('chapter-paging');

    let lastScrollY = scrollY;
    let gesture = null, timer = 0, destination = null, touch = null;
    const rail = document.querySelector('#timeline-wrapper');
    const railSection = rail?.closest('section');
    function stops() {
        const max=Math.max(0,root.scrollHeight-innerHeight);
        const positions=[0,max];
        for(const [index,node] of sections().entries()){
            const rect=node.getBoundingClientRect(),start=scrollY+rect.top;
            const excess=rect.height-innerHeight;
            if(excess<=innerHeight*.16){
                positions.push(index===0?0:start+excess/2);
            } else {
                // Long mobile chapters have overlapping reading positions so no content is skipped.
                const pages=Math.ceil(excess/(innerHeight*.78));
                for(let i=0;i<=pages;i++)positions.push(index===0&&i===0?0:start+excess*i/pages);
            }
        }
        return positions.map(y=>Math.max(0,Math.min(max,y))).sort((a,b)=>a-b);
    }

    function browsing(event) {
        if(reduced.matches || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey ||
            document.querySelector('dialog[open], [aria-modal="true"]:not([hidden])'))return false;
        const target=event.target instanceof Element?event.target:null;
        if(target?.closest('input,textarea,select,[contenteditable]:not([contenteditable=false])'))return false;
        for(let n=target;n && n!==document.body && n!==root;n=n.parentElement){
            if(n.scrollHeight>n.clientHeight+2 && /auto|scroll/.test(getComputedStyle(n).overflowY))return false;
        }
        return true;
    }

    function clearGesture() {
        clearTimeout(timer);
        gesture = null;
    }
    let capturing = false;
    function updateCapture() {
        const needed = destination !== null || centeredRail();
        if (needed === capturing) return;
        capturing = needed;
        if (needed) window.addEventListener('wheel', captureWheel, {capture:true, passive:false});
        else window.removeEventListener('wheel', captureWheel, true);
    }
    function endAlignment() {
        destination = null;
        updateCapture();
    }
    function interrupt() {
        clearGesture();
        if (destination !== null) {
            endAlignment();
            window.scrollTo({top: scrollY, behavior: 'instant'});
        }
    }
    function align(top) {
        if (Math.abs(top - scrollY) < 2) return;
        destination = top;
        updateCapture();
        window.scrollTo({top, behavior: 'smooth'});
    }
    function adjacent(positions, start, sign) {
        return sign > 0 ? positions.find(y => y > start + 8) : positions.findLast(y => y < start - 8);
    }
    function settle() {
        if (!gesture || touch) return;
        const {start, sign, distance} = gesture;
        clearGesture();
        if (distance < 42 || reduced.matches) return;
        const positions = stops();
        const nearest = y => positions.reduce((a,b) => Math.abs(a-y) <= Math.abs(b-y) ? a : b);
        const origin = nearest(start);
        const next = adjacent(positions, origin, sign);
        const landed = nearest(scrollY);
        const fromRest = Math.abs(start - origin) <= 28;
        // Mid-chapter adjustments must never snap back past the gesture start.
        if (!fromRest && sign * (landed - start) < 0) return;
        align(fromRest && next !== undefined && sign * (landed - next) < 0 ? next : landed);
    }
    function schedule() {
        clearTimeout(timer);
        timer = setTimeout(settle, 140);
    }
    function record(delta, start) {
        const sign = Math.sign(delta);
        if (!sign) return;
        if (!gesture || gesture.sign !== sign) {
            interrupt();
            gesture = {start, sign, distance: 0};
        }
        gesture.distance += Math.abs(delta);
    }
    function centeredRail() {
        if (!railSection || !rail.scrollWidth) return false;
        const r = railSection.getBoundingClientRect();
        return Math.abs(r.top + (r.height - innerHeight)/2) <= 8;
    }
    function moveRail(delta) {
        if (!delta || !centeredRail()) return false;
        const before = rail.scrollLeft;
        rail.scrollLeft += delta;
        return rail.scrollLeft - before;
    }
    function wheelDelta(e) {
        if (!e.deltaY || Math.abs(e.deltaX) > Math.abs(e.deltaY) || !browsing(e)) return 0;
        return e.deltaY * (e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? innerHeight : 1);
    }
    function captureWheel(e) {
        if (!e.cancelable) return;
        const delta = wheelDelta(e);
        if (!delta) return;
        const consumed = moveRail(delta);
        if (consumed) {
            e.preventDefault();
            interrupt();
            const remaining = delta - consumed;
            if (Math.abs(remaining) >= 1) {
                record(remaining, scrollY);
                window.scrollBy({top:remaining, behavior:'instant'});
                schedule();
            }
        } else if (destination !== null) {
            const start = scrollY;
            interrupt();
            e.preventDefault();
            window.scrollBy({top:delta, behavior:'instant'});
            record(delta, start);
            schedule();
        }
    }
    function wheel(e) {
        const delta = wheelDelta(e);
        if (!delta) return;
        record(delta, lastScrollY);
        schedule();
    }
    function scrolled() {
        lastScrollY = scrollY;
        if (rail && destination === null) updateCapture();
        if (gesture && !touch) schedule();
        if (destination !== null && Math.abs(scrollY - destination) < 2) endAlignment();
    }
    function key(e) {
        if (!browsing(e) || e.shiftKey || e.target.closest?.('button,a,summary,[role=slider]')) return;
        const sign = {PageDown:1, PageUp:-1, ArrowDown:1, ArrowUp:-1, ' ':1}[e.key];
        if (!sign) {
            if (e.key === 'Home' || e.key === 'End') interrupt();
            return;
        }
        e.preventDefault();
        if (e.repeat && destination !== null) return;
        interrupt();
        if (rail && moveRail(sign * rail.clientWidth * .75)) return;
        const next = adjacent(stops(), scrollY, sign);
        if (next !== undefined) align(next);
    }
    function startTouch(e) {
        reset();
        if (e.touches.length !== 1 || !browsing(e)) return;
        const p = e.touches[0];
        touch = {x:p.clientX, y:p.clientY, last:p.clientY, start:scrollY, axis:null, rail: centeredRail()};
        if (touch.rail) window.addEventListener('touchmove', railTouch, {passive:false});
    }
    function trackTouch(e) {
        if (!touch || e.touches.length !== 1) return;
        const p = e.touches[0], dy = touch.y - p.clientY;
        if (!touch.axis && Math.max(Math.abs(dy), Math.abs(p.clientX-touch.x)) >= 5)
            touch.axis = Math.abs(dy) > Math.abs(p.clientX-touch.x) ? 'y' : 'x';
        if (touch.axis !== 'y') return;
        const delta = touch.last - p.clientY;
        touch.last = p.clientY;
        if (touch.rail && e.cancelable) {
            e.preventDefault();
            const remaining = delta - moveRail(delta);
            if (Math.abs(remaining) < 1) { clearGesture(); return; }
            // A gesture already captured by the rail continues vertically at its edge.
            record(remaining, scrollY);
            window.scrollBy({top:remaining, behavior:'instant'});
        } else {
            record(delta, gesture ? scrollY : touch.start);
        }
    }
    function railTouch(e) { trackTouch(e); }
    function nativeTouch(e) { if (!touch?.rail) trackTouch(e); }
    function releaseTouch() {
        window.removeEventListener('touchmove', railTouch);
        touch = null;
    }
    function endTouch() {
        releaseTouch();
        settle();
    }
    function reset() { releaseTouch(); interrupt(); }
    const bindings = [
        ['wheel', wheel, {passive:true}], ['scroll', scrolled, {passive:true}], ['keydown', key],
        ['touchstart', startTouch, {passive:true}], ['touchmove', nativeTouch, {passive:true}],
        ['touchend', endTouch, {passive:true}], ['touchcancel', reset], ['pointerdown', reset, {passive:true}],
        ['hashchange', reset], ['popstate', reset], ['resize', reset], ['kuz-scroll-reset', reset]
    ];
    for (const [name,fn,options] of bindings) window.addEventListener(name,fn,options);
    updateCapture();
    reduced.addEventListener('change',reset);
    return () => {
        reset();
        window.removeEventListener('wheel', captureWheel, true);
        root.classList.remove('chapter-paging');
        reduced.removeEventListener('change',reset);
        for (const [name,fn,options] of bindings) window.removeEventListener(name,fn,options);
    };
}
