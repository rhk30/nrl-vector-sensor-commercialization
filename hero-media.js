(()=>{'use strict';
const panel=document.querySelector('.scene-panel');if(!panel)return;
const svg=panel.querySelector('svg');if(!svg)return;

// Real platform/environment media is context only. The patent-specific information
// is supplied by hero-overlay-rework.js. Videos remain muted at all times.
const media={
  subsea:{type:'image',src:'https://upload.wikimedia.org/wikipedia/commons/9/99/Flickr_-_Official_U.S._Navy_Imagery_-_USS_Virginia_makes_way_up_the_Thames_River..jpg',position:'50% 48%'},
  fleet:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/2/24/USN_Destroyers_hauling_it.webm',position:'50% 46%'},
  swcc:{type:'image',src:'https://upload.wikimedia.org/wikipedia/commons/4/4f/SBT_22_on_SOC-R_boats.jpg',position:'50% 52%'},
  harbor:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e0/Forward_View_of_CCGS_McIntyre_Bay.webm/Forward_View_of_CCGS_McIntyre_Bay.webm.360p.vp9.webm',position:'50% 50%'}
};

const hardMute=v=>{v.muted=true;v.defaultMuted=true;v.volume=0;v.setAttribute('muted','');v.setAttribute('playsinline','');v.removeAttribute('controls');};
const videos=[];
const layer=document.createElement('div');layer.className='rhk-media-layer';
Object.entries(media).forEach(([id,m])=>{
  const wrap=document.createElement('div');wrap.className='rhk-media-item';wrap.dataset.scene=id;
  if(m.type==='video'){
    const v=document.createElement('video');v.src=m.src;v.loop=true;v.playsInline=true;v.autoplay=true;v.preload='auto';v.disablePictureInPicture=true;v.setAttribute('aria-hidden','true');v.style.objectPosition=m.position||'50% 50%';hardMute(v);
    v.addEventListener('volumechange',()=>{if(!v.muted||v.volume!==0)hardMute(v);});
    // Keep the small set of muted context videos warm so switching scenes is only
    // a composited crossfade rather than a pause/load/restart cycle.
    v.addEventListener('canplay',()=>{if(!document.hidden)v.play().catch(()=>{});},{once:true});
    videos.push(v);wrap.appendChild(v);
  }else{
    const img=document.createElement('img');img.src=m.src;img.alt='';img.loading='eager';img.decoding='async';img.style.objectPosition=m.position||'50% 50%';wrap.appendChild(img);
  }
  layer.appendChild(wrap);
});
panel.insertBefore(layer,svg);
const shade=document.createElement('div');shade.className='rhk-media-shade';panel.insertBefore(shade,svg);

function keepVideosWarm(){videos.forEach(v=>{hardMute(v);if(!document.hidden)v.play().catch(()=>{});else v.pause();});}
function sync(){
  const active=panel.querySelector('.scene-group.active')?.dataset.scene||'subsea';
  layer.querySelectorAll('.rhk-media-item').forEach(item=>item.classList.toggle('active',item.dataset.scene===active));
  panel.classList.toggle('has-live-media',!!media[active]);
  keepVideosWarm();
}
new MutationObserver(sync).observe(panel,{subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',keepVideosWarm);sync();

import('./hero-overlay-rework.js?v=2').catch(err=>console.warn('RHKEARTH hero overlay fallback:',err));
})();