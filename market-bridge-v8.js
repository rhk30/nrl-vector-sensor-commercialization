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
section.className='market-motion market-motion-v8';
section.innerHTML=`
<div class="mm-stage">
  <div class="mm-circle" aria-label="Hypothetical naval operating picture using patent-described sensing architecture">
    <svg class="mm-scene" viewBox="0 0 800 800" role="img" aria-label="Side-cutaway maritime operating picture showing surface vessels, a submarine, patent-described moored directional sensing nodes and an external receiver path">
      <defs>
        <radialGradient id="v8Air" cx="50%" cy="35%" r="72%"><stop offset="0" stop-color="#0a1210"/><stop offset="1" stop-color="#020504"/></radialGradient>
        <linearGradient id="v8Water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#214c48" stop-opacity=".28"/><stop offset=".42" stop-color="#143632" stop-opacity=".22"/><stop offset="1" stop-color="#071613" stop-opacity=".10"/></linearGradient>
        <linearGradient id="v8Floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17241d"/><stop offset="1" stop-color="#070d0a"/></linearGradient>
        <linearGradient id="v8War" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#59645f"/><stop offset=".45" stop-color="#929d97"/><stop offset="1" stop-color="#4a5550"/></linearGradient>
        <linearGradient id="v8Fast" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#252d29"/><stop offset=".55" stop-color="#55615b"/><stop offset="1" stop-color="#303934"/></linearGradient>
        <linearGradient id="v8Sub" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#101613"/><stop offset=".5" stop-color="#39443f"/><stop offset="1" stop-color="#1a211e"/></linearGradient>
        <filter id="v8Shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000" flood-opacity=".62"/></filter>
        <filter id="v8Glow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="v8Clip"><circle cx="400" cy="400" r="393"/></clipPath>
      </defs>

      <g clip-path="url(#v8Clip)">
        <circle cx="400" cy="400" r="393" fill="url(#v8Air)"/>

        <!-- air / water boundary -->
        <rect x="0" y="258" width="800" height="542" fill="url(#v8Water)"/>
        <path class="surface-main" d="M0 260 C62 252 119 268 180 260 S300 251 365 261 S489 269 555 259 S685 252 800 262"/>
        <path class="surface-soft" d="M0 270 C70 262 132 276 197 268 S326 260 394 271 S528 278 596 268 S718 262 800 271"/>
        <text x="68" y="240" class="micro">SEA SURFACE // ILLUSTRATIVE OPERATING CONTEXT</text>

        <!-- seabed with non-flat bathymetry -->
        <path d="M0 632 C65 604 111 620 169 596 C227 572 272 615 329 590 C388 563 433 610 494 582 C552 555 601 594 662 571 C715 551 759 560 800 545 L800 800 L0 800Z" fill="url(#v8Floor)"/>
        <g class="contours">
          <path d="M7 651 C82 622 122 642 183 615 C240 589 282 632 343 607 C405 580 447 628 511 599 C571 572 619 612 680 589 C731 570 766 578 794 566"/>
          <path d="M7 684 C86 654 135 675 199 647 C260 620 302 662 366 637 C427 612 475 655 540 627 C603 600 651 638 711 615 C749 601 776 607 795 596"/>
          <path d="M15 720 C95 690 151 710 218 683 C281 658 328 700 392 675 C454 651 504 691 568 664 C631 639 684 675 742 654 C766 646 783 648 797 643"/>
          <path class="ridge" d="M115 605 C156 573 211 569 253 595"/>
          <path class="ridge" d="M462 590 C514 548 580 548 633 578"/>
        </g>
        <text x="68" y="744" class="micro">BATHYMETRY // ILLUSTRATIVE // NOT SURVEY DATA</text>

        <!-- subtle depth marks -->
        <g class="depth-marks"><line x1="63" y1="338" x2="85" y2="338"/><line x1="63" y1="430" x2="85" y2="430"/><line x1="63" y1="522" x2="85" y2="522"/><text x="92" y="342">WATER COLUMN</text></g>

        <!-- recent track histories -->
        <polyline id="v8TrailWar" class="history war" points=""/>
        <polyline id="v8TrailFast" class="history fast" points=""/>
        <polyline id="v8TrailSub" class="history sub" points=""/>

        <!-- surface combatant context -->
        <g id="v8Warship" class="platform warship" filter="url(#v8Shadow)">
          <g class="platform-body">
            <path d="M-78 7 L55 7 L86 -3 L67 -12 L32 -15 L18 -31 L-1 -34 L-13 -19 L-42 -16 L-49 -7 L-82 -3Z" fill="url(#v8War)" stroke="#d8e0dc" stroke-opacity=".68"/>
            <path d="M-35 -14 L25 -14 L35 -22 L18 -27 L-10 -26Z" fill="#75817b"/>
            <rect x="-5" y="-45" width="16" height="15" rx="1" fill="#a7b0ab"/>
            <path d="M3 -45 L3 -66 M-12 -55 L17 -55" class="detail"/><rect x="-3" y="-71" width="11" height="5" fill="#bac3be"/>
            <circle cx="43" cy="-13" r="5" fill="#6b7771"/><path d="M47 -13 L65 -13" class="detail"/>
            <path d="M-76 11 Q-35 18 60 12" class="wake"/>
          </g>
        </g>

        <!-- fast craft context -->
        <g id="v8Fastcraft" class="platform fastcraft" filter="url(#v8Shadow)">
          <g class="platform-body">
            <path d="M-52 6 L36 6 L61 -2 L45 -9 L18 -11 L8 -23 L-15 -24 L-27 -14 L-45 -10 L-58 -2Z" fill="url(#v8Fast)" stroke="#c7d0cb" stroke-opacity=".60"/>
            <path d="M-18 -20 L12 -20 L25 -12 L-28 -12Z" fill="#59655f"/><path d="M-7 -21 L-7 -39" class="detail"/><path d="M-20 -31 L9 -31" class="detail"/>
            <path d="M-58 10 Q-24 18 43 11" class="wake"/>
          </g>
        </g>

        <!-- submarine context -->
        <g id="v8Submarine" class="platform submarine" filter="url(#v8Shadow)">
          <g class="platform-body">
            <path d="M-92 0 C-77 -20 -44 -27 8 -26 C49 -25 78 -15 94 0 C78 15 49 25 8 26 C-44 27 -77 20 -92 0Z" fill="url(#v8Sub)" stroke="#a7b3ac" stroke-opacity=".55"/>
            <path d="M-8 -23 L1 -43 L20 -43 L28 -22Z" fill="#2d3832" stroke="#8e9a94" stroke-opacity=".44"/><rect x="9" y="-56" width="3" height="14" fill="#7d8983"/>
            <path d="M-62 -4 L-91 -18 L-67 2Z" fill="#242d29"/><path d="M-62 4 L-91 18 L-67 -2Z" fill="#242d29"/><path d="M72 -4 L98 -15 L83 2Z" fill="#242d29"/><path d="M72 4 L98 15 L83 -2Z" fill="#242d29"/>
            <path d="M-87 3 Q-36 10 81 4" class="sub-glint"/>
          </g>
        </g>

        <!-- patent node A: secondary -->
        <g class="node secondary" transform="translate(232 520) scale(.82)">
          <ellipse cx="0" cy="0" rx="29" ry="23" class="node-base"/><rect x="-6" y="-44" width="12" height="20" rx="2" class="meter"/><rect x="-6" y="24" width="12" height="20" rx="2" class="meter"/><rect x="-47" y="-6" width="20" height="12" rx="2" class="meter"/><rect x="27" y="-6" width="20" height="12" rx="2" class="meter"/><line x1="0" y1="24" x2="0" y2="89" class="tether"/><path d="M-18 98 L18 98 L27 114 L-27 114Z" class="anchor"/><circle r="53" class="node-ring"/><circle r="76" class="node-ring outer"/>
        </g>

        <!-- patent node B: primary / product focus -->
        <g id="v8PrimaryNode" class="node primary" transform="translate(420 535)" filter="url(#v8Glow)">
          <ellipse cx="0" cy="0" rx="38" ry="30" class="node-base"/>
          <rect x="-8" y="-58" width="16" height="26" rx="3" class="meter"/><rect x="-8" y="32" width="16" height="26" rx="3" class="meter"/><rect x="-60" y="-8" width="26" height="16" rx="3" class="meter"/><rect x="34" y="-8" width="26" height="16" rx="3" class="meter"/>
          <line x1="0" y1="30" x2="0" y2="105" class="tether"/><path d="M-23 116 L23 116 L34 136 L-34 136Z" class="anchor"/>
          <circle r="69" class="node-ring"/><circle r="96" class="node-ring outer"/>
          <circle r="112" class="node-pulse p1"/><circle r="145" class="node-pulse p2"/>
          <text x="78" y="-47" class="node-label">PATENT-DESCRIBED NODE</text><text x="78" y="-31" class="node-micro">102 FLOATING BASE</text><text x="78" y="-17" class="node-micro">104 FLOW METERS</text><text x="78" y="-3" class="node-micro">106 RETAINING THREAD</text><text x="78" y="11" class="node-micro">108 ANCHOR</text>
        </g>

        <!-- patent node C: secondary -->
        <g class="node secondary" transform="translate(615 500) scale(.78)">
          <ellipse cx="0" cy="0" rx="29" ry="23" class="node-base"/><rect x="-6" y="-44" width="12" height="20" rx="2" class="meter"/><rect x="-6" y="24" width="12" height="20" rx="2" class="meter"/><rect x="-47" y="-6" width="20" height="12" rx="2" class="meter"/><rect x="27" y="-6" width="20" height="12" rx="2" class="meter"/><line x1="0" y1="24" x2="0" y2="78" class="tether"/><path d="M-18 87 L18 87 L27 103 L-27 103Z" class="anchor"/><circle r="53" class="node-ring"/><circle r="76" class="node-ring outer"/>
        </g>

        <!-- bearing geometry and external receiver data path -->
        <line id="v8BearingWar" x1="232" y1="520" x2="260" y2="245" class="bearing"/>
        <line id="v8BearingFast" x1="615" y1="500" x2="580" y2="275" class="bearing"/>
        <line id="v8BearingSub" x1="420" y1="535" x2="390" y2="404" class="bearing strong"/>
        <g class="receiver" transform="translate(667 160)"><rect x="-55" y="-22" width="110" height="44" rx="4"/><circle cx="-34" cy="0" r="5"/><path d="M-28 0 L-8 0 M0 -8 L0 8 M-7 0 L7 0"/><text x="13" y="-3">EXTERNAL</text><text x="13" y="11">RECEIVER</text></g>
        <line x1="420" y1="535" x2="633" y2="178" class="data-path"/><text x="555" y="345" class="micro">MEASUREMENT / DATA PATH</text>

        <!-- operational-style labels -->
        <text x="68" y="96" class="op-title">HYPOTHETICAL NAVAL OPERATING PICTURE</text><text x="68" y="116" class="micro">ILLUSTRATIVE VIEW // NOT A NAVY UI // NOT A DETECTION-RANGE DISPLAY</text>
        <text x="68" y="142" class="micro">DASHED = SOURCE-TO-NODE BEARING GEOMETRY // SOLID = EXTERNAL RECEIVER PATH</text>
        <g class="legend"><circle cx="72" cy="187" r="4"/><text x="84" y="190">SURFACE PLATFORM</text><circle cx="212" cy="187" r="4"/><text x="224" y="190">FAST CRAFT</text><circle cx="330" cy="187" r="4"/><text x="342" y="190">SUBSURFACE PLATFORM</text></g>
      </g>
    </svg>
  </div>
</div>

<div class="mm-copy">
  <span class="mm-kicker">PATENT IN CONTEXT // OPERATIONAL HYPOTHESIS</span>
  <div class="mm-point"><h3>The node is the product.</h3><p>The primary visual centers the patent-described floating-base architecture. Platform silhouettes are intentionally subdued and exist only to give the sensing concept an operational frame.</p></div>
  <div class="mm-point"><h3>Bearing geometry, not sonar performance.</h3><p>Dashed source-to-node lines explain direction-of-arrival geometry. They do not represent detection range, probability of detection, source level, SNR or classification.</p></div>
  <div class="mm-point"><h3>Patent-described information path.</h3><p>US11287508B2 describes measurement information being communicated to an external device, including a ship, buoy, land receiver or central controller. The solid path visualizes that relationship only.</p></div>
  <div class="mm-foot">REPORTED SCALE REFERENCE // 6 mm MESH OD // ≈10 mm FLOATING-BASE RADIUS ESTIMATE @ 10 Hz // LOCATORS ENLARGED FOR LEGIBILITY</div>
</div>`;

