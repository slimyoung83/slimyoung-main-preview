/* Section 03 only, on local and public test hosts. */
(() => {
  'use strict';
  const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  const preview=location.hostname==='slimyoung83.github.io'&&location.pathname.startsWith('/slimyoung-main-preview/');
  if(!local&&!preview)return;
  const section=document.querySelector('#reviews'),config=window.SLIMYOUNG_PC_REVIEW_GALLERY;
  if(!section||!config)return;
  const linkURL=value=>{if(!value)return null;try{const u=new URL(value,location.href);return u.protocol==='https:'?u.href:null;}catch{return null;}};
  const items=(config.items||[]).filter(item=>item.src&&Number.isInteger(item.column)&&item.column>=1&&item.column<=5)
    .slice().sort((a,b)=>a.column-b.column||a.order-b.order);
  const title=document.createElement('h2');title.className='pc-review-generated pc-gallery-title';title.id='pc-review-heading';
  title.append('Real Selfie ');const emphasis=document.createElement('em');emphasis.textContent='Review';title.append(emphasis);
  section.querySelector('.section-head > div').append(title);
  const destination=linkURL(config.viewMoreUrl);
  const more=document.createElement(destination?'a':'button');more.className='pc-review-generated pc-gallery-more';more.textContent='View More';
  if(destination){more.href=destination;more.target='_blank';more.rel='noopener noreferrer';}
  else {more.type='button';more.disabled=true;}
  section.querySelector('.section-head').append(more);
  const gallery=document.createElement('div');gallery.className='pc-review-generated pc-gallery';
  section.append(gallery);section.classList.add('pc-gallery-mode');section.setAttribute('aria-labelledby',title.id);
  const wide=matchMedia('(min-width:1200px)'),tablet=matchMedia('(min-width:768px)');
  function render(){
    gallery.replaceChildren();
    const count=wide.matches?5:tablet.matches?3:2;
    const columns=Array.from({length:count},(_,index)=>{
      const column=document.createElement('div');column.className='pc-gallery-column';column.dataset.column=index+1;
      gallery.append(column);return column;
    });
    const heights=Array(count).fill(0);
    items.forEach(item=>{
      const index=wide.matches?item.column-1:heights.indexOf(Math.min(...heights));
      const card=document.createElement('figure');card.className='pc-gallery-card';
      card.dataset.type=item.type==='square'?'square':'portrait';
      const image=document.createElement('img');image.src=item.src;image.alt=item.alt||'';image.loading='lazy';image.decoding='async';
      image.style.objectFit=item.fit==='contain'?'contain':'cover';image.style.objectPosition=item.position||'center';
      if(item.preserveRatio){card.classList.add('pc-gallery-natural');image.addEventListener('load',()=>{card.style.aspectRatio=`${image.naturalWidth} / ${image.naturalHeight}`;},{once:true});}
      image.addEventListener('error',()=>{card.remove();},{once:true});
      card.append(image);columns[index].append(card);
      heights[index]+=(card.dataset.type==='square'?1:4/3)+.07;
    });
  }
  wide.addEventListener('change',render);tablet.addEventListener('change',render);render();
})();
