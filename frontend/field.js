// Original procedural artwork. These are engineering concepts, never product screenshots.
// The hero prefers smooth GPU shading; Canvas remains a dependency-free fallback.
import { createSculptureRenderer } from './sculpture-gl.js';
const TAU = Math.PI * 2;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function rotate(x, y, z, ax, ay) {
  const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
  const rx = x * cy + z * sy, rz = z * cy - x * sy;
  return [rx, y * cx - rz * sx, y * sx + rz * cx];
}

function drawSculpture(ctx, w, h, time, pointer, scroll) {
  const scale = Math.min(w, h) * (.24 + scroll * .05);
  const ax = -.65 + pointer.y * .24 + scroll * .3;
  const ay = -.32 + time * .075 + pointer.x * .42;
  const rows = 112, columns = 48, mesh = [];
  const cx = w * .51, cy = h * .49;
  const glow = ctx.createRadialGradient(cx, cy, scale * .3, cx, cy, scale * 2.4);
  glow.addColorStop(0, 'rgba(93,139,183,.15)');
  glow.addColorStop(.55, 'rgba(96,91,157,.055)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);

  for (let i = 0; i <= rows; i++) {
    const u = i / rows * TAU, row = [];
    for (let j = 0; j <= columns; j++) {
      const v = j / columns * TAU;
      const tube = .31 + .045 * Math.sin(u * 3 + time * .4);
      const radius = 1.12 + tube * Math.cos(v);
      const [x,y,z] = rotate(radius * Math.cos(u), radius * Math.sin(u), .31 * Math.sin(u * 2) + tube * Math.sin(v), ax, ay);
      const perspective = 3.8 / (3.8 - z);
      row.push({x:cx+x*scale*perspective, y:cy+y*scale*perspective, z, u, v});
    }
    mesh.push(row);
  }
  const faces=[];
  for(let i=0;i<rows;i++)for(let j=0;j<columns;j++){
    const p=[mesh[i][j],mesh[i+1][j],mesh[i+1][j+1],mesh[i][j+1]];
    faces.push({p,z:p.reduce((s,v)=>s+v.z,0)/4,i,j});
  }
  faces.sort((a,b)=>a.z-b.z);
  for(const face of faces){
    const {p,i,j,z}=face;
    const v=(j+.5)/columns*TAU, u=(i+.5)/rows*TAU;
    const light=clamp(.42+.35*Math.cos(v-.8)+.20*Math.cos(u+ay-pointer.x),.08,1);
    const sheen=Math.pow(Math.max(0,Math.cos(v-1.15+pointer.y*.45)),12);
    const hue=215+58*Math.sin(u+time*.09)+18*Math.cos(v+ay);
    const luminance=10+light*48+sheen*34;
    ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(let k=1;k<4;k++)ctx.lineTo(p[k].x,p[k].y);ctx.closePath();
    ctx.fillStyle=`hsla(${hue},${24+sheen*14}%,${luminance}%,.98)`;ctx.fill();
    ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.55;ctx.stroke();
    if(i%3===0&&j%3===0&&z>0){ctx.fillStyle=`rgba(220,249,244,${.24+sheen*.5})`;ctx.fillRect(p[0].x,p[0].y,1.2,1.2);}
  }
  // Slow orbital markers establish depth without a distracting constant starfield.
  for(let i=0;i<46;i++){
    const a=i*2.399963+time*.014, r=scale*(1.65+(i%7)*.085);
    const x=cx+Math.cos(a)*r, y=cy+Math.sin(a)*r*.74;
    ctx.fillStyle=`rgba(190,218,229,${.15+(i%5)*.045})`;ctx.beginPath();ctx.arc(x,y,i%7===0?1.4:.65,0,TAU);ctx.fill();
  }
}

function stroke(ctx, points, color, width=1){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function dot(ctx,x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=color;ctx.fill();}

function drawProject(ctx,w,h,time,pointer,kind){
  const unit=Math.min(w,h), cx=w/2+pointer.x*12, cy=h/2+pointer.y*10;
  const palette={data:'158,246,207',agent:'168,174,255',voice:'247,196,167',enterprise:'170,212,240',algorithm:'170,229,225',commerce:'225,231,169'};
  const color=palette[kind]||palette.data;
  const glow=ctx.createRadialGradient(cx,cy,10,cx,cy,unit*.5);glow.addColorStop(0,`rgba(${color},.12)`);glow.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  if(kind==='data'){
    const lanes=9;
    for(let i=0;i<lanes;i++){
      const startY=cy+(i-4)*unit*.066;
      const points=[];
      for(let j=0;j<=64;j++){const x=j/64, y=startY+Math.sin(x*Math.PI)*Math.sin(i*.8+time*.2)*unit*.14;points.push([unit*.08+x*(w-unit*.16),y]);}
      stroke(ctx,points,`rgba(${color},.18)`,1);
      const pos=(time*.09+i*.117)%1, at=Math.floor(pos*63);
      stroke(ctx,points.slice(Math.max(0,at-8),at+1),`rgba(${color},.85)`,2);
      dot(ctx,...points[at],2.8,`rgb(${color})`);
    }
    for(const x of [w*.15,w*.5,w*.85]){ctx.strokeStyle=`rgba(${color},.23)`;ctx.strokeRect(x-22,cy-26,44,52);dot(ctx,x,cy,5,`rgb(${color})`);}
  }else if(kind==='agent'){
    const nodes=Array.from({length:7},(_,i)=>{const a=i/7*TAU+time*.045;return[cx+Math.cos(a)*unit*.31,cy+Math.sin(a)*unit*.27];});
    nodes.forEach((p,i)=>{
      stroke(ctx,[[cx,cy],p],`rgba(${color},.25)`);
      stroke(ctx,[p,nodes[(i+2)%7]],`rgba(${color},.10)`);
      const k=(time*.2+i*.14)%1;dot(ctx,cx+(p[0]-cx)*k,cy+(p[1]-cy)*k,2.5,`rgba(${color},.85)`);
      dot(ctx,...p,17,`rgba(${color},.055)`);ctx.strokeStyle=`rgba(${color},.6)`;ctx.strokeRect(p[0]-12,p[1]-12,24,24);dot(ctx,...p,3,`rgb(${color})`);
    });
    for(let r=24;r<70;r+=16){ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.strokeStyle=`rgba(${color},${r===24?.85:.2})`;ctx.lineWidth=r===24?2:1;ctx.stroke();}
    dot(ctx,cx,cy,8,`rgb(${color})`);
  }else if(kind==='voice'){
    for(let layer=0;layer<4;layer++){
      const points=[];
      for(let i=0;i<160;i++){
        const t=i/159, envelope=Math.pow(Math.sin(t*Math.PI),1.4), wave=Math.sin(t*TAU*3-time*1.5+layer*.48)*Math.cos(t*TAU*.8+time*.2);
        points.push([w*.06+t*w*.88,cy+wave*envelope*unit*(.22+layer*.017)]);
      }
      stroke(ctx,points,`rgba(${color},${.7-layer*.15})`,layer===0?2:1);
    }
    for(let i=0;i<44;i++){const x=w*.12+i/43*w*.76, value=4+Math.abs(Math.sin(i*.7-time*2))*Math.sin(i/43*Math.PI)*unit*.065;stroke(ctx,[[x,cy+unit*.32-value],[x,cy+unit*.32+value]],`rgba(${color},.45)`,2);}
  }else if(kind==='enterprise'){
    for(let layer=0;layer<4;layer++){
      const x=cx-unit*.26+layer*unit*.055, y=cy-unit*.16-layer*unit*.045;
      const p=[[x,y],[x+unit*.43,y-unit*.08],[x+unit*.52,y+unit*.23],[x+unit*.09,y+unit*.31],[x,y]];
      ctx.beginPath();p.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.fillStyle=`rgba(25,41,56,${.5+layer*.1})`;ctx.fill();stroke(ctx,p,`rgba(${color},${.18+layer*.13})`,1.5);
      for(let row=0;row<4;row++){const yy=y+unit*(.045+row*.053);stroke(ctx,[[x+unit*.09,yy],[x+unit*.34,yy-unit*.045]],`rgba(${color},.27)`,2);}
      dot(ctx,x+unit*.055,y+unit*.03,3,`rgb(${color})`);
    }
  }else if(kind==='algorithm'){
    const points=[];
    for(let z=0;z<34;z++)for(let x=0;x<34;x++){
      const xx=(x/33-.5)*2, zz=(z/33-.5)*2;
      const yy=Math.sin(xx*3+time*.4)*Math.cos(zz*3-time*.2)*.24;
      const [rx,ry,rz]=rotate(xx,yy,zz,.74+pointer.y*.09,.35+pointer.x*.1);
      points.push({x:cx+rx*unit*.34,y:cy+ry*unit*.34,z:rz});
    }
    points.sort((a,b)=>a.z-b.z).forEach(p=>dot(ctx,p.x,p.y,1.2+(p.z+1)*.6,`rgba(${color},${clamp(.32+p.z*.25,.1,.8)})`));
  }else{
    for(let i=0;i<6;i++){
      const a=i/6*TAU+time*.065, x=cx+Math.cos(a)*unit*.27, y=cy+Math.sin(a)*unit*.22;
      stroke(ctx,[[cx,cy],[x,y]],`rgba(${color},.18)`);
      const s=unit*.055, q=[[x-s,y-s],[x+s,y-s],[x+s,y+s],[x-s,y+s],[x-s,y-s]];stroke(ctx,q,`rgba(${color},.8)`,1.5);
      stroke(ctx,[[x-s,y-s],[x-s+s*.6,y-s-s*.6],[x+s+s*.6,y-s-s*.6],[x+s+s*.6,y+s-s*.6],[x+s,y+s]],`rgba(${color},.5)`);
      stroke(ctx,[[x+s,y-s],[x+s+s*.6,y-s-s*.6]],`rgba(${color},.5)`);
    }
    dot(ctx,cx,cy,13,`rgba(${color},.9)`);
  }
}

export function mountFields(root=document){
  const disposers=[];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  root.querySelectorAll('canvas[data-field]').forEach(original=>{
    let canvas=original, renderer=null;
    if(canvas.dataset.field==='sculpture'){
      try{renderer=createSculptureRenderer(canvas);}catch{
        // A failed shader may have locked the canvas to WebGL. Replace it before
        // selecting the 2D fallback; keep all presentation attributes intact.
        canvas=original.cloneNode(false);original.replaceWith(canvas);
      }
    }
    let ctx=renderer?null:canvas.getContext('2d');if(!renderer&&!ctx)return;
    canvas.dataset.renderer=renderer?'webgl':'canvas2d';
    const host=canvas.closest('.hero')||canvas.parentElement;
    let w=1,h=1,frame=0,visible=false,last=0,elapsed=0,lastClock=0;
    const target={x:0,y:0},pointer={x:0,y:0};
    const resize=()=>{const rect=canvas.getBoundingClientRect();w=rect.width;h=rect.height;const dpr=Math.min(devicePixelRatio||1,1.7);if(renderer)renderer.resize(w,h,dpr);else{canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}};
    const draw=(clock)=>{
      frame=0;if(!visible||document.hidden)return;
      const delta=lastClock?Math.min(.06,(clock-lastClock)/1000):0;lastClock=clock;
      if(!reduced.matches)elapsed+=delta;
      if(clock-last>31||reduced.matches){
        last=clock;pointer.x+=(target.x-pointer.x)*.09;pointer.y+=(target.y-pointer.y)*.09;
        ctx?.clearRect(0,0,w,h);
        const time=reduced.matches?7:elapsed;
        if(canvas.dataset.field==='sculpture'){
          const stage=canvas.closest('.hero-stage');const progress=stage?clamp(-stage.getBoundingClientRect().top/Math.max(1,stage.offsetHeight-innerHeight),0,1):0;
          if(renderer)renderer.draw({time,pointer,scroll:progress,width:w,height:h});
          else drawSculpture(ctx,w,h,time,pointer,progress);
        }else drawProject(ctx,w,h,time,pointer,canvas.dataset.field);
      }
      if(!reduced.matches)frame=requestAnimationFrame(draw);
    };
    const schedule=()=>{cancelAnimationFrame(frame);lastClock=0;if(visible&&!document.hidden)frame=requestAnimationFrame(draw);};
    const move=e=>{if(!fine.matches||reduced.matches)return;const r=host.getBoundingClientRect();target.x=clamp((e.clientX-r.left)/r.width*2-1,-1,1);target.y=clamp((e.clientY-r.top)/r.height*2-1,-1,1);};
    const leave=()=>{target.x=target.y=0;};
    host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',leave);
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{rootMargin:'100px'});observer.observe(canvas);
    const resizer=new ResizeObserver(()=>{resize();schedule();});resizer.observe(canvas);
    const contextLost=e=>{
      e.preventDefault();
      canvas.removeEventListener('webglcontextlost',contextLost);
      observer.unobserve(canvas);resizer.unobserve(canvas);renderer?.destroy();renderer=null;
      const replacement=canvas.cloneNode(false);canvas.replaceWith(replacement);canvas=replacement;
      ctx=canvas.getContext('2d');canvas.dataset.renderer='canvas2d';
      if(!ctx){visible=false;cancelAnimationFrame(frame);return;}
      resize();observer.observe(canvas);resizer.observe(canvas);schedule();
    };
    if(renderer)canvas.addEventListener('webglcontextlost',contextLost);
    document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);resize();
    disposers.push(()=>{cancelAnimationFrame(frame);canvas.removeEventListener('webglcontextlost',contextLost);renderer?.destroy();observer.disconnect();resizer.disconnect();host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',schedule);reduced.removeEventListener('change',schedule);});
  });
  return()=>disposers.forEach(fn=>fn());
}
