/* AI design samples only. Original image and source documentation are preserved. */
(() => {
 'use strict';
 const section=document.querySelector('#before-after.s5-gallery');
 if(!section) return;
 const items=[{src:'assets/images/before-after/arm-ai-sample.png',alt:'AI 디자인 샘플: 왼쪽 BEFORE 블러와 보라색 슬림영의원 LOGIN 표시, 오른쪽 AFTER. 실제 환자 사례 아님.'}];
 const track=section.querySelector('.s5-track'), viewport=section.querySelector('.s5-viewport');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const cards=[];let index=0,busy=false,hover=false,focus=false,drag=null,timer,finishTimer;
 let nextAt=performance.now()+5000;
 const wrap=n=>(n%items.length+items.length)%items.length;
 function setImage(card){const item=items[wrap(index+card.slot)];card.img.src=item.src;card.img.alt=item.alt;}
 for(let slot=-3;slot<=3;slot++){
  const el=document.createElement('figure'),img=new Image();
  el.className='s5-card';img.width=1808;img.height=870;img.decoding='async';img.draggable=false;el.append(img);track.append(el);
  const card={el,img,slot};cards.push(card);setImage(card);
 }
 function step(){return Math.min(660,track.getBoundingClientRect().width*.35);}
 function paint(fraction=0){
  const spacing=step();
  cards.forEach(card=>{
   const s=card.slot-fraction,a=Math.abs(s),depth=Math.min(a,3);
   const scale=1-Math.min(depth,2)*.14;
   const angle=reduced.matches?0:-Math.sign(s)*Math.min(depth,1.5)*14;
   card.el.style.transform=`translateX(-50%) translateX(${s*spacing}px) translateZ(${-depth*200}px) rotateY(${angle}deg) scale(${scale})`;
   card.el.style.opacity=String(a<=1?1-a*.19:Math.max(0,.81*(2-a)));
   card.el.style.zIndex=String(10-Math.round(a*2));
   card.el.classList.toggle('is-center',card.slot===0);
   card.el.setAttribute('aria-hidden',String(card.slot!==0));
  });
 }
 function schedule(){
  clearTimeout(timer);
  if(!busy&&!drag&&!hover&&!focus&&!document.hidden&&!reduced.matches) timer=setTimeout(()=>move(1,true),Math.max(0,nextAt-performance.now()));
 }
 function move(direction,automatic=false){
  if(busy) return;busy=true;clearTimeout(timer);track.classList.remove('is-instant');
  const duration=reduced.matches?0:650;
  if(automatic) nextAt=performance.now()+5000;
  paint(direction);
  finishTimer=setTimeout(()=>{
   index=wrap(index+direction);
   cards.forEach(card=>{
    card.slot-=direction;
    if(card.slot< -3||card.slot>3){card.slot=card.slot< -3?3:-3;card.el.classList.add('is-reset');setImage(card);}
   });
   // Existing cards retain their end transforms; only the invisible far card wraps.
   paint();
   requestAnimationFrame(()=>requestAnimationFrame(()=>cards.forEach(c=>c.el.classList.remove('is-reset'))));
   busy=false;section.dataset.moves=String(Number(section.dataset.moves||0)+1);
   if(!automatic)nextAt=performance.now()+5000;
   schedule();
  },duration);
 }
 section.querySelector('.s5-prev').addEventListener('click',()=>move(-1));
 section.querySelector('.s5-next').addEventListener('click',()=>move(1));
 viewport.addEventListener('pointerdown',e=>{
  if(busy||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
  clearTimeout(timer);drag={id:e.pointerId,x:e.clientX,fraction:0};viewport.setPointerCapture(e.pointerId);
  viewport.classList.add('is-dragging');track.classList.add('is-instant');
 });
 viewport.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  drag.fraction=Math.max(-1,Math.min(1,(drag.x-e.clientX)/step()));paint(drag.fraction);
 });
 function endDrag(e,cancelled=false){
  if(!drag||drag.id!==e.pointerId)return;
  const fraction=drag.fraction;drag=null;
  if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);
  viewport.classList.remove('is-dragging');track.classList.remove('is-instant');
  if(!cancelled&&Math.abs(fraction)>=.5)move(Math.sign(fraction));
  else{paint();nextAt=performance.now()+5000;schedule();}
 }
 viewport.addEventListener('pointerup',e=>endDrag(e));
 viewport.addEventListener('pointercancel',e=>endDrag(e,true));
 viewport.addEventListener('lostpointercapture',e=>endDrag(e,true));
 viewport.addEventListener('dragstart',e=>e.preventDefault());
 viewport.addEventListener('mouseenter',()=>{hover=true;schedule();});
 viewport.addEventListener('mouseleave',()=>{hover=false;nextAt=performance.now()+5000;schedule();});
 section.addEventListener('focusin',()=>{focus=true;schedule();});
 section.addEventListener('focusout',e=>{if(!section.contains(e.relatedTarget)){focus=false;nextAt=performance.now()+5000;schedule();}});
 document.addEventListener('visibilitychange',()=>{nextAt=performance.now()+5000;schedule();});
 reduced.addEventListener('change',()=>{paint();nextAt=performance.now()+5000;schedule();});
 addEventListener('resize',()=>{if(!busy&&!drag){track.classList.add('is-instant');paint();requestAnimationFrame(()=>track.classList.remove('is-instant'));}});
 paint();schedule();
})();
