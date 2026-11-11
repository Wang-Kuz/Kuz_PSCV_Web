// Fourteen authored architecture diagrams and fourteen distinct business scenes.
// All are editable-label illustrations, not customer screenshots or measured data.
const NS='http://www.w3.org/2000/svg';
const colors={rag:'#9cdec9',avatar:'#dfb4e9',oa:'#a7c9ff',qa:'#c5b5ff',local:'#90cddd',erp:'#e2c28e',archive:'#b6cf9a',ai:'#95b8f6',workflow:'#d3b3f5',harness:'#e6af8c',algorithm:'#8ed8cf',assistant:'#e4bed5',screen:'#81c9f3',platform:'#a4b6e8'};
const svgNode=(tag,attrs={},value)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(value!==undefined)n.textContent=value;return n;};
export function renderEngineeringArt(id,kind,copy){
 if(!colors[id]||!['concept','business'].includes(kind))throw Error('Unknown engineering illustration');
 const uid=`eng-${id}-${kind}`,accent=colors[id],labels=copy(`eng_${id}_${kind==='concept'?'diagram':'scene'}`).split('|');
 const svg=svgNode('svg',{viewBox:'0 0 720 480',class:`engineering-art art-${id} art-${kind}`,role:'img','aria-label':copy(`eng_${id}_title`)+' — '+copy(kind==='concept'?'engConcept':'engBusiness'),'data-art':id+'-'+kind});
 svg.style.setProperty('--art-accent',accent);
 svg.append(svgNode('desc',{},labels.join(' → ')));
 const defs=svgNode('defs'),gradient=svgNode('radialGradient',{id:uid+'-glow'});
 gradient.append(svgNode('stop',{offset:0,'stop-color':accent,'stop-opacity':.16}),svgNode('stop',{offset:1,'stop-color':accent,'stop-opacity':0}));defs.append(gradient);svg.append(defs);
 const add=(tag,a={},v)=>{const n=svgNode(tag,a,v);svg.append(n);return n;};
 const box=(x,y,w,h,active=false,r=12)=>add('rect',{x,y,width:w,height:h,rx:r,fill:active?'#203240':'#111c29',stroke:accent,'stroke-opacity':active?.7:.23,'stroke-width':1.2});
 const line=(x1,y1,x2,y2,active=false)=>add('path',{d:`M${x1} ${y1}L${x2} ${y2}`,fill:'none',stroke:accent,'stroke-opacity':active?.8:.28,'stroke-width':active?2:1.2,class:active?'art-flow':''});
 const path=(d,active=false)=>add('path',{d,fill:'none',stroke:accent,'stroke-opacity':active?.85:.3,'stroke-width':active?2:1.2,class:active?'art-flow':''});
 const dot=(x,y,r=4,active=true)=>add('circle',{cx:x,cy:y,r,fill:active?accent:'#111c29',stroke:accent,'stroke-opacity':.6,class:active?'art-signal':''});
 const text=(x,y,value,size=16,anchor='start',color='#d5e1ec',width=0)=>{
  const t=add('text',{x,y,'font-size':size,'text-anchor':anchor,fill:color,'font-family':'Inter, Segoe UI, Microsoft YaHei, sans-serif'});
  // Wrap custom labels, including English, without inserting markup.
  const limit=width||640,parts=String(value??'').split(/(\s+)/);let rows=[''];
  const measure=s=>Array.from(s).reduce((sum,c)=>sum+(/[\u0000-\u00ff]/.test(c)?.54:1),0)*size;
  for(const part of parts){if(measure(rows.at(-1)+part)>limit&&rows.at(-1))rows.push('');for(const ch of part){if(measure(rows.at(-1)+ch)>limit)rows.push('');rows[rows.length-1]+=ch;}}
  rows.slice(0,3).forEach((row,i)=>t.append(svgNode('tspan',{x,dy:i?size*1.25:0},row.trim()+(i===2&&rows.length>3?'…':''))));return t;
 };
 const label=(i)=>labels[i]||'';
 const caption=(x,y,i,w=170)=>text(x,y,label(i),17,'middle','#d5e1ec',w);
 const node=(x,y,w,h,i,active=false)=>{box(x,y,w,h,active);const t=caption(x+w/2,y+h/2+5,i,w-18);t.setAttribute('y',y+h/2+5-(t.childNodes.length-1)*10.625);};
 const chip=(x,y,w,i)=>{box(x,y,w,48,false,18);const t=text(x+w/2,y+29,label(i),13,'middle',accent,w-16);if(t.childNodes.length>1)t.setAttribute('y',y+20);};
 const grid=(x,y,cols,rows,cell=16,hot=false)=>{for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)add('rect',{x:x+c*cell,y:y+r*cell,width:cell-4,height:cell-4,rx:2,fill:accent,opacity:hot?(.13+((r*3+c*7)%9)*.085):.12});};
 const doc=(x,y,w=64,h=82)=>{box(x,y,w,h);path(`M${x+w-19} ${y}v20h19`);if(w<150)for(let i=0;i<3;i++)line(x+12,y+32+i*13,x+w-12-(i===2?12:0),y+32+i*13);};
 const ring=(x,y,r)=>add('circle',{cx:x,cy:y,r,fill:'none',stroke:accent,'stroke-opacity':.32});
 const face=(x,y,s=1)=>{add('ellipse',{cx:x,cy:y,rx:45*s,ry:58*s,fill:'#243340',stroke:accent,'stroke-opacity':.75});path(`M${x-65*s} ${y+114*s}Q${x-65*s} ${y+58*s} ${x} ${y+65*s}Q${x+65*s} ${y+58*s} ${x+65*s} ${y+114*s}`);line(x-26*s,y-6*s,x-10*s,y-8*s);line(x+10*s,y-8*s,x+26*s,y-6*s);path(`M${x-14*s} ${y+28*s}Q${x} ${y+36*s} ${x+14*s} ${y+28*s}`);};
 const wave=(x,y,w,h)=>{for(let i=0;i<25;i++){const size=(.15+Math.abs(Math.sin(i*1.7)*Math.cos(i*.4)))*h;line(x+i*w/25,y-size/2,x+i*w/25,y+size/2,i%3===0);}};
 const row=(x,y,w,left,right)=>{box(x,y,w,44,false,6);text(x+14,y+28,left,14,'start','#cbd7e5',w*.58);text(x+w-14,y+28,right,13,'end',accent,w*.32);};
 const title=()=>{dot(35,32,4);text(52,38,copy(`eng_${id}_title`),18,'start','#e2eaf4',580);line(28,57,692,57);};
 add('ellipse',{cx:360,cy:230,rx:350,ry:230,fill:`url(#${uid}-glow)`});
 if(kind==='concept'){
  switch(id){
   case 'rag':
    doc(34,164);doc(47,151);doc(60,138);caption(85,280,0,120);
    line(128,190,205,190,true);grid(215,155,4,4,20,true);caption(252,280,1,125);
    line(298,190,355,190,true);ring(402,190,53);for(let i=0;i<24;i++)dot(402+Math.cos(i*2.4)*(18+i%5*7),190+Math.sin(i*2.4)*(18+i%5*7),2.3,i%4===0);caption(402,280,2,135);
    path('M460 190H505L535 220L565 190H612',true);caption(535,280,3,120);node(596,146,96,88,4,true);
    path('M88 320V365H644V250',true);text(365,401,label(5),15,'middle',accent,600);break;
   case 'avatar':
    ring(350,208,134);ring(350,208,112);face(350,177,1.1);for(let i=0;i<8;i++){line(306+i*13,135,306+i*13,220);line(303,137+i*12,397,137+i*12);}
    wave(38,180,130,80);caption(102,275,0,160);line(178,210,218,210,true);node(25,340,155,58,1);path('M180 369H245V300',true);
    wave(535,180,140,70);caption(608,275,3,170);line(485,210,528,210,true);node(535,340,158,58,4);caption(350,407,2,210);break;
   case 'oa':
    for(let i=0;i<3;i++){box(30,75+i*112,660,94,false,8);text(44,102+i*112,label(i),14,'start',accent,115);}
    node(177,93,142,56,3,true);node(365,204,140,56,4);node(536,316,130,56,5,true);node(177,316,142,56,6);
    path('M319 121H343V232H365',true);path('M505 232H524V344H536',true);path('M365 232H343V344H319');path('M247 316V149',true);break;
   case 'qa':
    node(40,174,150,76,0,true);add('path',{d:'M287 145L350 212L287 279L224 212Z',fill:'#213147',stroke:accent});caption(287,217,1,100);line(190,212,224,212,true);
    [[66,2],[185,3],[304,4]].forEach(([y,i])=>{node(400,y,142,60,i);path(`M350 212H374V${y+30}H400`,i!==4);path(`M542 ${y+30}H574V212H602`,i===3);});node(602,174,90,76,5,true);chip(214,390,290,6);break;
   case 'local':
    box(150,68,420,340,false,24);text(360,101,label(0),17,'middle',accent,370);
    for(let i=0;i<3;i++){box(187,131+i*72,346,57,true,8);grid(210,145+i*72,6,2,15,true);dot(500,159+i*72,4);line(328,158+i*72,469,158+i*72);}
    node(23,182,104,76,1);line(127,220,187,220,true);node(593,182,104,76,2,true);line(533,220,593,220,true);caption(360,385,3,310);chip(220,426,280,4);break;
   case 'erp':
    ring(360,234,145);ring(360,234,77);caption(360,232,0,130);for(let i=0;i<6;i++){const a=i*Math.PI/3-Math.PI/2,x=360+Math.cos(a)*215,y=234+Math.sin(a)*167;node(x-64,y-25,128,50,i+1,i%2===0);line(360+Math.cos(a)*81,234+Math.sin(a)*81,x-Math.cos(a)*65,y-Math.sin(a)*28,true);}break;
   case 'archive':
    doc(40,145);doc(65,170);doc(89,195);caption(95,326,0,130);line(160,229,215,229,true);box(219,124,158,216);grid(242,150,6,7,18);line(229,205,366,205,true);caption(298,373,1,170);
    path('M377 229H416V128H460M416 229H460M416 229V330H460',true);[100,201,302].forEach((y,i)=>node(460,y,219,56,i+2,i===1));break;
   case 'ai':
    for(let i=0;i<4;i++){const y=91+i*77;add('path',{d:`M117 ${y+24}L360 ${y-29}L603 ${y+24}L360 ${y+77}Z`,fill:['#172733','#1c3040','#253c4e','#304b5e'][i],stroke:accent,'stroke-opacity':.5});caption(360,y+29,i,275);}
    path('M621 160H662V385H602',true);path('M99 370H58V130H117',true);text(665,435,label(4),14,'end',accent,340);break;
   case 'workflow':
    node(28,201,120,66,0,true);node(193,201,122,66,1);line(148,234,193,234,true);
    add('path',{d:'M374 195L414 234L374 273L334 234Z',fill:'#273045',stroke:accent});text(374,240,'?',22,'middle');line(315,234,334,234,true);
    node(457,91,144,58,2,true);node(457,319,144,58,3);path('M414 234H434V120H457',true);path('M414 234H434V348H457');path('M601 120H650V203M601 348H650V267',true);node(606,203,94,64,4,true);chip(210,407,285,5);break;
   case 'harness':
    box(96,73,528,336,false,22);text(360,104,label(0),17,'middle',accent);box(159,131,402,225,false,18);text(360,159,label(1),16,'middle');
    node(267,197,186,64,2,true);node(33,193,153,58,3);node(534,193,153,58,4);line(186,222,267,222,true);line(453,222,534,222,true);path('M360 261V319H218V191H267',true);caption(360,388,5,420);chip(213,428,294,6);break;
   case 'algorithm':
    for(let i=0;i<3;i++)grid(35+i*13,109+i*12,6,6,13,i===2);caption(94,264,0,130);line(149,177,200,177,true);grid(208,137,4,4,19,true);caption(245,264,1,135);
    for(let i=0;i<5;i++)box(326+i*18,118+i*13,14,110-i*12,i%2===0,4);line(290,177,326,177,true);caption(371,264,2,135);
    grid(454,111,7,7,17,true);line(422,177,454,177,true);caption(515,264,3,130);node(602,143,93,68,4,true);line(579,177,602,177,true);
    path('M92 314C210 398 495 398 650 314',true);text(360,420,label(5),16,'middle',accent,620);break;
   case 'assistant':
    ring(360,235,150);ring(360,235,96);face(360,215,.65);caption(360,345,0,210);
    [[100,107],[540,107],[100,330],[540,330]].forEach(([x,y],i)=>{node(x-67,y-28,134,56,i+1,i===1);path(`M${x+(x<360?67:-67)} ${y}Q${x<360?250:470} ${y} ${360+Math.sign(x-360)*80} ${235+Math.sign(y-235)*45}`,true);});
    add('circle',{cx:360,cy:70,r:28,fill:'#152334',stroke:accent});path('M360 52V70L374 78',true);text(360,438,label(5),15,'middle',accent,620);break;
   case 'screen':
    add('path',{d:'M65 319L284 204L650 290L420 418Z',fill:'#142635',stroke:accent,'stroke-opacity':.4});
    [[180,270,65],[265,230,105],[340,280,135],[435,270,75],[520,295,110]].forEach(([x,y,h])=>{add('path',{d:`M${x} ${y}v-${h}l31 -15l29 14v${h}l-29 15Z`,fill:'#1a3549',stroke:accent,'stroke-opacity':.6});path(`M${x+31} ${y-15}v-${h}M${x} ${y-h}l31 15l29 -16`);for(let j=0;j<3;j++)dot(x+13,y-h+22+j*14,2);});
    [[120,100,0],[360,62,1],[596,120,2]].forEach(([x,y,i])=>{ring(x,y,26);dot(x,y,6);caption(x,y-37,i,170);path(`M${x} ${y+27}Q${x} 260 360 300`,true);});caption(360,456,3,610);break;
   case 'platform':
    [82,174,266].forEach((y,i)=>{node(24,y,120,48,i);path(`M144 ${y+24}H185V223H220`,i!==1);});
    for(let i=0;i<3;i++){const x=230+i*140,y=153-i*21;box(x,y,108,167,true,5);add('ellipse',{cx:x+54,cy:y,rx:54,ry:19,fill:'#2b3b52',stroke:accent});add('path',{d:`M${x} ${y+130}a54 19 0 0 0 108 0`,fill:'none',stroke:accent,'stroke-opacity':.4});caption(x+54,y+80,i+3,96);if(i<2)line(x+108,y+83,x+140,y+62,true);}
    path('M618 194H662V363H284',true);caption(415,408,6,500);break;
  }
 }else{
  title();
  switch(id){
   case 'rag':
    box(26,82,306,361);text(46,114,label(0),16);box(44,134,270,61,true);text(59,160,label(1),15,'start','#e0eced',238);text(46,234,label(2),17);[260,286,312].forEach((y,i)=>line(46,y,304-i*34,y));chip(45,375,114,3);
    doc(378,101,288,315);text(402,156,label(4),19,'start','#e0eced',233);for(let i=0;i<6;i++){if(i===2||i===3)add('rect',{x:397,y:185+i*27,width:244,height:21,fill:accent,opacity:.15});line(402,196+i*27,634-(i%2)*28,196+i*27);}path('M159 392H352V266H397',true);break;
   case 'avatar':
    box(27,83,432,319);face(243,186,1.3);for(const [x,y,dx,dy]of [[50,108,1,1],[436,108,-1,1],[50,373,1,-1],[436,373,-1,-1]])path(`M${x} ${y+dy*27}V${y}H${x+dx*27}`,true);
    box(76,344,333,38,true);text(242,370,label(0),15,'middle','#e4dbea',310);wave(44,433,400,35);
    text(487,106,label(1),16);[126,202,278].forEach((y,i)=>{box(484,y,207,59,i===0);text(498,y+26,label(i+2),14,'start','#d5dce9',179);line(500,y+43,651,y+43);});chip(488,385,196,5);break;
   case 'oa':
    text(31,105,label(0),18);[130,200,270,340].forEach((y,i)=>{box(28,y,241,56,i===0);dot(48,y+28,4);text(66,y+34,label(i%3+1),15,'start','#cfdeee',185);});
    box(292,82,398,363);text(315,115,label(4),19);line(315,136,664,136);[169,215,261].forEach((y,i)=>{text(315,y,label(i+1),14);line(431,y,657,y);});line(332,305,632,305,true);[332,432,532,632].forEach((x,i)=>{dot(x,305,8,i<3);text(x,339,String(i+1).padStart(2,'0'),13,'middle',accent);});chip(485,377,176,5);break;
   case 'qa':
    box(28,83,430,362);box(141,105,293,64,true);text(158,132,label(0),16,'start','#e3e0f3',260);dot(58,207,16);box(88,187,346,108);text(107,215,label(1),17,'start','#dfdef4',309);text(107,254,label(2),14,'start',accent,309);[107,215].forEach((x,i)=>chip(x,319,96,i+3));
    text(486,112,label(5),17);[148,232,316].forEach((y,i)=>{ring(505,y,12);text(531,y+5,label(i+6),14,'start','#d0cfe0',155);if(i<2)line(505,y+12,505,y+70,true);});break;
   case 'local':
    [32,259,486].forEach((x,i)=>{box(x,88,202,131,i===0);text(x+16,114,`GPU / 0${i+1}`,16,'start',accent);grid(x+17,132,8,3,20,true);});
    box(32,242,430,199);text(49,269,label(0),16);[0,1,2,3].forEach(i=>text(49,304+i*30,`${['›','·','›','✓'][i]} ${label(i+1)}`,14,'start',i===3?accent:'#a6bbc9',390));
    text(488,266,label(5),17);[293,344,395].forEach((y,i)=>row(486,y,202,label(i+6),'●'));break;
   case 'erp':
    text(32,104,label(0),18);for(let r=0;r<3;r++)for(let c=0;c<4;c++){box(32+c*65,123+r*68,54,53,r===1&&c===2,5);add('path',{d:`M${43+c*65} ${143+r*68}l15 -8l16 8v16l-16 8l-15 -8Z`,fill:'none',stroke:accent,'stroke-opacity':.6});}
    text(329,104,label(1),18);[127,184,241].forEach((y,i)=>row(325,y,363,label(i+2),`PO · 0${i+1}`));line(32,358,688,358,true);[75,260,445,645].forEach((x,i)=>{dot(x,358,9);caption(x,404,i+5,140);});break;
   case 'archive':
    box(26,83,180,361);text(43,111,label(0),16);for(let i=0;i<5;i++){path(`M48 ${144+i*49}h16v14h-16Z`);text(76,155+i*49,label(i%3+1),13,'start','#becbb7',118);}
    doc(232,101,247,319);text(256,153,label(4),18,'start','#d8e1cd',199);for(let i=0;i<7;i++){if(i%3===0)box(253,174+i*27,196,22,false,3);line(261,186+i*27,437-(i%2)*38,186+i*27);}
    text(505,117,'OCR',24,'start',accent);[167,238,309,380].forEach((y,i)=>{text(504,y,label(i+5),14,'start','#c6d5bc',185);line(504,y+17,682,y+17);});break;
   case 'ai':
    text(35,104,label(0),17);for(let i=0;i<3;i++){doc(36+i*17,136+i*20,104,143);}path('M175 235H230',true);
    box(237,96,223,325,true);text(257,128,label(1),17,'start','#d8e3f6',183);[160,223,286].forEach((y,i)=>row(251,y,194,label(i+2),'✓'));
    path('M460 235H511',true);text(529,114,label(5),16,'start','#d1def6',165);[146,229,312].forEach((y,i)=>{box(525,y,164,62,i===1);text(538,y+30,label(i+6),14,'start','#cfdbeb',139);});break;
   case 'workflow':
    box(28,83,135,359);text(44,112,label(6),16,'start','#ddceed',105);[148,218,288,358].forEach((y,i)=>{box(52,y,87,48,i===2,6);text(96,y+31,['+','◇','AI','↳'][i],21,'middle',accent);});
    [96,181,266,351].forEach((y,i)=>{node(199,y,193,57,[0,1,2,4][i],i===2);if(i<3)line(295,y+57,295,y+85,true);});
    box(431,83,261,359,true);text(452,118,label(7),19,'start','#ded1ef',219);text(452,159,label(2),16);line(452,180,670,180);[211,283,355].forEach((y,i)=>{text(452,y,label(i+8),15,'start','#d1c5e0',210);box(452,y+14,219,32,false,5);line(466,y+30,609-i*26,y+30);});break;
   case 'harness':
    text(31,104,label(0),17);[136,185,234].forEach((y,i)=>row(28,y,327,label(i+1),i===1?'↺':'✓'));
    text(386,104,label(4),17);for(let i=0;i<5;i++){text(384,144+i*35,`0${i+1}`,12,'start',accent);box(424+i*13,129+i*35,231-i*34,19,i===2,4);}
    box(29,326,659,112,true);text(48,356,label(5),17);chip(48,379,268,6);chip(335,379,331,7);break;
   case 'algorithm':
    text(33,104,label(0),17);box(27,122,373,196);for(let i=0;i<4;i++)line(47,151+i*40,378,151+i*40);path('M49 149C89 151 92 236 149 247S230 289 378 292',true);path('M49 161C113 168 107 217 173 247S257 264 378 279');
    text(434,105,label(1),16);grid(435,127,7,7,26,true);text(40,363,label(2),17);[392,437].forEach((y,i)=>{text(42,y,`RUN / 0${i+1}`,14,'start',accent);line(162,y-5,389,y-5,i===0);});text(438,363,label(3),16);grid(441,385,10,3,21,true);break;
   case 'assistant':
    ring(130,175,76);ring(130,175,64);path('M130 130V175L165 196',true);text(130,284,label(0),17,'middle','#edd7e4',190);chip(38,333,181,1);
    box(249,83,441,151,true);text(272,116,label(2),19);text(272,155,label(3),16,'start','#d9c9d3',388);line(274,195,657,195);
    line(273,274,273,421,true);[277,338,399].forEach((y,i)=>{dot(273,y,6);text(295,y+5,label(i+4),16,'start','#e0ccd9',365);});break;
   case 'screen':
    add('path',{d:'M211 140L332 92L382 147L461 125L511 237L457 343L346 373L257 308L222 225Z',fill:'#112c3c',stroke:accent,'stroke-opacity':.55});
    for(let i=0;i<7;i++){const x=275+(i%3)*74,y=174+Math.floor(i/3)*67;ring(x,y,14);dot(x,y,4);path(`M${x} ${y}Q360 235 430 285`,true);}
    [46,565].forEach((x,j)=>[124,245,366].forEach((y,i)=>{ring(x+52,y,38);text(x+52,y+6,['◈','◉','◇'][i],27,'middle',accent);caption(x+52,y+63,i+j*3,115);}));
    text(360,432,label(6),16,'middle',accent,350);break;
   case 'platform':
    text(31,105,label(0),17);[133,196,259,322].forEach((y,i)=>row(28,y,211,label(i+1),'▤'));
    text(270,105,label(5),17);node(268,134,141,52,6);node(524,134,163,52,7,true);path('M409 160H524',true);node(391,230,168,52,8);path('M338 186V256H391M606 186V256H559',true);
    box(266,323,422,113);text(282,350,label(9),16);for(let i=0;i<3;i++){grid(283+i*130,369,6,2,17,true);}break;
  }
 }
 return svg;
}

export function mountEngineeringArt(){
 const visible=new Set(),update=()=>visible.forEach(svg=>svg.classList.toggle('art-visible',!document.hidden));
 const observer=new IntersectionObserver(entries=>{entries.forEach(({target,isIntersecting})=>{if(isIntersecting)visible.add(target);else{visible.delete(target);target.classList.remove('art-visible');}});update();},{threshold:.05});
 document.querySelectorAll('.engineering-art').forEach(svg=>observer.observe(svg));document.addEventListener('visibilitychange',update);
 return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update);};
}
