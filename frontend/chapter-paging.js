// One deliberate wheel or vertical swipe advances one reading position.
export function mountChapterPaging(selector) {
    const root=document.documentElement;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const sections=()=>[...document.querySelectorAll(selector)].filter(node=>node.getClientRects().length && node.getBoundingClientRect().height>1);
    if(new URL(location.href).searchParams.has('preview') || sections().length<2) return ()=>{};
    root.classList.add('chapter-paging');
    let frame=0, lastWheel=-Infinity, previousSign=0, consumed=false, impulse=0, touch=null;
    const stop=()=>{cancelAnimationFrame(frame);frame=0;};
    const reset=()=>{stop();lastWheel=-Infinity;consumed=false;impulse=0;touch=null;};
    function move(top) {
        stop();
        const start=scrollY, distance=top-start, time=performance.now();
        const duration=Math.min(580,260+Math.abs(distance)*.30);
        function tick(now){
            const t=Math.min(1,(now-time)/duration);
            window.scrollTo({top:start+distance*(t*t*(3-2*t)),behavior:'instant'});
            frame=t<1?requestAnimationFrame(tick):0;
        }
        frame=requestAnimationFrame(tick);
    }
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
    function go(sign) {
        const positions=stops(), tolerance=Math.min(80,innerHeight*.09);
        const y=sign>0?positions.find(v=>v>scrollY+tolerance):positions.findLast(v=>v<scrollY-tolerance);
        const dest=y??(sign>0?positions.at(-1):0);
        if(Math.abs(dest-scrollY)>1) move(dest);
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
    function timeline(sign) {
        const rail=document.querySelector('#timeline-wrapper');
        if(!rail || !rail.getClientRects().length)return null;
        const rect=rail.closest('section').getBoundingClientRect();
        if(Math.abs(rect.top+rect.height/2-innerHeight/2)>8)return null;
        return sign>0 ? (rail.scrollLeft+rail.clientWidth<rail.scrollWidth-1?rail:null) : (rail.scrollLeft>1?rail:null);
    }
    function wheel(event){
        if(!browsing(event)||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
        const delta=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?innerHeight:1);
        const sign=Math.sign(delta),now=performance.now();
        if(now-lastWheel>165 || sign!==previousSign){consumed=false;impulse=0;}
        lastWheel=now; previousSign=sign;
        const rail=timeline(sign);
        event.preventDefault();
        if(rail && !frame){rail.scrollLeft+=delta;return;}
        if(consumed || (frame && Math.sign(delta)===direction))return;
        impulse+=Math.abs(delta);
        if(impulse<18)return;
        consumed=true;direction=sign;go(sign);
    }
    let direction=0;
    function key(event){
        if(!browsing(event)||event.shiftKey||event.target.closest?.('button,a,summary,[role=slider]'))return;
        const sign={PageDown:1,PageUp:-1,ArrowDown:1,ArrowUp:-1,' ':1}[event.key];
        if(!sign){if(event.key==='Home'||event.key==='End')reset();return;}
        event.preventDefault();
        if(event.repeat && frame)return;
        const rail=timeline(sign);
        if(rail)rail.scrollLeft+=sign*rail.clientWidth*.75;
        else {direction=sign;go(sign);}
    }
    function startTouch(e){
        reset();
        if(e.touches.length!==1||!browsing(e))return;
        const p=e.touches[0];touch={x:p.clientX,y:p.clientY,last:p.clientY};
    }
    function moveTouch(e){
        if(!touch || !e.cancelable)return;
        if(e.touches.length!==1){touch=null;return;}
        const p=e.touches[0],dy=touch.y-p.clientY,delta=touch.last-p.clientY;
        const dx=touch.x-p.clientX;
        if(!touch.axis){
            if(Math.max(Math.abs(dx),Math.abs(dy))<5)return;
            touch.axis=Math.abs(dy)>Math.abs(dx)?'vertical':'horizontal';
        }
        if(touch.axis!=='vertical')return;
        e.preventDefault();
        if(touch.paged)return;
        const sign=Math.sign(delta);
        const rail=timeline(sign);
        if(rail && sign){
            rail.scrollLeft+=delta;touch.y=p.clientY;
        } else if(Math.abs(dy)>36){
            touch.paged=true;direction=Math.sign(dy);go(direction);
        }
        touch.last=p.clientY;
    }
    const endTouch=()=>{touch=null;};
    const bindings=[['wheel',wheel,{passive:false}],['keydown',key],['touchstart',startTouch,{passive:true}],
        ['touchmove',moveTouch,{passive:false}],['touchend',endTouch],['touchcancel',endTouch],['pointerdown',reset,{passive:true}],['hashchange',reset],
        ['popstate',reset],['resize',reset],['kuz-scroll-reset',reset]];
    for(const [name,fn,options] of bindings)window.addEventListener(name,fn,options);
    reduced.addEventListener('change',reset);
    return ()=>{reset();root.classList.remove('chapter-paging');reduced.removeEventListener('change',reset);
        for(const [name,fn,options] of bindings)window.removeEventListener(name,fn,options);};
}
