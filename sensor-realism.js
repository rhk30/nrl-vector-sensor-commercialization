(()=>{'use strict';
const physics=document.getElementById('physics');
const host=physics?.querySelector('.results .diagram');
if(!host)return;
const radials=16;let spokes='',rings='';
for(let i=0;i<radials;i++){const a=Math.PI*2*i/radials,x=(Math.cos(a)*98).toFixed(1),y=(Math.sin(a)*98).toFixed(1);spokes+=`<line class="mesh-wire minor" x1="0" y1="0" x2="${x}" y2="${y}"/>`;}
for(let r=18;r<=92;r+=12)rings+=`<circle class="mesh-wire" cx="0" cy="0" r="${r}"/>`;
host.classList.add('sensor-engineering');
host.innerHTML=`
<svg viewBox="0 0 980 500" role="img" aria-label="Patent-grounded conceptual cutaway of the mesh-type acoustic vector sensor and optical displacement readout">
  <defs>
    <marker id="engArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" class="wave-arrow"/></marker>
    <linearGradient id="engFrame" x1="0" x2="1"><stop offset="0" stop-color="#0b0d0b"/><stop offset=".5" stop-color="#20251f"/><stop offset="1" stop-color="#0a0c0a"/></linearGradient>
  </defs>
  <g id="engField" transform="translate(34 88)">
    <text x="0" y="0" class="eng-label">INCIDENT ACOUSTIC FIELD</text>
    <path class="flow" d="M0 58 C48 29 98 86 148 58 S246 30 296 58" marker-end="url(#engArrow)"/>
    <path class="flow" d="M0 93 C48 64 98 121 148 93 S246 65 296 93" marker-end="url(#engArrow)"/>
    <path class="flow" d="M0 128 C48 99 98 156 148 128 S246 100 296 128" marker-end="url(#engArrow)"/>
    <g opacity=".48"><circle class="particle" cx="38" cy="183" r="2.4"/><circle class="particle" cx="76" cy="166" r="2.1"/><circle class="particle" cx="112" cy="189" r="2.6"/><circle class="particle" cx="151" cy="170" r="2.2"/><circle class="particle" cx="188" cy="190" r="2.4"/><circle class="particle" cx="226" cy="168" r="2.2"/><circle class="particle" cx="264" cy="187" r="2.5"/></g>
    <line id="engFlowVector" x1="42" y1="221" x2="233" y2="221" class="optical" marker-end="url(#engArrow)"/>
    <text x="42" y="247" class="eng-small">PARTICLE-VELOCITY ORIENTATION</text>
    <text id="engAngleValue" x="42" y="265" class="eng-value">0° incidence</text>
  </g>
  <g transform="translate(466 255)">
    <ellipse cx="0" cy="4" rx="137" ry="114" fill="url(#engFrame)" stroke="#7f887c" stroke-width="1.2"/>
    <ellipse cx="0" cy="4" rx="115" ry="94" class="metal-dark"/>
    <text x="-82" y="-126" class="eng-small">MICROFABRICATED SUPPORT FRAME</text>
    <line x1="-30" y1="-115" x2="-12" y2="-91" class="callout"/>
    <g id="engMesh" class="mesh-flex" transform="scale(1 .76)">${rings}${spokes}<circle class="mesh-highlight" cx="0" cy="0" r="99"/><circle class="mesh-highlight" cx="0" cy="0" r="5.5"/></g>
    <ellipse id="engDeflectHalo" cx="0" cy="4" rx="36" ry="17" fill="none" stroke="#e4e7df" stroke-width=".7" opacity=".25"/>
    <circle id="engDeflectPoint" class="deflect-marker" cx="0" cy="4" r="3.2"/>
    <line x1="-137" y1="117" x2="137" y2="117" class="dimension"/><line x1="-137" y1="109" x2="-137" y2="126" class="dimension"/><line x1="137" y1="109" x2="137" y2="126" class="dimension"/>
    <text x="-37" y="139" class="eng-value">6 mm OD</text>
    <line x1="-82" y1="-30" x2="-166" y2="-58" class="callout"/>
    <text x="-247" y="-61" class="eng-label">FINE 2-D WEB</text><text x="-247" y="-44" class="eng-small">viscous drag → out-of-plane deformation</text>
    <line x1="49" y1="42" x2="145" y2="67" class="callout"/>
    <text x="151" y="71" class="eng-label">NORMAL DISPLACEMENT</text><text x="151" y="88" class="eng-small">detected optically</text>
  </g>
  <g class="probe-glow" transform="translate(780 208)">
    <rect x="0" y="0" width="126" height="78" rx="7" class="metal"/><circle cx="13" cy="39" r="8" class="metal-dark"/><circle cx="13" cy="39" r="3" fill="#e2e5de"/>
    <text x="33" y="30" class="eng-label">OPTICAL PROBE</text><text x="33" y="49" class="eng-small">mirror displacement readout</text>
    <line id="engLaser" x1="13" y1="39" x2="-250" y2="49" class="laser"/><circle id="engProbeSpot" cx="-250" cy="49" r="4" fill="#e3e6df" opacity=".86"/>
  </g>
  <path d="M844 287 V328 H780" class="fine-dim"/><rect x="700" y="328" width="160" height="60" rx="6" class="metal-dark"/>
  <text x="718" y="352" class="eng-label">SIGNAL PROCESSING</text><text x="718" y="371" class="eng-small">displacement → vector component</text>
  <g transform="translate(390 420)"><path d="M0 0 H160 L139 28 H22Z" class="metal"/><line x1="80" y1="28" x2="80" y2="54" class="fine-dim"/><text x="28" y="18" class="eng-small">FLOATING / MOORED EMBODIMENT</text></g>
  <g transform="translate(694 72)"><rect width="238" height="104" rx="6" class="data-panel"/><text x="14" y="21" class="eng-kicker">PATENT REFERENCE</text><text id="arraySpanSvg" x="14" y="45" class="eng-value">6 mm prototype OD</text><text id="fiberSvg" x="14" y="67" class="eng-value">≈20 μm beam separation</text><text id="directionSvg" x="14" y="89" class="eng-value">≈2.7 m total fiber</text></g>
</svg>
<div class="sensor-cutaway-caption"><div class="cutaway-copy"><div class="cutaway-kicker">Patent-grounded conceptual cutaway</div><div class="cutaway-title">Micro-mesh particle-motion transducer with optical displacement readout.</div><div class="cutaway-note">Mechanism and labeled dimensions follow US11287508B2 / US11408961B2. Overall package geometry is illustrative. Mesh movement is exaggerated and normalized only to show the patent-described cosine-type directional response.</div></div><div id="engVisualScale" class="cutaway-status">Normalized cos θ display · not displacement magnitude</div></div>`;
const angle=document.getElementById('angle');
function update(){
  const a=+(angle?.value||0),proj=Math.abs(Math.cos(a*Math.PI/180));
  const px=2+proj*6;
  const mesh=document.getElementById('engMesh'),point=document.getElementById('engDeflectPoint'),halo=document.getElementById('engDeflectHalo');
  if(mesh){mesh.style.transform=`translateY(${px.toFixed(1)}px) scale(1 ${(0.76+proj*.018).toFixed(3)})`;mesh.style.opacity=String(.82+proj*.18);}
  if(point){point.setAttribute('cy',String(4+px));point.setAttribute('r',String(3+proj));}
  if(halo){halo.setAttribute('cy',String(4+px));halo.setAttribute('ry',String(17+proj*4));halo.setAttribute('opacity',String(.18+proj*.28));}
  const spot=document.getElementById('engProbeSpot');if(spot)spot.setAttribute('cy',String(49+px*.45));
  const laser=document.getElementById('engLaser');if(laser)laser.setAttribute('y2',String(49+px*.45));
  const angleValue=document.getElementById('engAngleValue');if(angleValue)angleValue.textContent=`${Math.round(a)}° incidence`;
  const vector=document.getElementById('engFlowVector');if(vector){const len=115+proj*80,ar=(a-18)*Math.PI/180;vector.setAttribute('x2',String(42+Math.cos(ar)*len));vector.setAttribute('y2',String(221+Math.sin(ar)*len*.25));}
  const scale=document.getElementById('engVisualScale');if(scale)scale.textContent=`Normalized cos θ display: ${(proj*100).toFixed(0)}% · deformation magnitude not modeled`;
  const p1=document.getElementById('arraySpanSvg'),p2=document.getElementById('fiberSvg'),p3=document.getElementById('directionSvg');
  if(p1)p1.textContent='6 mm prototype OD';if(p2)p2.textContent='≈20 μm beam separation';if(p3)p3.textContent='≈2.7 m total fiber';
}
angle?.addEventListener('input',update);['freq','spl','diameter','spacing'].forEach(id=>document.getElementById(id)?.addEventListener('input',()=>queueMicrotask(update)));update();
})();