if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');
style.textContent=`
.market-motion-v8{display:grid;grid-template-columns:minmax(540px,1.12fr) minmax(360px,.88fr);gap:58px;align-items:center;margin:28px 0 48px;padding:8px 0 30px}.market-motion-v8 .mm-stage{min-height:690px;display:flex;align-items:center;justify-content:center}.market-motion-v8 .mm-circle{position:relative;width:min(700px,97%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(196,210,201,.26);background:#040806;box-shadow:0 28px 110px rgba(0,0,0,.5),inset 0 0 130px rgba(0,0,0,.26)}.market-motion-v8 .mm-scene{width:100%;height:100%;display:block}.market-motion-v8 .surface-main{fill:none;stroke:#c3d9d2;stroke-width:1.6;stroke-opacity:.43}.market-motion-v8 .surface-soft{fill:none;stroke:#779993;stroke-width:1;stroke-opacity:.18}.market-motion-v8 .contours path{fill:none;stroke:#7f9589;stroke-width:1;stroke-opacity:.11}.market-motion-v8 .contours .ridge{stroke-opacity:.22;stroke-width:1.35}.market-motion-v8 .micro,.market-motion-v8 .op-title,.market-motion-v8 .node-label,.market-motion-v8 .node-micro,.market-motion-v8 .legend text,.market-motion-v8 .depth-marks text{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.065em}.market-motion-v8 .micro{font-size:7px;fill:#7f8e86}.market-motion-v8 .op-title{font-size:10px;fill:#c1cbc5}.market-motion-v8 .legend text{font-size:6.5px;fill:#7d8a83}.market-motion-v8 .legend circle{fill:#aab8b0;opacity:.75}.market-motion-v8 .depth-marks line{stroke:#6f8178;stroke-opacity:.2}.market-motion-v8 .depth-marks text{font-size:6.5px;fill:#62716a}.market-motion-v8 .history{fill:none;stroke-width:1.25;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:2 7}.market-motion-v8 .history.war{stroke:#b7c5bd;stroke-opacity:.16}.market-motion-v8 .history.fast{stroke:#94a59c;stroke-opacity:.14}.market-motion-v8 .history.sub{stroke:#82998d;stroke-opacity:.12}.market-motion-v8 .platform{transform-origin:center;transform-box:fill-box}.market-motion-v8 .detail{fill:none;stroke:#d9e1dc;stroke-width:1.5;stroke-opacity:.7}.market-motion-v8 .wake{fill:none;stroke:#d7e3dc;stroke-width:1.2;stroke-opacity:.13}.market-motion-v8 .sub-glint{fill:none;stroke:#819189;stroke-width:1;stroke-opacity:.18}.market-motion-v8 .node-base{fill:#111c18;stroke:#e0e8e3;stroke-width:1.7;stroke-opacity:.86}.market-motion-v8 .meter{fill:#b8c6bd;stroke:#f0f4f1;stroke-width:1;stroke-opacity:.82}.market-motion-v8 .tether{stroke:#c2cec6;stroke-width:1.5;stroke-dasharray:5 5;stroke-opacity:.72}.market-motion-v8 .anchor{fill:#46564d;stroke:#cad5cf;stroke-width:1.25;stroke-opacity:.75}.market-motion-v8 .node-ring{fill:none;stroke:#d4dfd8;stroke-width:1.25;stroke-opacity:.34}.market-motion-v8 .node-ring.outer{stroke-opacity:.14}.market-motion-v8 .node.secondary{opacity:.64}.market-motion-v8 .node.primary{opacity:1}.market-motion-v8 .node-label{font-size:8px;fill:#dce6e0}.market-motion-v8 .node-micro{font-size:6.4px;fill:#95a59c}.market-motion-v8 .node-pulse{fill:none;stroke:#c2d0c7;stroke-width:1;opacity:.08}.market-motion-v8 .p1{animation:v8Pulse 8s ease-out infinite}.market-motion-v8 .p2{animation:v8Pulse 8s ease-out 3.7s infinite}@keyframes v8Pulse{0%{opacity:.13;transform:scale(.78);transform-origin:420px 535px}70%{opacity:.035}100%{opacity:0;transform:scale(1.17);transform-origin:420px 535px}}.market-motion-v8 .bearing{stroke:#c3d0c8;stroke-width:1.05;stroke-opacity:.25;stroke-dasharray:5 7}.market-motion-v8 .bearing.strong{stroke-opacity:.42}.market-motion-v8 .data-path{stroke:#c9d5cd;stroke-width:1.35;stroke-opacity:.42}.market-motion-v8 .receiver rect{fill:#08100d;stroke:#c4d0c8;stroke-opacity:.45}.market-motion-v8 .receiver circle{fill:#d4ded8}.market-motion-v8 .receiver path{fill:none;stroke:#aebbb3;stroke-width:1}.market-motion-v8 .receiver text{font:6.5px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#9dab9f}.market-motion-v8 .mm-copy{padding-right:2%;display:flex;flex-direction:column;justify-content:center}.market-motion-v8 .mm-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9daa99;margin-bottom:20px}.market-motion-v8 .mm-point{padding:0 0 24px;margin-bottom:22px;border-bottom:1px solid rgba(169,181,155,.13)}.market-motion-v8 .mm-point h3{margin:0 0 9px;font-size:28px;line-height:1.04;letter-spacing:-.035em}.market-motion-v8 .mm-point p{margin:0;max-width:650px;color:#929a91;font-size:12px;line-height:1.6}.market-motion-v8 .mm-point b{color:#cbd4ce}.market-motion-v8 .mm-foot{color:#697269;font:8.5px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.045em}@media(max-width:1000px){.market-motion-v8{grid-template-columns:1fr;gap:26px}.market-motion-v8 .mm-stage{min-height:auto}.market-motion-v8 .mm-circle{width:min(640px,88vw)}.market-motion-v8 .mm-copy{padding:0 5%}.market-motion-v8 .mm-point h3{font-size:24px}}@media(max-width:600px){.market-motion-v8 .mm-circle{width:92vw}.market-motion-v8 .mm-point h3{font-size:21px}.market-motion-v8 .mm-point p{font-size:11px}.market-motion-v8 .node-label,.market-motion-v8 .node-micro{display:none}}
`;
document.head.appendChild(style);

