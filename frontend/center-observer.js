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
