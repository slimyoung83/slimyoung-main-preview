'use strict';
window.createHeroDrawing = async function(hero,reduced){
 const root='./assets/images/hero/auto-drawing/';
 const response=await fetch(root+'character-layout.json?v=unit-ridge-alignment-1');if(!response.ok)throw Error('Drawing layout unavailable');const data=await response.json();
 const load=async file=>{const image=new Image();image.src=root+file;await image.decode();return image;};
 const stage=document.createElement('div');stage.className='hero-drawing';stage.hidden=true;stage.setAttribute('aria-hidden','true');
 const surface=document.createElement('canvas');surface.className='drawing-surface';stage.append(surface);hero.append(stage);const ctx=surface.getContext('2d');
 const [handImage,...captionImages]=await Promise.all([load('hand-slim-natural.png'),...data.captions.map(c=>load(c.file))]);
 // Supplied PNG already fades through its alpha channel; retain its RGB AND alpha unchanged.
 const hand=handImage;
 const captions=data.captions.map((c,i)=>({...c,image:captionImages[i]}));
 async function inkLayer(spec){
  const [image,map]=await Promise.all([load(spec.file),load(spec.map+'?v=unit-ridge-alignment-1')]),canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);const original=context.getImageData(0,0,canvas.width,canvas.height),ink=context.createImageData(canvas.width,canvas.height);ink.data.set(original.data);
  context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(map,0,0);const mb=context.getImageData(0,0,canvas.width,canvas.height).data,ranks=new Uint16Array(canvas.width*canvas.height),counts=new Uint32Array(65536);let total=0;
  for(let i=0;i<ranks.length;i++){ranks[i]=mb[i*4]*256+mb[i*4+1];ink.data[i*4+3]=0;if(original.data[i*4+3]&&ranks[i]){counts[ranks[i]]++;total++;}}
  const offsets=new Uint32Array(65536);let sum=0;for(let i=0;i<65536;i++){offsets[i]=sum;sum+=counts[i];}const cursor=offsets.slice(),order=new Uint32Array(total);
  for(let i=0;i<ranks.length;i++)if(original.data[i*4+3]&&ranks[i])order[cursor[ranks[i]]++]=i;
  context.clearRect(0,0,canvas.width,canvas.height);return {...spec,canvas,context,original,ink,ranks,order,revealed:0};
 }
 const [curves,glow]=await Promise.all([inkLayer(data.guides),inkLayer(data.glow)]);
 const transform=(spec,p)=>{const angle=spec.angle*Math.PI/180,c=Math.cos(angle)*spec.scale,s=Math.sin(angle)*spec.scale;return [spec.offset[0]+p[0]*c-p[1]*s,spec.offset[1]+p[0]*s+p[1]*c];};
 const path=points=>{const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));return {points,lengths,length:lengths.at(-1)};};
 const point=(p,f)=>{const distance=p.length*Math.max(0,Math.min(1,f));let i=1;while(i<p.lengths.length-1&&p.lengths[i]<distance)i++;const a=p.points[i-1],b=p.points[i],t=(distance-p.lengths[i-1])/Math.max(.001,p.lengths[i]-p.lengths[i-1]);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];};
 const segments=[],letters=[],connectors=[],lineSteps=[];let time=.35,last=[600,1200];const smooth=f=>f*f*(3-2*f);
 function move(to,duration,phase='travel',curved=false){
  const from=last.slice(),points=curved?Array.from({length:25},(_,i)=>{const t=i/24,u=1-t;return [u*u*from[0]+2*u*t*(from[0]+to[0])/2+t*t*to[0],u*u*from[1]+2*u*t*(Math.min(from[1],to[1])-35)+t*t*to[1]];}):[from,to];
  segments.push({kind:'move',start:time,end:time+duration,path:path(points),phase});time+=duration;last=to;
 }
 function caption(c){
  move(c.characters[0].from,.35,c.name,true);let row=0;
  for(const glyph of c.characters){
   if(last!==glyph.from)move(glyph.from,glyph.row!==row?.10:.015,c.name,glyph.row!==row);
   const step={kind:'letter',start:time,end:time+.16,path:path([glyph.from,glyph.to]),phase:c.name,char:glyph.char,c,glyph};segments.push(step);letters.push(step);time=step.end;last=glyph.to;row=glyph.row;
  }
 }
 function connector(points,phase,embedded=false){move(points[0],.10,phase);const step={kind:'connector',start:time,end:time+.22,path:path(points),phase,embedded};segments.push(step);connectors.push(step);time=step.end;last=points.at(-1);}
 caption(captions[0]);connector([[500.7,260.8],[473.75,340.3]],'top',true);
 curves.paths.forEach((points,i)=>{const world=points.map(p=>transform(curves,p));move(world[0],.10,'lines');const step={kind:'curve',start:time,end:time+.64,path:path(world),phase:'lines',i};segments.push(step);lineSteps.push(step);time=step.end;last=world.at(-1);});
 caption(captions[2]);connector([[798,414],[739,414]],'right');
 caption(captions[1]);connector([[495,622],[467,535]],'bottom');
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
 const glowPenPoint=([x,y])=>transform(glow,[x,y+shift(x)]).map((value,i)=>value-nibOffset[i]);
 const glowPath=sourceRidge.map(glowPenPoint);
 // The reveal ranks measure distance on the original ridge, so retain that clock.
 const glowPenPath={...path(sourceRidge),points:glowPath};
 move(glowPath[0],.25,'glow',true);
 const glowStep={kind:'glow',start:time,end:time+1,path:glowPenPath,phase:'glow'};
 segments.push(glowStep);time=glowStep.end;last=glowPath.at(-1);
 const restPath=[...glowPath.slice(contactIndex).reverse(),finalPen];
 segments.push({kind:'move',start:time,end:time+.22,path:path(restPath),phase:'settle'});time+=.22;last=restPath.at(-1);
 const duration=time;
 // Move each source pixel with its reveal rank. Round only at native PNG resolution.
 const glowWidth=glow.canvas.width;
 const columnShift=Int16Array.from({length:glowWidth},(_,x)=>Math.round(shift(x)));
 glow.destination=Int32Array.from(glow.order,pixel=>pixel+glowWidth*columnShift[pixel%glowWidth]);
 stage.dataset.duration=String(duration);stage.dataset.writingMode='one-motion-per-character';stage.dataset.characters=String(letters.length);
 stage.dataset.schedule=JSON.stringify(segments.filter(s=>s.kind!=='move').map(s=>({kind:s.kind,phase:s.phase,char:s.char,start:+s.start.toFixed(3),end:+s.end.toFixed(3)})));
 let raf=0,started=0,active=false,pausedAt=0,virtualHeight=901,ratio=1;const progress=(step,t)=>Math.max(0,Math.min(1,(t-step.start)/(step.end-step.start)));
 function updateInk(layer,f){
  const limit=Math.round(Math.max(0,Math.min(1,f))*65534);
  const previous=layer.revealed;
  while(layer.revealed<layer.order.length&&layer.ranks[layer.order[layer.revealed]]<=limit){
   const index=layer.revealed++, source=layer.order[index]*4;
   if(layer.destination){
    const target=layer.destination[index]*4;
    if(target>=0&&target<layer.ink.data.length){
     for(let channel=0;channel<4;channel++)layer.ink.data[target+channel]=layer.original.data[source+channel];
    }
   }else layer.ink.data[source+3]=layer.original.data[source+3];
  }
  if(layer.revealed!==previous)layer.context.putImageData(layer.ink,0,0);
 }
 function drawLayer(layer){ctx.save();ctx.translate(...layer.offset);ctx.rotate(layer.angle*Math.PI/180);ctx.scale(layer.scale,layer.scale);ctx.drawImage(layer.canvas,0,0);ctx.restore();}
 function drawConnector(step,t){const f=progress(step,t);if(!f)return;
  if(step.embedded){const c=captions[0],sy=455,height=(c.image.height-sy)*f;ctx.drawImage(c.image,0,sy,c.image.width,height,c.x,c.y+sy*c.height/c.image.height,c.width,height*c.height/c.image.height);return;}
  const a=step.path.points[0],b=point(step.path,f);ctx.save();ctx.strokeStyle='#fff';ctx.fillStyle='#fff';ctx.lineWidth=1.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.stroke();if(f===1){ctx.beginPath();ctx.arc(b[0],b[1],3,0,Math.PI*2);ctx.fill();}ctx.restore();
 }
 function render(t){
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,1980,virtualHeight);
  for(const step of letters){const f=progress(step,t);if(!f)continue;const c=step.c,[x,y,w,h]=step.glyph.rect,sx=c.width/c.image.width,sy=c.height/c.image.height;ctx.save();ctx.globalAlpha=smooth(f);ctx.drawImage(c.image,x,y,w,h,c.x+x*sx,c.y+y*sy,w*sx,h*sy);ctx.restore();}
  connectors.forEach(step=>drawConnector(step,t));let curveProgress=0;for(const step of lineSteps)if(t>=step.start)curveProgress=(step.i+progress(step,t))/lineSteps.length;
  updateInk(curves,curveProgress);drawLayer(curves);
  if(t>glowStep.start){updateInk(glow,progress(glowStep,t));drawLayer(glow);}
  const segment=segments.find(s=>t>=s.start&&t<s.end);stage.dataset.phase=t<.35?'base':t>=duration?'complete':segment?.phase||'travel';
  if(segment||t>=duration){let pen=finalPen;if(segment){let f=progress(segment,t);if(segment.kind==='move')f=smooth(f);pen=point(segment.path,f);}ctx.save();ctx.translate(...pen);ctx.rotate(-37*Math.PI/180);const scale=500/1122;ctx.globalAlpha=Math.max(0,Math.min(1,(t-.35)/.30));ctx.drawImage(hand,-handAnchor[0]*scale,-handAnchor[1]*scale,500,1402*scale);ctx.restore();stage.dataset.penX=pen[0].toFixed(3);stage.dataset.penY=pen[1].toFixed(3);stage.dataset.penDown=String(!!segment&&segment.kind!=='move');stage.dataset.handVisible=String(t>.35);stage.dataset.character=segment?.char||'';
  }else{stage.dataset.penDown='false';stage.dataset.handVisible='false';stage.dataset.character='';}
  if(t>=duration&&!stage.dataset.actualComplete)stage.dataset.actualComplete=t.toFixed(3);
  stage.dataset.elapsed=Math.min(t,duration).toFixed(3);stage.dataset.revealed=String(letters.filter(s=>t>=s.end).length);stage.dataset.progress=Math.min(1,t/duration).toFixed(4);
 }
 function reset(){delete stage.dataset.actualComplete;for(const layer of [curves,glow]){layer.revealed=0;for(let i=3;i<layer.ink.data.length;i+=4)layer.ink.data[i]=0;layer.context.putImageData(layer.ink,0,0);}}
 function tick(now){raf=0;if(!active||document.hidden)return;const t=reduced.matches?duration:(now-started)/1000;render(t);if(t<duration)raf=requestAnimationFrame(tick);}
 function select(value){cancelAnimationFrame(raf);raf=0;active=value;stage.hidden=!value;reset();ctx.clearRect(0,0,surface.width,surface.height);if(!value){stage.dataset.phase='inactive';return;}started=performance.now();pausedAt=0;render(reduced.matches?duration:0);if(!reduced.matches)raf=requestAnimationFrame(tick);}
 function align(){const box=hero.querySelector('.hero-slides').getBoundingClientRect(),h=hero.getBoundingClientRect(),scale=Math.min(box.width/1980,box.height/901);stage.style.left=(box.left-h.left)+'px';stage.style.top=(box.top-h.top)+'px';stage.style.transform=`scale(${scale})`;virtualHeight=Math.max(901,(h.bottom-box.top)/scale);ratio=Math.min(1.5,Math.max(.15,scale*(devicePixelRatio||1)));surface.width=Math.round(1980*ratio);surface.height=Math.round(virtualHeight*ratio);surface.style.width='1980px';surface.style.height=virtualHeight+'px';if(active)render(reduced.matches?duration:Math.min(duration,(performance.now()-started)/1000));}
 function visibility(){if(document.hidden){if(active){pausedAt=performance.now();cancelAnimationFrame(raf);raf=0;}}else if(active&&pausedAt){started+=performance.now()-pausedAt;pausedAt=0;raf=requestAnimationFrame(tick);}}
 document.addEventListener('visibilitychange',visibility);const observer=new ResizeObserver(align);observer.observe(hero.querySelector('.hero-slides'));align();return {select,destroy(){cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',visibility);stage.remove();}};
};
