(async()=>{
'use strict';
if(window.__rhkApplicationsStarted)return;
window.__rhkApplicationsStarted=true;

const market=document.getElementById('market');
if(!market)return;
market.querySelector('.market-motion')?.remove();
market.querySelector('.market-bridge')?.remove();
const head=market.querySelector('.section-head');

const section=document.createElement('section');
section.className='market-motion market-motion-v5';
section.innerHTML=`
  <div class="mm-stage">
    <div class="mm-circle" aria-label="Illustrative maritime operating picture using patent-described sensing architecture">
      <svg class="mm-scene" viewBox="0 0 800 800" role="img" aria-label="Surface combatant, fast craft and submarine moving past enlarged locator symbols for patent-described moored vector sensors">
        <defs>
          <radialGradient id="mmBg" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#0d201d"/><stop offset=".58" stop-color="#081411"/><stop offset="1" stop-color="#030706"/></radialGradient>
          <linearGradient id="mmWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#315f5b" stop-opacity=".38"/><stop offset=".18" stop-color="#163835" stop-opacity=".34"/><stop offset="1" stop-color="#06110f" stop-opacity=".08"/></linearGradient>
          <linearGradient id="mmShip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8c2bc"/><stop offset=".52" stop-color="#7f8b85"/><stop offset="1" stop-color="#4f5c56"/></linearGradient>
          <linearGradient id="mmSub" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4c5751"/><stop offset=".55" stop-color="#242d29"/><stop offset="1" stop-color="#101613"/></linearGradient>
          <filter id="mmGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="mmSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2"/></filter>
          <clipPath id="mmClip"><circle cx="400" cy="400" r="394"/></clipPath>
        </defs>

        <g clip-path="url(#mmClip)">
          <circle cx="400" cy="400" r="394" fill="url(#mmBg)"/>

          <!-- subtle bathymetric perspective -->
          <g class="mm-bathy" fill="none" stroke="#88a095" stroke-opacity=".055" stroke-width="1">
            <path d="M72 662 Q400 548 728 662"/><path d="M52 704 Q400 574 748 704"/><path d="M34 748 Q400 600 766 748"/>
            <path d="M112 615 Q400 520 688 615"/><path d="M160 574 Q400 500 640 574"/>
            <path d="M120 394 L680 394"/><path d="M150 455 L650 455"/><path d="M188 516 L612 516"/>
            <path d="M160 800 L310 390"/><path d="M270 800 L350 390"/><path d="M400 800 L400 390"/><path d="M530 800 L450 390"/><path d="M640 800 L490 390"/>
          </g>

          <!-- visible air/water boundary -->
          <rect x="0" y="286" width="800" height="514" fill="url(#mmWater)"/>
          <path d="M0 292 C72 278 125 304 194 290 S320 279 389 293 S525 306 602 287 S727 280 800 295" fill="none" stroke="#c0d8d1" stroke-opacity=".42" stroke-width="2"/>
          <path d="M0 304 C80 291 143 316 220 303 S353 292 430 306 S573 316 642 300 S748 292 800 305" fill="none" stroke="#6f9690" stroke-opacity=".22" stroke-width="1"/>
          <text x="72" y="275" class="mm-svg-micro">SEA SURFACE // ILLUSTRATIVE</text>

          <!-- sensor locator 1 -->
          <g class="mm-node" transform="translate(255 500)">
            <circle r="24"/><circle r="42" class="mm-node-ring"/>
            <rect x="-8" y="-8" width="16" height="16" class="mm-base"/>
            <rect x="-4" y="-31" width="8" height="14" class="mm-meter"/><rect x="-4" y="17" width="8" height="14" class="mm-meter"/><rect x="-31" y="-4" width="14" height="8" class="mm-meter"/><rect x="17" y="-4" width="14" height="8" class="mm-meter"/>
            <line x1="0" y1="31" x2="0" y2="78" class="mm-tether"/><path d="M-13 84 L13 84 L20 96 L-20 96Z" class="mm-anchor"/>
            <circle r="56" class="mm-pulse p1"/><circle r="78" class="mm-pulse p2"/>
          </g>
          <g class="mm-node" transform="translate(530 505)">
            <circle r="24"/><circle r="42" class="mm-node-ring"/>
            <rect x="-8" y="-8" width="16" height="16" class="mm-base"/>
            <rect x="-4" y="-31" width="8" height="14" class="mm-meter"/><rect x="-4" y="17" width="8" height="14" class="mm-meter"/><rect x="-31" y="-4" width="14" height="8" class="mm-meter"/><rect x="17" y="-4" width="14" height="8" class="mm-meter"/>
            <line x1="0" y1="31" x2="0" y2="78" class="mm-tether"/><path d="M-13 84 L13 84 L20 96 L-20 96Z" class="mm-anchor"/>
            <circle r="56" class="mm-pulse p2"/><circle r="78" class="mm-pulse p3"/>
          </g>
          <g class="mm-node" transform="translate(390 650)">
            <circle r="24"/><circle r="42" class="mm-node-ring"/>
            <rect x="-8" y="-8" width="16" height="16" class="mm-base"/>
            <rect x="-4" y="-31" width="8" height="14" class="mm-meter"/><rect x="-4" y="17" width="8" height="14" class="mm-meter"/><rect x="-31" y="-4" width="14" height="8" class="mm-meter"/><rect x="17" y="-4" width="14" height="8" class="mm-meter"/>
            <line x1="0" y1="31" x2="0" y2="72" class="mm-tether"/><path d="M-13 78 L13 78 L20 90 L-20 90Z" class="mm-anchor"/>
            <circle r="56" class="mm-pulse p3"/><circle r="78" class="mm-pulse p1"/>
          </g>

          <!-- moving bearing geometry; endpoints track vessel lanes -->
          <line x1="255" y1="500" x2="170" y2="235" class="mm-bearing"><animate attributeName="x2" values="170;610;170" dur="24s" repeatCount="indefinite"/></line>
          <line x1="530" y1="505" x2="635" y2="340" class="mm-bearing"><animate attributeName="x2" values="635;225;635" dur="18s" repeatCount="indefinite"/></line>
          <line x1="390" y1="650" x2="170" y2="565" class="mm-bearing"><animate attributeName="x2" values="170;610;170" dur="28s" repeatCount="indefinite"/></line>

          <!-- detailed surface combatant; straight transit, slight heave only -->
          <g class="mm-vessel mm-warship">
            <animateTransform attributeName="transform" type="translate" values="170 235;610 235;170 235" dur="24s" repeatCount="indefinite"/>
            <g class="mm-heave-war">
              <animateTransform attributeName="transform" type="translate" values="0 0;0 -2;0 1;0 0" dur="7s" repeatCount="indefinite"/>
              <path d="M-74 8 L52 8 L79 1 L58 -9 L23 -12 L12 -29 L-9 -31 L-18 -17 L-45 -14 L-53 -4 L-78 0Z" fill="url(#mmShip)" stroke="#d9e0dc" stroke-opacity=".74"/>
              <path d="M-26 -15 L22 -15 L30 -24 L10 -29 L-13 -28Z" fill="#87928d"/><rect x="-9" y="-43" width="17" height="14" rx="1" fill="#a4afa9"/><path d="M-2 -43 L-2 -65" class="mm-detail"/><path d="M-18 -52 L14 -52" class="mm-detail"/><rect x="-7" y="-71" width="11" height="5" fill="#b8c2bc"/>
              <path d="M40 -7 L63 -7" class="mm-detail"/><circle cx="46" cy="-10" r="5" fill="#87928d"/>
              <path d="M-67 12 Q-22 20 58 13" class="mm-wake"/>
            </g>
          </g>

          <!-- detailed fast craft / SWCC-style context -->
          <g class="mm-vessel mm-fastcraft">
            <animateTransform attributeName="transform" type="translate" values="635 340;225 340;635 340" dur="18s" repeatCount="indefinite"/>
            <g>
              <animateTransform attributeName="transform" type="translate" values="0 0;0 2;0 -1;0 0" dur="4.8s" repeatCount="indefinite"/>
              <path d="M-55 7 L38 7 L61 -1 L47 -8 L19 -10 L7 -23 L-18 -24 L-29 -14 L-48 -9 L-60 -2Z" fill="#343e39" stroke="#c7d0cb" stroke-opacity=".68"/>
              <path d="M-18 -20 L10 -20 L22 -12 L-29 -12Z" fill="#5d6963"/><path d="M-7 -21 L-7 -40" class="mm-detail"/><path d="M-23 -32 L9 -32" class="mm-detail"/>
              <rect x="-48" y="8" width="12" height="7" rx="2" fill="#202724"/><rect x="-30" y="8" width="12" height="7" rx="2" fill="#202724"/>
              <path d="M-61 12 Q-25 22 44 13" class="mm-wake"/>
            </g>
          </g>

          <!-- detailed submarine; fixed attitude, no roll or orbiting -->
          <g class="mm-vessel mm-submarine">
            <animateTransform attributeName="transform" type="translate" values="170 565;610 565;170 565" dur="28s" repeatCount="indefinite"/>
            <g>
              <path d="M-82 0 C-70 -22 -39 -30 10 -28 C48 -26 72 -14 86 0 C72 14 48 26 10 28 C-39 30 -70 22 -82 0Z" fill="url(#mmSub)" stroke="#aab7b0" stroke-opacity=".62"/>
              <path d="M-4 -24 L5 -43 L21 -43 L28 -23Z" fill="#2b3530" stroke="#8e9b94" stroke-opacity=".5"/><rect x="9" y="-55" width="3" height="13" fill="#87938d"/>
              <path d="M-60 -5 L-90 -20 L-63 2Z" fill="#242d29"/><path d="M-60 5 L-90 20 L-63 -2Z" fill="#242d29"/><path d="M72 -4 L96 -15 L82 3Z" fill="#242d29"/><path d="M72 4 L96 15 L82 -3Z" fill="#242d29"/>
              <path d="M-5 -27 L-18 -42 L8 -29Z" fill="#343f39"/>
              <path d="M-77 3 Q-18 11 77 4" stroke="#7f8b85" stroke-opacity=".25" fill="none"/>
            </g>
          </g>

          <text x="98" y="114" class="mm-svg-label">MARITIME OPERATING PICTURE // CONCEPT</text>
          <text x="98" y="136" class="mm-svg-micro">PATENT-GROUNDED NODE ARCHITECTURE + ILLUSTRATIVE VESSEL CONTEXT</text>
          <text x="98" y="706" class="mm-svg-micro">PATENT LOCATORS ARE ENLARGED FOR LEGIBILITY // NOT PHYSICAL-SCALE RENDERINGS</text>
          <text x="98" y="728" class="mm-svg-micro">DASHED = SOURCE-TO-NODE BEARING GEOMETRY // NO DETECTION RANGE OR CLASSIFICATION CLAIM</text>
        </g>
      </svg>
    </div>
  </div>

  <div class="mm-copy">
    <span class="mm-kicker">DEFENSE FIRST // PATENT IN CONTEXT</span>
    <div class="mm-point"><h3>Distributed directional sensing</h3><p>The operating picture shows how a compact directional sensor could contribute bearing information in a maritime scene. The vessels are illustrative context, not validated targets or fielded Navy deployments.</p></div>
    <div class="mm-point"><h3>Moored architecture</h3><p>Each enlarged locator preserves the disclosed FIG. 1 relationships: floating base <b>102</b>, flow meters <b>104</b>, retaining thread <b>106</b> and anchor <b>108</b>.</p></div>
    <div class="mm-point"><h3>Bearing geometry, not performance</h3><p>Dashed lines connect each moving source context to a nearby node to explain direction-of-arrival geometry only. No range, source level, SNR, classification or probability-of-detection model is implied.</p></div>
    <div class="mm-foot">ILLUSTRATIVE OPERATING CONTEXT // US11287508B2 ARCHITECTURE</div>
  </div>`;

if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');
style.textContent=`
.market-motion-v5{display:grid;grid-template-columns:minmax(520px,1.08fr) minmax(360px,.92fr);gap:54px;align-items:center;margin:30px 0 46px;padding:8px 0 26px}.market-motion-v5 .mm-stage{min-height:680px;display:flex;align-items:center;justify-content:center}.market-motion-v5 .mm-circle{position:relative;width:min(680px,96%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(198,211,202,.28);background:#06100e;box-shadow:0 24px 90px rgba(0,0,0,.46),inset 0 0 110px rgba(0,0,0,.34)}.market-motion-v5 .mm-scene{display:block;width:100%;height:100%}.market-motion-v5 .mm-svg-label,.market-motion-v5 .mm-svg-micro{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;fill:#aab6ad}.market-motion-v5 .mm-svg-label{font-size:10px}.market-motion-v5 .mm-svg-micro{font-size:7.2px;fill:#77847b}.market-motion-v5 .mm-node>circle:first-child{fill:#0b1512;stroke:#c0cbc3;stroke-width:1.4}.market-motion-v5 .mm-node-ring{fill:none;stroke:#9caaa0;stroke-opacity:.28;stroke-width:1}.market-motion-v5 .mm-base{fill:#d5ddd7;fill-opacity:.74}.market-motion-v5 .mm-meter{fill:#8f9c94;fill-opacity:.82}.market-motion-v5 .mm-tether{stroke:#98a69d;stroke-opacity:.46;stroke-dasharray:5 7}.market-motion-v5 .mm-anchor{fill:#56635c;fill-opacity:.58;stroke:#8e9b94;stroke-opacity:.36}.market-motion-v5 .mm-bearing{stroke:#c5b47e;stroke-opacity:.55;stroke-width:1.2;stroke-dasharray:6 8}.market-motion-v5 .mm-detail{stroke:#d0d7d2;stroke-opacity:.62;stroke-width:1.5;fill:none}.market-motion-v5 .mm-wake{stroke:#c9ded8;stroke-opacity:.19;stroke-width:2;fill:none;filter:url(#mmSoft)}.market-motion-v5 .mm-pulse{fill:none;stroke:#b7c5bb;stroke-width:1;stroke-opacity:.12;transform-box:fill-box;transform-origin:center;animation:mmPulse 6s linear infinite}.market-motion-v5 .mm-pulse.p2{animation-delay:-2s}.market-motion-v5 .mm-pulse.p3{animation-delay:-4s}@keyframes mmPulse{0%{transform:scale(.72);opacity:.02}45%{opacity:.18}100%{transform:scale(1.28);opacity:0}}.market-motion-v5 .mm-copy{padding-right:3%;display:flex;flex-direction:column;justify-content:center}.market-motion-v5 .mm-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9eaa9a;margin-bottom:22px}.market-motion-v5 .mm-point{padding:0 0 25px;margin-bottom:24px;border-bottom:1px solid rgba(169,181,155,.13)}.market-motion-v5 .mm-point h3{margin:0 0 9px;font-size:30px;line-height:1.04;letter-spacing:-.038em}.market-motion-v5 .mm-point p{margin:0;max-width:660px;color:#929a91;font-size:12.5px;line-height:1.62}.market-motion-v5 .mm-point b{color:#c4ccc5;font-weight:600}.market-motion-v5 .mm-foot{color:#697269;font:8.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.055em}@media(max-width:1050px){.market-motion-v5{grid-template-columns:1fr;gap:26px}.market-motion-v5 .mm-stage{min-height:auto}.market-motion-v5 .mm-circle{width:min(650px,86vw)}.market-motion-v5 .mm-copy{padding:0 5%}.market-motion-v5 .mm-point h3{font-size:25px}}@media(max-width:600px){.market-motion-v5 .mm-circle{width:92vw}.market-motion-v5 .mm-copy{padding:0 3%}.market-motion-v5 .mm-point h3{font-size:22px}.market-motion-v5 .mm-point p{font-size:11.5px}.market-motion-v5 .mm-svg-label{font-size:9px}.market-motion-v5 .mm-svg-micro{font-size:6.3px}}
`;
document.head.appendChild(style);
})();