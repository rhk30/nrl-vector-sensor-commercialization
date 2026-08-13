(()=>{'use strict';
const market=document.getElementById('market');
if(!market||market.querySelector('.market-motion'))return;
const old=market.querySelector('.market-bridge');if(old)old.remove();
const head=market.querySelector('.section-head');
const section=document.createElement('section');section.className='market-motion';
section.innerHTML=`
  <div class="mm-stage">
    <div class="mm-grid" aria-hidden="true"></div>
    <div class="mm-circle">
      <video class="mm-video" autoplay muted loop playsinline preload="metadata" aria-hidden="true" src="https://upload.wikimedia.org/wikipedia/commons/2/24/USN_Destroyers_hauling_it.webm"></video>
      <div class="mm-grade"></div>
      <svg viewBox="0 0 600 600" role="img" aria-label="Patent-described floating vector sensor architecture over muted Navy operating-context footage">
        <defs>
          <radialGradient id="mmLobe1"><stop offset="0" stop-color="#c9d2c5" stop-opacity=".18"/><stop offset="1" stop-color="#c9d2c5" stop-opacity="0"/></radialGradient>
          <radialGradient id="mmLobe2"><stop offset="0" stop-color="#9ca99a" stop-opacity=".13"/><stop offset="1" stop-color="#9ca99a" stop-opacity="0"/></radialGradient>
        </defs>
        <circle cx="300" cy="315" r="205" fill="url(#mmLobe2)" class="mm-breathe slow"/>
        <circle cx="300" cy="315" r="145" fill="url(#mmLobe1)" class="mm-breathe"/>
        <circle cx="300" cy="315" r="92" class="mm-range"/>
        <circle cx="300" cy="315" r="145" class="mm-range soft"/>

        <g class="mm-network">
          <line x1="300" y1="315" x2="198" y2="226"/><line x1="300" y1="315" x2="405" y2="223"/><line x1="300" y1="315" x2="438" y2="357"/><line x1="300" y1="315" x2="220" y2="411"/>
          <circle cx="198" cy="226" r="4"/><circle cx="405" cy="223" r="4"/><circle cx="438" cy="357" r="4"/><circle cx="220" cy="411" r="4"/>
        </g>

        <g class="mm-patent-node" transform="translate(300 315)">
          <circle r="36" class="mm-base"/>
          <rect x="-12" y="-70" width="24" height="17" class="mm-meter"/><line x1="0" y1="-53" x2="0" y2="-36"/>
          <rect x="-12" y="53" width="24" height="17" class="mm-meter"/><line x1="0" y1="36" x2="0" y2="53"/>
          <rect x="-70" y="-12" width="17" height="24" class="mm-meter"/><line x1="-53" y1="0" x2="-36" y2="0"/>
          <rect x="53" y="-12" width="17" height="24" class="mm-meter"/><line x1="36" y1="0" x2="53" y2="0"/>
          <text x="0" y="4" text-anchor="middle">102</text>
          <text x="76" y="-48">104 ×4</text>
          <line x1="0" y1="36" x2="0" y2="138" class="mm-thread"/>
          <text x="10" y="106">106</text>
          <g transform="translate(0 154)"><rect x="-38" y="-12" width="76" height="24" rx="3" class="mm-anchor"/><text x="0" y="4" text-anchor="middle">108</text></g>
        </g>

        <g class="mm-source-orbit">
          <circle cx="300" cy="132" r="10" class="mm-source"/>
          <circle cx="300" cy="132" r="26" class="mm-pulse"/><circle cx="300" cy="132" r="42" class="mm-pulse two"/>
        </g>
        <line id="mmBearing" x1="300" y1="315" x2="300" y2="132" class="mm-bearing"/>
        <text x="30" y="560" class="mm-caption">PATENT CORE // 102 FLOATING BASE · 104 FLOW METERS · 106 RETAINING THREAD · 108 ANCHOR</text>
      </svg>
    </div>
  </div>
  <div class="mm-copy">
    <span class="mm-kicker">DEFENSE FIRST // PATENT-IN-CONTEXT</span>
    <div class="mm-point"><h3>Distributed directional sensing</h3><p>The patent describes vector sensing that uses particle-motion orientation to recover direction-of-arrival information without requiring a conventional wavelength-scale pressure array.</p></div>
    <div class="mm-point"><h3>Moored architecture</h3><p>US11287508B2 discloses a floating base with one or more flow meters, a retaining thread and an anchor. FIG. 1 shows four flow meters around the base.</p></div>
    <div class="mm-point"><h3>Networked receiver path</h3><p>The disclosure also contemplates external devices and centralized aggregation of measurements from multiple vector sensors. The Navy footage is operating context only, not a claimed installation.</p></div>
    <div class="mm-foot">AUTOPLAY VISUAL // NO DETECTION RANGE, SNR, TARGET CLASSIFICATION OR OPERATIONAL PERFORMANCE IS MODELED</div>
  </div>`;
if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');style.textContent=`
.market-motion{display:grid;grid-template-columns:minmax(420px,1.02fr) minmax(360px,.98fr);gap:52px;align-items:center;margin:34px 0 42px;padding:22px 0 28px}.mm-stage{position:relative;min-height:620px;display:flex;align-items:center;justify-content:center}.mm-grid{position:absolute;inset:28px 7% 28px 0;background-image:linear-gradient(rgba(160,171,158,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(160,171,158,.07) 1px,transparent 1px);background-size:72px 72px;mask-image:linear-gradient(90deg,#000 65%,transparent)}.mm-circle{position:relative;width:min(570px,90%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(204,213,201,.28);box-shadow:0 0 0 1px rgba(255,255,255,.02),0 28px 90px rgba(0,0,0,.38);background:#080a08}.mm-video,.mm-grade,.mm-circle svg{position:absolute;inset:0;width:100%;height:100%}.mm-video{object-fit:cover;filter:grayscale(1) saturate(.38) contrast(1.18) brightness(.42);transform:scale(1.06)}.mm-grade{background:radial-gradient(circle at 48% 54%,rgba(89,105,90,.06),rgba(5,6,5,.12) 50%,rgba(4,5,4,.52) 100%),linear-gradient(180deg,rgba(4,5,4,.08),rgba(4,5,4,.28));z-index:1}.mm-circle svg{z-index:2}.mm-range{fill:none;stroke:rgba(205,215,201,.18);stroke-width:1}.mm-range.soft{stroke-dasharray:4 9;opacity:.7}.mm-network line{stroke:rgba(225,232,221,.28);stroke-width:1}.mm-network circle{fill:#e3e8df;opacity:.75}.mm-base{fill:rgba(9,12,9,.78);stroke:#d7dfd2;stroke-width:1.5}.mm-meter,.mm-anchor{fill:rgba(7,9,7,.82);stroke:#c8d1c4;stroke-width:1}.mm-patent-node line{stroke:#aeb8aa;stroke-width:1}.mm-patent-node text,.mm-caption{fill:#d3dbcf;font:9px ui-monospace,SFMono-Regular,Menlo,monospace}.mm-thread{stroke-dasharray:4 5!important}.mm-source{fill:#e9eee6}.mm-source-orbit{transform-origin:300px 315px;animation:mmOrbit 16s linear infinite}.mm-pulse{fill:none;stroke:#d7dfd2;stroke-width:1;animation:mmPulse 3.6s ease-out infinite;transform-origin:300px 132px}.mm-pulse.two{animation-delay:-1.8s}.mm-bearing{stroke:#d4dcd0;stroke-width:1;stroke-dasharray:4 6;opacity:.55}.mm-caption{font-size:7.6px;letter-spacing:.035em}.mm-breathe{transform-origin:300px 315px;animation:mmBreathe 5.5s ease-in-out infinite}.mm-breathe.slow{animation-duration:8s}.mm-copy{padding-right:5%;display:flex;flex-direction:column;justify-content:center}.mm-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9eaa9a;margin-bottom:20px}.mm-point{padding:0 0 26px;margin-bottom:24px;border-bottom:1px solid rgba(169,181,155,.13)}.mm-point:last-of-type{margin-bottom:14px}.mm-point h3{margin:0 0 8px;font-size:28px;line-height:1.06;letter-spacing:-.03em}.mm-point p{margin:0;max-width:650px;color:#929a91;font-size:12px;line-height:1.56}.mm-foot{color:#697269;font:8.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em}@keyframes mmOrbit{to{transform:rotate(360deg)}}@keyframes mmPulse{0%{opacity:.45;transform:scale(.45)}100%{opacity:0;transform:scale(1.6)}}@keyframes mmBreathe{0%,100%{transform:scale(.94);opacity:.65}50%{transform:scale(1.06);opacity:1}}
@media(max-width:1000px){.market-motion{grid-template-columns:1fr;gap:24px}.mm-stage{min-height:auto;padding:12px 0}.mm-circle{width:min(560px,82vw)}.mm-copy{padding:0 5%}.mm-point h3{font-size:24px}}
@media(max-width:600px){.market-motion{margin-top:22px}.mm-grid{display:none}.mm-circle{width:90vw}.mm-point{padding-bottom:20px;margin-bottom:20px}.mm-point h3{font-size:21px}.mm-point p{font-size:11px}}
@media(prefers-reduced-motion:reduce){.mm-source-orbit,.mm-pulse,.mm-breathe{animation:none!important}}
`;
document.head.appendChild(style);

const video=section.querySelector('.mm-video');if(video){video.muted=true;video.defaultMuted=true;video.volume=0;video.setAttribute('muted','');video.removeAttribute('controls');video.play().catch(()=>{});}
const line=section.querySelector('#mmBearing'),start=performance.now();
function tick(now){const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const a=reduced?0:((now-start)/16000)*Math.PI*2-Math.PI/2;const x=300+183*Math.cos(a),y=315+183*Math.sin(a);line?.setAttribute('x2',x.toFixed(1));line?.setAttribute('y2',y.toFixed(1));requestAnimationFrame(tick);}requestAnimationFrame(tick);
})();