'use strict';
window.createHeroDrawing = async function(hero,reduced){
 const root='./assets/images/hero/auto-drawing/';
 const response=await fetch(root+'character-layout.json?v=unit-ridge-alignment-1');if(!response.ok)throw Error('Drawing layout unavailable');const data=await response.json();
 const load=async file=>{const image=new Image();image.src=root+file;await image.decode();return image;};
 const stage=document.createElement('div');stage.className='hero-drawing';stage.hidden=true;stage.setAttribute('aria-hidden','true');
 const surface=document.createElement('canvas');surface.className='drawing-surface';stage.append(surface);hero.append(stage);const ctx=surface.getContext('2d');
 const handReady=load('hand-slim-natural.png');
 const notes=[...hero.querySelectorAll('.hero-html-note')];
 const handwritingReady=document.fonts.load('34px "Nanum Pen Script"',notes.map(note=>note.textContent).join('')).catch(()=>[]);
 const captions=notes.map(note=>{
  let row=0;
  const glyphs=[];
  for(const node of [...note.childNodes]){
   if(node.nodeName==='BR'){row++;continue;}
   if(node.nodeType!==Node.TEXT_NODE)continue;
   const fragment=document.createDocumentFragment();
   for(const char of node.textContent){
    if(!char.trim()){fragment.append(char);continue;}
    const span=document.createElement('span');
    span.className='hero-note-glyph';
    span.textContent=char;
    fragment.append(span);
    glyphs.push({span,row,char});
   }
   node.replaceWith(fragment);
  }
  return glyphs;
 });
 async function inkLayer(spec,parallel=false){
  const [image,map]=await Promise.all([load(spec.file),load(spec.map+'?v=unit-ridge-alignment-1')]),canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);const original=context.getImageData(0,0,canvas.width,canvas.height),ink=context.createImageData(canvas.width,canvas.height);ink.data.set(original.data);
  context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(map,0,0);const mb=context.getImageData(0,0,canvas.width,canvas.height).data,ranks=new Uint16Array(canvas.width*canvas.height),counts=new Uint32Array(65536);let total=0;
  for(let i=0;i<ranks.length;i++){ranks[i]=mb[i*4]*256+mb[i*4+1];ink.data[i*4+3]=0;if(original.data[i*4+3]&&ranks[i]){counts[ranks[i]]++;total++;}}
  if(parallel){
   // The guide map stores each arrow in its own third of the rank range.
   counts.fill(0);
   for(let i=0;i<ranks.length;i++){
    if(!original.data[i*4+3]||!ranks[i])continue;
    const combined=(ranks[i]-1)*spec.paths.length;
    const boundary=Math.round(combined/65533);
    let arrow=Math.min(spec.paths.length-1,Math.floor(combined/65533));
    // Quantization can give an arrowhead and the next tail the same rank.
    if(boundary>0&&boundary<spec.paths.length&&Math.abs(combined-boundary*65533)<=spec.paths.length/2){
     const x=i%canvas.width,y=Math.floor(i/canvas.width);
     const [endX,endY]=spec.paths[boundary-1].at(-1);
     const [startX,startY]=spec.paths[boundary][0];
     arrow=Math.hypot(x-endX,y-endY)<Math.hypot(x-startX,y-startY)?boundary-1:boundary;
    }
    ranks[i]=1+Math.max(0,Math.min(65533,combined-arrow*65533));
    counts[ranks[i]]++;
   }
  }
  const offsets=new Uint32Array(65536);let sum=0;for(let i=0;i<65536;i++){offsets[i]=sum;sum+=counts[i];}const cursor=offsets.slice(),order=new Uint32Array(total);
  for(let i=0;i<ranks.length;i++)if(original.data[i*4+3]&&ranks[i])order[cursor[ranks[i]]++]=i;
  context.clearRect(0,0,canvas.width,canvas.height);return {...spec,canvas,context,original,ink,ranks,order,revealed:0};
 }
 const [curves,glow,hand]=await Promise.all([inkLayer(data.guides,true),inkLayer(data.glow),handReady,handwritingReady]);
 const transform=(spec,p)=>{const angle=spec.angle*Math.PI/180,c=Math.cos(angle)*spec.scale,s=Math.sin(angle)*spec.scale;return [spec.offset[0]+p[0]*c-p[1]*s,spec.offset[1]+p[0]*s+p[1]*c];};
 const path=points=>{const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));return {points,lengths,length:lengths.at(-1)};};
 const point=(p,f)=>{const distance=p.length*Math.max(0,Math.min(1,f));let i=1;while(i<p.lengths.length-1&&p.lengths[i]<distance)i++;const a=p.points[i-1],b=p.points[i],t=(distance-p.lengths[i-1])/Math.max(.001,p.lengths[i]-p.lengths[i-1]);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];};
 const smooth=f=>f*f*(3-2*f);
 const previewDrawingOffsetY=-29;
 let segments=[],letters=[],connectors=[],guideStep,glowStep,duration,time,last;
 function move(to,duration,phase='travel',curved=false){
  const from=last.slice(),points=curved?Array.from({length:25},(_,i)=>{const t=i/24,u=1-t;return [u*u*from[0]+2*u*t*(from[0]+to[0])/2+t*t*to[0],u*u*from[1]+2*u*t*(Math.min(from[1],to[1])-35)+t*t*to[1]];}):[from,to];
  segments.push({kind:'move',start:time,end:time+duration,path:path(points),phase});time+=duration;last=to;
 }
 function caption(glyphs,phase,connectorPoints){
  const origin=stage.getBoundingClientRect();
  const scale=origin.width/1980;
  let previousRow=-1;
  for(const glyph of glyphs){
   const box=glyph.span.getBoundingClientRect();
   // The inline box includes the font's ascent and descent. Aim through the ink.
   const y=(box.top+box.height*.56-origin.top)/scale-nibOffset[1]-previewDrawingOffsetY;
   const from=[(box.left-origin.left)/scale-nibOffset[0],y];
   const to=[(box.right-origin.left)/scale-nibOffset[0],y];
   const first=previousRow===-1;
   const lineBreak=glyph.row!==previousRow;
   move(from,first?.32:lineBreak?.08:.015,phase,lineBreak);
   if(first)connectors.push({kind:'connector',start:time,end:time+.45,path:path(connectorPoints),phase});
   const step={kind:'letter',start:time,end:time+.13,path:path([from,to]),phase,char:glyph.char,span:glyph.span};
   segments.push(step);letters.push(step);time=step.end;last=to;previousRow=glyph.row;
  }
 }
 const finalPen=[580,510], handAnchor=[286,104];
 // Keep the approved hand transform. Its visible nib is slightly offset from the image anchor.
 const handAngle=-37*Math.PI/180, handScale=500/1122;
 const [tipX,tipY]=data.handTip.map((value,i)=>(value-handAnchor[i])*handScale);
 const nibOffset=[tipX*Math.cos(handAngle)-tipY*Math.sin(handAngle),tipX*Math.sin(handAngle)+tipY*Math.cos(handAngle)];
 const glowAngle=glow.angle*Math.PI/180;
 const [dx,dy]=finalPen.map((value,i)=>(value+nibOffset[i]-glow.offset[i])/glow.scale);
 const contactX=dx*Math.cos(glowAngle)+dy*Math.sin(glowAngle);
 const contactY=-dx*Math.sin(glowAngle)+dy*Math.cos(glowAngle);
 const sourceRidge=glow.paths[0];
 const contactIndex=sourceRidge.findIndex(([x])=>x>=contactX);
 const [before,after]=sourceRidge.slice(contactIndex-1,contactIndex+1);
 const ridgeY=before[1]+(after[1]-before[1])*(contactX-before[0])/(after[0]-before[0]);
 const lift=contactY-ridgeY;
 // Native PNG columns sampled along the arm edge. Follow the silhouette through
 // the contact rather than bending the line only toward the nib.
 const profile=[[80,0],[200,-14],[500,-51],[950,-69],[contactX,lift],[1500,-74],[1800,-38],[2000,0]];
 function shift(x){
  const i=profile.findIndex(([column])=>column>x);
  if(i<1)return 0;
  const [left,y0]=profile[i-1],[right,y1]=profile[i];
  const [previous,yp]=profile[Math.max(0,i-2)],[next,yn]=profile[Math.min(profile.length-1,i+1)];
  const span=right-left,t=(x-left)/span;
  const m0=i===1?0:span*(y1-yp)/(right-previous);
  const m1=i===profile.length-1?0:span*(yn-y0)/(next-left);
  return y0+(y1-y0)*smooth(t)+t*(1-t)*((1-t)*m0-t*m1);
 }
 // Extend only the original left taper; the middle and pen contact retain their coordinates.
 const extension=800;
 const leftExtension=x=>extension*Math.max(0,1-x/800)**2;
 const extendGlow=([x,y])=>[x-leftExtension(x),y+shift(x)+leftExtension(x)*.13];
 const glowPenPoint=p=>transform(glow,extendGlow(p)).map((value,i)=>value-nibOffset[i]);
 const glowPath=sourceRidge.map(glowPenPoint);
 // The reveal ranks measure distance on the original ridge, so retain that clock.
 const glowPenPath={...path(sourceRidge),points:glowPath};
 const restPath=path([...glowPath.slice(contactIndex).reverse(),finalPen]);
 const guidePath=path(curves.paths[1].map(p=>transform(curves,p).map((value,i)=>value-nibOffset[i])));
 function buildTimeline(){
  segments=[];letters=[];connectors=[];time=.35;last=[600,1200];
  caption(captions[0],'top',[[473.75,340.3],[500.7,260.8]]);
  move(guidePath.points[0],.33,'lines',true);
  guideStep={kind:'curve',start:time,end:time+1,path:guidePath,phase:'lines'};
  segments.push(guideStep);time=guideStep.end;last=guidePath.points.at(-1);
  caption(captions[1],'right',[[739,414],[798,414]]);
  caption(captions[2],'bottom',[[467,535],[495,622]]);
  move(glowPath[0],.25,'glow',true);
  glowStep={kind:'glow',start:time,end:time+1,path:glowPenPath,phase:'glow'};
  segments.push(glowStep);time=glowStep.end;
  segments.push({kind:'move',start:time,end:time+.22,path:restPath,phase:'settle'});
  duration=time+.22;
  stage.dataset.duration=String(duration);
  stage.dataset.characters=String(letters.length);
  stage.dataset.schedule=JSON.stringify([...segments.filter(s=>s.kind!=='move'),...connectors].sort((a,b)=>a.start-b.start).map(s=>({kind:s.kind,phase:s.phase,char:s.char,start:+s.start.toFixed(3),end:+s.end.toFixed(3)})));
 }
 // Move each source pixel with its reveal rank. Round only at native PNG resolution.
 const glowWidth=glow.canvas.width;
 const columns=Int16Array.from({length:glowWidth+1},(_,x)=>Math.round(extendGlow([x,0])[0])+extension);
 const rows=Int16Array.from({length:glowWidth},(_,x)=>Math.round(extendGlow([x,0])[1]));
 glow.canvas.width=glowWidth+extension;
 glow.ink=glow.context.createImageData(glow.canvas.width,glow.canvas.height);
 glow.leftPadding=extension;
 glow.destination=Int32Array.from(glow.order,pixel=>{
  const x=pixel%glowWidth,y=Math.floor(pixel/glowWidth)+rows[x];
  return y<0||y>=glow.canvas.height?-1:y*glow.canvas.width+columns[x];
 });
 glow.columnWidths=Uint8Array.from(rows,(_,x)=>columns[x+1]-columns[x]);
 stage.dataset.writingMode='one-motion-per-character';
 let raf=0,started=0,active=false,pausedAt=0,virtualHeight=901,ratio=1;const progress=(step,t)=>Math.max(0,Math.min(1,(t-step.start)/(step.end-step.start)));
 function updateInk(layer,f){
  if(f<=0)return;
  const limit=Math.round(Math.min(1,f)*65534);
  const previous=layer.revealed;
  while(layer.revealed<layer.order.length&&layer.ranks[layer.order[layer.revealed]]<=limit){
   const index=layer.revealed++, source=layer.order[index]*4;
   if(layer.destination){
    const target=layer.destination[index]*4;
    if(target>=0){
     const width=layer.columnWidths[layer.order[index]%glowWidth];
     const rgba=layer.original.data.subarray(source,source+4);
     for(let column=0;column<width;column++)layer.ink.data.set(rgba,target+column*4);
    }
   }else layer.ink.data[source+3]=layer.original.data[source+3];
  }
  if(layer.revealed!==previous)layer.context.putImageData(layer.ink,0,0);
 }
 function drawLayer(layer){ctx.save();ctx.translate(...layer.offset);ctx.rotate(layer.angle*Math.PI/180);ctx.scale(layer.scale,layer.scale);ctx.drawImage(layer.canvas,-(layer.leftPadding||0),0);ctx.restore();}
 function drawConnector(step,t){const f=progress(step,t);if(!f)return;
  const a=step.path.points[0],b=point(step.path,f);
  ctx.save();ctx.strokeStyle='#fff';ctx.fillStyle='#fff';ctx.lineWidth=1.5;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();
  ctx.beginPath();ctx.arc(a[0],a[1],3,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 function render(t){
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,1980,virtualHeight);
  for(const step of letters){
   const visible=t>step.start;
   if(step.span.classList.contains('is-written')!==visible)step.span.classList.toggle('is-written',visible);
  }
  connectors.forEach(step=>drawConnector(step,t));ctx.save();ctx.translate(0,previewDrawingOffsetY);
  updateInk(curves,progress(guideStep,t));drawLayer(curves);
  if(t>glowStep.start){updateInk(glow,progress(glowStep,t));drawLayer(glow);}
  const segment=segments.find(s=>t>=s.start&&t<s.end);stage.dataset.phase=t<.35?'base':t>=duration?'complete':segment?.phase||'travel';
  if(segment||t>=duration){let pen=finalPen;if(segment){let f=progress(segment,t);if(segment.kind==='move')f=smooth(f);pen=point(segment.path,f);}ctx.save();ctx.translate(...pen);ctx.rotate(-37*Math.PI/180);const scale=500/1122;ctx.globalAlpha=Math.max(0,Math.min(1,(t-.35)/.30));ctx.drawImage(hand,-handAnchor[0]*scale,-handAnchor[1]*scale,500,1402*scale);ctx.restore();stage.dataset.penX=pen[0].toFixed(3);stage.dataset.penY=pen[1].toFixed(3);stage.dataset.penDown=String(!!segment&&segment.kind!=='move');stage.dataset.handVisible=String(t>.35);stage.dataset.character=segment?.char||'';
  }else{stage.dataset.penDown='false';stage.dataset.handVisible='false';stage.dataset.character='';}
  ctx.restore();
  if(t>=duration&&!stage.dataset.actualComplete)stage.dataset.actualComplete=t.toFixed(3);
  stage.dataset.elapsed=Math.min(t,duration).toFixed(3);stage.dataset.revealed=String(letters.filter(s=>t>=s.end).length);stage.dataset.progress=Math.min(1,t/duration).toFixed(4);
 }
 function reset(){delete stage.dataset.actualComplete;for(const layer of [curves,glow]){layer.revealed=0;for(let i=3;i<layer.ink.data.length;i+=4)layer.ink.data[i]=0;layer.context.putImageData(layer.ink,0,0);}}
 function tick(now){raf=0;if(!active||document.hidden)return;const t=reduced.matches?duration:(now-started)/1000;render(t);if(t<duration)raf=requestAnimationFrame(tick);}
 function select(value,start){cancelAnimationFrame(raf);raf=0;active=value;stage.hidden=!value;reset();ctx.clearRect(0,0,surface.width,surface.height);if(!value){stage.dataset.phase='inactive';return;}buildTimeline();started=start;pausedAt=0;render(reduced.matches?duration:0);if(!reduced.matches)raf=requestAnimationFrame(tick);}
 function align(){const box=hero.querySelector('.hero-slides').getBoundingClientRect(),h=hero.getBoundingClientRect(),scale=Math.min(box.width/1980,box.height/901);stage.style.left=(box.left-h.left)+'px';stage.style.top=(box.top-h.top)+'px';stage.style.transform=`scale(${scale})`;virtualHeight=Math.max(901,(h.bottom-box.top)/scale);ratio=Math.min(1.5,Math.max(.15,scale*(devicePixelRatio||1)));surface.width=Math.round(1980*ratio);surface.height=Math.round(virtualHeight*ratio);surface.style.width='1980px';surface.style.height=virtualHeight+'px';if(active){buildTimeline();render(reduced.matches?duration:Math.min(duration,((pausedAt||performance.now())-started)/1000));}}
 function visibility(){if(document.hidden){if(active){pausedAt=performance.now();cancelAnimationFrame(raf);raf=0;}}else if(active&&pausedAt){started+=performance.now()-pausedAt;pausedAt=0;raf=requestAnimationFrame(tick);}}
 document.addEventListener('visibilitychange',visibility);const observer=new ResizeObserver(align);observer.observe(hero.querySelector('.hero-slides'));align();return {select,destroy(){cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',visibility);stage.remove();}};
};
