'use strict';
(() => {
 if (window.SLIMYOUNG_UI) return;
 const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const detail=document.body.classList.contains('ui-detail');
 try {
  const templates=window.SLIMYOUNG_UI_TEMPLATES;
  if(!templates)throw new Error('Shared UI templates did not load');
  $$('[data-shared-ui]').forEach(slot=>{
   const name=slot.dataset.sharedUi;
   if(!Object.hasOwn(templates,name))throw new Error('Unknown shared UI slot: '+name);
   const t=document.createElement('template');t.innerHTML=templates[name];
   for(const root of t.content.children)root.classList.add('shared-ui');
   if(slot.id)t.content.firstElementChild.id=slot.id;
   slot.replaceWith(t.content);
  });
  // Resolve anchors after every shared section exists, including local #visit.
  if(detail)$$('.shared-ui a[href^="#"]').forEach(a=>{
   const href=a.getAttribute('href');
   if(href==='#top'||!document.getElementById(href.slice(1)))a.setAttribute('href','index.html'+(href==='#top'?'':href));
  });
  document.body.classList.add('shared-ui-active');
 }catch(error){document.body.dataset.sharedUiError='mount';console.error('[Shared UI]',error);throw error;}
 function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
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
      if (dialog.id === 'video-dialog') $('#player')?.replaceChildren();
      syncLock();
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close(dialog);
    });
  });
  $$('[data-close]').forEach(button => button.addEventListener('click', () => close(document.getElementById(button.dataset.close))));

  const panel = $('#mega-panel');
  const desktopNav = $('.desktop-nav');
  const menuButtons = $$('[data-menu]');
  const menuGroups = [...panel.querySelectorAll('.mega-group')];
  const header = $('.site-header');
  let activeMenu = null;
  let closeTimer = 0;
  let pointerExitTimer = 0;

  const mobileNav = $('#mobile-menu nav');
  menuGroups.forEach(group => {
    const details = el('details');
    const summary = el('summary', '', group.getAttribute('aria-label'));
    const links = el('div', 'mobile-submenu');
    for (const item of group.children) links.append(item.firstElementChild.cloneNode(true));
    details.append(summary, links);
    mobileNav.append(details);
  });

  function hideMega(restoreFocus = false) {
    if (!activeMenu) return;
    clearTimeout(pointerExitTimer);
    const invoker = activeMenu;
    activeMenu = null;
    invoker.setAttribute('aria-expanded', 'false');
    if (restoreFocus) invoker.focus();
    panel.inert = true;
    delete panel.dataset.open;
    clearTimeout(closeTimer);
    if (motion.matches) panel.hidden = true;
    else closeTimer = setTimeout(() => { panel.hidden = true; }, 180);
  }

  function positionMega(button) {
    const bounds = header.getBoundingClientRect();
    const trigger = button.getBoundingClientRect();
    const width = panel.offsetWidth;
    const center = trigger.left - bounds.left + trigger.width / 2;
    const left = Math.max(12, Math.min(center - width / 2, bounds.width - width - 12));
    panel.style.setProperty('--mega-left', left + 'px');
  }

  function showMega(button, focusPanel = false) {
    clearTimeout(pointerExitTimer);
    clearTimeout(closeTimer);
    if (activeMenu !== button) {
      panel.dataset.entry = activeMenu ? 'switch' : 'open';
      activeMenu?.setAttribute('aria-expanded', 'false');
      activeMenu = button;
      button.setAttribute('aria-expanded', 'true');
      menuGroups.forEach(group => { group.hidden = group.dataset.group !== button.dataset.menu; });
    }
    panel.hidden = false;
    positionMega(button);
    panel.inert = false;
    panel.dataset.open = '';
    if (focusPanel) {
      const group = menuGroups.find(item => !item.hidden);
      (group.querySelector('a') || group).focus();
    }
  }

  menuButtons.forEach((button, index) => {
    button.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse') showMega(button);
    });
    button.addEventListener('click', event => {
      if (activeMenu === button && event.detail !== 0 && event.pointerType !== 'mouse') hideMega();
      else showMega(button, event.detail === 0);
    });
    button.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        showMega(button, true);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const offset = event.key === 'ArrowRight' ? 1 : -1;
        const next = menuButtons[(index + offset + menuButtons.length) % menuButtons.length];
        next.focus();
        if (activeMenu) showMega(next);
      }
    });
  });
  header.addEventListener('pointerenter', () => clearTimeout(pointerExitTimer));
  header.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' && !panel.contains(document.activeElement)) {
      pointerExitTimer = setTimeout(() => hideMega(), 100);
    }
  });
  panel.addEventListener('click', event => { if (event.target.closest('a')) hideMega(true); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) hideMega(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeMenu) hideMega(true);
  });
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) hideMega();
  });
  $('.menu-open').addEventListener('click', () => { hideMega(); show($('#mobile-menu')); });
  $('.menu-close').addEventListener('click', () => close($('#mobile-menu')));
  $$('#mobile-menu a').forEach(link => link.addEventListener('click', () => close($('#mobile-menu'))));
  const headerMode = matchMedia('(max-width:1600px)');
  function syncHeaderMode() {
    if (headerMode.matches) hideMega();
    else close($('#mobile-menu'));
  }
  headerMode.addEventListener('change', syncHeaderMode);
  addEventListener('resize', syncHeaderMode);
  new ResizeObserver(() => {
    if (activeMenu) positionMega(activeMenu);
  }).observe(desktopNav);


