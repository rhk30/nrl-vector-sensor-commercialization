(()=>{'use strict';
const market=document.getElementById('market');
if(!market||market.querySelector('.market-bridge'))return;
const head=market.querySelector('.section-head');
const bridge=document.createElement('section');
bridge.className='market-bridge';
bridge.innerHTML=`
  <div class="mb-copy">
    <span class="mb-kicker">PATENT GEOMETRY IN CONTEXT</span>
    <h3>One disclosed architecture. Multiple maritime contexts.</h3>
    <p>The animation below keeps the core geometry tied to US11287508B2: floating base <b>102</b>, four flow meters <b>104</b> as shown in FIG. 1, retaining thread <b>106</b>, anchor <b>108</b>, and an external receiver path. The moving source and ship are context only.</p>
    <div class="mb-boundary"><b>WHAT THIS ADDS</b><span>It connects the patent drawing to a defense use case without claiming detection range, target classification, bearing accuracy, or underwater performance.</span></div>
  </div>
  <div class="mb-visual" aria-label="Autoplay patent-grounded floating vector sensor architecture in a conceptual maritime defense context">
    <svg viewBox="0 0 760 620" role="img" aria-label="Floating base with four flow meters, retaining thread, anchor, moving acoustic source and external receiver path">
      <defs>
        <marker id="mbArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#b7c1b2"/></marker>
        <radialGradient id="mbGlow"><stop offset="0" stop-color="#a9b59b" stop-opacity=".13"/><stop offset="1" stop-color="#a9b59b" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="760" height="620" fill="#070907"/>
      <line x1="0" y1="104" x2="760" y2="104" class="mb-waterline"/>
      <text x="28" y="88" class="mb-tiny">SEA SURFACE</text>

      <circle cx="374" cy="305" r="192" fill="url(#mbGlow)"/>
      <circle cx="374" cy="305" r="150" class="mb-orbit"/>
      <circle cx="374" cy="305" r="105" class="mb-orbit inner"/>

      <g class="mb-ship" transform="translate(600 72)">
        <path d="M-77 18H66L89 4 22-5 2-26h-36l-10 19-38 2Z"/>
        <rect x="-25" y="-38" width="34" height="12"/>
        <line x1="-8" y1="-38" x2="-8" y2="-59"/>
        <text x="-57" y="44" class="mb-label">EXTERNAL DEVICE 214</text>
      </g>

      <g class="mb-sensor" transform="translate(374 305)">
        <circle r="52" class="mb-base"/>
        <text x="0" y="5" text-anchor="middle" class="mb-label">BASE 102</text>
        <g class="mb-meter" transform="translate(0 -83)"><rect x="-22" y="-8" width="44" height="16"/><line x1="0" y1="8" x2="0" y2="28"/></g>
        <g class="mb-meter" transform="translate(0 83)"><rect x="-22" y="-8" width="44" height="16"/><line x1="0" y1="-8" x2="0" y2="-28"/></g>
        <g class="mb-meter" transform="translate(-83 0) rotate(90)"><rect x="-22" y="-8" width="44" height="16"/><line x1="0" y1="8" x2="0" y2="28"/></g>
        <g class="mb-meter" transform="translate(83 0) rotate(90)"><rect x="-22" y="-8" width="44" height="16"/><line x1="0" y1="-8" x2="0" y2="-28"/></g>
        <text x="78" y="-85" class="mb-label">FLOW METERS 104</text>
        <text x="78" y="-69" class="mb-small">four shown in FIG. 1</text>
      </g>

      <line x1="374" y1="357" x2="374" y2="480" class="mb-thread"/>
      <text x="392" y="422" class="mb-label">RETAINING THREAD 106</text>
      <g transform="translate(374 516)">
        <rect x="-62" y="-19" width="124" height="38" rx="4" class="mb-anchor"/>
        <path d="M-49 19L-70 40M49 19L70 40M-70 40H70" class="mb-anchor-line"/>
        <text x="0" y="5" text-anchor="middle" class="mb-label">ANCHOR 108</text>
      </g>

      <path d="M374 480C478 430 536 244 596 111" class="mb-data" marker-end="url(#mbArrow)"/>
      <text x="495" y="332" class="mb-small">measurement / DOA data path</text>

      <g class="mb-source-orbit">
        <g class="mb-source">
          <ellipse rx="54" ry="14"/>
          <path d="M-8-13L0-29 10-13Z"/>
          <line x1="-29" y1="0" x2="-68" y2="0"/>
          <line x1="35" y1="0" x2="70" y2="0"/>
          <text x="-58" y="42" class="mb-label">ACOUSTIC SOURCE</text>
          <circle r="35" class="mb-wave"/><circle r="58" class="mb-wave delay1"/><circle r="82" class="mb-wave delay2"/>
        </g>
      </g>

      <line id="mbBearing" x1="374" y1="305" x2="180" y2="260" class="mb-bearing"/>
      <text x="28" y="586" class="mb-small">REDRAWN FROM PATENT DISCLOSURE // NOT PATENT CAD // CONTEXT ELEMENTS ARE ILLUSTRATIVE</text>
    </svg>
  </div>`;
if(head)head.insertAdjacentElement('afterend',bridge);else market.prepend(bridge);

const style=document.createElement('style');
style.textContent=`
.market-bridge{display:grid;grid-template-columns:minmax(280px,.72fr) minmax(0,1.28fr);gap:1px;margin:26px 0 30px;border:1px solid rgba(169,181,155,.16);background:rgba(169,181,155,.14)}
.mb-copy,.mb-visual{background:#080a08}.mb-copy{padding:26px 24px;display:flex;flex-direction:column;justify-content:center}.mb-kicker{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;color:#a9b59b}.mb-copy h3{font-size:25px;line-height:1.05;margin:8px 0 12px;letter-spacing:-.03em}.mb-copy p{font-size:11px;line-height:1.6;color:#929a91;margin:0}.mb-copy p b{color:#dfe3da}.mb-boundary{margin-top:22px;padding-top:14px;border-top:1px solid rgba(169,181,155,.15)}.mb-boundary b,.mb-boundary span{display:block}.mb-boundary b{font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;color:#a9b59b}.mb-boundary span{margin-top:7px;font-size:10px;line-height:1.5;color:#818a81}
.mb-visual{position:relative;min-height:500px;overflow:hidden}.mb-visual svg{display:block;width:100%;height:100%;min-height:500px}.mb-waterline{stroke:#343a34;stroke-width:1}.mb-orbit{fill:none;stroke:#2f352f;stroke-width:1;stroke-dasharray:4 8}.mb-orbit.inner{opacity:.45}.mb-tiny,.mb-label,.mb-small{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.mb-tiny{font-size:9px;fill:#6f776f}.mb-label{font-size:9px;fill:#d6ddd1}.mb-small{font-size:8px;fill:#737c73}.mb-base{fill:#111511;stroke:#c8d0c3;stroke-width:1.2}.mb-meter rect{fill:#0d100d;stroke:#b7c1b2}.mb-meter line{stroke:#8e988b}.mb-thread{stroke:#7d867d;stroke-width:1;stroke-dasharray:5 5}.mb-anchor{fill:#111411;stroke:#737c73}.mb-anchor-line{fill:none;stroke:#737c73}.mb-ship path,.mb-ship rect,.mb-source ellipse,.mb-source path{fill:#111411;stroke:#c5cdc0}.mb-ship line,.mb-source line{stroke:#a3ada0}.mb-data{fill:none;stroke:#9aa696;stroke-width:1;stroke-dasharray:5 6}.mb-bearing{stroke:#b9c4b5;stroke-width:1;stroke-dasharray:3 7;opacity:.5}.mb-wave{fill:none;stroke:#aab5a6;stroke-width:.7;opacity:0;animation:mbPulse 5.8s ease-out infinite}.mb-wave.delay1{animation-delay:-1.9s}.mb-wave.delay2{animation-delay:-3.8s}
.mb-source-orbit{transform-origin:374px 305px;animation:mbOrbit 18s linear infinite}.mb-source{transform:translate(150px,0)}
@keyframes mbOrbit{to{transform:rotate(360deg)}}@keyframes mbPulse{0%{opacity:.26;transform:scale(.3)}72%{opacity:.06}100%{opacity:0;transform:scale(1.18)}}
@media(max-width:900px){.market-bridge{grid-template-columns:1fr}.mb-copy{padding:20px}.mb-visual{min-height:430px}.mb-visual svg{min-height:430px}}
@media(prefers-reduced-motion:reduce){.mb-source-orbit,.mb-wave{animation:none}.mb-source-orbit{transform:rotate(0deg)}.mb-source{transform:translate(150px,0)}}
`;
document.head.appendChild(style);

// Keep the dashed bearing line connected to the moving context source.
const orbit=bridge.querySelector('.mb-source-orbit'),line=bridge.querySelector('#mbBearing');
let start=performance.now();
function tick(now){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const a=reduced?0:((now-start)/18000)*Math.PI*2;
  const x=374+150*Math.cos(a),y=305+150*Math.sin(a);
  line?.setAttribute('x2',x.toFixed(1));line?.setAttribute('y2',y.toFixed(1));
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
})();