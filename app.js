'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const content = window.SLIMYOUNG_CONTENT || {};
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const safeURL = value => {
    if (typeof value !== 'string' || !value) return null;
    try { const u = new URL(value, location.href); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; } catch { return null; }
  };
  const approved = item => item && item.consentConfirmed === true && item.usageRightsConfirmed === true;
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function image(src, alt, lazy = true) {
    const img = el('img'); img.src = safeURL(src); img.alt = alt || '';
    img.loading = lazy ? 'lazy' : 'eager'; img.decoding = 'async'; return img;
  }

  // Native modal dialogs trap focus and return focus to their invoker.
  let lockedOverflow = null;
  function syncLock() {
    const open = $$('dialog[open]').length > 0;
    if (open && lockedOverflow === null) {
      lockedOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
    } else if (!open && lockedOverflow !== null) {
      document.documentElement.style.overflow = lockedOverflow; lockedOverflow = null;
    }
  }
  function show(dialog) { if (!dialog.open) { dialog.showModal(); syncLock(); } }
  function close(dialog) { if (dialog.open) dialog.close(); }
  $$('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => {
      if (dialog.id === 'video-dialog') $('#player').replaceChildren();
      syncLock();
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close(dialog);
    });
  });
  $$('[data-close]').forEach(button => button.addEventListener('click', () => close(document.getElementById(button.dataset.close))));

  const panel = $('#mega-panel'); const menuButtons = $$('[data-menu]');
  function hideMega(focus = false) {
    const invoker = menuButtons.find(button => button.getAttribute('aria-expanded') === 'true');
    panel.hidden = true; menuButtons.forEach(button => button.setAttribute('aria-expanded', 'false'));
    if (focus && invoker) invoker.focus();
  }
  menuButtons.forEach(button => button.addEventListener('click', () => {
    const toggleOff = button.getAttribute('aria-expanded') === 'true' && !panel.hidden;
    hideMega();
    if (toggleOff) return;
    panel.hidden = false; button.setAttribute('aria-expanded', 'true');
    $$('.mega-group').forEach(group => group.classList.toggle('is-highlighted', group.dataset.group === button.dataset.menu));
  }));
  $('.mega-close').addEventListener('click', () => hideMega(true));
  panel.addEventListener('click', event => { if (event.target.closest('a')) hideMega(); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) hideMega(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) hideMega(true); });
  $('.site-header').addEventListener('focusout', event => {
    if (event.relatedTarget && !$('.site-header').contains(event.relatedTarget)) hideMega();
  });
  $('.menu-open').addEventListener('click', () => { hideMega(); show($('#mobile-menu')); });
  $('.menu-close').addEventListener('click', () => close($('#mobile-menu')));
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => close($('#mobile-menu'))));
  const headerMode = matchMedia('(max-width:1279px)');
  function syncHeaderMode() {
    if (headerMode.matches) hideMega();
    else close($('#mobile-menu'));
  }
  headerMode.addEventListener('change', syncHeaderMode);
  addEventListener('resize', syncHeaderMode);

  const videos = (content.videos || []).filter(video => /^[a-zA-Z0-9_-]{11}$/.test(video.id) && safeURL(video.source));
  let selectedVideo = 0;
  function openVideo(index) {
    const video = videos[index]; if (!video) return;
    const frame = el('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?autoplay=1&rel=0`;
    frame.title = video.title; frame.allow = 'autoplay; encrypted-media; picture-in-picture'; frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    $('#player').replaceChildren(frame); $('#video-title').textContent = video.title;
    $('#youtube').href = `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;
    show($('#video-dialog'));
  }
  function selectVideo(index) {
    const video = videos[index]; if (!video) return;
    selectedVideo = index; $('#featured-title').textContent = video.title;
    $('#featured-index').textContent = `${String(index + 1).padStart(2, '0')} / FILM`;
    $('#featured-source').href = safeURL(video.source);
    $('.video-topic').textContent = index === 0 ? '지방이식,\n그 이후의 이야기.' : video.title;
    $$('.video-list-item[data-index]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.index) === index)));
  }
  for (let index = 0; index < Math.max(3, videos.length); index++) {
    const video = videos[index]; const button = el('button', 'video-list-item'); button.type = 'button';
    const mini = el('span', 'video-mini', video ? String(index + 1).padStart(2, '0') : 'COMING SOON');
    const copy = el('span');
    copy.append(el('strong', '', video ? video.title : '공식 영상 자료 확인 중'));
    copy.append(el('small', '', video ? '공식 게시글 확인 · 선택하여 보기' : '영상 ID 확인 후 연결'));
    if (video) {
      const thumb = image(`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`, `${video.title} 썸네일`);
      thumb.addEventListener('error', () => { thumb.hidden = true; }); mini.append(thumb);
      button.dataset.index = String(index); button.setAttribute('aria-pressed', String(index === 0));
      button.addEventListener('click', () => selectVideo(index));
    } else button.disabled = true;
    button.append(mini, copy); $('#video-list').append(button);
  }
  if (!videos.length) {
    $('#featured-play').disabled = true; $('#featured-title').textContent = '공식 영상 자료 확인 중';
    $('#featured-source').removeAttribute('href');
  }
  $('#featured-play').addEventListener('click', () => openVideo(selectedVideo));
  $$('[data-video]').forEach(button => {
    const index = videos.findIndex(video => video.id === button.dataset.video);
    button.disabled = index < 0;
    button.addEventListener('click', () => { if (index >= 0) openVideo(index); });
  });

  function openImage(items, title, caption) {
    const gallery = $('#image-gallery') || el('div', 'lightbox-images'); gallery.id = 'image-gallery';
    gallery.replaceChildren(...items.map(item => image(item.src, item.alt, false)));
    $('#expanded-image').hidden = true;
    if (!gallery.isConnected) $('#expanded-image').after(gallery);
    $('#image-title').textContent = title; $('#image-caption').textContent = caption || '';
    show($('#image-dialog'));
  }
  const reviews = (content.reviews || []).filter(item => approved(item) && safeURL(item.src) && item.alt);
  if (reviews.length) reviews.forEach(item => {
    const button = el('button', 'review-card'); button.type = 'button';
    button.setAttribute('aria-label', `${item.title || '후기 사진'} 확대 보기`);
    button.append(image(item.src, item.alt), el('span', 'review-caption', item.title || '리얼 셀카 후기'));
    button.addEventListener('click', () => openImage([item], item.title || '리얼 셀카 후기', item.caption));
    $('#review-grid').append(button);
  });
  else for (let i = 0; i < 6; i++) {
    const slot = el('div', 'review-slot');
    const note = el('div'); note.append(el('strong', '', '후기 이미지 슬롯'), el('small', '', '사용 동의 확인 후 연결'));
    slot.append(el('span', 'slot-number', String(i + 1).padStart(2, '0')), note); $('#review-grid').append(slot);
  }
  if (approved(content.doctor) && safeURL(content.doctor.src) && content.doctor.alt) {
    $('#doctor-slot').replaceChildren(image(content.doctor.src, content.doctor.alt));
  }

  const labels = {body:'지방흡입', fat:'지방이식', lifting:'리프팅', petit:'쁘띠시술'};
  let category = 'body'; let caseIndex = 0;
  const cases = () => (content.beforeAfter?.[category] || []).filter(item => approved(item) && safeURL(item.beforeSrc) && safeURL(item.afterSrc));
  function renderCases() {
    const items = cases(); const track = $('#case-track'); track.replaceChildren();
    const previous = el('div', 'case-side'); const center = el('div', 'case-center'); const next = el('div', 'case-side');
    previous.setAttribute('aria-hidden', 'true'); next.setAttribute('aria-hidden', 'true');
    if (!items.length) {
      previous.textContent = 'PREVIOUS'; next.textContent = 'NEXT';
      center.append(el('span', 'case-empty-icon', 'S.'), el('h3', '', `${labels[category]} 사례 준비 중`), el('p', '', '공개 동의와 사용 권한이 확인된 자료를 연결합니다. 현재 등록된 실제 사례는 없습니다.'));
      $('#case-status').textContent = `${labels[category]} · 공개 동의 확인된 사례 미등록`;
    } else {
      caseIndex = ((caseIndex % items.length) + items.length) % items.length;
      const item = items[caseIndex]; center.classList.add('case-image');
      const button = el('button'); button.type = 'button'; button.setAttribute('aria-label', `${item.title || labels[category]} 전후사진 확대 보기`);
      const pair = el('div', 'case-pair'); pair.append(image(item.beforeSrc, item.beforeAlt || '시술 전 사진'), image(item.afterSrc, item.afterAlt || '시술 후 사진'));
      button.append(pair); button.addEventListener('click', () => openImage([{src:item.beforeSrc, alt:item.beforeAlt || '시술 전 사진'}, {src:item.afterSrc, alt:item.afterAlt || '시술 후 사진'}], item.title || labels[category], item.caption));
      center.append(button, el('div', 'case-caption', item.title || labels[category]));
      if (items.length > 1) {
        previous.append(image(items[(caseIndex - 1 + items.length) % items.length].afterSrc, ''));
        next.append(image(items[(caseIndex + 1) % items.length].beforeSrc, ''));
      }
      $('#case-status').textContent = `${labels[category]} · ${caseIndex + 1} / ${items.length}`;
    }
    $('#case-prev').disabled = items.length < 2; $('#case-next').disabled = items.length < 2;
    track.append(previous, center, next);
    $('#ba-panel').setAttribute('aria-labelledby', $(`[data-category="${category}"]`).id);
  }
  function changeCategory(key, focus = false) {
    category = key; caseIndex = 0;
    $$('[data-category]').forEach(button => {
      const active = button.dataset.category === key; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
    }); renderCases();
  }
  $$('[data-category]').forEach(button => {
    button.addEventListener('click', () => changeCategory(button.dataset.category));
    button.addEventListener('keydown', event => {
      const keys = Object.keys(labels); let index = keys.indexOf(category);
      if (event.key === 'ArrowRight') index = (index + 1) % keys.length;
      else if (event.key === 'ArrowLeft') index = (index - 1 + keys.length) % keys.length;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = keys.length - 1;
      else return;
      event.preventDefault(); changeCategory(keys[index], true);
    });
  });
  function moveCase(delta) { if (cases().length > 1) { caseIndex += delta; renderCases(); } }
  $('#case-prev').addEventListener('click', () => moveCase(-1)); $('#case-next').addEventListener('click', () => moveCase(1));
  let gesture = null;
  $('.case-carousel').addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse' && event.isPrimary) gesture = {x:event.clientX,y:event.clientY}; });
  $('.case-carousel').addEventListener('pointerup', event => {
    if (!gesture) return; const dx = event.clientX - gesture.x; const dy = event.clientY - gesture.y; gesture = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) moveCase(dx < 0 ? 1 : -1);
  });
  $('.case-carousel').addEventListener('pointercancel', () => { gesture = null; }); renderCases();

  $$('[data-consult]').forEach(button => button.addEventListener('click', () => show($('#consult-dialog'))));
  $('#consult-location').addEventListener('click', () => close($('#consult-dialog')));
  $('#map-link').href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('서울특별시 중구 명동8나길 9');

  // No scroll interception, long sticky section or perpetual animation loop.
  let queued = false;
  function onFrame() {
    queued = false; $('.site-header').classList.toggle('is-scrolled', scrollY > 100);
    const hero = $('.hero'); const rect = hero.getBoundingClientRect();
    if (motion.matches) $('.hero-photo').style.transform = 'none';
    else if (rect.bottom > 0 && rect.top < innerHeight) $('.hero-photo').style.transform = `translateY(${-rect.top * .22}px)`;
    const doctor = $('#doctor-slot img');
    if (doctor) {
      const bounds = $('#doctor-slot').getBoundingClientRect();
      doctor.style.transform = motion.matches ? 'none' : `translateY(${Math.max(-22, Math.min(22, (innerHeight / 2 - bounds.top - bounds.height / 2) * .045))}px)`;
    }
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(onFrame); } }, {passive:true});
  addEventListener('resize', onFrame); motion.addEventListener('change', onFrame); onFrame();
  const canvas = $('.design-canvas');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { canvas.classList.add('drawn'); observer.unobserve(canvas); }
    }, {threshold:.2}); observer.observe(canvas);
  } else canvas.classList.add('drawn');
})();