{
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


}
  $$('[data-consult]').forEach(button => button.addEventListener('click', () => show($('#consult-dialog'))));
  $('#consult-location').addEventListener('click', () => close($('#consult-dialog')));

  // Header-only scroll state. Direction travel accumulates to reject wheel jitter.
  const scrollHeader = $('.site-header');
  const mobileMenu = $('#mobile-menu');
  let headerY = Math.max(0, scrollY), headerDirection = 0, headerTravel = 0;
  let headerState = headerY <= 2 ? 'top-transparent' : 'scroll-visible';
  let headerRestoring = true, headerUserScroll = false;
  // Browser history restoration and layout anchoring are not scroll intent.
  addEventListener('wheel', () => { headerUserScroll = true; }, {passive:true});
  addEventListener('touchmove', () => { headerUserScroll = true; }, {passive:true});
  addEventListener('keydown', event => {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) headerUserScroll = true;
  });
  addEventListener('pointerdown', event => {
    if (event.button === 1 || event.clientX >= document.documentElement.clientWidth - 20) headerUserScroll = true;
  }, {passive:true});
  function paintHeader() {
    const menuOpen = panel.hasAttribute('data-open') || mobileMenu.open;
    const keyboardFocus = scrollHeader.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
    const state = menuOpen ? 'menu-open' : keyboardFocus && headerState === 'scroll-hidden' ? 'scroll-visible' : headerState;
    scrollHeader.dataset.headerState = state;
    scrollHeader.inert = state === 'scroll-hidden';
  }
  function updateHeader() {
    const y = Math.max(0, Math.min(scrollY, document.documentElement.scrollHeight - innerHeight));
    const delta = y - headerY;
    headerY = y;
    if (y <= 2) { headerState = 'top-transparent'; headerTravel = 0; headerDirection = 0; }
    else if (headerRestoring || !headerUserScroll) headerState = 'scroll-visible';
    else if (delta !== 0) {
      const direction = Math.sign(delta);
      if (direction !== headerDirection) { headerDirection = direction; headerTravel = 0; }
      headerTravel += Math.abs(delta);
      if (headerTravel >= 12) headerState = direction > 0 ? 'scroll-hidden' : 'scroll-visible';
    }
    paintHeader();
  }
  new MutationObserver(paintHeader).observe(panel, {attributes:true, attributeFilter:['data-open']});
  new MutationObserver(paintHeader).observe(mobileMenu, {attributes:true, attributeFilter:['open']});
  scrollHeader.addEventListener('focusin', paintHeader);
  scrollHeader.addEventListener('focusout', () => requestAnimationFrame(paintHeader));
  function restoreHeader() {
    headerY = Math.max(0, scrollY); headerDirection = 0; headerTravel = 0;
    headerState = headerY <= 2 ? 'top-transparent' : 'scroll-visible'; paintHeader();
  }
  function settleHeader() {
    headerRestoring = true; headerUserScroll = false; restoreHeader();
    requestAnimationFrame(() => requestAnimationFrame(() => { restoreHeader(); headerRestoring = false; }));
  }
  ['pageshow','popstate','hashchange'].forEach(name => addEventListener(name, settleHeader));
  settleHeader();

 let headerQueued=false;
 addEventListener('scroll',()=>{if(!headerQueued){headerQueued=true;requestAnimationFrame(()=>{headerQueued=false;updateHeader();});}},{passive:true});
 addEventListener('resize',updateHeader);
 window.SLIMYOUNG_UI=Object.freeze({show,close,version:'shared-ui-v2'});
 document.body.dataset.sharedUiReady='true';
})();
