'use strict';
// Only this page's in-document navigation. No analytics, forms or data storage.
(() => {
  const root = document.querySelector('.safety-page');
  if (!root || root.dataset.safetyReady) return;
  root.dataset.safetyReady = 'true';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  root.querySelectorAll('.safety-discover,.safety-index a').forEach(link => {
    link.addEventListener('click', event => {
      const target = document.getElementById(link.hash.slice(1));
      if (!target) return;
      event.preventDefault();
      history.replaceState(null, '', link.hash);
      target.scrollIntoView({behavior:reduced.matches ? 'instant' : 'smooth',block:'start'});
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
    });
  });
})();
