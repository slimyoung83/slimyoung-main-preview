(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nodes = document.querySelectorAll('.reveal');
  if (reduced.matches || !('IntersectionObserver' in window)) nodes.forEach(n => n.classList.add('is-visible'));
  else {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {rootMargin:'0px 0px -8% 0px',threshold:0.08});
    nodes.forEach(n => observer.observe(n));
    reduced.addEventListener('change', e => { if(e.matches){nodes.forEach(n=>n.classList.add('is-visible'));observer.disconnect();} });
  }
  const button=document.querySelector('.menu-toggle'), nav=document.querySelector('#brand-nav');
  if (!button || !nav) return;
  const close=()=>{button.setAttribute('aria-expanded','false');nav.classList.remove('is-open');};
  button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
  nav.addEventListener('click',e=>{if(e.target.closest('a'))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&button.getAttribute('aria-expanded')==='true'){close();button.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))close();});
})();
