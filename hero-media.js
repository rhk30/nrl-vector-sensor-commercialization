(()=>{'use strict';
const panel=document.querySelector('.scene-panel');if(!panel)return;
const svg=panel.querySelector('svg');if(!svg)return;

// Atmospheric context only. These media do not depict the NRL sensor in use.
// Selection rule: platform-first imagery, no promotional text overlays, and no
// discernible faces. Harbor footage is intentionally preserved unchanged.
const media={
  subsea:{type:'image',src:'https://upload.wikimedia.org/wikipedia/commons/9/99/Flickr_-_Official_U.S._Navy_Imagery_-_USS_Virginia_makes_way_up_the_Thames_River..jpg',position:'50% 48%'},
  fleet:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/2/24/USN_Destroyers_hauling_it.webm',position:'50% 46%'},
  swcc:{type:'image',src:'https://upload.wikimedia.org/wikipedia/commons/4/4f/SBT_22_on_SOC-R_boats.jpg',position:'50% 52%'},
  harbor:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e0/Forward_View_of_CCGS_McIntyre_Bay.webm/Forward_View_of_CCGS_McIntyre_Bay.webm.360p.vp9.webm',position:'50% 50%'}
};

const hardMute=v=>{
  v.muted=true;v.defaultMuted=true;v.volume=0;
  v.setAttribute('muted','');v.setAttribute('playsinline','');
  v.removeAttribute('controls');
};

const layer=document.createElement('div');layer.className='rhk-media-layer';
Object.entries(media).forEach(([id,m])=>{
  const wrap=document.createElement('div');wrap.className='rhk-media-item';wrap.dataset.scene=id;
  if(m.type==='video'){
    const v=document.createElement('video');v.src=m.src;v.loop=true;v.playsInline=true;v.autoplay=false;v.preload='metadata';
    hardMute(v);v.disablePictureInPicture=true;v.setAttribute('aria-hidden','true');v.style.objectPosition=m.position||'50% 50%';
    v.addEventListener('volumechange',()=>{if(!v.muted||v.volume!==0)hardMute(v);});
    wrap.appendChild(v);
  }else{
    const img=document.createElement('img');img.src=m.src;img.alt='';img.loading='eager';img.decoding='async';img.style.objectPosition=m.position||'50% 50%';wrap.appendChild(img);
  }
  layer.appendChild(wrap);
});
panel.insertBefore(layer,svg);
const shade=document.createElement('div');shade.className='rhk-media-shade';panel.insertBefore(shade,svg);

function sync(){
  const active=panel.querySelector('.scene-group.active')?.dataset.scene||'subsea';
  layer.querySelectorAll('.rhk-media-item').forEach(item=>{
    const on=item.dataset.scene===active;item.classList.toggle('active',on);
    const video=item.querySelector('video');
    if(video){hardMute(video);if(on)video.play().catch(()=>{});else video.pause();}
  });
  panel.classList.toggle('has-live-media',!!media[active]);
}
new MutationObserver(sync).observe(panel,{subtree:true,attributes:true,attributeFilter:['class']});
sync();

import('./hero-overlay-rework.js?v=1').catch(err=>console.warn('RHKEARTH hero overlay fallback:',err));
})();