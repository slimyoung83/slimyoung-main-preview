/* Section 04 philosophy and text-style signature only; no numeric counters. */
(() => {
 'use strict';
 const section=document.querySelector('#philosophy-doctor.s4-cinema');
 if(!section||!('IntersectionObserver' in window))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(!reduced.matches)section.classList.add('s4-enhanced');
 const observer=new IntersectionObserver(entries=>{
  if(entries.some(e=>e.isIntersecting)){section.classList.add('s4-philosophy-visible');observer.disconnect();}
 },{threshold:.25});
 observer.observe(section.querySelector('.s4-philosophy'));
})();
