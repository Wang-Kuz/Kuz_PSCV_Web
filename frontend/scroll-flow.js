export function splitScroll(position,max,delta){const next=Math.max(0,Math.min(max,position+delta));return {next,remaining:delta-(next-position)};}
export function mountScrollFlow({damping=68}={}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(pointer:fine)');let frame=0,targetY=scrollY,rail=null,targetX=0,last=0;
 const cancel=()=>{cancelAnimationFrame(frame);frame=0;rail=null;targetY=scrollY;};
 const tick=now=>{const alpha=1-Math.exp(-Math.min(40,now-last||16)/damping);last=now;const y=scrollY+(targetY-scrollY)*alpha;window.scrollTo({top:y,behavior:'instant'});if(rail)rail.scrollLeft+=(targetX-rail.scrollLeft)*alpha;if(Math.abs(targetY-scrollY)>.8||(rail&&Math.abs(targetX-rail.scrollLeft)>.8)){frame=requestAnimationFrame(tick);}else{window.scrollTo({top:targetY,behavior:'instant'});if(rail)rail.scrollLeft=targetX;frame=0;}};
 const wheel=e=>{if(e.ctrlKey||e.metaKey||e.defaultPrevented||reduced.matches||!fine.matches||document.querySelector('dialog[open]'))return;
  const el=e.target instanceof Element?e.target:null;if(el?.closest('input,textarea,select,[contenteditable=true]'))return;
  const wrapper=document.querySelector('#timeline-wrapper');let active=null;if(wrapper){const rect=wrapper.getBoundingClientRect();if(rect.top<innerHeight*.75&&rect.bottom>innerHeight*.35)active=wrapper;}
  for(let n=el;n&&n!==document.body;n=n.parentElement){if(n===active)break;const style=getComputedStyle(n);if(/auto|scroll/.test(style.overflowY)&&n.scrollHeight>n.clientHeight+2)return;}
  let delta=e.deltaY*(e.deltaMode===1?24:e.deltaMode===2?innerHeight:1);if(!delta)return;
  if(!frame)targetY=scrollY;
  if(active&&active.scrollWidth>active.clientWidth+2){if(rail!==active||!frame){rail=active;targetX=rail.scrollLeft;}const step=splitScroll(targetX,rail.scrollWidth-rail.clientWidth,delta);targetX=step.next;delta=step.remaining;}
  const max=document.documentElement.scrollHeight-innerHeight;targetY=Math.max(0,Math.min(max,targetY+delta));e.preventDefault();if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}
 };
 addEventListener('wheel',wheel,{passive:false});addEventListener('pointerdown',cancel,{passive:true});addEventListener('touchstart',cancel,{passive:true});addEventListener('keydown',cancel);addEventListener('resize',cancel);reduced.addEventListener('change',cancel);
 return()=>{cancel();removeEventListener('wheel',wheel);removeEventListener('pointerdown',cancel);removeEventListener('touchstart',cancel);removeEventListener('keydown',cancel);removeEventListener('resize',cancel);reduced.removeEventListener('change',cancel);};
}
