(()=>{'use strict';
const physics=document.getElementById('physics');if(!physics)return;
const q=(s,r=physics)=>r.querySelector(s),qa=(s,r=physics)=>Array.from(r.querySelectorAll(s));
const angle=document.getElementById('angle'),cutaway=q('.sensor-engineering'),plot=q('.patent-directivity-panel'),readouts=q('.audited-reference-grid');
if(!angle||!cutaway||!plot)return;
const THETA=20,R=Math.cos(THETA*Math.PI/180),signed=v=>(v>=0?'+':'')+v.toFixed(3);
angle.value=String(THETA);angle.disabled=true;angle.dispatchEvent(new Event('input',{bubbles:true}));
angle.closest('.control')?.remove();
q('#auditDirectivity')?.closest('.audit-readout')?.remove();
if(readouts)readouts.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';

let head=q('.static-tech-head');
if(!head){head=document.createElement('div');head.className='static-tech-head';const host=q('.results')||physics;host.insertBefore(head,host.firstChild);}
head.innerHTML=`<div><span>US11287508B2 // MESH FLOW SENSOR</span><h3>How the mesh converts particle motion into directional information.</h3><p>Patent-grounded mechanism and prototype data. The cutaway includes one fixed analytical geometry example; no performance simulation is applied.</p></div>`;

const svg=q('svg',cutaway);
if(svg){
  const replacements={
    'INCIDENT ACOUSTIC FIELD':'INCIDENT PLANE-WAVE DIRECTION k',
    'MESH-NORMAL REFERENCE':'MESH NORMAL n',
    'PARTICLE-VELOCITY AXIS':'WAVE / PARTICLE-VELOCITY DIRECTION',
    '20° incidence':'',
    'FINE 2-D WEB':'FINE 2-D MESH / WEB',
    'NORMAL DISPLACEMENT':'OUT-OF-PLANE DISPLACEMENT',
    'OPTICAL PROBE':'OPTICAL INTERFEROMETER',
    'mirror displacement readout':'center-mirror displacement readout',
    'SIGNAL PROCESSING':'DIRECTIONAL RESPONSE',
    'displacement → vector component':'normalized projection: R/Rmax = cos θ',
    'FLOATING / MOORED EMBODIMENT':'MESH-TYPE FLOW-SENSOR ELEMENT'
  };
  qa('text',svg).forEach(t=>{const s=(t.textContent||'').trim();if(s==='PATENT REFERENCE'){t.closest('g')?.remove();return;}if(Object.prototype.hasOwnProperty.call(replacements,s))t.textContent=replacements[s];});

  // Integrate the illustrative cosine example into the actual geometry instead
  // of presenting it as a detached UI card. Geometry origin is the existing
  // mesh-normal / incident-direction reference point inside engField.
  const field=document.getElementById('engField');
  if(field&&!document.getElementById('engThetaAnnotation')){
    const ns='http://www.w3.org/2000/svg';
    const g=document.createElementNS(ns,'g');g.id='engThetaAnnotation';g.setAttribute('transform','translate(56 98)');
    const r=43,a=THETA*Math.PI/180;
    const x0=150+r,y0=232,x1=150+r*Math.cos(a),y1=232+r*Math.sin(a);
    const arc=document.createElementNS(ns,'path');arc.setAttribute('d',`M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`);arc.setAttribute('class','theta-arc');g.appendChild(arc);
    const ray=document.createElementNS(ns,'line');ray.setAttribute('x1','150');ray.setAttribute('y1','232');ray.setAttribute('x2',x1.toFixed(1));ray.setAttribute('y2',y1.toFixed(1));ray.setAttribute('class','theta-ray');g.appendChild(ray);
    const t1=document.createElementNS(ns,'text');t1.setAttribute('x','207');t1.setAttribute('y','250');t1.setAttribute('class','theta-value');t1.textContent='θ = 20°';g.appendChild(t1);
    const t2=document.createElementNS(ns,'text');t2.setAttribute('x','207');t2.setAttribute('y','266');t2.setAttribute('class','theta-derived');t2.textContent='cos θ = +0.940';g.appendChild(t2);
    const t3=document.createElementNS(ns,'text');t3.setAttribute('x','207');t3.setAttribute('y','281');t3.setAttribute('class','theta-note');t3.textContent='ILLUSTRATIVE ANALYTICAL POINT';g.appendChild(t3);
    field.appendChild(g);
  }
}

const title=q('.cutaway-title',cutaway);if(title)title.textContent='Microfabricated mesh flow sensor with optical displacement readout.';
const note=q('.cutaway-note',cutaway);if(note)note.textContent='The mesh mechanism and labeled prototype dimensions follow US11287508B2. Package geometry, motion amplitude and animation rate are schematic.';
const status=document.getElementById('engVisualScale');if(status)status.textContent='SCHEMATIC MOTION · NOT TO SCALE · ANIMATION RATE IS ILLUSTRATIVE';

const ph=q('.directivity-head',plot);
if(ph){const h=ph.querySelector('h3'),p=ph.querySelector('p'),live=ph.querySelector('.directivity-live');if(h)h.textContent='Normalized cosine directivity';if(p)p.textContent='Analytical relationship stated by the patent. The reported 90 Hz result is dipole-type directionality; the 20° marker is illustrative, not reconstructed test data.';if(live)live.innerHTML=`<span>ILLUSTRATIVE θ</span><b>${THETA}°</b><span>cos θ</span><b>${signed(R)}</b>`;}

const mesh=document.getElementById('engMesh'),point=document.getElementById('engDeflectPoint'),halo=document.getElementById('engDeflectHalo'),spot=document.getElementById('engProbeSpot'),laser=document.getElementById('engLaser');
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function draw(phase){const shift=phase*4*R;if(mesh){mesh.style.transform=`translateY(${shift.toFixed(2)}px) scale(1 .778)`;mesh.style.opacity=String(.9+.08*Math.abs(phase));}if(point){point.setAttribute('cy',shift.toFixed(2));point.setAttribute('r',(3.2+.6*Math.abs(phase)).toFixed(2));}if(halo){halo.setAttribute('cy',shift.toFixed(2));halo.setAttribute('ry',(18+3*Math.abs(phase)).toFixed(2));halo.setAttribute('opacity',(.22+.18*Math.abs(phase)).toFixed(2));}if(spot)spot.setAttribute('cy',(48+shift*.35).toFixed(2));if(laser)laser.setAttribute('y2',(48+shift*.35).toFixed(2));}
if(reduced){draw(0);}else{const start=performance.now();const animate=now=>{draw(Math.sin((now-start)/5000*Math.PI*2));requestAnimationFrame(animate);};requestAnimationFrame(animate);}

const style=document.createElement('style');
style.textContent=`
.static-tech-head{padding:20px 22px;border:1px solid rgba(169,181,155,.18);border-bottom:0;background:#080a08}.static-tech-head>div>span{display:block;color:#899487;font:9px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.07em}.static-tech-head h3{margin:6px 0 6px;font-size:23px;max-width:850px}.static-tech-head p{margin:0;color:#909990;font-size:11px;max-width:820px}.audited-reference-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}
#engThetaAnnotation .theta-arc{fill:none;stroke:#cfd6ca;stroke-width:1.15;opacity:.88}#engThetaAnnotation .theta-ray{stroke:#a9b59b;stroke-width:.8;stroke-dasharray:2.5 3.5;opacity:.55}#engThetaAnnotation .theta-value{fill:#e5e9e1;font:600 11px ui-monospace,SFMono-Regular,Menlo,monospace}#engThetaAnnotation .theta-derived{fill:#b8c2b3;font:9px ui-monospace,SFMono-Regular,Menlo,monospace}#engThetaAnnotation .theta-note{fill:#697268;font:7px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}
@media(max-width:760px){.static-tech-head{padding:16px}.static-tech-head h3{font-size:20px}}
`;
document.head.appendChild(style);
})();
