(()=>{'use strict';
const physics=document.getElementById('physics');
const host=physics?.querySelector('.results .diagram');
if(!host)return;

const radials=16;
let spokes='',rings='';
for(let i=0;i<radials;i++){
  const a=(Math.PI*2*i/radials),x=(Math.cos(a)*98).toFixed(1),y=(Math.sin(a)*98).toFixed(1);
  spokes+=`<line class="mesh-wire minor" x1="0" y1="0" x2="${x}" y2="${y}"/>`;
}
for(let r=18;r<=92;r+=12)rings+=`<circle class="mesh-wire" cx="0" cy="0" r="${r}"/>`;

host.classList.add('sensor-engineering');
host.innerHTML=`
<svg viewBox="0 0 980 500" role="img" aria-label="Conceptual engineering cutaway of the NRL mesh-type acoustic vector sensor and optical displacement readout">
  <defs>
    <marker id="engArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" class="wave-arrow"/></marker>
    <linearGradient id="engFrame" x1="0" x2="1"><stop offset="0" stop-color="#0b0d0b"/><stop offset=".5" stop-color="#20251f"/><stop offset="1" stop-color="#0a0c0a"/></linearGradient>
  </defs>

  <!-- acoustic field / particle motion -->
  <g id="engField" transform="translate(34 88)">
    <text x="0" y="0" class="eng-label">INCIDENT FIELD</text>
    <path class="flow" d="M0 58 C48 29 98 86 148 58 S246 30 296 58" marker-end="url(#engArrow)"/>
    <path class="flow" d="M0 93 C48 64 98 121 148 93 S246 65 296 93" marker-end="url(#engArrow)"/>
    <path class="flow" d="M0 128 C48 99 98 156 148 128 S246 100 296 128" marker-end="url(#engArrow)"/>
    <g opacity=".48">
      <circle class="particle" cx="38" cy="183" r="2.4"/><circle class="particle" cx="76" cy="166" r="2.1"/><circle class="particle" cx="112" cy="189" r="2.6"/><circle class="particle" cx="151" cy="170" r="2.2"/><circle class="particle" cx="188" cy="190" r="2.4"/><circle class="particle" cx="226" cy="168" r="2.2"/><circle class="particle" cx="264" cy="187" r="2.5"/>
    </g>
    <line id="engFlowVector" x1="42" y1="221" x2="233" y2="221" class="optical" marker-end="url(#engArrow)"/>
    <text x="42" y="247" class="eng-small">PARTICLE-VELOCITY VECTOR</text>
    <text id="engAngleValue" x="42" y="265" class="eng-value">20° incidence</text>
  </g>

  <!-- sensor package -->
  <g transform="translate(466 255)">
    <ellipse cx="0" cy="4" rx="137" ry="114" fill="url(#engFrame)" stroke="#7f887c" stroke-width="1.2"/>
    <ellipse cx="0" cy="4" rx="115" ry="94" class="metal-dark"/>
    <text x="-82" y="-126" class="eng-small">MICRO-FABRICATED FRAME</text>
    <line x1="-30" y1="-115" x2="-12" y2="-91" class="callout"/>

    <g id="engMesh" class="mesh-flex" transform="scale(1 .76)">
      ${rings}${spokes}
      <circle class="mesh-highlight" cx="0" cy="0" r="99"/>
      <circle class="mesh-highlight" cx="0" cy="0" r="5.5"/>
    </g>
    <ellipse id="engDeflectHalo" cx="0" cy="4" rx="36" ry="17" fill="none" stroke="#e4e7df" stroke-width=".7" opacity=".25"/>
    <circle id="engDeflectPoint" class="deflect-marker" cx="0" cy="4" r="3.2"/>

    <line x1="-137" y1="117" x2="137" y2="117" class="dimension"/>
    <line x1="-137" y1="109" x2="-137" y2="126" class="dimension"/><line x1="137" y1="109" x2="137" y2="126" class="dimension"/>
    <text x="-37" y="139" class="eng-value"><tspan id="engDiameterValue">6.0</tspan> mm OD</text>

    <line x1="-82" y1="-30" x2="-166" y2="-58" class="callout"/>
    <text x="-247" y="-61" class="eng-label">FINE 2-D WEB</text>
    <text x="-247" y="-44" class="eng-small">viscous drag → deformation</text>

    <line x1="49" y1="42" x2="145" y2="67" class="callout"/>
    <text x="151" y="71" class="eng-label">NORMAL DISPLACEMENT</text>
    <text x="151" y="88" class="eng-small">measured optically</text>
  </g>

  <!-- optical probe / package -->
  <g class="probe-glow" transform="translate(780 208)">
    <rect x="0" y="0" width="126" height="78" rx="7" class="metal"/>
    <circle cx="13" cy="39" r="8" class="metal-dark"/><circle cx="13" cy="39" r="3" fill="#e2e5de"/>
    <text x="33" y="30" class="eng-label">OPTICAL PROBE</text>
    <text x="33" y="49" class="eng-small">displacement readout</text>
    <line id="engLaser" x1="13" y1="39" x2="-250" y2="49" class="laser"/>
    <circle id="engProbeSpot" cx="-250" cy="49" r="4" fill="#e3e6df" opacity=".86"/>
  </g>

  <path d="M844 287 V328 H780" class="fine-dim"/>
  <rect x="700" y="328" width="160" height="60" rx="6" class="metal-dark"/>
  <text x="718" y="352" class="eng-label">SIGNAL PROCESSING</text>
  <text x="718" y="371" class="eng-small">displacement → vector component</text>

  <!-- packaging context -->
  <g transform="translate(390 420)">
    <path d="M0 0 H160 L139 28 H22Z" class="metal"/><line x1="80" y1="28" x2="80" y2="54" class="fine-dim"/>
    <text x="26" y="18" class="eng-small">FLOATING / MOORED CONTEXT</text>
  </g>

  <!-- data panel preserves IDs used by existing physics code -->
  <g transform="translate(694 72)">
    <rect width="238" height="104" rx="6" class="data-panel"/>
    <text x="14" y="21" class="eng-kicker">LIVE MODEL</text>
    <text id="arraySpanSvg" x="14" y="45" class="eng-value">—</text>
    <text id="fiberSvg" x="14" y="67" class="eng-value">—</text>
    <text id="directionSvg" x="14" y="89" class="eng-value">—</text>
  </g>
</svg>
<div class="sensor-cutaway-caption">
  <div class="cutaway-copy">
    <div class="cutaway-kicker">Conceptual engineering cutaway</div>
    <div class="cutaway-title">Micro-mesh particle-motion transducer with optical displacement readout.</div>
    <div class="cutaway-note">Based on public NRL patent and literature descriptions. Geometry is illustrative; displayed mesh deformation is intentionally exaggerated so the mechanism is visible.</div>
  </div>
  <div id="engVisualScale" class="cutaway-status">Display deformation exaggerated</div>
</div>`;

const ids={freq:document.getElementById('freq'),spl:document.getElementById('spl'),angle:document.getElementById('angle'),diameter:document.getElementById('diameter'),spacing:document.getElementById('spacing')};
function update(){
  if(!ids.freq)return;
  const spl=+ids.spl.value,a=+ids.angle.value,D=+ids.diameter.value,d=+ids.spacing.value;
  const p=1e-6*Math.pow(10,spl/20),fiber=2.7*Math.pow(D/6,2)*(20/d),proj=Math.abs(Math.cos(a*Math.PI/180)),def=.3*(fiber/2.7)*p*proj;
  const visual=Math.max(.15,Math.min(1,(Math.log10(Math.max(def,1e-7))+7)/7));
  const px=2+visual*8;
  const mesh=document.getElementById('engMesh');
  const point=document.getElementById('engDeflectPoint');
  const halo=document.getElementById('engDeflectHalo');
  if(mesh){mesh.style.transform=`translateY(${px.toFixed(1)}px) scale(1 ${(.76+visual*.025).toFixed(3)})`;mesh.style.opacity=String(.8+visual*.2)}
  if(point){point.setAttribute('cy',String(4+px));point.setAttribute('r',String(2.8+visual*1.4))}
  if(halo){halo.setAttribute('cy',String(4+px));halo.setAttribute('ry',String(17+visual*5));halo.setAttribute('opacity',String(.18+visual*.34))}
  const spot=document.getElementById('engProbeSpot');if(spot)spot.setAttribute('cy',String(49+px*.45));
  const laser=document.getElementById('engLaser');if(laser)laser.setAttribute('y2',String(49+px*.45));
  const angle=document.getElementById('engAngleValue');if(angle)angle.textContent=`${Math.round(a)}° incidence`;
  const diameter=document.getElementById('engDiameterValue');if(diameter)diameter.textContent=D.toFixed(1);
  const vector=document.getElementById('engFlowVector');if(vector){const len=105+proj*95;const ar=(a-18)*Math.PI/180;vector.setAttribute('x2',String(42+Math.cos(ar)*len));vector.setAttribute('y2',String(221+Math.sin(ar)*len*.25))}
  const scale=document.getElementById('engVisualScale');if(scale)scale.textContent=`Calculated response ≈ ${def<.001?(def*1000).toFixed(3)+' pm':def.toFixed(4)+' nm'} · display exaggerated`;
}
Object.values(ids).forEach(el=>el&&el.addEventListener('input',update));
update();
})();