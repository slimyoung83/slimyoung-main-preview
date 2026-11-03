/* AI design samples only. Existing patient/case data is left untouched. */
(() => {
 'use strict';
 const section=document.querySelector('#before-after.s5-gallery');if(!section)return;
 const items=[{src:'assets/images/before-after/arm-ai-sample.png',title:'팔뚝 지방흡입',period:'수술 후 1개월',alt:'AI 디자인 샘플: 왼쪽 BEFORE 블러와 보라색 슬림영의원 LOGIN 표시, 오른쪽 AFTER. 실제 환자 사례 아님.'}];
 const track=section.querySelector('.s5-track'),carousel=section.querySelector('.s5-carousel'),pause=section.querySelector('.s5-pause');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let index=0,busy=false,paused=reduced.matches,hover=false,focus=false,timer,finishTimer;
 function render(){track.replaceChildren();for(let offset=-2;offset<=2;offset++){const item=items[((index+offset)%items.length+items.length)%items.length];const card=document.createElement('figure');card.className='s5-card'+(offset===0?' is-center':'');if(offset!==0)card.setAttribute('aria-hidden','true');const img=new Image();img.src=item.src;img.alt=item.alt;img.width=1808;img.height=870;img.decoding='async';const caption=document.createElement('figcaption');caption.textContent=item.title;const small=document.createElement('small');small.textContent=item.period;caption.append(small);card.append(img,caption);track.append(card);}}
 function move(direction){if(busy)return;busy=true;const step=track.children[0].getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap);const complete=()=>{if(!busy)return;busy=false;clearTimeout(finishTimer);track.removeEventListener('transitionend',complete);index=(index+direction+items.length)%items.length;track.style.transition='none';track.style.transform='translateX(-50%)';render();section.dataset.moves=String(Number(section.dataset.moves||0)+1);};track.style.transition=reduced.matches?'none':'transform 650ms cubic-bezier(.22,.61,.36,1)';track.style.transform=`translateX(calc(-50% - ${direction*step}px))`;if(reduced.matches)complete();else{track.addEventListener('transitionend',complete,{once:true});finishTimer=setTimeout(complete,850);}}
 function schedule(){clearInterval(timer);if(!paused&&!hover&&!focus&&!document.hidden)timer=setInterval(()=>move(1),5000);}
 section.querySelector('.s5-prev').addEventListener('click',()=>move(-1));section.querySelector('.s5-next').addEventListener('click',()=>move(1));
 pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'자동 롤링 재생':'자동 롤링 일시정지';schedule();});
 carousel.addEventListener('mouseenter',()=>{hover=true;schedule();});carousel.addEventListener('mouseleave',()=>{hover=false;schedule();});
 section.addEventListener('focusin',()=>{focus=true;schedule();});section.addEventListener('focusout',e=>{if(!section.contains(e.relatedTarget)){focus=false;schedule();}});
 document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',()=>{paused=reduced.matches;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'자동 롤링 재생':'자동 롤링 일시정지';schedule();});
 render();pause.setAttribute('aria-pressed',String(paused));if(paused)pause.textContent='자동 롤링 재생';schedule();
})();
