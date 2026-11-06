'use strict';
// First-slide-only timeline. All coordinates share the original 1980 x 901 canvas.
window.createHeroDrawing = async function (hero, reduced) {
  const root = './assets/images/hero/auto-drawing/';
  const stage = document.createElement('div');
  stage.className = 'hero-drawing'; stage.setAttribute('aria-hidden', 'true'); stage.hidden = true;
  const image = (file, cls) => {
    const img = new Image(); img.alt = ''; img.src = root + file; img.className = cls;
    img.draggable = false; stage.append(img); return img;
  };
  const top = image('caption-top.png', 'drawing-caption drawing-top');
  const bottom = image('handwriting-bottom-review.png', 'drawing-caption drawing-bottom');
  const right = image('handwriting-right-review.png', 'drawing-caption drawing-right');
  // Reuse the established guide coordinates as vectors, avoiding skin/background remnants in the old matte.
  stage.insertAdjacentHTML('beforeend', `<svg class="drawing-guides" viewBox="0 0 1980 901" aria-hidden="true">
    <defs><marker id="drawing-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 1 10 5 0 9 3 5Z" fill="white"/></marker></defs>
    <g class="drawing-lines" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round">
      <path d="M385 497 C520 484 639 428 710 312" stroke-dasharray="9 7" marker-end="url(#drawing-arrow)"/>
      <path d="M400 529 C550 501 690 424 760 315" marker-end="url(#drawing-arrow)"/>
      <path d="M460 545 C600 511 710 435 765 355" stroke-dasharray="9 7" marker-end="url(#drawing-arrow)"/>
      <circle cx="535" cy="434" r="20" opacity=".15"/>
    </g>
    <g class="drawing-bottom-guide" stroke="white" fill="white"><path d="M467 535 495 622" fill="none"/><circle cx="467" cy="535" r="3"/></g>
    <g class="drawing-right-guide" stroke="white" fill="white"><path d="M739 414 798 414" fill="none"/><circle cx="739" cy="414" r="3"/></g>
  </svg>`);
  const lines = stage.querySelector('.drawing-lines');
  const bottomGuide = stage.querySelector('.drawing-bottom-guide');
  const rightGuide = stage.querySelector('.drawing-right-guide');
  const hand = image('hand-long-sleeve.png', 'drawing-hand');
  await Promise.all([top,bottom,right,hand].map(img => img.decode()));
  hero.append(stage);
  let animations = [];
  function cancel() { animations.forEach(a => a.cancel()); animations = []; }
  function animate(el, frames, options) { const a = el.animate(frames, options); animations.push(a); return a; }
  function select(active) {
    cancel(); stage.hidden = !active;
    if (!active) return;
    stage.dataset.phase = 'base';
    stage.dataset.startedAt = String(performance.now());
    if (reduced.matches) { stage.classList.add('drawing-static'); return; }
    stage.classList.remove('drawing-static');
    const reveal = (el, delay, duration) => {
      const a = animate(el,[{opacity:0,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)'}],
        {delay,duration,easing:'ease-out',fill:'both'});
      a.onfinish = () => { stage.dataset.phase = el === top ? 'top' : el === bottom ? 'bottom' : 'complete'; };
    };
    reveal(top,1400,800); reveal(bottom,3000,800); reveal(right,5800,800);
    [ [bottomGuide,3000], [rightGuide,5800] ].forEach(([el,delay])=>animate(el,[{opacity:0},{opacity:1}],{delay,duration:800,fill:'both'}));
    // Reveal the source-aligned white strokes progressively from lower-left to upper-right.
    const lineAnimation = animate(lines,[{opacity:0,clipPath:'polygon(0 100%,0 100%,0 0,0 0)'},
      {opacity:1,clipPath:'polygon(0 100%,100% 100%,100% 0,0 0)'}],
      {delay:3800,duration:1200,easing:'linear',fill:'both'});
    lineAnimation.onfinish = () => { stage.dataset.phase = 'lines'; };
    const pen = (x,y) => `translate(${x-198}px,${y-79}px) rotate(55deg)`;
    animate(hand,[
      {offset:0,opacity:0,transform:pen(480,310)},
      {offset:.6/7,opacity:0,transform:pen(480,310)},
      {offset:1.4/7,opacity:1,transform:pen(448,208)},
      {offset:2.2/7,opacity:1,transform:pen(590,252)},
      {offset:3/7,opacity:1,transform:pen(462,635)},
      {offset:3.8/7,opacity:1,transform:pen(600,680)},
      {offset:4.1/7,opacity:1,transform:pen(390,555)},
      {offset:4.5/7,opacity:1,transform:pen(540,505)},
      {offset:5/7,opacity:1,transform:pen(752,350)},
      {offset:5.8/7,opacity:1,transform:pen(805,391)},
      {offset:6.6/7,opacity:1,transform:pen(915,448)},
      {offset:1,opacity:0,transform:pen(935,480)}
    ],{duration:7000,easing:'linear',fill:'both'});
  }
  function align() {
    const box = hero.querySelector('.hero-slides').getBoundingClientRect();
    const heroBox = hero.getBoundingClientRect();
    stage.style.left = (box.left-heroBox.left)+'px'; stage.style.top = (box.top-heroBox.top)+'px';
    stage.style.transform = `scale(${Math.min(box.width/1980,box.height/901)})`;
  }
  const observer = new ResizeObserver(align); observer.observe(hero.querySelector('.hero-slides')); align();
  return {select,destroy(){cancel();observer.disconnect();stage.remove();}};
};
