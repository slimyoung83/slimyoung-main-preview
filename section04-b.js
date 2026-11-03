/* User-specified display values; clinical totals have not been independently verified. */
(() => {
 'use strict';
 const section=document.querySelector('#philosophy-doctor.s4-cinema');
 if(!section || !('IntersectionObserver' in window)) return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const stats=section.querySelector('.s4-stats');
 const counters=[...section.querySelectorAll('[data-s4-count]')];
 let started=false, finished=false, scheduled=false;
 const targets={surgery:12000,reviews:2000};
 if(!reduced.matches) section.classList.add('s4-enhanced');
 function revealPhilosophy(){
  scheduled=false;
  if(finished && section.getBoundingClientRect().top<=-100) section.classList.add('s4-philosophy-visible');
 }
 function onScroll(){if(!scheduled){scheduled=true;requestAnimationFrame(revealPhilosophy);}}
 function render(progress){counters.forEach(el=>{el.firstChild.nodeValue=Math.round(targets[el.dataset.s4Count]*progress).toLocaleString('en-US');});}
 function start(){
  if(started) return; started=true;
  section.classList.add('s4-stats-visible');
  if(targets){
   counters.forEach(el=>{el.classList.add('s4-design-number');el.replaceChildren(document.createTextNode('0'),Object.assign(document.createElement('small'),{textContent:'건 이상'}));});
  }
  const begin=performance.now();
  function frame(now){
   const t=reduced.matches?1:Math.min((now-begin)/1500,1);
   if(targets) render(1-Math.pow(1-t,3));
   if(t<1) requestAnimationFrame(frame);
   else{finished=true;section.dataset.countComplete='true';revealPhilosophy();}
  }
  requestAnimationFrame(frame);
 }
 const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){start();observer.disconnect();}},{threshold:.25});
 observer.observe(stats);
 addEventListener('scroll',onScroll,{passive:true});
 addEventListener('pageshow',onScroll);
})();
