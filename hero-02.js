'use strict';
(() => {
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  // Empty/uncertain assets must keep A's existing background, not simulate 3 slides.
  const candidates = window.SLIMYOUNG_HERO_MODELS;
  const controls = document.querySelector('.hero-rolling');
  const state = document.querySelector('.hero-media-state');
  if (!Array.isArray(candidates) || candidates.length < 2) return;
  const models = candidates.filter(item => item && item.approvedForPreview === true && item.alt && (/^\.\/model-\d+\.(?:jpg|jpeg|png|webp|avif)$/i.test(item.src) || item.src === './assets/images/hero/line-design-retouched.png'));
  if (models.length !== candidates.length) return;
  const artwork = document.querySelector('.hero-slides img');
  const frames = models.map((item, index) => {
    if (index === 0) return artwork;
    const img = new Image(); img.alt = item.alt; img.decoding = 'async'; img.src = item.src;
    img.style.setProperty('--model-desktop-position', item.desktopPosition || '65% center');
    img.style.setProperty('--model-mobile-position', item.mobilePosition || '65% top');
    return img;
  });
  const hero=document.querySelector('.hero');
  const drawingReady=window.createHeroDrawing(hero,reduced).catch(()=>{
    hero.dataset.drawingError='asset-load';
    return null;
  });
  const overlay = hero.querySelector('.hero-html-preview');
  const countNodes = [...overlay.querySelectorAll('[data-count]')];
  const fontsReady = Promise.allSettled([
    ['italic 500 51px "Noto Serif KR"', '.hero-html-copy h2'],
    ['italic 700 51px "Noto Serif KR"', '.hero-html-copy strong'],
    ['400 23px "Noto Sans KR"', '.hero-html-description'],
    ['500 20px "Noto Sans KR"', '.hero-html-stat dt'],
    ['700 24px "Noto Serif KR"', '.hero-live-number small']
  ].map(([font, selector]) => document.fonts.load(font,
    [...overlay.querySelectorAll(selector)].map(node => node.textContent).join(''))));
  const effectsReady = Promise.all([drawingReady, fontsReady]);
  artwork.decode().then(() => {
    let drawing = null;
    let countFrame = 0;
    let activation = 0;

    function count(start) {
      function tick(now) {
        const progress = reduced.matches ? 1 : Math.max(0, Math.min(1, (now - start) / 2400));
        const eased = 1 - Math.pow(1 - progress, 3);
        countNodes.forEach(node => {
          node.textContent = Math.round(Number(node.dataset.count) * eased).toLocaleString('en-US');
        });
        if (progress < 1) countFrame = requestAnimationFrame(tick);
      }
      tick(start);
    }
    function alignStats() {
      const box=document.querySelector('.hero-slides').getBoundingClientRect();
      const scale=Math.min(box.width/1980,box.height/901);
      overlay.style.width='1980px'; overlay.style.height='901px';
      overlay.style.left='0px'; overlay.style.top='0px';
      overlay.style.transform='scale('+scale+')';
    }
    const layoutObserver=new ResizeObserver(alignStats);
    layoutObserver.observe(document.querySelector('.hero-slides')); alignStats();
    reduced.addEventListener('change',startEffects);
    const container = document.querySelector('.hero-slides');
    const dots = document.querySelector('.hero-dots');
    // Main hero is manual-only. Drawing has its own finite animation frame, never a slide timer.
    let index = 0;
    frames.slice(1).forEach(img => container.append(img));
    const buttons = models.map((item, i) => {
      const button = document.createElement('button'); button.type = 'button'; button.setAttribute('aria-label', `${i + 1}번 모델 이미지 보기`);
      button.addEventListener('click', () => { select(i); }); dots.append(button); return button;
    });
    async function startEffects() {
      const current = ++activation;
      cancelAnimationFrame(countFrame);
      countFrame = 0;
      drawing?.select(false, 0);
      overlay.hidden = true;
      if (index !== 0) return;

      const [readyDrawing] = await effectsReady;
      if (current !== activation) return;
      drawing = readyDrawing;
      const start = performance.now();
      overlay.hidden = false;
      count(start);
      drawing?.select(true, start);
      performance.mark('hero-effects-start', {startTime:start});
    }
    function select(i) {
      index = (i + models.length) % models.length;
      startEffects();
      frames.forEach((img, n) => { img.classList.toggle('is-active', n === index); img.setAttribute('aria-hidden', String(n !== index)); });
      buttons.forEach((button, n) => button.setAttribute('aria-pressed', String(n === index)));
      document.querySelector('.hero-page').textContent = `${String(index + 1).padStart(2,'0')} / ${String(models.length).padStart(2,'0')}`;
    }
    // First paint is opaque; keep normal crossfades for subsequent manual selections.
    artwork.style.transition='none';
    select(0);
    controls.hidden = false; state.hidden = true; document.querySelector('.hero').classList.add('has-models');
    container.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(()=>requestAnimationFrame(()=>artwork.style.removeProperty('transition')));
    addEventListener('pagehide', () => { ++activation; drawingReady.then(ready => ready?.destroy()); cancelAnimationFrame(countFrame); layoutObserver.disconnect(); }, {once:true});
  }).catch(() => { state.textContent = '모델 이미지 파일 확인 필요 · 기존 배경 유지'; });
})();


