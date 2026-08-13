(()=>{'use strict';
const physics=document.getElementById('physics');if(!physics)return;
const q=(s,r=physics)=>r.querySelector(s),qa=(s,r=physics)=>Array.from(r.querySelectorAll(s));
const angle=document.getElementById('angle'),cutaway=q('.sensor-engineering'),plot=q('.patent-directivity-panel'),readouts=q('.audited-reference-grid');
if(!angle||!cutaway||!plot)return;
const THETA=20,R=Math.cos(THETA*Math.PI/180),signed=v=>(v>=0?'+':'')+v.toFixed(3);
angle.value=String(THETA);angle.disabled=true;angle.dispatchEvent(new Event('input',{bubbles:true}));
angle.closest('.control')?.remove();
q('#auditDirectivity')?.closest('.audit-readout')?.remove();
if(readouts){readouts.style.gridTemplateColumns='repeat(3,minmax(0,1fr))';}
let head=q('.static-tech-head');if(!head){head=document.createElement('div');head.className='static-tech-head';const host=q('.results')||physics;host.insertBefore(head,host.firstChild);}
head.innerHTML=`<div><span>US11287508B2 // MESH FLOW SENSOR</span><h3>How the mesh converts particle motion into directional information.</h3><p>Patent-grounded mechanism and prototype data, with one fixed analytical cosine example.</p></div><aside><span>ILLUSTRATIVE GEOMETRY</span><b>θ = ${THETA}°</b><strong>cos θ = ${signed(R)}</strong><small>20° is an illustrative point, not a reported test condition.</small></aside>`;
const svg=q('svg',cutaway);if(svg){
  const replacements={
    'INCIDENT ACOUSTIC FIELD':'INCIDENT PLANE-WAVE DIRECTION k',
    'MESH-NORMAL REFERENCE':'MESH NORMAL n',
    'PARTICLE-VELOCITY AXIS':'WAVE / PARTICLE-VELOCITY DIRECTION',
    '20° incidence':'θ = 20° · illustrative',
    'FINE 2-D WEB':'FINE 2-D MESH / WEB',
    'NORMAL DISPLACEMENT':'OUT-OF-PLANE DISPLACEMENT',
    'OPTICAL PROBE':'OPTICAL INTERFEROMETER',
    'mirror displacement readout':'center-mirror displacement readout',
    'SIGNAL PROCESSING':'DIRECTIONAL RESPONSE',
    'displacement → vector component':'normalized projection: R/Rmax = cos θ',
    'FLOATING / MOORED EMBODIMENT':'MESH-TYPE FLOW-SENSOR ELEMENT'
  };
  qa('text',svg).forEach(t=>{const s=(t.textContent||'').trim();if(s==='PATENT REFERENCE'){t.closest('g')?.remove();return;}if(replacements[s])t.textContent=replacements[s];});
}
const title=q('.cutaway-title',cutaway);if(title)title.textContent='Microfabricated mesh flow sensor with optical displacement readout.';
const note=q('.cutaway-note',cutaway);if(note)note.textContent='The mesh mechanism and labeled prototype dimensions follow US11287508B2. Package geometry, motion amplitude and animation rate are schematic.';
const status=document.getElementById('engVisualScale');if(status)status.textContent='θ = 20° illustrative · cos θ = +0.940 · schematic motion · not to scale';
const ph=q('.directivity-head',plot);if(ph){const h=ph.querySelector('h3'),p=ph.querySelector('p'),live=ph.querySelector('.directivity-live');if(h)h.textContent='Normalized cosine directivity';if(p)p.textContent='Analytical relationship stated by the patent. The reported 90 Hz result is dipole-type directionality; the 20° point shown here is illustrative, not reconstructed test data.';if(live)live.innerHTML=`<span>ILLUSTRATIVE θ</span><b>${THETA}°</b><span>cos θ</span><b>${signed(R)}</b>`;}
const mesh=document.getElementById('engMesh'),point=document.getElementById('engDeflectPoint'),halo=document.getElementById('engDeflectHalo'),spot=document.getElementById('engProbeSpot'),laser=document.getElementById('engLaser');
const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function draw(phase){const shift=phase*4*R;if(mesh){mesh.style.transform=`translateY(${shift.toFixed(2)}px) scale(1 .778)`;mesh.style.opacity=String(.9+.08*Math.abs(phase));}if(point){point.setAttribute('cy',shift.toFixed(2));point.setAttribute('r',(3.2+.6*Math.abs(phase)).toFixed(2));}if(halo){halo.setAttribute('cy',shift.toFixed(2));halo.setAttribute('ry',(18+3*Math.abs(phase)).toFixed(2));halo.setAttribute('opacity',(.22+.18*Math.abs(phase)).toFixed(2));}if(spot)spot.setAttribute('cy',(48+shift*.35).toFixed(2));if(laser)laser.setAttribute('y2',(48+shift*.35).toFixed(2));}
if(reduced){draw(0);}else{const start=performance.now();const animate=now=>{draw(Math.sin((now-start)/5000*Math.PI*2));requestAnimationFrame(animate);};requestAnimationFrame(animate);}
const style=document.createElement('style');style.textContent=`.static-tech-head{display:flex;justify-content:space-between;gap:28px;padding:20px 22px;border:1px solid rgba(169,181,155,.18);border-bottom:0;background:#080a08}.static-tech-head>div>span,.static-tech-head aside span,.static-tech-head aside small{display:block;color:#899487;font:9px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.07em}.static-tech-head h3{margin:6px 0 6px;font-size:23px}.static-tech-head p{margin:0;color:#909990;font-size:11px}.static-tech-head aside{width:220px;flex:0 0 220px;border:1px solid rgba(169,181,155,.16);padding:11px 13px}.static-tech-head aside b{display:block;margin-top:7px;font-size:18px}.static-tech-head aside strong{display:block;color:#d6ddcf;font:12px ui-monospace,SFMono-Regular,Menlo,monospace}.static-tech-head aside small{margin-top:7px;letter-spacing:0}.audited-reference-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}@media(max-width:760px){.static-tech-head{display:block}.static-tech-head aside{width:100%;margin-top:14px}}`;document.head.appendChild(style);
})();
