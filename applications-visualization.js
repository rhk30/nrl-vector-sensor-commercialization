(()=>{
'use strict';
if(window.__rhkApplicationsV10)return;
window.__rhkApplicationsV10=true;

const market=document.getElementById('market');
if(!market)return;
market.querySelector('.market-motion')?.remove();
market.querySelector('.market-bridge')?.remove();
const head=market.querySelector('.section-head');

const section=document.createElement('section');
section.className='market-motion market-motion-v10';
section.innerHTML=`
<div class="mm10-stage">
  <div class="mm10-circle">
    <svg class="mm10-scene" viewBox="0 0 800 800" role="img" aria-label="Illustrative maritime operating picture showing three acoustic sources and patent-described moored directional sensing nodes">
      <defs>
        <radialGradient id="m10Bg" cx="50%" cy="34%" r="76%"><stop offset="0" stop-color="#0c1714"/><stop offset="1" stop-color="#020504"/></radialGradient>
        <linearGradient id="m10Water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#173c39" stop-opacity=".28"/><stop offset="1" stop-color="#071714" stop-opacity=".10"/></linearGradient>
        <linearGradient id="m10Floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#15231c"/><stop offset="1" stop-color="#060b08"/></linearGradient>
        <linearGradient id="m10War" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4f5b55"/><stop offset=".5" stop-color="#9da9a2"/><stop offset="1" stop-color="#4b5751"/></linearGradient>
        <linearGradient id="m10Fast" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#28312d"/><stop offset=".52" stop-color="#69756f"/><stop offset="1" stop-color="#333d38"/></linearGradient>
        <linearGradient id="m10Sub" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#121915"/><stop offset=".5" stop-color="#48544d"/><stop offset="1" stop-color="#1b231f"/></linearGradient>
        <filter id="m10Shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity=".58"/></filter>
        <filter id="m10Glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="m10CircleClip"><circle cx="400" cy="400" r="392"/></clipPath>
        <clipPath id="m10WaterClip"><rect x="8" y="276" width="784" height="516"/></clipPath>
      </defs>

      <g clip-path="url(#m10CircleClip)">
        <circle cx="400" cy="400" r="392" fill="url(#m10Bg)"/>

        <g class="mm10-hud" text-anchor="middle">
          <text x="400" y="78" class="mm10-title">HYPOTHETICAL MARITIME OPERATING PICTURE</text>
          <text x="400" y="101" class="mm10-small">ILLUSTRATIVE CONTEXT // NOT A NAVY UI // NOT A DETECTION-RANGE DISPLAY</text>
          <text x="400" y="127" class="mm10-small">DASHED = SOURCE BEARING // SOLID = RECEIVER / DATA PATH</text>
          <text x="400" y="159" class="mm10-legend">SURFACE COMBATANT   •   FAST CRAFT   •   SUBSURFACE PLATFORM</text>
        </g>

        <rect x="0" y="276" width="800" height="524" fill="url(#m10Water)"/>
        <path class="mm10-surface" d="M0 278 C70 270 132 286 201 278 S334 269 405 280 S541 287 612 277 S731 270 800 280"/>
        <path class="mm10-surface-soft" d="M0 288 C74 281 142 294 211 287 S346 279 417 290 S552 296 625 287 S741 280 800 290"/>
        <text x="400" y="259" text-anchor="middle" class="mm10-small">SEA SURFACE // ILLUSTRATIVE</text>

        <path d="M0 646 C64 614 117 633 174 607 C235 579 279 625 339 599 C399 572 449 618 510 590 C569 563 617 605 677 581 C729 560 766 569 800 555 L800 800 L0 800Z" fill="url(#m10Floor)"/>
        <g class="mm10-contours">
          <path d="M8 666 C82 634 126 655 189 626 C248 599 292 643 354 617 C415 591 460 636 524 608 C585 581 631 620 691 597 C738 579 770 584 794 574"/>
          <path d="M12 704 C91 674 141 694 205 666 C267 640 311 681 375 656 C438 631 485 671 550 644 C613 618 662 654 722 632 C759 619 780 621 795 615"/>
          <path d="M18 743 C98 714 154 733 220 706 C285 681 333 721 399 697 C462 674 513 712 578 686 C642 662 695 695 751 676 C773 668 788 669 797 665"/>
        </g>
        <text x="400" y="748" text-anchor="middle" class="mm10-small">SEABED // ILLUSTRATIVE BATHYMETRY</text>

        <g id="m10Acoustic" clip-path="url(#m10WaterClip)">
          <g id="m10WaveWar" class="mm10-wave-group"></g>
          <g id="m10WaveFast" class="mm10-wave-group"></g>
          <g id="m10WaveSub" class="mm10-wave-group"></g>
        </g>

        <polyline id="m10TrailWar" class="mm10-history war" points=""/>
        <polyline id="m10TrailFast" class="mm10-history fast" points=""/>
        <polyline id="m10TrailSub" class="mm10-history sub" points=""/>

        <g id="m10Warship" class="mm10-platform" filter="url(#m10Shadow)">
          <path d="M-72 5 L48 5 L79 -3 L61 -12 L32 -15 L20 -30 L1 -33 L-12 -20 L-40 -17 L-49 -8 L-76 -3Z" fill="url(#m10War)" stroke="#d7e0da" stroke-opacity=".72"/>
          <path d="M-32 -14 L24 -14 L34 -22 L18 -27 L-9 -26Z" fill="#77837d"/>
          <rect x="-4" y="-43" width="14" height="14" rx="1" fill="#a8b1ac"/>
          <path d="M3 -43 L3 -62 M-10 -53 L16 -53" class="mm10-detail"/><rect x="-2" y="-67" width="10" height="5" fill="#bdc6c1"/>
          <circle cx="41" cy="-13" r="4.5" fill="#748079"/><path d="M45 -13 L61 -13" class="mm10-detail"/>
          <path d="M-69 10 Q-27 17 57 11" class="mm10-wake"/>
        </g>

        <g id="m10Fastcraft" class="mm10-platform" filter="url(#m10Shadow)">
          <path d="M-49 5 L33 5 L57 -2 L43 -9 L18 -11 L8 -22 L-14 -23 L-26 -14 L-43 -10 L-55 -2Z" fill="url(#m10Fast)" stroke="#d2dbd5" stroke-opacity=".64"/>
          <path d="M-18 -19 L11 -19 L23 -12 L-27 -12Z" fill="#64706a"/><path d="M-6 -20 L-6 -36 M-18 -29 L8 -29" class="mm10-detail"/>
          <path d="M-54 9 Q-20 16 40 10" class="mm10-wake"/>
        </g>

        <g id="m10Submarine" class="mm10-platform" filter="url(#m10Shadow)">
          <path d="M-88 0 C-74 -19 -43 -25 8 -24 C47 -23 74 -14 90 0 C74 14 47 23 8 24 C-43 25 -74 19 -88 0Z" fill="url(#m10Sub)" stroke="#acb8b1" stroke-opacity=".58"/>
          <path d="M-8 -22 L1 -40 L18 -40 L26 -21Z" fill="#354039" stroke="#95a199" stroke-opacity=".5"/><rect x="8" y="-52" width="3" height="12" fill="#87938c"/>
          <path d="M-59 -3 L-87 -16 L-65 1Z" fill="#29322d"/><path d="M-59 3 L-87 16 L-65 -1Z" fill="#29322d"/><path d="M69 -4 L94 -14 L80 2Z" fill="#29322d"/><path d="M69 4 L94 14 L80 -2Z" fill="#29322d"/>
        </g>

        <line id="m10BearingWar" x1="235" y1="520" x2="300" y2="276" class="mm10-bearing"/>
        <line id="m10BearingFast" x1="600" y1="510" x2="570" y2="278" class="mm10-bearing"/>
        <line id="m10BearingSub" x1="420" y1="535" x2="390" y2="420" class="mm10-bearing strong"/>

        <g class="mm10-node secondary" transform="translate(235 520) scale(.82)">
          <ellipse cx="0" cy="0" rx="29" ry="23" class="base"/><rect x="-6" y="-44" width="12" height="20" rx="2" class="meter"/><rect x="-6" y="24" width="12" height="20" rx="2" class="meter"/><rect x="-47" y="-6" width="20" height="12" rx="2" class="meter"/><rect x="27" y="-6" width="20" height="12" rx="2" class="meter"/><line x1="0" y1="24" x2="0" y2="88" class="tether"/><path d="M-18 97 L18 97 L27 113 L-27 113Z" class="anchor"/><circle r="53" class="ring"/><circle r="76" class="ring outer"/>
        </g>

        <g id="m10PrimaryNode" class="mm10-node primary" transform="translate(420 535)" filter="url(#m10Glow)">
          <ellipse cx="0" cy="0" rx="38" ry="30" class="base"/>
          <rect x="-8" y="-58" width="16" height="26" rx="3" class="meter"/><rect x="-8" y="32" width="16" height="26" rx="3" class="meter"/><rect x="-60" y="-8" width="26" height="16" rx="3" class="meter"/><rect x="34" y="-8" width="26" height="16" rx="3" class="meter"/>
          <line x1="0" y1="30" x2="0" y2="104" class="tether"/><path d="M-23 115 L23 115 L34 135 L-34 135Z" class="anchor"/>
          <circle r="69" class="ring"/><circle r="96" class="ring outer"/>
        </g>
        <text x="420" y="430" text-anchor="middle" class="mm10-node-title">PATENT-DESCRIBED NODE</text>
        <text x="420" y="448" text-anchor="middle" class="mm10-node-copy">102 BASE  •  104 FLOW METERS  •  106 RETAINING THREAD  •  108 ANCHOR</text>

        <g class="mm10-node secondary" transform="translate(600 510) scale(.78)">
          <ellipse cx="0" cy="0" rx="29" ry="23" class="base"/><rect x="-6" y="-44" width="12" height="20" rx="2" class="meter"/><rect x="-6" y="24" width="12" height="20" rx="2" class="meter"/><rect x="-47" y="-6" width="20" height="12" rx="2" class="meter"/><rect x="27" y="-6" width="20" height="12" rx="2" class="meter"/><line x1="0" y1="24" x2="0" y2="78" class="tether"/><path d="M-18 87 L18 87 L27 103 L-27 103Z" class="anchor"/><circle r="53" class="ring"/><circle r="76" class="ring outer"/>
        </g>

        <line x1="420" y1="535" x2="650" y2="180" class="mm10-data"/>
        <circle cx="650" cy="180" r="5" class="mm10-receiver-dot"/>
        <text x="665" y="176" class="mm10-small">EXTERNAL RECEIVER / CONTROLLER</text>
        <text x="400" y="704" text-anchor="middle" class="mm10-foot">PLATFORM MOTION + WAVEFRONTS ARE ILLUSTRATIVE // NO RANGE, SNR OR CLASSIFICATION CLAIM</text>
      </g>
    </svg>
  </div>
</div>
<div class="mm10-copy">
  <span class="mm10-kicker">PATENT IN CONTEXT</span>
  <h3>Directional sensing in a maritime scene.</h3>
  <p>The patent-described node is enlarged for legibility. Dashed lines show source-bearing geometry; animated rings show qualitative acoustic fields reaching the nodes. Platforms, motion and bathymetry are illustrative context only.</p>
  <div class="mm10-boundary"><b>PATENT-DESCRIBED</b><span>102 floating base · 104 flow meters · 106 retaining thread · 108 anchor · external receiver path</span></div>
  <div class="mm10-boundary"><b>NOT CLAIMED HERE</b><span>detection range · SNR · classification · fielded Navy performance</span></div>
</div>`;

if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');
style.textContent=`
.market-motion-v10{display:grid;grid-template-columns:minmax(560px,1.08fr) minmax(350px,.72fr);gap:54px;align-items:center;margin:28px 0 48px;padding:8px 0 30px}.mm10-stage{display:flex;align-items:center;justify-content:center;min-height:690px}.mm10-circle{width:min(720px,97%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(198,211,202,.28);background:#030705;box-shadow:0 26px 110px rgba(0,0,0,.52),inset 0 0 120px rgba(0,0,0,.24)}.mm10-scene{display:block;width:100%;height:100%}.mm10-title,.mm10-small,.mm10-legend,.mm10-node-title,.mm10-node-copy,.mm10-foot{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.055em}.mm10-title{font-size:12px;font-weight:700;fill:#d8e2dc}.mm10-small{font-size:8px;fill:#91a198}.mm10-legend{font-size:8.5px;fill:#bac7c0}.mm10-surface{fill:none;stroke:#c4d7d0;stroke-width:1.7;stroke-opacity:.46}.mm10-surface-soft{fill:none;stroke:#819c94;stroke-width:1;stroke-opacity:.18}.mm10-contours path{fill:none;stroke:#81958a;stroke-width:1;stroke-opacity:.13}.mm10-detail{fill:none;stroke:#dbe3de;stroke-width:1.4;stroke-opacity:.7}.mm10-wake{fill:none;stroke:#d9e5de;stroke-width:1.1;stroke-opacity:.14}.mm10-history{fill:none;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:2 8}.mm10-history.war{stroke:#bbc7c0;stroke-opacity:.12}.mm10-history.fast{stroke:#9fafa7;stroke-opacity:.11}.mm10-history.sub{stroke:#8ea197;stroke-opacity:.10}.mm10-wave{fill:none;stroke:#d5e1da;stroke-width:1.05}.mm10-wave.war{stroke-opacity:.18}.mm10-wave.fast{stroke-opacity:.15}.mm10-wave.sub{stroke-opacity:.22}.mm10-bearing{stroke:#c8d3cc;stroke-width:1;stroke-opacity:.24;stroke-dasharray:5 7}.mm10-bearing.strong{stroke-opacity:.42}.mm10-data{stroke:#d1ddd6;stroke-width:1.25;stroke-opacity:.38}.mm10-receiver-dot{fill:#d9e3dd}.mm10-node .base{fill:#111b17;stroke:#e0e9e3;stroke-width:1.7;stroke-opacity:.9}.mm10-node .meter{fill:#bdcbc2;stroke:#f3f6f4;stroke-width:1;stroke-opacity:.85}.mm10-node .tether{stroke:#c8d2cb;stroke-width:1.45;stroke-dasharray:5 5;stroke-opacity:.7}.mm10-node .anchor{fill:#46564d;stroke:#ccd7d0;stroke-width:1.2;stroke-opacity:.8}.mm10-node .ring{fill:none;stroke:#d6e1da;stroke-width:1.2;stroke-opacity:.34}.mm10-node .ring.outer{stroke-opacity:.14}.mm10-node.secondary{opacity:.78}.mm10-node.primary .base{stroke-width:2.4;stroke-opacity:1}.mm10-node.primary .meter{fill:#d4dfd8;stroke:#fff;stroke-opacity:.96}.mm10-node.primary .ring{stroke-opacity:.55}.mm10-node.primary .ring.outer{stroke-opacity:.25}.mm10-node-title{font-size:10px;font-weight:700;fill:#eef4f0}.mm10-node-copy{font-size:7.1px;fill:#b6c3bc}.mm10-foot{font-size:7.2px;fill:#7f8e86}.mm10-copy{padding-right:3%;max-width:650px}.mm10-kicker{display:block;margin-bottom:16px;font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9daa99}.mm10-copy h3{margin:0 0 14px;font-size:32px;line-height:1.02;letter-spacing:-.04em}.mm10-copy>p{margin:0 0 26px;color:#969e96;font-size:13px;line-height:1.62;max-width:590px}.mm10-boundary{display:grid;grid-template-columns:132px 1fr;gap:18px;padding:15px 0;border-top:1px solid rgba(169,181,155,.14);font:9.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;color:#89948c}.mm10-boundary b{color:#c7d1cb;font-weight:600;letter-spacing:.05em}.mm10-boundary span{color:#879188}@media(max-width:1000px){.market-motion-v10{grid-template-columns:1fr;gap:24px}.mm10-stage{min-height:auto}.mm10-circle{width:min(680px,90vw)}.mm10-copy{padding:0 6%;max-width:none}.mm10-copy h3{font-size:27px}}@media(max-width:620px){.mm10-circle{width:94vw}.mm10-title{font-size:10px}.mm10-small{font-size:6.8px}.mm10-legend{font-size:7px}.mm10-node-copy{display:none}.mm10-copy h3{font-size:23px}.mm10-copy>p{font-size:12px}.mm10-boundary{grid-template-columns:1fr;gap:6px}}
`;
document.head.appendChild(style);

const svg=section.querySelector('.mm10-scene');
const ns='http://www.w3.org/2000/svg';
const groups={war:svg.querySelector('#m10WaveWar'),fast:svg.querySelector('#m10WaveFast'),sub:svg.querySelector('#m10WaveSub')};
const waves={};
for(const key of ['war','fast','sub']){
  waves[key]=[];
  for(let i=0;i<4;i++){
    const c=document.createElementNS(ns,'circle');c.setAttribute('class',`mm10-wave ${key}`);groups[key].appendChild(c);waves[key].push(c);
  }
}
const war=svg.querySelector('#m10Warship'),fast=svg.querySelector('#m10Fastcraft'),sub=svg.querySelector('#m10Submarine');
const bw=svg.querySelector('#m10BearingWar'),bf=svg.querySelector('#m10BearingFast'),bs=svg.querySelector('#m10BearingSub');
const tw=svg.querySelector('#m10TrailWar'),tf=svg.querySelector('#m10TrailFast'),ts=svg.querySelector('#m10TrailSub');

let last=performance.now();
// Slow, one-way-looking transit during any normal review session. The underlying
// paths remain bounded, but the first mathematical turnarounds are pushed well
// beyond a typical presentation so platforms never appear to ping-pong or flip.
let pwPhase=.20,pfPhase=3.30,psPhase=.30;
const trails={war:[],fast:[],sub:[]};
let dirWar=1,dirFast=-1,dirSub=1;
function warPos(a){return{x:305+120*Math.sin(a),y:274+2.1*Math.sin(a*.63)+1.2*Math.sin(a*1.41)}}
function fastPos(a){return{x:590+66*Math.sin(a),y:278+1.7*Math.sin(a*.77)+.8*Math.sin(a*1.63)}}
function subPos(a){return{x:405+165*Math.sin(a),y:405+15*Math.sin(a*.43)+4*Math.sin(a*1.17)}}
function derivative(fn,a){const p=fn(a-.006),q=fn(a+.006);return{x:q.x-p.x,y:q.y-p.y}}
function setUpright(el,p,d,s){if(Math.abs(d.x)>.003){if(el===fast)dirFast=d.x>=0?1:-1;else if(el===war)dirWar=d.x>=0?1:-1;else dirSub=d.x>=0?1:-1;}const dir=el===fast?dirFast:el===war?dirWar:dirSub;el.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) scale(${(dir*s).toFixed(3)} ${s.toFixed(3)})`)}
function updateTrail(arr,p,max){const lastPt=arr[arr.length-1];if(!lastPt||Math.hypot(lastPt.x-p.x,lastPt.y-p.y)>5.5){arr.push({x:p.x,y:p.y});if(arr.length>max)arr.shift()}}
function drawTrail(el,arr){el.setAttribute('points',arr.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '))}
function setWaves(key,p,now,period,maxR){waves[key].forEach((c,i)=>{const ph=((now/1000+i*period/4)%period)/period;const r=14+ph*maxR;c.setAttribute('cx',p.x.toFixed(1));c.setAttribute('cy',p.y.toFixed(1));c.setAttribute('r',r.toFixed(1));c.style.opacity=String((1-ph)*.45)})}
function frame(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  pwPhase+=dt*.00070;pfPhase+=dt*.00080;psPhase+=dt*.00065;
  const pW=warPos(pwPhase),pF=fastPos(pfPhase),pS=subPos(psPhase);
  setUpright(war,pW,derivative(warPos,pwPhase),.76);
  setUpright(fast,pF,derivative(fastPos,pfPhase),.70);
  setUpright(sub,pS,derivative(subPos,psPhase),.76);
  bw.setAttribute('x2',pW.x);bw.setAttribute('y2',pW.y+5);
  bf.setAttribute('x2',pF.x);bf.setAttribute('y2',pF.y+5);
  bs.setAttribute('x2',pS.x);bs.setAttribute('y2',pS.y);
  updateTrail(trails.war,pW,32);updateTrail(trails.fast,pF,28);updateTrail(trails.sub,pS,36);
  drawTrail(tw,trails.war);drawTrail(tf,trails.fast);drawTrail(ts,trails.sub);
  setWaves('war',{x:pW.x,y:pW.y+4},now,12,138);
  setWaves('fast',{x:pF.x,y:pF.y+4},now+1700,10.5,120);
  setWaves('sub',pS,now+3300,13.5,150);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();