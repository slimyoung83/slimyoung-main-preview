'use strict';
window.createHeroDrawing = async function(hero,reduced){
 const root='./assets/images/hero/auto-drawing/',response=await fetch(root+'writing-traces.json');
 if(!response.ok)throw Error('Writing trace data unavailable');const data=await response.json();
 const load=async file=>{const img=new Image();img.src=root+file;await img.decode();return img;};
 const stage=document.createElement('div');stage.className='hero-drawing';stage.hidden=true;stage.setAttribute('aria-hidden','true');
 const surface=document.createElement('canvas');surface.className='drawing-surface';stage.append(surface);hero.append(stage);const ctx=surface.getContext('2d'),hand=await load('hand-long-sleeve.png');
 const captions=await Promise.all(data.captions.map(async c=>{
  const [image,map]=await Promise.all([load(c.file),load(c.map)]),canvas=document.createElement('canvas');canvas.width=c.width*c.resolution;canvas.height=c.height*c.resolution;
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0,canvas.width,canvas.height);const original=context.getImageData(0,0,canvas.width,canvas.height),ink=context.createImageData(canvas.width,canvas.height);ink.data.set(original.data);
  context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(map,0,0);const mapBytes=context.getImageData(0,0,canvas.width,canvas.height).data,ranks=new Uint16Array(canvas.width*canvas.height),counts=new Uint32Array(65536);let total=0;
  for(let i=0;i<ranks.length;i++){ranks[i]=mapBytes[i*4]*256+mapBytes[i*4+1];ink.data[i*4+3]=0;if(original.data[i*4+3]&&ranks[i]){counts[ranks[i]]++;total++;}}
  const offsets=new Uint32Array(65536);let sum=0;for(let i=0;i<65536;i++){offsets[i]=sum;sum+=counts[i];}const cursor=offsets.slice(),order=new Uint32Array(total);
  for(let i=0;i<ranks.length;i++)if(original.data[i*4+3]&&ranks[i])order[cursor[ranks[i]]++]=i;context.clearRect(0,0,canvas.width,canvas.height);
  return {...c,canvas,context,original,ink,ranks,order,revealed:0};
 }));
 const distance=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
 const path=points=>{const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+distance(points[i-1],points[i]));return {points,lengths,length:lengths.at(-1)};};
 const point=(p,f)=>{const length=p.length*Math.max(0,Math.min(1,f));let n=1;while(n<p.lengths.length-1&&p.lengths[n]<length)n++;const a=p.points[n-1],b=p.points[n],t=(length-p.lengths[n-1])/Math.max(.0001,p.lengths[n]-p.lengths[n-1]);return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];};
 const segments=[],guides=[];let time=.6,last=[480,1400];
 function move(to,duration=.2,phase='travel'){segments.push({kind:'move',start:time,end:time+duration,path:path([last,to]),phase});time+=duration;last=to;}
 function caption(c){move(c.strokes[0].points[0],.5,c.name);c.start=time;for(const s of c.strokes){const p=path(s.points),start=c.start+s.start;if(start>time)segments.push({kind:'move',start:time,end:start,path:path([last,p.points[0]]),phase:c.name});segments.push({kind:'ink',start,end:start+s.duration,path:p,phase:c.name});time=start+s.duration;last=p.points.at(-1);}c.end=c.start+c.duration;time=c.end;}
 function guide(points,duration,phase='lines',dash=false,opacity=1,arrow=false){move(points[0],.2,phase);const g={kind:'line',start:time,end:time+duration,path:path(points),phase,dash,opacity,arrow};segments.push(g);guides.push(g);time=g.end;last=points.at(-1);}
 const bezier=(a,b,c,d)=>Array.from({length:81},(_,i)=>{const t=i/80,u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];});
 caption(captions[0]);caption(captions[1]);guide([[495,622],[467,535]],.45,'bottom');
 guide(bezier([385,497],[520,484],[639,428],[710,312]),1.45,'lines',true,1,true);
 guide(bezier([400,529],[550,501],[690,424],[760,315]),1.45,'lines',false,1,true);
 guide(bezier([460,545],[600,511],[710,435],[765,355]),1.45,'lines',true,1,true);
 guide(Array.from({length:65},(_,i)=>[535+20*Math.cos(i*Math.PI/32),434+20*Math.sin(i*Math.PI/32)]),.65,'lines',false,.15);
 caption(captions[2]);guide([[798,414],[739,414]],.4,'right');const writtenEnd=time;move([last[0]+80,1600],1,'exit');const duration=time;stage.dataset.duration=String(duration);
 let raf=0,started=0,active=false,pausedAt=0,virtualHeight=901,ratio=1;
 function updateInk(c,progress){const limit=Math.round(Math.max(0,Math.min(1,progress))*65534);let changed=false;while(c.revealed<c.order.length&&c.ranks[c.order[c.revealed]]<=limit){const pixel=c.order[c.revealed++];c.ink.data[pixel*4+3]=c.original.data[pixel*4+3];changed=true;}if(changed)c.context.putImageData(c.ink,0,0);}
 function drawLine(g,t){if(t<=g.start)return;const f=Math.min(1,(t-g.start)/(g.end-g.start)),tip=point(g.path,f),length=g.path.length*f;ctx.save();ctx.globalAlpha=g.opacity;ctx.strokeStyle='white';ctx.fillStyle='white';ctx.lineWidth=1.5;ctx.lineCap='round';ctx.lineJoin='round';ctx.setLineDash(g.dash?[9,7]:[]);ctx.beginPath();ctx.moveTo(...g.path.points[0]);for(let i=1;i<g.path.points.length&&g.path.lengths[i]<length;i++)ctx.lineTo(...g.path.points[i]);ctx.lineTo(...tip);ctx.stroke();
  if(f===1&&g.arrow){const a=g.path.points.at(-2),b=g.path.points.at(-1);ctx.translate(...b);ctx.rotate(Math.atan2(b[1]-a[1],b[0]-a[0]));ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-10,-4);ctx.lineTo(-7,0);ctx.lineTo(-10,4);ctx.closePath();ctx.fill();}else if(f===1&&g.path.length<100){ctx.beginPath();ctx.arc(tip[0],tip[1],3,0,Math.PI*2);ctx.fill();}ctx.restore();
 }
 function render(t){ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,1980,virtualHeight);for(const c of captions){updateInk(c,(t-c.start)/c.duration);ctx.drawImage(c.canvas,c.x,c.y,c.width,c.height);}guides.forEach(g=>drawLine(g,t));const segment=segments.find(s=>t>=s.start&&t<s.end);stage.dataset.phase=t<.6?'base':t>=duration?'complete':segment?.phase||'travel';
  if(segment){let f=(t-segment.start)/(segment.end-segment.start);if(segment.kind==='move')f=f*f*(3-2*f);const pen=point(segment.path,f);ctx.save();ctx.translate(...pen);ctx.rotate(55*Math.PI/180);const scale=1000/1546;ctx.globalAlpha=t<1.1?Math.max(0,(t-.6)/.5):t>writtenEnd?Math.max(0,1-(t-writtenEnd)):1;ctx.drawImage(hand,-338*scale,-131*scale,1000,1017*scale);ctx.restore();stage.dataset.penX=pen[0].toFixed(3);stage.dataset.penY=pen[1].toFixed(3);stage.dataset.penDown=String(segment.kind!=='move');}else stage.dataset.penDown='false';
  stage.dataset.elapsed=t.toFixed(3);stage.dataset.revealed=String(captions.reduce((sum,c)=>sum+c.revealed,0));stage.dataset.progress=Math.min(1,t/duration).toFixed(4);
 }
 function reset(){for(const c of captions){c.revealed=0;for(let i=3;i<c.ink.data.length;i+=4)c.ink.data[i]=0;c.context.putImageData(c.ink,0,0);}}
 function tick(now){raf=0;if(!active||document.hidden)return;const t=reduced.matches?duration:(now-started)/1000;render(t);if(t<duration)raf=requestAnimationFrame(tick);}
 function select(value){cancelAnimationFrame(raf);raf=0;active=value;stage.hidden=!value;reset();ctx.clearRect(0,0,surface.width,surface.height);if(!value){stage.dataset.phase='inactive';return;}started=performance.now();pausedAt=0;render(reduced.matches?duration:0);if(!reduced.matches)raf=requestAnimationFrame(tick);}
 function align(){const box=hero.querySelector('.hero-slides').getBoundingClientRect(),h=hero.getBoundingClientRect(),scale=Math.min(box.width/1980,box.height/901);stage.style.left=(box.left-h.left)+'px';stage.style.top=(box.top-h.top)+'px';stage.style.transform=`scale(${scale})`;virtualHeight=Math.max(901,(h.bottom-box.top)/scale);ratio=Math.min(1.5,Math.max(.15,scale*(devicePixelRatio||1)));surface.width=Math.round(1980*ratio);surface.height=Math.round(virtualHeight*ratio);surface.style.width='1980px';surface.style.height=virtualHeight+'px';if(active)render(reduced.matches?duration:Math.min(duration,(performance.now()-started)/1000));}
 function visibility(){if(document.hidden){if(active){pausedAt=performance.now();cancelAnimationFrame(raf);raf=0;}}else if(active&&pausedAt){started+=performance.now()-pausedAt;pausedAt=0;raf=requestAnimationFrame(tick);}}
 document.addEventListener('visibilitychange',visibility);const observer=new ResizeObserver(align);observer.observe(hero.querySelector('.hero-slides'));align();return {select,destroy(){cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener('visibilitychange',visibility);stage.remove();}};
};