const svg=section.querySelector('.mm-scene');
const war=svg.querySelector('#v8Warship'),fast=svg.querySelector('#v8Fastcraft'),sub=svg.querySelector('#v8Submarine');
const bw=svg.querySelector('#v8BearingWar'),bf=svg.querySelector('#v8BearingFast'),bs=svg.querySelector('#v8BearingSub');
const tw=svg.querySelector('#v8TrailWar'),tf=svg.querySelector('#v8TrailFast'),ts=svg.querySelector('#v8TrailSub');

// Persistent low-speed operational motion. Periods are several minutes long, so the
// viewer does not see an obvious loop. Platforms stay in separated physical sectors.
let last=performance.now();
let phaseWar=.18,phaseFast=2.25,phaseSub=3.75;
const trails={war:[],fast:[],sub:[]};
function warPos(a){return{x:310+118*Math.cos(a)+7*Math.sin(2.4*a),y:246+5*Math.sin(a)+2*Math.sin(2.1*a)}}
function fastPos(a){return{x:585+66*Math.cos(a)+5*Math.sin(2.2*a),y:273+4*Math.sin(a)+2*Math.sin(2.6*a)}}
function subPos(a){return{x:400+188*Math.cos(a)+11*Math.sin(1.7*a),y:406+24*Math.sin(a)+6*Math.sin(2.3*a)}}
function heading(fn,a,dir=1){const p=fn(a),q=fn(a+.01*dir);return Math.atan2(q.y-p.y,q.x-p.x)*180/Math.PI;}
function updateTrail(arr,p,max){const lastPt=arr[arr.length-1];if(!lastPt||Math.hypot(lastPt.x-p.x,lastPt.y-p.y)>6){arr.push({x:p.x,y:p.y});if(arr.length>max)arr.shift();}}
function drawTrail(el,arr){el.setAttribute('points',arr.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1)).join(' '));}
function setPlatform(el,p,h,s){el.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${h.toFixed(2)}) scale(${s})`);}
function frame(now){
  const dt=Math.min((now-last)/1000,.05);last=now;
  phaseWar+=dt*.018;      // ~5.8 minute cycle
  phaseFast-=dt*.027;     // ~3.9 minute cycle
  phaseSub+=dt*.013;      // ~8.1 minute cycle
  const pw=warPos(phaseWar),pf=fastPos(phaseFast),ps=subPos(phaseSub);
  setPlatform(war,pw,heading(warPos,phaseWar,1),.78);
  setPlatform(fast,pf,heading(fastPos,phaseFast,-1),.72);
  setPlatform(sub,ps,heading(subPos,phaseSub,1),.77);
  bw.setAttribute('x2',pw.x);bw.setAttribute('y2',pw.y);
  bf.setAttribute('x2',pf.x);bf.setAttribute('y2',pf.y);
  bs.setAttribute('x2',ps.x);bs.setAttribute('y2',ps.y);
  updateTrail(trails.war,pw,34);updateTrail(trails.fast,pf,30);updateTrail(trails.sub,ps,38);
  drawTrail(tw,trails.war);drawTrail(tf,trails.fast);drawTrail(ts,trails.sub);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();