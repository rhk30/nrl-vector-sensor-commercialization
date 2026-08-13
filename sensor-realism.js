(()=>{'use strict';
const physics=document.getElementById('physics'),host=physics?.querySelector('.results .diagram');if(!host)return;
const NS='http://www.w3.org/2000/svg',radials=16;let spokes='',rings='';
for(let i=0;i<radials;i++){const a=Math.PI*2*i/radials,x=(Math.cos(a)*104).toFixed(1),y=(Math.sin(a)*104).toFixed(1);spokes+=`<line class="mesh-wire minor" x1="0" y1="0" x2="${x}" y2="${y}"/>`;}
for(let r=18;r<=96;r+=13)rings+=`<circle class="mesh-wire" cx="0" cy="0" r="${r}"/>`;
const theta=20*Math.PI/180,kx=Math.cos(theta),ky=Math.sin(theta),px=-ky,py=kx;
let fronts='';[0,58,116].forEach((d,i)=>{const cx=38+d*kx,cy=38+d*ky,h=38;fronts+=`<line class="integrity-phase-front" x1="${(cx-px*h).toFixed(1)}" y1="${(cy-py*h).toFixed(1)}" x2="${(cx+px*h).toFixed(1)}" y2="${(cy+py*h).toFixed(1)}" opacity="${(.34+i*.12).toFixed(2)}"/>`;});

host.classList.add('sensor-engineering');
host.innerHTML=`
<svg viewBox="0 0 1120 540" role="img" aria-label="Patent-grounded conceptual cutaway of the mesh-type acoustic vector sensor and optical displacement readout">
  <defs><marker id="engArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" class="wave-arrow"/></marker><linearGradient id="engFrame" x1="0" x2="1"><stop offset="0" stop-color="#0b0d0b"/><stop offset=".5" stop-color="#20251f"/><stop offset="1" stop-color="#0a0c0a"/></linearGradient></defs>

  <g id="engField">
    <text x="56" y="72" class="eng-label">INCIDENT PLANE-WAVE FIELD</text>
    <g transform="translate(56 98)">
      <g id="integrityPlaneWave">${fronts}<line x1="42" y1="142" x2="${(42+kx*104).toFixed(1)}" y2="${(142+ky*104).toFixed(1)}" class="integrity-k-arrow" marker-end="url(#engArrow)"/><text x="50" y="169" class="eng-small">PROPAGATION DIRECTION k̂</text></g>
      <g opacity=".48"><circle class="particle" cx="38" cy="178" r="2.4"/><circle class="particle" cx="76" cy="161" r="2.1"/><circle class="particle" cx="112" cy="184" r="2.6"/><circle class="particle" cx="151" cy="165" r="2.2"/><circle class="particle" cx="188" cy="185" r="2.4"/><circle class="particle" cx="226" cy="163" r="2.2"/><circle class="particle" cx="264" cy="182" r="2.5"/></g>
      <circle cx="150" cy="232" r="2.6" fill="#aab3a6" opacity=".72"/><line id="engNormalReference" x1="150" y1="232" x2="260" y2="232" class="fine-dim"/><text x="150" y="216" class="eng-small" text-anchor="middle">MESH NORMAL n</text>
      <line id="engFlowVector" x1="150" y1="232" x2="${(150+kx*105).toFixed(1)}" y2="${(232+ky*105).toFixed(1)}" class="optical" marker-end="url(#engArrow)"/><text x="150" y="354" class="eng-small" text-anchor="middle">PROPAGATION / PARTICLE-VELOCITY AXIS</text><text id="engAngleValue" x="150" y="376" class="eng-value" text-anchor="middle">20° illustrative</text>
    </g>
  </g>

  <g transform="translate(525 278)">
    <ellipse cx="0" cy="0" rx="150" ry="122" fill="url(#engFrame)" stroke="#7f887c" stroke-width="1.2"/><ellipse cx="0" cy="0" rx="126" ry="101" class="metal-dark"/>
    <g class="eng-callout-card" transform="translate(-82 -156)"><rect x="-12" y="-18" width="188" height="38" rx="4"/><text x="82" y="5" class="eng-small" text-anchor="middle">MICROFABRICATED SUPPORT FRAME</text></g><line x1="0" y1="-122" x2="0" y2="-104" class="callout"/>
    <g id="engMesh" class="mesh-flex" transform="scale(1 .76)">${rings}${spokes}<circle class="mesh-highlight" cx="0" cy="0" r="105"/><circle class="mesh-highlight" cx="0" cy="0" r="5.5"/></g><ellipse id="engDeflectHalo" cx="0" cy="0" rx="38" ry="18" fill="none" stroke="#e4e7df" stroke-width=".7" opacity=".25"/><circle id="engDeflectPoint" class="deflect-marker" cx="0" cy="0" r="3.2"/>
    <line x1="-105" y1="-28" x2="-184" y2="-54" class="callout"/><g class="eng-callout-card" transform="translate(-324 -91)"><rect width="174" height="54" rx="4"/><text x="12" y="21" class="eng-label">FINE 2-D MESH / WEB</text><text x="12" y="40" class="eng-small">viscous drag → out-of-plane deformation</text></g>
    <line x1="84" y1="52" x2="169" y2="78" class="callout"/><g class="eng-callout-card" transform="translate(176 55)"><rect width="192" height="58" rx="4"/><text x="14" y="23" class="eng-label">OUT-OF-PLANE DISPLACEMENT</text><text x="14" y="43" class="eng-small">detected optically</text></g>
    <line x1="-150" y1="142" x2="150" y2="142" class="dimension"/><line x1="-150" y1="133" x2="-150" y2="151" class="dimension"/><line x1="150" y1="133" x2="150" y2="151" class="dimension"/><rect x="-46" y="128" width="92" height="28" rx="4" class="eng-inline-card"/><text x="0" y="147" class="eng-value" text-anchor="middle">6 mm OD</text>
  </g>

  <g class="probe-glow" transform="translate(842 230)"><rect x="0" y="0" width="210" height="92" rx="8" class="metal"/><circle cx="22" cy="46" r="9" class="metal-dark"/><circle cx="22" cy="46" r="3.2" fill="#e2e5de"/><text x="118" y="38" class="eng-label" text-anchor="middle">OPTICAL INTERFEROMETER</text><text x="118" y="61" class="eng-small" text-anchor="middle">center-mirror displacement readout</text><line id="engLaser" x1="22" y1="46" x2="-210" y2="48" class="laser"/><circle id="engProbeSpot" cx="-210" cy="48" r="4" fill="#e3e6df" opacity=".86"/></g>
  <path d="M947 322 V354" class="fine-dim"/><g transform="translate(822 354)"><rect width="250" height="78" rx="8" class="metal-dark"/><text x="125" y="31" class="eng-label" text-anchor="middle">DIRECTIONAL RESPONSE</text><text x="125" y="55" class="eng-small" text-anchor="middle">normalized projection: R/Rmax = cos θ</text></g>
  <g transform="translate(402 468)"><path d="M0 0 H246 L222 42 H24Z" class="metal"/><line x1="123" y1="42" x2="123" y2="66" class="fine-dim"/><text x="123" y="25" class="eng-small" text-anchor="middle">MESH-TYPE FLOW-SENSOR ELEMENT</text></g>
</svg>
<div class="sensor-cutaway-caption"><div class="cutaway-copy"><div class="cutaway-kicker">Patent-grounded conceptual cutaway</div><div class="cutaway-title">Microfabricated mesh flow sensor with optical displacement readout.</div><div class="cutaway-note">Mechanism and labeled prototype dimensions follow US11287508B2 and the published NRL prototype work. Package geometry, visible displacement and animation rate are schematic.</div></div><div id="engVisualScale" class="cutaway-status">SCHEMATIC MOTION · NOT TO SCALE</div></div>`;

const style=document.createElement('style');style.textContent=`.integrity-phase-front{stroke:#8e9a8c;stroke-width:1;stroke-dasharray:5 7}.integrity-k-arrow{stroke:#cfd6ca;stroke-width:1.25;fill:none}`;document.head.appendChild(style);

const angle=document.getElementById('angle');
function update(){const a=+(angle?.value||20),r=Math.cos(a*Math.PI/180),mag=Math.abs(r),shift=r*6,ar=a*Math.PI/180;const mesh=document.getElementById('engMesh'),point=document.getElementById('engDeflectPoint'),halo=document.getElementById('engDeflectHalo');if(mesh){mesh.style.transform=`translateY(${shift.toFixed(1)}px) scale(1 ${(0.76+mag*.018).toFixed(3)})`;mesh.style.opacity=String(.82+mag*.18);}if(point){point.setAttribute('cy',String(shift));point.setAttribute('r',String(3+mag));}if(halo){halo.setAttribute('cy',String(shift));halo.setAttribute('ry',String(18+mag*4));halo.setAttribute('opacity',String(.18+mag*.28));}const spot=document.getElementById('engProbeSpot');if(spot)spot.setAttribute('cy',String(48+shift*.35));const laser=document.getElementById('engLaser');if(laser)laser.setAttribute('y2',String(48+shift*.35));const vector=document.getElementById('engFlowVector');if(vector){vector.setAttribute('x2',String(150+Math.cos(ar)*105));vector.setAttribute('y2',String(232+Math.sin(ar)*105));}}
angle?.addEventListener('input',update);update();
})();
