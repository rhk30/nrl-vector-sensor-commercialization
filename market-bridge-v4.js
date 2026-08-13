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
section.className='market-motion market-motion-v6';
section.innerHTML=`
  <div class="mm-stage">
    <div class="mm-circle" aria-label="Illustrative maritime operating picture using patent-described sensing architecture">
      <svg class="mm-scene" viewBox="0 0 800 800" role="img" aria-label="Naval operating picture with surface combatant, fast craft and submarine moving continuously around patent-described moored vector-sensor locators">
        <defs>
          <radialGradient id="mmBg6" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#0d211e"/><stop offset=".58" stop-color="#081511"/><stop offset="1" stop-color="#030706"/></radialGradient>
          <linearGradient id="mmWater6" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#346862" stop-opacity=".22"/><stop offset=".22" stop-color="#183c38" stop-opacity=".16"/><stop offset="1" stop-color="#06110f" stop-opacity=".035"/></linearGradient>
          <linearGradient id="mmFloor6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#101a15"/><stop offset=".52" stop-color="#17221b"/><stop offset="1" stop-color="#0a120e"/></linearGradient>
          <linearGradient id="mmWar6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d0d8d3"/><stop offset=".45" stop-color="#8a9690"/><stop offset="1" stop-color="#52605a"/></linearGradient>
          <linearGradient id="mmFast6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#56635c"/><stop offset="1" stop-color="#222a26"/></linearGradient>
          <linearGradient id="mmSub6" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#56625c"/><stop offset=".52" stop-color="#26302b"/><stop offset="1" stop-color="#111713"/></linearGradient>
          <filter id="mmSoft6" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.25"/></filter>
          <clipPath id="mmClip6"><circle cx="400" cy="400" r="394"/></clipPath>
        </defs>

        <g clip-path="url(#mmClip6)">
          <circle cx="400" cy="400" r="394" fill="url(#mmBg6)"/>

          <!-- varied seabed / bathymetry -->
          <path d="M0 510 C86 458 150 500 230 472 C309 444 348 506 426 476 C503 446 553 416 633 455 C704 490 756 447 800 430 L800 800 L0 800Z" fill="url(#mmFloor6)" opacity=".86"/>
          <path d="M0 578 C97 531 175 557 247 534 C326 509 384 564 468 526 C554 488 626 500 800 469" class="mm-contour"/>
          <path d="M0 624 C105 575 172 610 261 579 C341 551 398 616 493 568 C596 516 667 558 800 518" class="mm-contour c2"/>
          <path d="M0 680 C83 635 163 657 252 637 C346 616 413 673 508 628 C602 584 700 612 800 574" class="mm-contour c3"/>
          <path d="M0 740 C118 688 190 728 290 696 C377 669 455 730 551 681 C646 633 720 674 800 647" class="mm-contour c4"/>
          <path d="M116 525 C165 496 218 498 265 518" class="mm-ridge"/><path d="M472 486 C531 440 609 440 673 478" class="mm-ridge"/>
          <path d="M330 607 C371 582 422 584 457 610" class="mm-ridge faint"/>

          <!-- lighter transparent water column -->
          <rect x="0" y="284" width="800" height="516" fill="url(#mmWater6)"/>
          <path d="M0 290 C70 278 128 302 198 290 S322 280 390 293 S526 304 602 288 S726 281 800 294" class="mm-surface-main"/>
          <path d="M0 301 C81 292 148 313 223 302 S353 293 430 304 S575 314 643 301 S747 294 800 305" class="mm-surface-sub"/>
          <text x="72" y="267" class="mm-svg-micro">SEA SURFACE // ILLUSTRATIVE</text>

          <!-- motion reference paths stay invisible; JS drives all motion continuously -->
          <path id="mmRouteWar" d="M174 208 C278 178 470 184 603 216 C648 227 658 255 622 272 C506 313 294 303 184 265 C142 251 141 220 174 208Z" class="mm-motion-path"/>
          <path id="mmRouteFast" d="M625 332 C533 310 356 312 224 334 C187 340 175 366 209 384 C334 420 530 404 625 369 C662 356 660 341 625 332Z" class="mm-motion-path"/>
          <path id="mmRouteSub" d="M181 548 C286 520 492 526 618 555 C656 565 661 594 627 610 C514 653 297 645 182 602 C145 588 145 559 181 548Z" class="mm-motion-path"/>

          <!-- patent-described moored architecture locators; enlarged for legibility -->
          <g class="mm-node" transform="translate(255 500)">
            <circle r="31" class="mm-node-body"/><circle r="48" class="mm-node-ring"/><circle r="67" class="mm-node-ring outer"/>
            <circle r="10" class="mm-base"/><text x="0" y="3" text-anchor="middle" class="mm-node-num">102</text>
            <rect x="-5" y="-42" width="10" height="18" rx="1" class="mm-meter"/><rect x="-5" y="24" width="10" height="18" rx="1" class="mm-meter"/><rect x="-42" y="-5" width="18" height="10" rx="1" class="mm-meter"/><rect x="24" y="-5" width="18" height="10" rx="1" class="mm-meter"/>
            <text x="45" y="-24" class="mm-node-num">104</text>
            <line x1="0" y1="42" x2="0" y2="93" class="mm-tether"/><text x="7" y="78" class="mm-node-num">106</text><path d="M-16 101 L16 101 L24 115 L-24 115Z" class="mm-anchor"/><text x="29" y="113" class="mm-node-num">108</text>
            <circle r="78" class="mm-pulse p1"/><circle r="103" class="mm-pulse p2"/>
          </g>
          <g class="mm-node" transform="translate(530 505)">
            <circle r="31" class="mm-node-body"/><circle r="48" class="mm-node-ring"/><circle r="67" class="mm-node-ring outer"/>
            <circle r="10" class="mm-base"/><text x="0" y="3" text-anchor="middle" class="mm-node-num">102</text>
            <rect x="-5" y="-42" width="10" height="18" rx="1" class="mm-meter"/><rect x="-5" y="24" width="10" height="18" rx="1" class="mm-meter"/><rect x="-42" y="-5" width="18" height="10" rx="1" class="mm-meter"/><rect x="24" y="-5" width="18" height="10" rx="1" class="mm-meter"/>
            <line x1="0" y1="42" x2="0" y2="93" class="mm-tether"/><path d="M-16 101 L16 101 L24 115 L-24 115Z" class="mm-anchor"/>
            <circle r="78" class="mm-pulse p2"/><circle r="103" class="mm-pulse p3"/>
          </g>
          <g class="mm-node" transform="translate(390 648)">
            <circle r="31" class="mm-node-body"/><circle r="48" class="mm-node-ring"/><circle r="67" class="mm-node-ring outer"/>
            <circle r="10" class="mm-base"/><text x="0" y="3" text-anchor="middle" class="mm-node-num">102</text>
            <rect x="-5" y="-42" width="10" height="18" rx="1" class="mm-meter"/><rect x="-5" y="24" width="10" height="18" rx="1" class="mm-meter"/><rect x="-42" y="-5" width="18" height="10" rx="1" class="mm-meter"/><rect x="24" y="-5" width="18" height="10" rx="1" class="mm-meter"/>
            <line x1="0" y1="42" x2="0" y2="82" class="mm-tether"/><path d="M-16 90 L16 90 L24 104 L-24 104Z" class="mm-anchor"/>
            <circle r="78" class="mm-pulse p3"/><circle r="103" class="mm-pulse p1"/>
          </g>

          <!-- bearing geometry tracks actual moving objects -->
          <line id="mmBearingWar" x1="255" y1="500" x2="174" y2="208" class="mm-bearing"/>
          <line id="mmBearingFast" x1="530" y1="505" x2="625" y2="332" class="mm-bearing"/>
          <line id="mmBearingSub" x1="390" y1="648" x2="181" y2="548" class="mm-bearing"/>

          <!-- top-down surface combatant planform -->
          <g id="mmWarship" class="mm-vessel">
            <g class="mm-vessel-visual">
              <path d="M-86 -12 C-58 -18 8 -18 56 -12 L86 0 L56 12 C8 18 -58 18 -86 12 L-96 0Z" fill="url(#mmWar6)" stroke="#dce3df" stroke-opacity=".78"/>
              <path d="M-36 -9 L28 -9 L48 -4 L48 4 L28 9 L-36 9Z" fill="#7e8a84"/>
              <path d="M-18 -7 L11 -7 L24 -3 L24 3 L11 7 L-18 7Z" fill="#a5afa9"/>
              <rect x="-8" y="-4" width="20" height="8" rx="1" fill="#bcc5c0"/>
              <circle cx="22" cy="0" r="5" fill="#68746e"/><path d="M27 0 L45 0" class="mm-detail"/>
              <rect x="-30" y="-2" width="7" height="4" fill="#d0d8d3"/><path d="M-27 -2 L-27 -13 M-36 -9 L-18 -9" class="mm-detail"/>
              <path d="M-86 -5 Q-108 -2 -124 0 Q-108 2 -86 5" class="mm-wake"/><path d="M-84 -9 Q-113 -6 -137 -3" class="mm-wake thin"/><path d="M-84 9 Q-113 6 -137 3" class="mm-wake thin"/>
            </g>
          </g>

          <!-- top-down fast craft -->
          <g id="mmFastcraft" class="mm-vessel">
            <g class="mm-vessel-visual">
              <path d="M-62 -12 C-38 -17 12 -16 43 -9 L66 0 L43 9 C12 16 -38 17 -62 12 L-72 0Z" fill="url(#mmFast6)" stroke="#cbd4cf" stroke-opacity=".72"/>
              <path d="M-22 -8 L18 -8 L34 -3 L34 3 L18 8 L-22 8Z" fill="#59655f"/><rect x="-7" y="-5" width="19" height="10" rx="2" fill="#74817a"/>
              <rect x="-54" y="-11" width="16" height="4" rx="2" fill="#1f2623"/><rect x="-54" y="7" width="16" height="4" rx="2" fill="#1f2623"/>
              <path d="M-63 -5 Q-85 -3 -105 0 Q-85 3 -63 5" class="mm-wake"/><path d="M-61 -9 Q-92 -7 -116 -4" class="mm-wake thin"/><path d="M-61 9 Q-92 7 -116 4" class="mm-wake thin"/>
            </g>
          </g>

          <!-- top-down submarine planform; no roll, no corkscrew -->
          <g id="mmSubmarine" class="mm-vessel">
            <g class="mm-vessel-visual">
              <path d="M-94 0 C-82 -17 -52 -22 7 -21 C51 -20 81 -12 96 0 C81 12 51 20 7 21 C-52 22 -82 17 -94 0Z" fill="url(#mmSub6)" stroke="#aeb9b3" stroke-opacity=".66"/>
              <rect x="-8" y="-7" width="25" height="14" rx="5" fill="#38443e"/><path d="M-8 -17 L13 -17 L21 -7 L-8 -7Z" fill="#45514b"/>
              <path d="M-68 -5 L-93 -19 L-74 -2Z" fill="#2d3732"/><path d="M-68 5 L-93 19 L-74 2Z" fill="#2d3732"/><path d="M74 -4 L101 -15 L88 0Z" fill="#2d3732"/><path d="M74 4 L101 15 L88 0Z" fill="#2d3732"/>
              <path d="M-93 -4 Q-119 -2 -142 0 Q-119 2 -93 4" class="mm-subtrail"/><path d="M-89 -8 Q-126 -7 -151 -4" class="mm-subtrail thin"/><path d="M-89 8 Q-126 7 -151 4" class="mm-subtrail thin"/>
            </g>
          </g>

          <text x="98" y="112" class="mm-svg-label">MARITIME OPERATING PICTURE // CONCEPT</text>
          <text x="98" y="134" class="mm-svg-micro">PATENT-GROUNDED NODE ARCHITECTURE + ILLUSTRATIVE VESSEL CONTEXT</text>
          <text x="98" y="710" class="mm-svg-micro">LOCATORS ENLARGED FOR LEGIBILITY // PATENT HARDWARE IS NOT SHOWN AT VESSEL SCALE</text>
          <text x="98" y="732" class="mm-svg-micro">DASHED = SOURCE-TO-NODE BEARING GEOMETRY // NO RANGE, SNR OR CLASSIFICATION CLAIM</text>
        </g>
      </svg>
    </div>
  </div>

  <div class="mm-copy">
    <span class="mm-kicker">DEFENSE FIRST // PATENT IN CONTEXT</span>
    <div class="mm-point"><h3>Distributed directional sensing</h3><p>The operating picture shows how compact directional sensing could contribute bearing information in a maritime scene. The vessels are illustrative context, not validated targets or fielded Navy deployments.</p></div>
    <div class="mm-point"><h3>Moored architecture</h3><p>The enlarged locator symbols preserve the disclosed FIG. 1 relationships: floating base <b>102</b>, flow meters <b>104</b>, retaining thread <b>106</b> and anchor <b>108</b>.</p></div>
    <div class="mm-point"><h3>Continuous geometry, not a game loop</h3><p>Platforms remain continuously in the operating picture on bounded transit routes. Bearing lines follow their actual positions. The motion explains geometry only; it does not model detection performance.</p></div>
    <div class="mm-foot">ILLUSTRATIVE OPERATING CONTEXT // US11287508B2 ARCHITECTURE</div>
  </div>`;

