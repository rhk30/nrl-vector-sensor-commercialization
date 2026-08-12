(()=>{'use strict';
const panel=document.querySelector('.scene-panel');if(!panel)return;
const svg=panel.querySelector('svg');if(!svg)return;

// Atmospheric context only. These media do not depict the NRL sensor in use.
// Harbor footage is intentionally preserved exactly as previously selected.
const media={
  subsea:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/6/67/Happy_120th_Birthday_to_the_U.S._Navy_Submarine_Force.webm',position:'50% 50%'},
  fleet:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/1/11/USS_Rafael_Peralta_Enforces_Maritime_Blockade_%281006061%29.webm',position:'52% 50%'},
  swcc:{type:'image',src:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/US_Navy_100915-N-8689C-034_pecial_warfare_combatant-craft_crewmen_%28SWCC%29_assigned_to_Special_Boat_Team_%28SBT%29_20_pilot_an_11-meter_rigid-hull_inflat.jpg/960px-US_Navy_100915-N-8689C-034_pecial_warfare_combatant-craft_crewmen_%28SWCC%29_assigned_to_Special_Boat_Team_%28SBT%29_20_pilot_an_11-meter_rigid-hull_inflat.jpg',position:'55% 50%'},
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
    if(video){
      hardMute(video);
      if(on)video.play().catch(()=>{});else video.pause();
    }
  });
  panel.classList.toggle('has-live-media',!!media[active]);
}
new MutationObserver(sync).observe(panel,{subtree:true,attributes:true,attributeFilter:['class']});
sync();
})();