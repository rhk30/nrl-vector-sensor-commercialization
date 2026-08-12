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
<svg viewBox="0 0 980 520" role="img" aria-label="Conceptual engineering cutaway of the NRL mesh-type acoustic vector sensor and optical displacement readout">
  <defs>
    <marker id="engArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" class="wave-arrow"/></marker>
    <linearGradient id="engFrame" x1="0" x2="1"><stop offset="0" stop-color="#0b0d0b"/><stop offset=".5" stop-color="#20251f"/><stop offset="1" stop-color="#0a0c0a"/></linearGradient>
  </defs>

  <text x="28" y="30" class="eng-kicker">CONCEPTUAL ENGINEERING CUTAWAY // PUBLIC PATENT + LITERATURE BASIS</text>
  <text x="28" y="54" class="eng-title">Micro-mesh particle-motion transducer with optical displacement readout</text>
  <text x="28" y="73" class="eng-small">Geometry is illustrative. Mesh deflection below is deliberately exaggerated so the operating principle is visible.</text>

  <!-- acoustic field / particle motion -->
  <g id="engField" transform="translate(25 120)">
    <text x="0" y="0" class="eng-label">INCIDENT LOW-FREQUENCY FIELD</text>
    <path class="flow" d="M0 58 C48 29 98 86 148 58 S246 30 296 58" marker-end="url(#engArrow)"/>
    <path class="flow" d="M0 93 C48 64 98 121 148 93 S246 65 296 93" marker-end="url(#engArrow)"/>
    <path class="flow" d="M0 128 C48 99 98 156 148 128 S246 100 296 128" marker-end="url(#engArrow)"/>
    <g opacity=".48">
      <circle class="particle" cx="38" cy="183" r="2.4"/><circle class="particle" cx="76" cy="166" r="2.1"/><circle class="particle" cx="112" cy="189" r="2.6"/><circle class="particle" cx="151" cy="170" r="2.2"/><circle class="particle" cx="188" cy="190" r="2.4"/><circle class="particle" cx="226" cy="168" r="2.2"/><circle class="particle" cx="264" cy="187" r="2.5"/>
    </g>
    <line id="engFlowVector" x1="42" y1="221" x2="233" y2="221" class="optical" marker-end="url(#engArrow)"/>
    <text x="42" y="247" class="eng-small">LOCAL PARTICLE-VELOCITY VECTOR</text>
    <text id="engAngleValue" x="42" y="266" class="eng-value">20° incidence to mesh normal</text>
  </g>

  <!-- sensor package -->
  <g transform="translate(468 275)">
    <ellipse cx="0" cy="4" rx="137" ry="114" fill="url(#engFrame)" stroke="#7f887c" stroke-width="1.2"/>
    <ellipse cx="0" cy="4" rx="115" ry="94" class="metal-dark"/>
    <text x="-95" y="-126" class="eng-small">MICRO-FABRICATED SUPPORT FRAME</text>
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
    <text x="-38" y="139" class="eng-value"><tspan id="engDiameterValue">6.0</tspan> mm mesh OD</text>

    <line x1="-85" y1="-28" x2="-188" y2="-65" class="callout"/><text x="-278" y="-70" class="eng-label">FINE 2-D WEB</text><text x="-278" y="-53" class="eng-small">viscous drag bends / stretches mesh</text>
    <line x1="48" y1="44" x2="154" y2="74" class="callout"/><text x="161" y="78" class="eng-label">NORMAL DISPLACEMENT</text><text x="161" y="95" class="eng-small">optically measured at/near mesh</text>
  </g>

  <!-- optical probe / package -->
  <g class="probe-glow" transform="translate(780 230)">
    <rect x="0" y="0" width="126" height="78" rx="7" class="metal"/>
    <circle cx="13" cy="39" r="8" class="metal-dark"/><circle cx="13" cy="39" r="3" fill="#e2e5de"/>
    <text x="33" y="29" class="eng-label">OPTICAL PROBE</text><text x="33" y="47" class="eng-small">interferometric / displacement</text><text x="33" y="62" class="eng-small">readout embodiment</text>
    <line id="engLaser" x1="13" y1="39" x2="-250" y2="49" class="laser"/>
    <circle id="engProbeSpot" cx="-250" cy="49" r="4" fill="#e3e6df" opacity=".86"/>
  </g>
  <path d="M844 309 V350 H780" class="fine-dim"/><rect x="700" y="350" width="160" height="66" rx="6" class="metal-dark"/>
  <text x="718" y="374" class="eng-label">SIGNAL CONDITIONING</text><text x="718" y="392" class="eng-small">displacement → vector component</text><text x="718" y="407" class="eng-small">bearing / intensity processing</text>

  <!-- packaging context -->
  <g transform="translate(390 450)">
    <path d="M0 0 H160 L139 28 H22Z" class="metal"/><line x1="80" y1="28" x2="80" y2="58" class="fine-dim"/>
    <text x="27" y="18" class="eng-small">FLOATING / MOORED PACKAGE CONTEXT</text>
  </g>

  <!-- data panel preserves IDs used by existing physics code -->
  <g transform="translate(694 95)">
    <rect width="238" height="105" rx="6" class="data-panel"/>
    <text x="14" y="22" class="eng-kicker">LIVE MODEL CONTEXT</text>
    <text id="arraySpanSvg" x="14" y="46" class="eng-value">—</text>
    <text id="fiberSvg" x="14" y="68" class="eng-value">—</text>
    <text id="directionSvg" x="14" y="90" class="eng-value">—</text>
  </g>

  <g transform="translate(28 459)">
    <text class="eng-label" x="0" y="0">MECHANISM</text><text class="eng-small" x="82" y="0">acoustic particle motion → viscous force on fine web → normal mesh deformation → displacement readout → directional component</text>
    <text class="eng-label" x="0" y="24">VISUAL SCALE</text><text id="engVisualScale" class="eng-small" x="82" y="24">mesh deformation shown at greatly exaggerated scale</text>
  </g>
</svg>`;

const ids={freq:document.getElementById('freq'),spl:document.getElementById('spl'),angle:document.getElementById('angle'),diameter:document.getElementById('diameter'),spacing:document.getElementById('spacing')};
function update(){
  if(!ids.freq)return;
  const f=+ids.freq.value,spl=+ids.spl.value,a=+ids.angle.value,D=+ids.diameter.value,d=+ids.spacing.value;
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
  const angle=document.getElementById('engAngleValue');if(angle)angle.textContent=`${Math.round(a)}° incidence to mesh normal`;
  const diameter=document.getElementById('engDiameterValue');if(diameter)diameter.textContent=D.toFixed(1);
  const vector=document.getElementById('engFlowVector');if(vector){const len=105+proj*95;const ar=(a-18)*Math.PI/180;vector.setAttribute('x2',String(42+Math.cos(ar)*len));vector.setAttribute('y2',String(221+Math.sin(ar)*len*.25))}
  const scale=document.getElementById('engVisualScale');if(scale)scale.textContent=`calculated response ≈ ${def<.001?(def*1000).toFixed(3)+' pm':def.toFixed(4)+' nm'}; display displacement exaggerated for visibility`;
}
Object.values(ids).forEach(el=>el&&el.addEventListener('input',update));
update();
})();