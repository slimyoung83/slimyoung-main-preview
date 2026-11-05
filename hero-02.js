'use strict';
(() => {
  const rail = document.querySelector('.hero-quick');
  const toggle = rail.querySelector('.quick-toggle');
  const panel = rail.querySelector('.quick-panel');
  const hoverQuery = matchMedia('(hover:hover) and (pointer:fine)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let pinned = false;
  function expand(value) { rail.classList.toggle('is-expanded', value); toggle.setAttribute('aria-expanded', String(value)); }
  toggle.addEventListener('click', () => { pinned = !pinned; expand(pinned); });
  panel.addEventListener('click', event => { if (!hoverQuery.matches && !rail.classList.contains('is-expanded')) { event.preventDefault(); event.stopImmediatePropagation(); pinned = true; expand(true); } }, true);
  panel.addEventListener('pointerenter', () => { if (hoverQuery.matches) expand(true); });
  rail.addEventListener('pointerleave', () => { if (hoverQuery.matches && !pinned) expand(false); });
  rail.addEventListener('focusin', event => { if (event.target !== toggle && (hoverQuery.matches || event.target.matches(':focus-visible'))) expand(true); });
  rail.addEventListener('focusout', event => { if (!rail.contains(event.relatedTarget)) { pinned = false; expand(false); } });
  document.addEventListener('pointerdown', event => { if (!rail.contains(event.target)) { pinned = false; expand(false); } });
  rail.addEventListener('keydown', event => { if (event.key === 'Escape') { pinned = false; expand(false); toggle.focus(); } });
  rail.querySelectorAll('.quick-action').forEach(button => button.addEventListener('click', () => { pinned = false; expand(false); }));

  // These controls are intentionally not a form. Values are never read,
  // serialized, stored, included in a URL, or sent to the existing modal.
  const bar = document.querySelector('.consult-bar-02');
  bar.addEventListener('keydown', event => { if (event.key === 'Enter' && event.target.matches('input')) event.preventDefault(); });
  const fields = [...bar.querySelectorAll('.bar-desktop input,.bar-desktop select')];
  const consent = bar.querySelector('#preview-consent');
  const consentStatus = bar.querySelector('#consent-status');
  // Gate only the existing local preview modal; never submit or read contact values.
  bar.addEventListener('click', event => {
    if (!event.target.closest('.db-reserve')) return;
    if (!consent.checked) {
      event.preventDefault(); event.stopImmediatePropagation();
      consentStatus.textContent = '필수 개인정보 동의를 확인해 주세요. 실제 접수되지 않는 시안입니다.';
      consent.reportValidity(); consent.focus();
    } else {
      consentStatus.textContent = '디자인 미리보기 · 입력값 전송·저장·예약 접수 없음';
    }
  }, true);
  addEventListener('pagehide', () => fields.forEach(field => { if (field.type === 'checkbox') field.checked = false; else field.value = ''; }));

  // Empty/uncertain assets must keep A's existing background, not simulate 3 slides.
  const candidates = window.SLIMYOUNG_HERO_MODELS;
  const controls = document.querySelector('.hero-rolling');
  const state = document.querySelector('.hero-media-state');
  if (!Array.isArray(candidates) || candidates.length < 2) return;
  const models = candidates.filter(item => item && item.approvedForPreview === true && item.alt && (/^\.\/model-\d+\.(?:jpg|jpeg|png|webp|avif)$/i.test(item.src) || item.src === './assets/images/hero/line-design-retouched.png'));
  if (models.length !== candidates.length) return;
  const frames = models.map(item => {
    const img = new Image(); img.alt = item.alt; img.decoding = 'async'; img.src = item.src;
    img.style.setProperty('--model-desktop-position', item.desktopPosition || '65% center');
    img.style.setProperty('--model-mobile-position', item.mobilePosition || '65% top');
    return img;
  });
  Promise.all(frames.map(img => img.decode())).then(() => {
    // Edit only the decoded hero copy. Original PNG and SECTION 05 stay untouched.
    const artwork = frames[0];
    const canvas = document.createElement('canvas');
    canvas.width = artwork.naturalWidth; canvas.height = artwork.naturalHeight;
    const ctx = canvas.getContext('2d', {willReadFrequently:true});
    ctx.drawImage(artwork, 0, 0);
    function restoreRect(x,y,w,h) {
      const top = ctx.getImageData(x,y-4,w,1).data;
      const bottom = ctx.getImageData(x,y+h+4,w,1).data;
      const patch = ctx.createImageData(w,h);
      for(let row=0;row<h;row++) for(let col=0;col<w;col++) {
        const i=(row*w+col)*4, j=col*4, t=row/(h-1);
        for(let c=0;c<3;c++) patch.data[i+c]=Math.round(top[j+c]*(1-t)+bottom[j+c]*t);
        patch.data[i+3]=255;
      }
      ctx.putImageData(patch,x,y);
    }
    [[1008,590,190,52],[1252,590,193,52],[1508,590,169,52],[1280,550,132,34]].forEach(r=>restoreRect(...r));
    artwork.src=canvas.toDataURL('image/png');
    const overlay=document.createElement('div');
    overlay.className='hero-live-stats';
    overlay.innerHTML='<span class="hero-lifting-label">리프팅 시술건수</span>'+[12000,72000,2000].map((n,i)=>'<span class="hero-live-number stat-'+i+'"><span data-count="'+n+'">'+n.toLocaleString('en-US')+'</span><small>건+</small></span>').join('');
    document.querySelector('.hero').append(overlay);
    const countNodes=[...overlay.querySelectorAll('[data-count]')];
    let countFrame=0;
    function count(active) {
      cancelAnimationFrame(countFrame); countFrame=0;
      overlay.hidden=!active;
      if(!active) return;
      const start=performance.now();
      function tick(now) {
        const progress=reduced.matches?1:Math.min(1,(now-start)/2000);
        const eased=1-Math.pow(1-progress,3);
        countNodes.forEach(node=>node.textContent=Math.round(Number(node.dataset.count)*eased).toLocaleString('en-US'));
        if(progress<1) countFrame=requestAnimationFrame(tick);
      }
      tick(start);
    }
    function alignStats() {
      const box=document.querySelector('.hero-slides').getBoundingClientRect();
      const scale=Math.min(box.width/1980,box.height/901);
      overlay.style.width='1980px'; overlay.style.height='901px';
      overlay.style.left='0px'; overlay.style.top=((box.height-901*scale)/2)+'px';
      overlay.style.transform='scale('+scale+')';
    }
    const layoutObserver=new ResizeObserver(alignStats);
    layoutObserver.observe(document.querySelector('.hero-slides')); alignStats();
    reduced.addEventListener('change',()=>count(index===0));
    const container = document.querySelector('.hero-slides');
    const dots = document.querySelector('.hero-dots');
    const pause = document.querySelector('.hero-pause');
    let index = 0, timer = null, paused = false, onScreen = true, interacting = false;
    frames.forEach(img => container.append(img));
    const buttons = models.map((item, i) => {
      const button = document.createElement('button'); button.type = 'button'; button.setAttribute('aria-label', `${i + 1}번 모델 이미지 보기`);
      button.addEventListener('click', () => { select(i, true); }); dots.append(button); return button;
    });
    function stop() { clearInterval(timer); timer = null; }
    function schedule() { stop(); if (!paused && !reduced.matches && !document.hidden && onScreen && !interacting) timer = setInterval(() => select((index + 1) % models.length), 10000); }
    function select(i, manual = false) {
      index = (i + models.length) % models.length;
      count(index === 0);
      frames.forEach((img, n) => { img.classList.toggle('is-active', n === index); img.setAttribute('aria-hidden', String(n !== index)); });
      buttons.forEach((button, n) => button.setAttribute('aria-pressed', String(n === index)));
      document.querySelector('.hero-page').textContent = `${String(index + 1).padStart(2,'0')} / ${String(models.length).padStart(2,'0')}`;
      if (manual) schedule();
    }
    controls.hidden = false; state.hidden = true; document.querySelector('.hero').classList.add('has-models');
    container.setAttribute('aria-hidden', 'false'); select(0);
    document.querySelector('.hero-prev').addEventListener('click', () => select(index - 1, true));
    document.querySelector('.hero-next').addEventListener('click', () => select(index + 1, true));
    pause.addEventListener('click', () => { paused = !paused; pause.setAttribute('aria-pressed', String(paused)); pause.textContent = paused ? '자동 전환 재개' : '자동 전환 일시정지'; schedule(); });
    const hero = document.querySelector('.hero');
    hero.addEventListener('pointerenter', () => { interacting = true; stop(); }); hero.addEventListener('pointerleave', () => { interacting = false; schedule(); });
    hero.addEventListener('focusin', () => { interacting = true; stop(); }); hero.addEventListener('focusout', event => { if (!hero.contains(event.relatedTarget)) { interacting = false; schedule(); } });
    document.addEventListener('visibilitychange', schedule); reduced.addEventListener('change', schedule);
    const observer = new IntersectionObserver(entries => { onScreen = entries[0].isIntersecting; schedule(); }, {threshold:.15}); observer.observe(hero); schedule();
    addEventListener('pagehide', () => { stop(); cancelAnimationFrame(countFrame); layoutObserver.disconnect(); observer.disconnect(); }, {once:true});
  }).catch(() => { state.textContent = '모델 이미지 파일 확인 필요 · 기존 배경 유지'; });
})();

