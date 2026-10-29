/* Desktop-only presentation and official YouTube title metadata. No booking/data changes. */
(() => {
  'use strict';
  const section=document.querySelector('.sy-youtube');
  if(!section) return;
  const desktop=matchMedia('(min-width:1200px)');
  const config=window.SLIMYOUNG_CONTENT?.youtube || {};
  const items=(config.items || []).filter(x=>/^[A-Za-z0-9_-]{11}$/.test(x.id));
  const titles=new Map(items.filter(x=>x.title).map(x=>[x.id,x.title]));
  const thumbnails=new Map();
  const requests=new Map();
  const main=section.querySelector('#featured-play');
  const originalImage=section.querySelector('#sy-featured-thumb');
  const choices=[...section.querySelectorAll('.sy-video-choice')];
  const originalLabels=new Map(choices.map(b=>[b,b.getAttribute('aria-label')]));
  const titleNodes=new Map();
  let active=false;
  let generation=0;
  const controllers=new Set();

  function thumbnail(host,id) {
    let img=thumbnails.get(host);
    if(!img) {
      img=document.createElement('img');img.className='sy-pc-thumb';img.alt='';img.decoding='async';
      host.append(img);thumbnails.set(host,img);
    }
    if(img.dataset.videoId===id) return;
    img.dataset.videoId=id;img.hidden=false;
    // maxres is a native 16:9 thumbnail. mqdefault is the 16:9 fallback,
    // unlike hqdefault's 4:3 canvas with baked-in letterboxing.
    const fallback='https://i.ytimg.com/vi/'+id+'/mqdefault.jpg';
    img.onerror=()=>{if(img.src!==fallback) img.src=fallback;else {img.hidden=true;if(host===main)section.classList.remove('sy-pc-thumbnail-ready');}};
    img.onload=()=>{if(img.naturalWidth<320 && img.src!==fallback){img.src=fallback;return;}if(host===main)section.classList.add('sy-pc-thumbnail-ready');};
    img.src='https://i.ytimg.com/vi/'+id+'/maxresdefault.jpg';
  }
  function render() {
    if(!active) return;
    const id=main.dataset.videoId;
    if(id) {thumbnail(main,id);main.setAttribute('aria-label',(titles.get(id)||'영상')+' 재생');}
    choices.forEach(button=>{
      const id=button.dataset.videoId;
      thumbnail(button.querySelector('.sy-choice-thumb'),id);
      const node=titleNodes.get(button);
      node.textContent=titles.get(id)||'';
      button.setAttribute('aria-label',(titles.get(id)||'영상')+' 선택');
    });
  }
  async function loadTitle(id,token) {
    if(titles.has(id)||requests.has(id)) return;
    const controller=new AbortController();controllers.add(controller);
    const timer=setTimeout(()=>controller.abort(),8000);
    const request=(async()=>{
      try {
        const url='https://www.youtube.com/oembed?url='+encodeURIComponent('https://www.youtube.com/watch?v='+id)+'&format=json';
        const response=await fetch(url,{signal:controller.signal,credentials:'omit'});
        if(!response.ok) return;
        const data=await response.json();
        if(data.provider_name!=='YouTube'||typeof data.title!=='string'||!data.title.trim()) return;
        if(!active||token!==generation) return;
        titles.set(id,data.title.trim());render();
      } catch { /* No invented title or visible development caption on failure. */ }
      finally {clearTimeout(timer);controllers.delete(controller);}
    })();
    requests.set(id,request);await request;requests.delete(id);
  }
  function sync() {
    active=desktop.matches;generation++;
    controllers.forEach(c=>c.abort());
    if(active) {
      choices.forEach(button=>{if(!titleNodes.has(button)){const n=document.createElement('strong');n.className='sy-pc-video-title';button.append(n);titleNodes.set(button,n);}});
      render();items.forEach(item=>loadTitle(item.id,generation));
    } else {
      thumbnails.forEach(img=>{img.removeAttribute('src');img.dataset.videoId='';});
      choices.forEach(button=>button.setAttribute('aria-label',originalLabels.get(button)));
      const selected=items.find(x=>x.id===main.dataset.videoId),index=items.indexOf(selected);
      if(selected)main.setAttribute('aria-label',(selected.title||'슬림영 영상 '+String(index+1).padStart(2,'0'))+' 재생');
      section.classList.remove('sy-pc-thumbnail-ready');
    }
  }
  new MutationObserver(()=>{if(active)render();}).observe(main,{attributes:true,attributeFilter:['data-video-id']});
  // The original app still controls selection, playback and all mobile content.
  desktop.addEventListener('change',sync);sync();
})();
