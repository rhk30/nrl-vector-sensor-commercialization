(()=>{'use strict';
const panel=document.querySelector('.scene-panel');if(!panel)return;
const svg=panel.querySelector('svg');if(!svg)return;

const media={
  subsea:{type:'image',src:'https://upload.wikimedia.org/wikipedia/commons/9/99/Flickr_-_Official_U.S._Navy_Imagery_-_USS_Virginia_makes_way_up_the_Thames_River..jpg',position:'50% 48%'},
  fleet:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/2/24/USN_Destroyers_hauling_it.webm',position:'50% 46%'},
  swcc:{type:'image',src:'https://upload.wikimedia.org/wikipedia/commons/4/4f/SBT_22_on_SOC-R_boats.jpg',position:'50% 52%'},
  harbor:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e0/Forward_View_of_CCGS_McIntyre_Bay.webm/Forward_View_of_CCGS_McIntyre_Bay.webm.360p.vp9.webm',position:'50% 50%'}
};
const sceneOrder=['subsea','fleet','swcc','harbor','wind'];

const hardMute=v=>{v.muted=true;v.defaultMuted=true;v.volume=0;v.setAttribute('muted','');v.setAttribute('playsinline','');v.removeAttribute('controls');};
const videoByScene=new Map();
const layer=document.createElement('div');layer.className='rhk-media-layer';
let currentScene='subsea';

function activeWrap(){return layer.querySelector(`.rhk-media-item[data-scene="${currentScene}"]`);}
function showStaticFallback(wrap){
  if(!wrap||!wrap.classList.contains('active'))return;
  wrap.classList.add('media-failed');
  panel.classList.remove('has-live-media');
}
function showLiveMedia(wrap){
  if(!wrap||!wrap.classList.contains('active'))return;
  wrap.classList.remove('media-failed','is-buffering');
  panel.classList.add('has-live-media');
}
function clearFallbackTimer(v){if(v?._rhkFallbackTimer){clearTimeout(v._rhkFallbackTimer);v._rhkFallbackTimer=null;}}
function scheduleFallback(v,delay=2400){
  if(!v)return;
  clearFallbackTimer(v);
  v._rhkFallbackTimer=setTimeout(()=>{
    const wrap=v.closest('.rhk-media-item');
    if(wrap?.classList.contains('active')&&!v.paused&&v.readyState>=3)return;
    showStaticFallback(wrap);
  },delay);
}
function safePlay(v){
  if(!v||document.hidden)return;
  hardMute(v);
  if(v.readyState<2){try{v.load();}catch{}}
  const p=v.play();if(p&&typeof p.catch==='function')p.catch(()=>{scheduleFallback(v,900);});
}
function scheduleRetry(v,delay=650){
  clearTimeout(v._rhkRetryTimer);
  v._rhkRetryTimer=setTimeout(()=>{if(v.closest('.rhk-media-item')?.classList.contains('active'))safePlay(v);},delay);
}
function prime(v){
  if(!v)return;
  hardMute(v);
  if(v.preload!=='auto')v.preload='auto';
  if(v.readyState===0){try{v.load();}catch{}}
}

Object.entries(media).forEach(([id,m])=>{
  const wrap=document.createElement('div');wrap.className='rhk-media-item';wrap.dataset.scene=id;
  if(m.type==='video'){
    const v=document.createElement('video');
    v.src=m.src;v.loop=true;v.playsInline=true;v.autoplay=false;v.preload='metadata';v.disablePictureInPicture=true;v.setAttribute('aria-hidden','true');v.style.objectPosition=m.position||'50% 50%';hardMute(v);
    v.addEventListener('volumechange',()=>{if(!v.muted||v.volume!==0)hardMute(v);});
    v.addEventListener('loadeddata',()=>{wrap.classList.add('is-ready');if(wrap.classList.contains('active'))safePlay(v);});
    v.addEventListener('canplay',()=>{wrap.classList.add('is-ready');if(wrap.classList.contains('active'))safePlay(v);});
    v.addEventListener('playing',()=>{clearFallbackTimer(v);wrap.classList.add('is-playing','is-ready');showLiveMedia(wrap);});
    v.addEventListener('waiting',()=>{wrap.classList.add('is-buffering');scheduleRetry(v,500);scheduleFallback(v,2200);});
    v.addEventListener('stalled',()=>{wrap.classList.add('is-buffering');scheduleRetry(v,850);scheduleFallback(v,1800);});
    v.addEventListener('suspend',()=>{if(wrap.classList.contains('active')&&v.readyState<3){scheduleRetry(v,900);scheduleFallback(v,2200);}});
    v.addEventListener('error',()=>{showStaticFallback(wrap);scheduleRetry(v,1800);});
    videoByScene.set(id,v);wrap.appendChild(v);
  }else{
    const img=document.createElement('img');img.src=m.src;img.alt='';img.loading='eager';img.decoding='async';img.style.objectPosition=m.position||'50% 50%';
    img.addEventListener('load',()=>{wrap.classList.add('is-ready');showLiveMedia(wrap);});
    img.addEventListener('error',()=>showStaticFallback(wrap));
    wrap.appendChild(img);
  }
  layer.appendChild(wrap);
});
panel.insertBefore(layer,svg);
const shade=document.createElement('div');shade.className='rhk-media-shade';panel.insertBefore(shade,svg);

function nextVideoAfter(scene){
  const start=Math.max(0,sceneOrder.indexOf(scene));
  for(let n=1;n<=sceneOrder.length;n++){
    const id=sceneOrder[(start+n)%sceneOrder.length];if(videoByScene.has(id))return videoByScene.get(id);
  }
  return null;
}
function sync(){
  const active=panel.querySelector('.scene-group.active')?.dataset.scene||'subsea';
  if(active===currentScene&&layer.querySelector('.rhk-media-item.active'))return;
  currentScene=active;
  layer.querySelectorAll('.rhk-media-item').forEach(item=>item.classList.toggle('active',item.dataset.scene===active));

  const wrap=activeWrap();
  const m=media[active];
  if(!m){panel.classList.remove('has-live-media');}
  else if(m.type==='image'){
    const img=wrap?.querySelector('img');
    if(img?.complete&&img.naturalWidth>0)showLiveMedia(wrap);else panel.classList.remove('has-live-media');
  }else{
    const v=videoByScene.get(active);
    panel.classList.remove('has-live-media');
    if(v){v.preload='auto';safePlay(v);scheduleFallback(v,2600);}
  }

  videoByScene.forEach((v,id)=>{
    const item=v.closest('.rhk-media-item');
    if(id!==active){clearTimeout(v._rhkRetryTimer);clearFallbackTimer(v);if(!v.paused)v.pause();item?.classList.remove('is-buffering');}
  });
  prime(nextVideoAfter(active));
}

let syncQueued=false;
const observer=new MutationObserver(()=>{
  if(syncQueued)return;syncQueued=true;requestAnimationFrame(()=>{syncQueued=false;sync();});
});
observer.observe(panel,{subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){videoByScene.forEach(v=>{clearFallbackTimer(v);v.pause();});return;}
  const activeVideo=videoByScene.get(currentScene);if(activeVideo){safePlay(activeVideo);scheduleFallback(activeVideo,2600);}prime(nextVideoAfter(currentScene));
});
window.addEventListener('pageshow',()=>{const v=videoByScene.get(currentScene);if(v){safePlay(v);scheduleFallback(v,2600);}});
sync();

import('./hero-overlay-rework.js?v=5')
  .then(()=>import('./hero-overlay-safe.js?v=1'))
  .catch(err=>console.warn('RHKEARTH hero overlay fallback:',err));
})();