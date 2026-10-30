/* Desktop-only gallery on the public test host. Original patient data is not modified. */
(() => {
  'use strict';
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const preview=location.hostname==='slimyoung83.github.io'&&location.pathname.startsWith('/slimyoung-main-preview/');
  if(!local&&!preview)return;
  const section=document.querySelector('#reviews'),config=window.SLIMYOUNG_PC_REVIEW_GALLERY;
  if(!section||!config)return;
  const desktop=matchMedia('(min-width:1200px)');
  const originalLabel=section.getAttribute('aria-labelledby');
  const linkURL=value=>{if(!value)return null;try{const u=new URL(value,location.href);return u.protocol==='https:'?u.href:null;}catch{return null;}};
  const items=Array.from({length:6},(_,index)=>index===0 ? (config.items?.[0] || {}) : {});
  function clear() {
    section.classList.remove('pc-gallery-mode');
    section.querySelectorAll('.pc-review-generated').forEach(e=>e.remove());
    if(originalLabel===null)section.removeAttribute('aria-labelledby');
    else section.setAttribute('aria-labelledby',originalLabel);
  }
  function sync() {
    if(!desktop.matches){clear();return;}
    if(section.classList.contains('pc-gallery-mode')||items.length!==6)return;
    const title=document.createElement('h2');title.className='pc-review-generated pc-gallery-title';title.id='pc-review-heading';
    title.append('Real Selfie ');const emphasis=document.createElement('em');emphasis.textContent='Review';title.append(emphasis);
    section.querySelector('.section-head > div').append(title);
    const destination=linkURL(config.viewMoreUrl);
    const more=document.createElement(destination?'a':'button');more.className='pc-review-generated pc-gallery-more';more.textContent='View More';
    if(destination){more.href=destination;more.target='_blank';more.rel='noopener noreferrer';}
    else {more.type='button';more.disabled=true;}
    section.querySelector('.section-head').append(more);
    const gallery=document.createElement('div');gallery.className='pc-review-generated pc-gallery';gallery.setAttribute('role','list');
    items.forEach((item)=>{
      const card=document.createElement('figure');
      card.className='pc-gallery-card';
      card.setAttribute('role','listitem');
      if(item.src){
        const image=document.createElement('img');
        image.src=item.src;image.alt=item.alt || '';image.loading='lazy';image.decoding='async';
        image.style.objectFit='contain';
        card.append(image);
      }
      gallery.append(card);
    });
    section.append(gallery);section.classList.add('pc-gallery-mode');section.setAttribute('aria-labelledby',title.id);
  }
  desktop.addEventListener('change',sync);sync();
})();
