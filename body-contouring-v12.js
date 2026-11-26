'use strict';
(() => {
  if (!document.body.classList.contains('body-contouring')) return;
  const nodes = document.querySelectorAll('.bc-reveal');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!motion.matches && 'IntersectionObserver' in window) {
    document.body.classList.add('bc-motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold: .06});
    nodes.forEach(node => observer.observe(node));
    motion.addEventListener('change', event => {
      if (event.matches) { document.body.classList.remove('bc-motion'); observer.disconnect(); }
    });
  }
  const regions = {
    arm: ['팔 지방흡입 상담', '팔의 체형과 피부 상태, 흉터에 대한 고민을 함께 살피며 상담합니다.'],
    abdomen: ['복부 지방흡입 상담', '복부의 고민과 원하는 변화의 방향을 듣고 개인의 상태를 확인합니다.'],
    thigh: ['허벅지 지방흡입 상담', '허벅지의 체형과 고민 부위를 살피며 개인에게 맞는 진료 방향을 상담합니다.'],
    calf: ['종아리 지방흡입 상담', '종아리의 고민 부위와 현재 상태를 확인한 뒤 진료 계획을 상담합니다.'],
    face: ['얼굴 지방흡입 상담', '얼굴의 고민 부위와 원하는 방향을 듣고 현재 상태를 확인합니다.']
  };
  function selectRegion(key) {
    if (!Object.hasOwn(regions, key)) return;
    document.getElementById('region-name').textContent = regions[key][0];
    document.getElementById('region-description').textContent = regions[key][1];
    document.querySelectorAll('[data-region-button]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.regionButton === key)));
    document.querySelectorAll('.bc-region-shapes [data-region]').forEach(dot => dot.classList.toggle('is-active', dot.dataset.region === key));
  }
  document.querySelectorAll('[data-region-button]').forEach(button => button.addEventListener('click', () => selectRegion(button.dataset.regionButton)));
  selectRegion('arm');
})();
