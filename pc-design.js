'use strict';
(() => {
 const desktop=matchMedia('(min-width:1200px)');
 const $=s=>document.querySelector(s);
 const originals=new Map();
 function replace(selector,html){const node=$(selector);if(!node)return;originals.set(node,node.innerHTML);node.innerHTML=html;}
 function apply(){
  if(!desktop.matches||document.body.classList.contains('pc-design'))return;
  document.body.classList.add('pc-design');
  replace('#review-grid','<div class="pc-empty"><h3>등록된 후기가 없습니다.</h3><p>환자의 공개 동의와 사용 권한이 확인된 후기만 게시합니다.</p></div>');
  replace('.doctor-slot','<div class="pc-doctor-empty"><h3>의료진 소개</h3><p>등록된 의료진 사진과 경력 정보가 없습니다.</p></div>');
  replace('.expertise-cards','<a class="pc-text-link" href="#visit">상담 안내 확인하기</a>');
  replace('.design-copy .editorial-copy','하나의 기준보다, 개인의 균형을.');
  const steps=document.createElement('ol');steps.className='pc-steps';steps.innerHTML=['상담','진단·계획','과정 설명','회복 안내'].map((v,i)=>'<li><span>0'+(i+1)+'</span><h3>'+v+'</h3></li>').join('');$('.design-copy').append(steps);
  const empty=document.createElement('div');empty.className='pc-ba-empty';empty.innerHTML='<div><strong>BEFORE</strong><p>등록된 전후사례가 없습니다.</p></div><div><strong>AFTER</strong><p>환자 동의와 사용 권한 확인 후 게시합니다.</p></div>';$('#ba-panel').prepend(empty);
  replace('.visit-details>div:last-child dd','<a href="tel:023182350">방문 전 전화로 진료시간을 확인해 주세요.</a>');
  const address=$('.visit-details>div:first-child dd').textContent.replace(/\s+/g,' ').trim();
  replace('.map-panel','<div class="pc-map-links"><h3>슬림영 오시는 길</h3><p>'+address+'</p><a href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address)+'" target="_blank" rel="noopener noreferrer">지도에서 주소 확인하기 ↗</a><a href="https://slimyoung.co.kr/new2023/mn01/mn01_05.php" target="_blank" rel="noopener noreferrer">공식 오시는 길 ↗</a></div>');
  ['주소','전화','진료시간'].forEach((text,i)=>replace('.visit-details>div:nth-child('+(i+1)+') dt',text));
  const bar=document.createElement('div');bar.className='pc-contact-bar';bar.innerHTML='<span>슬림영 상담</span><a href="tel:023182350">02-318-2350 <span>전화 상담</span></a><a href="#visit">오시는 길</a>';$('.consult-bar').append(bar);
  document.querySelectorAll('.pc-design .quick-action,.pc-design .visit-copy [data-consult]').forEach(node=>{originals.set(node,{disabled:node.disabled});node.disabled=true;node.setAttribute('aria-disabled','true')});
 }
 function restore(){if(desktop.matches)return;document.body.classList.remove('pc-design');for(const [n,value] of originals){if(typeof value==='string')n.innerHTML=value;else{n.disabled=value.disabled;n.removeAttribute('aria-disabled')}}originals.clear();document.querySelectorAll('.pc-steps,.pc-ba-empty,.pc-contact-bar').forEach(n=>n.remove());}
 desktop.addEventListener('change',()=>desktop.matches?apply():restore());apply();
})();
