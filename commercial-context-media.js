(()=>{
'use strict';
const market=document.getElementById('market');
const thesis=market?.querySelector('.thesis-grid');
if(!market||!thesis||market.querySelector('.commercial-context-media'))return;

const reel=document.createElement('section');
reel.className='commercial-context-media';
reel.innerHTML=`
  <div class="ccm-frame">
    <div class="ccm-media" aria-label="Illustrative commercial maritime operating contexts">
      <div class="ccm-item active" data-i="0"><video muted playsinline loop preload="metadata" src="https://upload.wikimedia.org/wikipedia/commons/transcoded/7/73/Container_ship.webm/Container_ship.webm.360p.vp9.webm"></video></div>
      <div class="ccm-item" data-i="1"><video muted playsinline loop preload="metadata" src="https://upload.wikimedia.org/wikipedia/commons/transcoded/1/14/Olieplatform_in_de_Noordzee-4804238.webm/Olieplatform_in_de_Noordzee-4804238.webm.360p.vp9.webm"></video></div>
      <div class="ccm-item" data-i="2"><video muted playsinline loop preload="metadata" src="https://upload.wikimedia.org/wikipedia/commons/transcoded/4/47/Operating_Turbines_04.webm/Operating_Turbines_04.webm.360p.vp9.webm"></video></div>
      <div class="ccm-item" data-i="3"><img alt="Marine seismic airgun array on a research vessel" src="https://upload.wikimedia.org/wikipedia/commons/1/14/Airgun-array_hg.jpg"></div>
      <div class="ccm-item" data-i="4"><video muted playsinline loop preload="metadata" src="https://upload.wikimedia.org/wikipedia/commons/transcoded/9/98/Fishing_Boat-1013831%2C_Dingle_Peninsula%2C_Co._Kerry%2C_Ireland.webm/Fishing_Boat-1013831%2C_Dingle_Peninsula%2C_Co._Kerry%2C_Ireland.webm.360p.vp9.webm"></video></div>
      <div class="ccm-shade"></div>
      <div class="ccm-copy">
        <span class="ccm-kicker">ILLUSTRATIVE COMMERCIAL CONTEXT</span>
        <h3 id="ccmTitle">Commercial shipping</h3>
        <p id="ccmText">Potential sensing context only. No deployment, customer adoption or validated performance is implied.</p>
      </div>
      <div class="ccm-index"><span id="ccmIndex">01 / 05</span><div class="ccm-progress"><i></i></div></div>
    </div>
    <div class="ccm-tabs" aria-label="Commercial context scenes">
      <button class="active" data-i="0">Shipping</button><button data-i="1">Offshore oil & gas</button><button data-i="2">Offshore wind</button><button data-i="3">Marine seismic</button><button data-i="4">Fishing</button>
    </div>
    <div class="ccm-note">Evaluation imagery is illustrative only. These are RHKEARTH commercialization hypotheses, not patent deployment claims or validated sensor installations.</div>
    <details class="ccm-credits"><summary>Media credits</summary><div>
      <a href="https://commons.wikimedia.org/wiki/File:Container_ship.webm" target="_blank" rel="noopener">Container ship / Jan Ainali / CC BY-SA 4.0</a>
      <a href="https://commons.wikimedia.org/wiki/File:Olieplatform_in_de_Noordzee-4804238.webm" target="_blank" rel="noopener">North Sea platforms / Marc Plomp, Stichting Natuurbeelden / CC BY-SA 3.0 NL</a>
      <a href="https://commons.wikimedia.org/wiki/File:Operating_Turbines_04.webm" target="_blank" rel="noopener">Offshore turbines / Bureau of Ocean Energy Management / CC BY-SA 2.0</a>
      <a href="https://commons.wikimedia.org/wiki/File:Airgun-array_hg.jpg" target="_blank" rel="noopener">Marine seismic airgun array / Hannes Grobe / CC BY 3.0</a>
      <a href="https://commons.wikimedia.org/wiki/File:Fishing_Boat-1013831,_Dingle_Peninsula,_Co._Kerry,_Ireland.webm" target="_blank" rel="noopener">Fishing boat / Maoileann / CC BY-SA 4.0</a>
    </div></details>
  </div>`;
thesis.insertAdjacentElement('afterend',reel);

const style=document.createElement('style');
style.textContent=`
.commercial-context-media{margin:30px 0 58px}.ccm-frame{border-top:1px solid rgba(173,185,163,.16);border-bottom:1px solid rgba(173,185,163,.16);padding:26px 0 18px}.ccm-media{position:relative;min-height:410px;overflow:hidden;background:#050706}.ccm-item{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease;pointer-events:none}.ccm-item.active{opacity:1}.ccm-item video,.ccm-item img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0;filter:grayscale(.72) saturate(.55) brightness(.53) contrast(1.08);transform:scale(1.015)}.ccm-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.76) 0%,rgba(0,0,0,.43) 43%,rgba(0,0,0,.19) 72%,rgba(0,0,0,.35) 100%),linear-gradient(0deg,rgba(0,0,0,.56),transparent 54%);pointer-events:none}.ccm-copy{position:absolute;left:4%;bottom:12%;z-index:2;max-width:610px}.ccm-kicker{display:block;margin-bottom:11px;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#a3b09f}.ccm-copy h3{margin:0 0 10px;font-size:36px;line-height:1;letter-spacing:-.045em;color:#f0f1ed}.ccm-copy p{margin:0;max-width:570px;font-size:12px;line-height:1.55;color:#a3aaa2}.ccm-index{position:absolute;right:3.5%;bottom:9%;z-index:2;min-width:160px;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;color:#aab4ac;letter-spacing:.06em}.ccm-progress{height:1px;margin-top:9px;background:rgba(255,255,255,.16);overflow:hidden}.ccm-progress i{display:block;width:0;height:100%;background:#d2d9d4}.ccm-progress i.run{animation:ccmProgress 7s linear forwards}@keyframes ccmProgress{to{width:100%}}.ccm-tabs{display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid rgba(173,185,163,.13)}.ccm-tabs button{appearance:none;border:0;border-right:1px solid rgba(173,185,163,.11);background:#060806;color:#687169;padding:14px 8px;text-align:left;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;cursor:pointer}.ccm-tabs button:last-child{border-right:0}.ccm-tabs button.active{color:#d3d9d4;background:#0b0e0c}.ccm-note{padding-top:13px;color:#687169;font:8.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.025em}.ccm-credits{margin-top:8px;color:#59625b;font:8px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}.ccm-credits summary{cursor:pointer;color:#69736b}.ccm-credits div{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:6px}.ccm-credits a{color:#667168;text-decoration:none;border-bottom:1px solid rgba(120,132,122,.18)}@media(max-width:760px){.ccm-media{min-height:340px}.ccm-copy{left:6%;right:6%;bottom:16%}.ccm-copy h3{font-size:28px}.ccm-index{right:6%;bottom:5%}.ccm-tabs{grid-template-columns:1fr 1fr}.ccm-tabs button{border-bottom:1px solid rgba(173,185,163,.11)}}
`;
document.head.appendChild(style);

const scenes=[
  ['Commercial shipping','Ports, transits and high-traffic waterways are potential evaluation environments for directional acoustic sensing.'],
  ['Offshore oil & gas','Fixed and mobile offshore infrastructure creates a complex acoustic environment worth evaluating only after technical validation.'],
  ['Offshore wind','Construction, operation and environmental monitoring around offshore energy infrastructure are potential dual-use evaluation paths.'],
  ['Marine seismic / airgun activity','Marine seismic surveys are a strong acoustic-source context for evaluating directional observation concepts; no claimed detection performance is implied.'],
  ['Fishing activity','Working vessels and biologically sensitive environments represent another possible observation context, contingent on customer need and validation.']
];
const items=[...reel.querySelectorAll('.ccm-item')],tabs=[...reel.querySelectorAll('.ccm-tabs button')];
const title=reel.querySelector('#ccmTitle'),text=reel.querySelector('#ccmText'),index=reel.querySelector('#ccmIndex'),bar=reel.querySelector('.ccm-progress i');
let active=0,timer=null;
function safePlay(v){if(!v)return;v.muted=true;v.defaultMuted=true;v.volume=0;v.playsInline=true;const p=v.play();if(p?.catch)p.catch(()=>{});}
function show(i){active=(i+items.length)%items.length;items.forEach((el,n)=>{const on=n===active;el.classList.toggle('active',on);const v=el.querySelector('video');if(v){if(on)safePlay(v);else if(!v.paused)v.pause();}});tabs.forEach((b,n)=>b.classList.toggle('active',n===active));title.textContent=scenes[active][0];text.textContent=scenes[active][1];index.textContent=String(active+1).padStart(2,'0')+' / 05';bar.classList.remove('run');void bar.offsetWidth;bar.classList.add('run')}
function restart(){clearInterval(timer);timer=setInterval(()=>show(active+1),7000)}
tabs.forEach((b,i)=>b.addEventListener('click',()=>{show(i);restart()}));
items.forEach(el=>{const v=el.querySelector('video');if(v){v.addEventListener('error',()=>{if(el.classList.contains('active'))show(active+1)});v.addEventListener('canplay',()=>{if(el.classList.contains('active'))safePlay(v)})}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInterval(timer);items.forEach(el=>el.querySelector('video')?.pause())}else{show(active);restart()}});
show(0);restart();
})();