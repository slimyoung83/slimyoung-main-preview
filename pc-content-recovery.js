/* Recover desktop content states without changing patient data or mobile DOM. */
(() => {
  'use strict';
  const desktop=matchMedia('(min-width:1200px)');
  const reviews=document.querySelector('#review-grid');
  const cases=document.querySelector('#case-track');
  const doctor=document.querySelector('#philosophy-doctor');
  if(!reviews||!cases||!doctor) return;
  function contentNode(className) {
    const node=document.createElement('p');
    node.className='pc-restored-content pc-content-empty '+className;
    node.style.display='none';
    node.setAttribute('role','status');
    return node;
  }
  function emptyState(container,populated,text) {
    let state=container.querySelector(':scope > .pc-content-empty');
    if(populated) {if(state)state.remove();return;}
    if(!state) {state=contentNode('');container.append(state);}
    if(state.textContent!==text)state.textContent=text;
  }
  function render() {
    if(!desktop.matches) return;
    emptyState(reviews,!!reviews.querySelector('.review-card'),'등록된 후기가 없습니다.');
    const label=document.querySelector('[data-category][aria-selected="true"]')?.textContent.trim()||'';
    emptyState(cases,!!cases.querySelector('.case-image'),label+' 전후사진이 없습니다.');
    let access=doctor.querySelector('.pc-doctor-access');
    if(!access) {
      access=document.createElement('div');access.className='pc-restored-content pc-doctor-access';access.style.display='none';
      const link=document.createElement('a');link.className='solid-button';
      link.href='https://slimyoung.co.kr/new2023/mn01/mn01_01.php';
      link.target='_blank';link.rel='noopener noreferrer';link.textContent='의료진 소개';
      access.append(link);
    }
    // No replacement portrait, credentials, philosophy or statistics are invented.
    // When a rights-approved portrait exists, retain the original photo/copy columns.
    const parent=doctor.querySelector('#doctor-slot img')?doctor.querySelector('.doctor-copy'):doctor;
    if(access.parentNode!==parent)parent.append(access);
  }
  const observer=new MutationObserver(render);
  function sync() {
    observer.disconnect();
    if(desktop.matches) {
      render();
      [reviews,cases,doctor].forEach(node=>observer.observe(node,{childList:true,subtree:true}));
    } else document.querySelectorAll('.pc-restored-content').forEach(node=>node.remove());
  }
  desktop.addEventListener('change',sync);sync();
})();
