(()=>{
'use strict';
if(window.__rhkApplicationsStarted)return;
window.__rhkApplicationsStarted=true;

const market=document.getElementById('market');
if(!market)return;
market.querySelector('.market-motion')?.remove();
market.querySelector('.market-bridge')?.remove();
const head=market.querySelector('.section-head');

const section=document.createElement('section');
section.className='market-motion market-motion-v7';
section.innerHTML=`
  <div class="mm-stage">
    <div class="mm-circle" aria-label="Illustrative maritime operating picture using patent-described sensing architecture">
      <svg class="mm-scene" viewBox="0 0 800 800" role="img" aria-label="Continuous maritime operating picture with surface combatant, fast craft, submarine, and patent-described moored vector-sensor locators">
        <defs>
          <radialGradient id="mm7Bg" cx="50%" cy="42%" r="72%">
            <stop offset="0" stop-color="#0b1916"/><stop offset=".62" stop-color="#06100e"/><stop offset="1" stop-color="#020504"/>
          </radialGradient>
          <linearGradient id="mm7Water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#5f9991" stop-opacity=".10"/><stop offset=".38" stop-color="#2f625d" stop-opacity=".075"/><stop offset="1" stop-color="#17322e" stop-opacity=".025"/>
          </linearGradient>
          <linearGradient id="mm7War" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#52605a"/><stop offset=".45" stop-color="#929e98"/><stop offset=".82" stop-color="#65736d"/><stop offset="1" stop-color="#c1cbc6"/>
          </linearGradient>
          <linearGradient id="mm7Fast" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#1d2521"/><stop offset=".55" stop-color="#4a5751"/><stop offset="1" stop-color="#7c8982"/>
          </linearGradient>
          <linearGradient id="mm7Sub" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#111713"/><stop offset=".48" stop-color="#303a35"/><stop offset=".82" stop-color="#1f2824"/><stop offset="1" stop-color="#69766f"/>
          </linearGradient>
          <filter id="mm7Shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity=".6"/>
          </filter>
          <filter id="mm7Glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="mm7Clip"><circle cx="400" cy="400" r="393"/></clipPath>
        </defs>

        <g clip-path="url(#mm7Clip)">
          <circle cx="400" cy="400" r="393" fill="url(#mm7Bg)"/>

          <!-- bathymetry: no pseudo-3D grid, just restrained topographic depth cues -->
          <g class="mm-bathy">
            <path d="M42 615 C112 555 172 584 231 548 C287 514 335 559 390 531 C452 499 490 454 555 475 C619 495 663 452 759 430"/>
            <path d="M25 654 C108 589 168 622 242 581 C301 548 347 594 414 558 C483 521 521 480 589 500 C648 517 702 475 781 456"/>
            <path d="M18 698 C93 638 175 668 257 623 C327 585 373 630 447 594 C520 558 570 520 642 541 C704 558 746 521 790 503"/>
            <path d="M24 744 C117 690 189 719 282 673 C354 637 407 682 479 648 C551 614 610 575 681 596 C735 612 770 590 798 574"/>
            <path d="M112 550 C158 514 215 510 264 535" class="ridge"/>
            <path d="M454 503 C510 455 588 451 652 482" class="ridge"/>
            <path d="M303 643 C350 608 406 607 457 634" class="ridge faint"/>
            <path d="M560 663 C608 626 676 628 720 650" class="ridge faint"/>
          </g>
          <text x="74" y="676" class="mm-depth-label">VARIED BATHYMETRY // ILLUSTRATIVE</text>

          <!-- low-opacity water column / surface texture -->
          <rect x="0" y="0" width="800" height="800" fill="url(#mm7Water)"/>
          <g class="mm-surface-texture">
            <path d="M55 184 C128 172 187 194 255 182 S385 170 451 185 S583 197 648 183 S739 175 785 185"/>
            <path d="M44 199 C121 187 195 208 273 197 S402 187 480 200 S610 211 681 197 S751 191 790 200" class="soft"/>
          </g>
          <text x="74" y="160" class="mm-svg-micro">SURFACE TRACKS // ILLUSTRATIVE PLATFORM CONTEXT</text>

          <!-- history trails: updated continuously in JS -->
          <polyline id="mmTrailWar" class="mm-history war" points=""/>
          <polyline id="mmTrailFast" class="mm-history fast" points=""/>
          <polyline id="mmTrailSub" class="mm-history sub" points=""/>

          <!-- patent node locators; enlarged only so the architecture can be read -->
          <g id="mmNodeA" class="mm-node" transform="translate(250 492)">
            <circle r="27" class="mm-node-body"/><circle r="45" class="mm-node-ring"/><circle r="66" class="mm-node-ring outer"/>
            <circle r="10" class="mm-base"/><text x="0" y="3" text-anchor="middle" class="mm-node-num">102</text>
            <rect x="-5" y="-44" width="10" height="18" rx="2" class="mm-meter"/><rect x="-5" y="26" width="10" height="18" rx="2" class="mm-meter"/><rect x="-44" y="-5" width="18" height="10" rx="2" class="mm-meter"/><rect x="26" y="-5" width="18" height="10" rx="2" class="mm-meter"/>
            <line x1="0" y1="44" x2="0" y2="92" class="mm-tether"/><path d="M-17 101 L17 101 L25 116 L-25 116Z" class="mm-anchor"/>
            <text x="48" y="-28" class="mm-node-num">104</text><text x="8" y="79" class="mm-node-num">106</text><text x="30" y="115" class="mm-node-num">108</text>
            <circle r="77" class="mm-pulse p1"/><circle r="100" class="mm-pulse p2"/>
          </g>
          <g id="mmNodeB" class="mm-node" transform="translate(545 500)">
            <circle r="27" class="mm-node-body"/><circle r="45" class="mm-node-ring"/><circle r="66" class="mm-node-ring outer"/>
            <circle r="10" class="mm-base"/>
            <rect x="-5" y="-44" width="10" height="18" rx="2" class="mm-meter"/><rect x="-5" y="26" width="10" height="18" rx="2" class="mm-meter"/><rect x="-44" y="-5" width="18" height="10" rx="2" class="mm-meter"/><rect x="26" y="-5" width="18" height="10" rx="2" class="mm-meter"/>
            <line x1="0" y1="44" x2="0" y2="92" class="mm-tether"/><path d="M-17 101 L17 101 L25 116 L-25 116Z" class="mm-anchor"/>
            <circle r="77" class="mm-pulse p2"/><circle r="100" class="mm-pulse p3"/>
          </g>
          <g id="mmNodeC" class="mm-node" transform="translate(395 645)">
            <circle r="27" class="mm-node-body"/><circle r="45" class="mm-node-ring"/><circle r="66" class="mm-node-ring outer"/>
            <circle r="10" class="mm-base"/>
            <rect x="-5" y="-44" width="10" height="18" rx="2" class="mm-meter"/><rect x="-5" y="26" width="10" height="18" rx="2" class="mm-meter"/><rect x="-44" y="-5" width="18" height="10" rx="2" class="mm-meter"/><rect x="26" y="-5" width="18" height="10" rx="2" class="mm-meter"/>
            <line x1="0" y1="44" x2="0" y2="82" class="mm-tether"/><path d="M-17 91 L17 91 L25 106 L-25 106Z" class="mm-anchor"/>
            <circle r="77" class="mm-pulse p3"/><circle r="100" class="mm-pulse p1"/>
          </g>

          <!-- source-to-node bearing geometry: endpoints updated every frame -->
          <line id="mmBearingWar" x1="250" y1="492" x2="400" y2="220" class="mm-bearing"/>
          <line id="mmBearingFast" x1="545" y1="500" x2="400" y2="340" class="mm-bearing"/>
          <line id="mmBearingSub" x1="395" y1="645" x2="400" y2="560" class="mm-bearing"/>

          <!-- surface combatant, top-down planform -->
          <g id="mmWarship" class="mm-vessel warship" filter="url(#mm7Shadow)">
            <g class="mm-vessel-body">
              <path d="M-91 -13 C-67 -17 -19 -18 35 -15 L67 -8 L96 0 L67 8 L35 15 C-19 18 -67 17 -91 13 L-102 0Z" fill="url(#mm7War)" stroke="#dde5e0" stroke-opacity=".76"/>
              <path d="M-52 -9 L23 -9 L45 -5 L45 5 L23 9 L-52 9Z" fill="#69766f"/>
              <path d="M-24 -7 L9 -7 L26 -3 L26 3 L9 7 L-24 7Z" fill="#a1aba6"/>
              <rect x="-4" y="-5" width="22" height="10" rx="1.5" fill="#bac3be"/>
              <path d="M-30 -10 L-30 -22 M-39 -18 L-20 -18" class="mm-detail"/>
              <rect x="-35" y="-20" width="9" height="5" fill="#c5cdc9"/>
              <circle cx="48" cy="0" r="6" fill="#69756f"/><path d="M54 0 L74 0" class="mm-detail"/>
              <g class="mm-vls"><rect x="-61" y="-6" width="5" height="4"/><rect x="-54" y="-6" width="5" height="4"/><rect x="-61" y="2" width="5" height="4"/><rect x="-54" y="2" width="5" height="4"/></g>
              <path d="M-92 -6 Q-118 -4 -139 0 Q-118 4 -92 6" class="mm-wake"/>
              <path d="M-90 -10 Q-127 -8 -153 -4" class="mm-wake thin"/><path d="M-90 10 Q-127 8 -153 4" class="mm-wake thin"/>
            </g>
          </g>

          <!-- fast craft / SWCC-style context, top-down -->
          <g id="mmFastcraft" class="mm-vessel fastcraft" filter="url(#mm7Shadow)">
            <g class="mm-vessel-body">
              <path d="M-64 -12 C-43 -16 -9 -16 30 -12 L53 -7 L72 0 L53 7 L30 12 C-9 16 -43 16 -64 12 L-76 0Z" fill="url(#mm7Fast)" stroke="#cbd5cf" stroke-opacity=".68"/>
              <path d="M-25 -9 L15 -9 L35 -4 L35 4 L15 9 L-25 9Z" fill="#56635d"/>
              <rect x="-9" y="-6" width="22" height="12" rx="2" fill="#75827b"/>
              <path d="M-9 -7 L-9 -18 M-16 -15 L2 -15" class="mm-detail"/>
              <rect x="-57" y="-12" width="17" height="4" rx="2" fill="#161d19"/><rect x="-57" y="8" width="17" height="4" rx="2" fill="#161d19"/>
              <circle cx="42" cy="0" r="4" fill="#737f79"/>
              <path d="M-66 -5 Q-88 -3 -109 0 Q-88 3 -66 5" class="mm-wake"/>
              <path d="M-64 -9 Q-97 -7 -120 -4" class="mm-wake thin"/><path d="M-64 9 Q-97 7 -120 4" class="mm-wake thin"/>
            </g>
          </g>

          <!-- submarine planform, fixed upright orientation relative to heading -->
          <g id="mmSubmarine" class="mm-vessel submarine" filter="url(#mm7Shadow)">
            <g class="mm-vessel-body">
              <path d="M-101 0 C-88 -18 -54 -23 9 -22 C55 -21 85 -13 103 0 C85 13 55 21 9 22 C-54 23 -88 18 -101 0Z" fill="url(#mm7Sub)" stroke="#aab6af" stroke-opacity=".62"/>
              <rect x="-8" y="-7" width="28" height="14" rx="6" fill="#39443f"/>
              <path d="M-7 -18 L13 -18 L22 -7 L-7 -7Z" fill="#46534c"/>
              <path d="M-73 -5 L-99 -21 L-80 -2Z" fill="#2b3530"/><path d="M-73 5 L-99 21 L-80 2Z" fill="#2b3530"/>
              <path d="M78 -5 L106 -17 L91 0Z" fill="#2b3530"/><path d="M78 5 L106 17 L91 0Z" fill="#2b3530"/>
              <circle cx="102" cy="0" r="8" fill="none" stroke="#707d76" stroke-width="2"/>
              <path d="M-100 -4 Q-127 -2 -150 0 Q-127 2 -100 4" class="mm-subtrail"/>
              <path d="M-97 -8 Q-134 -7 -160 -4" class="mm-subtrail thin"/><path d="M-97 8 Q-134 7 -160 4" class="mm-subtrail thin"/>
            </g>
          </g>

          <text x="96" y="103" class="mm-svg-label">MARITIME OPERATING PICTURE // CONCEPT</text>
          <text x="96" y="125" class="mm-svg-micro">PATENT-GROUNDED NODE ARCHITECTURE + ILLUSTRATIVE PLATFORM CONTEXT</text>
          <text x="96" y="715" class="mm-svg-micro">PATENT LOCATORS ENLARGED FOR LEGIBILITY // HARDWARE SCALE IS NOT SHARED WITH PLATFORM SILHOUETTES</text>
          <text x="96" y="737" class="mm-svg-micro">DASHED = SOURCE-TO-NODE BEARING GEOMETRY // NO RANGE, SNR OR CLASSIFICATION CLAIM</text>
        </g>
      </svg>
    </div>
  </div>

  <div class="mm-copy">
    <span class="mm-kicker">DEFENSE FIRST // PATENT IN CONTEXT</span>
    <div class="mm-point"><h3>Continuous maritime picture</h3><p>Surface and subsurface platforms remain continuously in scene on separated transit patterns. Their motion is illustrative context only; there is no simulated detection probability, range or classification.</p></div>
    <div class="mm-point"><h3>Patent-described moored node</h3><p>The enlarged locator preserves the disclosed FIG. 1 relationships: floating base <b>102</b>, flow meters <b>104</b>, retaining thread <b>106</b> and anchor <b>108</b>.</p></div>
    <div class="mm-point"><h3>Scale boundary kept explicit</h3><p>The patent reports a 6 mm mesh prototype and an approximately 10 mm floating-base radius estimate at 10 Hz. Those dimensions are not visually equated to the full-size vessels shown here.</p></div>
    <div class="mm-foot">ILLUSTRATIVE OPERATING CONTEXT // US11287508B2 ARCHITECTURE</div>
  </div>`;

if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');
style.textContent=`
.market-motion-v7{display:grid;grid-template-columns:minmax(520px,1.08fr) minmax(360px,.92fr);gap:54px;align-items:center;margin:30px 0 46px;padding:8px 0 28px}.market-motion-v7 .mm-stage{min-height:680px;display:flex;align-items:center;justify-content:center}.market-motion-v7 .mm-circle{position:relative;width:min(680px,96%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(198,211,202,.24);background:#06100e;box-shadow:0 26px 100px rgba(0,0,0,.48),inset 0 0 120px rgba(0,0,0,.25)}.market-motion-v7 .mm-scene{width:100%;height:100%;display:block}.market-motion-v7 .mm-bathy path{fill:none;stroke:#83958b;stroke-width:1;stroke-opacity:.095}.market-motion-v7 .mm-bathy .ridge{stroke-opacity:.17;stroke-width:1.35}.market-motion-v7 .mm-bathy .faint{stroke-opacity:.08}.market-motion-v7 .mm-depth-label,.market-motion-v7 .mm-svg-micro,.market-motion-v7 .mm-svg-label,.market-motion-v7 .mm-node-num{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.065em}.market-motion-v7 .mm-depth-label{font-size:8px;fill:#718078}.market-motion-v7 .mm-svg-label{font-size:10px;fill:#b7c2bc}.market-motion-v7 .mm-svg-micro{font-size:7px;fill:#7f8d85}.market-motion-v7 .mm-surface-texture path{fill:none;stroke:#c0d9d2;stroke-width:1.2;stroke-opacity:.22}.market-motion-v7 .mm-surface-texture .soft{stroke-opacity:.10}.market-motion-v7 .mm-history{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5;opacity:.22;stroke-dasharray:2 7}.market-motion-v7 .mm-history.war{stroke:#d3ded8}.market-motion-v7 .mm-history.fast{stroke:#9eaaa3}.market-motion-v7 .mm-history.sub{stroke:#74847a;opacity:.18}.market-motion-v7 .mm-node{filter:url(#mm7Glow)}.market-motion-v7 .mm-node-body{fill:#0b1512;stroke:#d5dfd8;stroke-width:1.5;stroke-opacity:.72}.market-motion-v7 .mm-node-ring{fill:none;stroke:#d5dfd8;stroke-width:1.25;stroke-opacity:.34}.market-motion-v7 .mm-node-ring.outer{stroke-opacity:.14}.market-motion-v7 .mm-base{fill:#d8e1dc;stroke:#fff;stroke-opacity:.5}.market-motion-v7 .mm-meter{fill:#b8c4bd;stroke:#eef2ef;stroke-opacity:.62}.market-motion-v7 .mm-tether{stroke:#bdc9c2;stroke-width:1.6;stroke-dasharray:4 4;stroke-opacity:.65}.market-motion-v7 .mm-anchor{fill:#44524b;stroke:#c5d0ca;stroke-opacity:.72}.market-motion-v7 .mm-node-num{font-size:6.5px;fill:#d9e2dc}.market-motion-v7 .mm-pulse{fill:none;stroke:#9eaea4;stroke-width:1;opacity:.09;transform-origin:center}.market-motion-v7 .p1{animation:mmPulse7 7s ease-out infinite}.market-motion-v7 .p2{animation:mmPulse7 7s ease-out 2.25s infinite}.market-motion-v7 .p3{animation:mmPulse7 7s ease-out 4.5s infinite}@keyframes mmPulse7{0%{opacity:.16;transform:scale(.72)}65%{opacity:.045}100%{opacity:0;transform:scale(1.18)}}.market-motion-v7 .mm-bearing{stroke:#c8d3cc;stroke-width:1.15;stroke-opacity:.30;stroke-dasharray:5 7}.market-motion-v7 .mm-vessel{transform-box:fill-box;transform-origin:center}.market-motion-v7 .mm-detail{fill:none;stroke:#d7dfda;stroke-width:1.6;stroke-opacity:.76}.market-motion-v7 .mm-vls rect{fill:#3e4a44;stroke:#aeb8b3;stroke-width:.5}.market-motion-v7 .mm-wake,.market-motion-v7 .mm-subtrail{fill:none;stroke:#dce7e1;stroke-width:1.4;stroke-opacity:.17;stroke-linecap:round}.market-motion-v7 .mm-wake.thin,.market-motion-v7 .mm-subtrail.thin{stroke-width:.8;stroke-opacity:.09}.market-motion-v7 .mm-subtrail{stroke:#96aaa0;stroke-opacity:.11}.market-motion-v7 .mm-copy{padding-right:2%;display:flex;flex-direction:column;justify-content:center}.market-motion-v7 .mm-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9eaa9a;margin-bottom:20px}.market-motion-v7 .mm-point{padding:0 0 24px;margin-bottom:22px;border-bottom:1px solid rgba(169,181,155,.13)}.market-motion-v7 .mm-point h3{margin:0 0 8px;font-size:28px;line-height:1.04;letter-spacing:-.035em}.market-motion-v7 .mm-point p{margin:0;max-width:650px;color:#929a91;font-size:12px;line-height:1.58}.market-motion-v7 .mm-point b{color:#cbd4ce}.market-motion-v7 .mm-foot{color:#697269;font:8.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em}@media(max-width:1000px){.market-motion-v7{grid-template-columns:1fr;gap:24px}.market-motion-v7 .mm-stage{min-height:auto;padding:8px 0}.market-motion-v7 .mm-circle{width:min(620px,86vw)}.market-motion-v7 .mm-copy{padding:0 5%}.market-motion-v7 .mm-point h3{font-size:24px}}@media(max-width:600px){.market-motion-v7 .mm-circle{width:92vw}.market-motion-v7 .mm-point h3{font-size:21px}.market-motion-v7 .mm-point p{font-size:11px}.market-motion-v7 .mm-svg-micro{font-size:6px}.market-motion-v7 .mm-depth-label{display:none}}
`;
document.head.appendChild(style);

const svg=section.querySelector('.mm-scene');
const war=svg.querySelector('#mmWarship'),fast=svg.querySelector('#mmFastcraft'),sub=svg.querySelector('#mmSubmarine');
const bw=svg.querySelector('#mmBearingWar'),bf=svg.querySelector('#mmBearingFast'),bs=svg.querySelector('#mmBearingSub');
const tw=svg.querySelector('#mmTrailWar'),tf=svg.querySelector('#mmTrailFast'),ts=svg.querySelector('#mmTrailSub');

// One persistent scene clock. These are closed parametric tracks, so there is no
// endpoint, respawn, reverse, or restart. Each vessel remains inside the safe area.
const start=performance.now();
const histories={war:[],fast:[],sub:[]};
function posWar(t){const a=t*.060;return{x:402+203*Math.cos(a)+18*Math.cos(2.3*a+.5),y:226+42*Math.sin(a)+13*Math.sin(2.0*a+.9)}}
function posFast(t){const a=-t*.086+1.7;return{x:405+184*Math.cos(a)+24*Math.cos(1.8*a+1.2),y:349+38*Math.sin(a)+17*Math.sin(2.7*a+.4)}}
function posSub(t){const a=t*.041+3.15;return{x:399+176*Math.cos(a)+20*Math.cos(2.1*a+.8),y:565+42*Math.sin(a)+15*Math.sin(2.4*a+1.1)}}
function heading(fn,t){const p=fn(t),q=fn(t+.035);return Math.atan2(q.y-p.y,q.x-p.x)*180/Math.PI;}
function pushHistory(arr,p,max=26){const last=arr[arr.length-1];if(!last||Math.hypot(last.x-p.x,last.y-p.y)>8){arr.push({x:p.x,y:p.y});if(arr.length>max)arr.shift();}}
function setTrail(el,arr){el.setAttribute('points',arr.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' '));}
function setVessel(el,p,h,scale=1){el.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${h.toFixed(2)}) scale(${scale})`);}
function animate(now){
  const t=(now-start)/1000;
  const pw=posWar(t),pf=posFast(t),ps=posSub(t);
  setVessel(war,pw,heading(posWar,t),.72);
  setVessel(fast,pf,heading(posFast,t),.72);
  setVessel(sub,ps,heading(posSub,t),.72);
  bw.setAttribute('x2',pw.x);bw.setAttribute('y2',pw.y);
  bf.setAttribute('x2',pf.x);bf.setAttribute('y2',pf.y);
  bs.setAttribute('x2',ps.x);bs.setAttribute('y2',ps.y);
  pushHistory(histories.war,pw,28);pushHistory(histories.fast,pf,24);pushHistory(histories.sub,ps,30);
  setTrail(tw,histories.war);setTrail(tf,histories.fast);setTrail(ts,histories.sub);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
})();