if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');
style.textContent=`
.market-motion-v6{display:grid;grid-template-columns:minmax(520px,1.08fr) minmax(360px,.92fr);gap:54px;align-items:center;margin:30px 0 46px;padding:8px 0 26px}.market-motion-v6 .mm-stage{min-height:680px;display:flex;align-items:center;justify-content:center}.market-motion-v6 .mm-circle{position:relative;width:min(680px,96%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(198,211,202,.30);background:#06100e;box-shadow:0 24px 90px rgba(0,0,0,.46),inset 0 0 110px rgba(0,0,0,.32)}.market-motion-v6 .mm-scene{display:block;width:100%;height:100%}.market-motion-v6 .mm-svg-label,.market-motion-v6 .mm-svg-micro,.market-motion-v6 .mm-node-num{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;fill:#aab6ad}.market-motion-v6 .mm-svg-label{font-size:10px}.market-motion-v6 .mm-svg-micro{font-size:7.2px;fill:#7b887f}.market-motion-v6 .mm-node-num{font-size:6.2px;fill:#d0d8d3;letter-spacing:.03em}.market-motion-v6 .mm-contour{fill:none;stroke:#84958a;stroke-width:1.2;stroke-opacity:.12}.market-motion-v6 .mm-contour.c2{stroke-opacity:.10}.market-motion-v6 .mm-contour.c3{stroke-opacity:.08}.market-motion-v6 .mm-contour.c4{stroke-opacity:.06}.market-motion-v6 .mm-ridge{fill:none;stroke:#a1aea5;stroke-opacity:.10;stroke-width:1.4}.market-motion-v6 .mm-ridge.faint{stroke-opacity:.055}.market-motion-v6 .mm-surface-main{fill:none;stroke:#c4ddd6;stroke-opacity:.38;stroke-width:1.8}.market-motion-v6 .mm-surface-sub{fill:none;stroke:#7da09a;stroke-opacity:.17;stroke-width:1}.market-motion-v6 .mm-motion-path{fill:none;stroke:none}.market-motion-v6 .mm-node-body{fill:#0b1713;stroke:#d5ddd7;stroke-width:1.8;stroke-opacity:.88}.market-motion-v6 .mm-node-ring{fill:none;stroke:#b4c1b8;stroke-opacity:.44;stroke-width:1.2}.market-motion-v6 .mm-node-ring.outer{stroke-opacity:.17}.market-motion-v6 .mm-base{fill:#d9e0db;fill-opacity:.90;stroke:#f0f3f1;stroke-opacity:.35}.market-motion-v6 .mm-meter{fill:#abb7af;fill-opacity:.90;stroke:#e0e6e2;stroke-opacity:.32}.market-motion-v6 .mm-tether{stroke:#b4c1b8;stroke-opacity:.58;stroke-dasharray:5 6;stroke-width:1.3}.market-motion-v6 .mm-anchor{fill:#69776f;fill-opacity:.78;stroke:#c0cbc3;stroke-opacity:.42}.market-motion-v6 .mm-bearing{stroke:#c8b577;stroke-opacity:.56;stroke-width:1.25;stroke-dasharray:6 8}.market-motion-v6 .mm-detail{stroke:#d3dad6;stroke-opacity:.72;stroke-width:1.4;fill:none}.market-motion-v6 .mm-wake,.market-motion-v6 .mm-subtrail{stroke:#c8ddd7;stroke-opacity:.20;stroke-width:2;fill:none;filter:url(#mmSoft6)}.market-motion-v6 .mm-wake.thin,.market-motion-v6 .mm-subtrail.thin{stroke-width:1.2;stroke-opacity:.11}.market-motion-v6 .mm-subtrail{stroke:#93aaa3;stroke-opacity:.10}.market-motion-v6 .mm-pulse{fill:none;stroke:#bbc8bf;stroke-width:1;stroke-opacity:.13;transform-box:fill-box;transform-origin:center;animation:mmPulse6 6.5s linear infinite}.market-motion-v6 .mm-pulse.p2{animation-delay:-2.2s}.market-motion-v6 .mm-pulse.p3{animation-delay:-4.4s}@keyframes mmPulse6{0%{transform:scale(.70);opacity:.02}46%{opacity:.17}100%{transform:scale(1.28);opacity:0}}.market-motion-v6 .mm-copy{padding-right:3%;display:flex;flex-direction:column;justify-content:center}.market-motion-v6 .mm-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9eaa9a;margin-bottom:22px}.market-motion-v6 .mm-point{padding:0 0 25px;margin-bottom:24px;border-bottom:1px solid rgba(169,181,155,.13)}.market-motion-v6 .mm-point h3{margin:0 0 9px;font-size:30px;line-height:1.04;letter-spacing:-.038em}.market-motion-v6 .mm-point p{margin:0;max-width:660px;color:#929a91;font-size:12.5px;line-height:1.62}.market-motion-v6 .mm-point b{color:#c4ccc5;font-weight:600}.market-motion-v6 .mm-foot{color:#697269;font:8.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.055em}@media(max-width:1050px){.market-motion-v6{grid-template-columns:1fr;gap:26px}.market-motion-v6 .mm-stage{min-height:auto}.market-motion-v6 .mm-circle{width:min(650px,86vw)}.market-motion-v6 .mm-copy{padding:0 5%}.market-motion-v6 .mm-point h3{font-size:25px}}@media(max-width:600px){.market-motion-v6 .mm-circle{width:92vw}.market-motion-v6 .mm-copy{padding:0 3%}.market-motion-v6 .mm-point h3{font-size:22px}.market-motion-v6 .mm-point p{font-size:11.5px}.market-motion-v6 .mm-svg-label{font-size:9px}.market-motion-v6 .mm-svg-micro{font-size:6.1px}}
`;
document.head.appendChild(style);

