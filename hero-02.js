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
  rail.addEventListener('pointerleave', () => { if (hoverQuery.matches && !pinned && !rail.contains(document.activeElement)) expand(false); });
  rail.addEventListener('focusin', event => { if (event.target !== toggle && (hoverQuery.matches || event.target.matches(':focus-visible'))) expand(true); });
  rail.addEventListener('focusout', event => { if (!pinned && !rail.contains(event.relatedTarget)) expand(false); });
  document.addEventListener('pointerdown', event => { if (!rail.contains(event.target)) { pinned = false; expand(false); } });
  rail.addEventListener('keydown', event => { if (event.key === 'Escape') { pinned = false; expand(false); toggle.focus(); } });
  rail.querySelectorAll('.quick-action').forEach(button => button.addEventListener('click', () => { pinned = false; expand(false); }));

  // These controls are intentionally not a form. Values are never read,
  // serialized, stored, included in a URL, or sent to the existing modal.
  const bar = document.querySelector('.consult-bar-02');
  bar.addEventListener('keydown', event => { if (event.key === 'Enter' && event.target.matches('input')) event.preventDefault(); });
  const desktop = matchMedia('(min-width:1181px)');
  const fields = [...bar.querySelectorAll('.bar-desktop input,.bar-desktop select')];
  function syncFields() { fields.forEach(field => { field.disabled = !desktop.matches; if (!desktop.matches) { if (field.type === 'checkbox') field.checked = false; else field.value = ''; } }); }
  desktop.addEventListener('change', syncFields); syncFields();
  addEventListener('pagehide', () => fields.forEach(field => { if (field.type === 'checkbox') field.checked = false; else field.value = ''; }));

  // Empty/uncertain assets must keep A's existing background, not simulate 3 slides.
  const candidates = window.SLIMYOUNG_HERO_MODELS;
  const controls = document.querySelector('.hero-rolling');
  const state = document.querySelector('.hero-media-state');
  if (!Array.isArray(candidates) || candidates.length < 2) return;
  const models = candidates.filter(item => item && item.approvedForPreview === true && item.alt && /^\.\/model-\d+\.(?:jpg|jpeg|png|webp|avif)$/i.test(item.src));
  if (models.length !== candidates.length) return;
  const frames = models.map(item => {
    const img = new Image(); img.alt = item.alt; img.decoding = 'async'; img.src = item.src;
    img.style.setProperty('--model-desktop-position', item.desktopPosition || '65% center');
    img.style.setProperty('--model-mobile-position', item.mobilePosition || '65% top');
    return img;
  });
  Promise.all(frames.map(img => img.decode())).then(() => {
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
    function schedule() { stop(); if (!paused && !reduced.matches && !document.hidden && onScreen && !interacting) timer = setInterval(() => select((index + 1) % models.length), 5000); }
    function select(i, manual = false) {
      index = (i + models.length) % models.length;
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
    addEventListener('pagehide', () => { stop(); observer.disconnect(); }, {once:true});
  }).catch(() => { state.textContent = '모델 이미지 파일 확인 필요 · 기존 배경 유지'; });
})();

