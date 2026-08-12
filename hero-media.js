(()=>{'use strict';
const panel=document.querySelector('.scene-panel');
if(!panel)return;
const svg=panel.querySelector('svg');
if(!svg)return;

const media={
  subsea:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/6/67/Happy_120th_Birthday_to_the_U.S._Navy_Submarine_Force.webm',source:'U.S. Navy submarine-force footage',credit:'U.S. Navy — public domain',page:'https://commons.wikimedia.org/wiki/File:Happy_120th_Birthday_to_the_U.S._Navy_Submarine_Force.webm',position:'50% 50%'},
  fleet:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/2/2c/Strong_Enough_USN.webm',source:'U.S. Navy fleet footage',credit:"America's Navy — public domain",page:'https://commons.wikimedia.org/wiki/File:Strong_Enough_USN.webm',position:'50% 50%'},
  swcc:{type:'image',src:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/US_Navy_100915-N-8689C-034_pecial_warfare_combatant-craft_crewmen_%28SWCC%29_assigned_to_Special_Boat_Team_%28SBT%29_20_pilot_an_11-meter_rigid-hull_inflat.jpg/960px-US_Navy_100915-N-8689C-034_pecial_warfare_combatant-craft_crewmen_%28SWCC%29_assigned_to_Special_Boat_Team_%28SBT%29_20_pilot_an_11-meter_rigid-hull_inflat.jpg',source:'Special Warfare Combatant-craft Crewmen',credit:'U.S. Navy photo — public domain',page:'https://commons.wikimedia.org/wiki/File:US_Navy_100915-N-8689C-034_pecial_warfare_combatant-craft_crewmen_(SWCC)_assigned_to_Special_Boat_Team_(SBT)_20_pilot_an_11-meter_rigid-hull_inflat.jpg',position:'55% 50%'},
  harbor:{type:'video',src:'https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e0/Forward_View_of_CCGS_McIntyre_Bay.webm/Forward_View_of_CCGS_McIntyre_Bay.webm.360p.vp9.webm',source:'Harbor transit footage',credit:'Extemporalist — CC0',page:'https://commons.wikimedia.org/wiki/File:Forward_View_of_CCGS_McIntyre_Bay.webm',position:'50% 50%'}
};

const layer=document.createElement('div');
layer.className='rhk-media-layer';
Object.entries(media).forEach(([id,m])=>{
  const wrap=document.createElement('div');wrap.className='rhk-media-item';wrap.dataset.scene=id;
  if(m.type==='video'){
    const v=document.createElement('video');
    v.src=m.src;v.muted=true;v.loop=true;v.playsInline=true;v.autoplay=false;v.preload='metadata';
    v.setAttribute('aria-hidden','true');v.style.objectPosition=m.position||'50% 50%';
    wrap.appendChild(v);
  }else{
    const img=document.createElement('img');img.src=m.src;img.alt='';img.loading='eager';img.decoding='async';img.style.objectPosition=m.position||'50% 50%';wrap.appendChild(img);
  }
  layer.appendChild(wrap);
});
panel.insertBefore(layer,svg);

const shade=document.createElement('div');shade.className='rhk-media-shade';panel.insertBefore(shade,svg);
const credit=document.createElement('a');credit.className='rhk-media-credit';credit.target='_blank';credit.rel='noopener';panel.appendChild(credit);

function sync(){
  const active=panel.querySelector('.scene-group.active')?.dataset.scene||'subsea';
  layer.querySelectorAll('.rhk-media-item').forEach(item=>{
    const on=item.dataset.scene===active;
    item.classList.toggle('active',on);
    const video=item.querySelector('video');
    if(video){
      if(on)video.play().catch(()=>{});else video.pause();
    }
  });
  const m=media[active];
  if(m){credit.style.display='block';credit.textContent=m.credit+' · media context only';credit.href=m.page;credit.title=m.source;}
  else{credit.style.display='none';credit.removeAttribute('href');}
  panel.classList.toggle('has-live-media',!!m);
}

new MutationObserver(sync).observe(panel,{subtree:true,attributes:true,attributeFilter:['class']});
panel.querySelectorAll('.scene-btn').forEach(btn=>btn.addEventListener('click',()=>setTimeout(sync,0)));
sync();
})();