const svg=section.querySelector('.mm-scene');
const routes={
  war:{el:svg.querySelector('#mmWarship'),path:svg.querySelector('#mmRouteWar'),line:svg.querySelector('#mmBearingWar'),duration:56000,phase:.08,heave:1.1,heaveRate:.00065},
  fast:{el:svg.querySelector('#mmFastcraft'),path:svg.querySelector('#mmRouteFast'),line:svg.querySelector('#mmBearingFast'),duration:43000,phase:.39,heave:1.7,heaveRate:.0010},
  sub:{el:svg.querySelector('#mmSubmarine'),path:svg.querySelector('#mmRouteSub'),line:svg.querySelector('#mmBearingSub'),duration:69000,phase:.66,heave:.65,heaveRate:.00038}
};

for(const r of Object.values(routes))r.length=r.path.getTotalLength();
let last=performance.now();
function move(r,now){
  const f=((now/r.duration)+r.phase)%1;
  const d=f*r.length;
  const p=r.path.getPointAtLength(d);
  const ahead=r.path.getPointAtLength((d+3)%r.length);
  const dx=ahead.x-p.x,dy=ahead.y-p.y;
  const angle=Math.atan2(dy,dx)*180/Math.PI;
  const heave=Math.sin(now*r.heaveRate)*r.heave;
  r.el.setAttribute('transform',`translate(${p.x.toFixed(2)} ${(p.y+heave).toFixed(2)}) rotate(${angle.toFixed(2)})`);
  r.line.setAttribute('x2',p.x.toFixed(2));
  r.line.setAttribute('y2',(p.y+heave).toFixed(2));
}
function frame(now){
  if(!document.hidden){for(const r of Object.values(routes))move(r,now);last=now;}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();