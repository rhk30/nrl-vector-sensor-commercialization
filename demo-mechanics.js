(()=>{'use strict';
const $=id=>document.getElementById(id);
const q=(sel,root=document)=>root.querySelector(sel);
const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const mission=q('.mission-shell');
if(!mission)return;

const target=$('targetType');
const config=$('sensorConfig');
const bearing=$('missionBearing');
const range=$('missionRange');
const freq=$('missionFreq');
const VISUAL_SPACING=6; // normalized display radius only; not a physical range

// Make architecture labels match the patent language more closely.
if(config){
  const labels={floating:'Floating base / flow meters',tower:'Viscous-channel tower',platform:'Hull / AUV mounting'};
  Array.from(config.options).forEach(o=>{if(labels[o.value])o.textContent=labels[o.value];});
}

const deploymentBasis={
  floating:['Floating / moored','Floating base with one or more flow meters, retaining thread and anchor. US11287508B2.'],
  hull:['Hull / AUV mounting','The specification describes mounting the vector sensor on a submarine or AUV hull. US11287508B2.'],
  sonobuoy:['Sonobuoy tower','Positive-buoyancy AVS tower moored above an anchor. US11408961B2.'],
  towed:['Towed array','Neutrally buoyant AVS embodiments are expressly described for towed-array use. US11408961B2.'],
  tower:['Viscous-channel tower','Tower with multiple differently oriented liquid-filled channels and flow sensors. US11408961B2.'],
  platform:['Hull / AUV mounting','The specification describes mounting the vector sensor on a submarine or AUV hull. US11287508B2.']
};
const refBasis={
  10:'10 Hz: patent estimate of about 10 mm floating-base radius for operation in this frequency range.',
  90:'90 Hz: in-air prototype directionality and responsivity evaluation.',
  530:'530 Hz: reported fundamental frequency of the first mesh prototype.'
};
const sourceNames={surface:'Surface vessel context',submarine:'Submerged vessel context',source:'Generic acoustic source'};

function currentPreset(){return q('.patent-demo-presets button.active',mission)?.dataset.preset||null;}
function resolveDeployment(){
  const preset=currentPreset();
  if(preset)return preset;
  const v=config?.value||'floating';
  return v==='platform'?'platform':v==='tower'?'tower':'floating';
}

const stage=q('.mission-stage',mission);
const svg=q('svg',stage);
const targetGroup=$('targetGroup');

const deploymentScenes={
  floating:{
    title:'FLOATING / MOORED',
    ref:'US11287508B2',
    note:'Floating base + retaining thread + anchor',
    art:`<svg viewBox="0 0 220 112" aria-hidden="true">
      <line class="deploy-water" x1="8" y1="24" x2="212" y2="24"/>
      <line class="deploy-bed" x1="8" y1="96" x2="212" y2="96"/>
      <g class="deploy-animate deploy-sway">
        <circle class="deploy-node" cx="110" cy="50" r="13"/>
        <line class="deploy-accent" x1="96" y1="50" x2="124" y2="50"/>
        <line class="deploy-accent" x1="110" y1="36" x2="110" y2="64"/>
        <rect class="deploy-core" x="105" y="45" width="10" height="10"/>
        <path class="deploy-line" d="M110 64 C108 73 113 80 110 90"/>
      </g>
      <path class="deploy-anchor" d="M101 96 L119 96 L114 89 L106 89 Z"/>
      <text class="deploy-tag" x="126" y="52">FLOATING BASE</text>
      <text class="deploy-caption" x="126" y="66">retained, free to move</text>
    </svg>`
  },
  hull:{
    title:'HULL / AUV MOUNTING',
    ref:'US11287508B2',
    note:'Specification-described platform mounting',
    art:`<svg viewBox="0 0 220 112" aria-hidden="true">
      <line class="deploy-water" x1="8" y1="24" x2="212" y2="24"/>
      <g class="deploy-animate deploy-hull">
        <path class="deploy-platform" d="M35 55 Q73 36 145 43 Q174 46 191 55 Q169 66 105 68 Q58 68 35 55 Z"/>
        <path class="deploy-platform-detail" d="M79 43 L93 30 L119 32 L130 43"/>
        <rect class="deploy-module" x="105" y="67" width="18" height="8" rx="1"/>
        <line class="deploy-accent" x1="114" y1="75" x2="114" y2="84"/>
      </g>
      <circle class="deploy-pulse deploy-animate" cx="114" cy="79" r="13"/>
      <text class="deploy-tag" x="18" y="90">VECTOR MODULE</text>
      <text class="deploy-caption" x="18" y="103">mounted to hull / AUV context</text>
    </svg>`
  },
  platform:{
    title:'HULL / AUV MOUNTING',
    ref:'US11287508B2',
    note:'Specification-described platform mounting',
    art:`<svg viewBox="0 0 220 112" aria-hidden="true">
      <line class="deploy-water" x1="8" y1="24" x2="212" y2="24"/>
      <g class="deploy-animate deploy-hull">
        <path class="deploy-platform" d="M35 55 Q73 36 145 43 Q174 46 191 55 Q169 66 105 68 Q58 68 35 55 Z"/>
        <path class="deploy-platform-detail" d="M79 43 L93 30 L119 32 L130 43"/>
        <rect class="deploy-module" x="105" y="67" width="18" height="8" rx="1"/>
        <line class="deploy-accent" x1="114" y1="75" x2="114" y2="84"/>
      </g>
      <circle class="deploy-pulse deploy-animate" cx="114" cy="79" r="13"/>
      <text class="deploy-tag" x="18" y="90">VECTOR MODULE</text>
      <text class="deploy-caption" x="18" y="103">mounted to hull / AUV context</text>
    </svg>`
  },
  sonobuoy:{
    title:'SONOBUOY TOWER',
    ref:'US11408961B2',
    note:'Positive-buoyancy AVS tower + mooring',
    art:`<svg viewBox="0 0 220 112" aria-hidden="true">
      <line class="deploy-water" x1="8" y1="24" x2="212" y2="24"/>
      <line class="deploy-bed" x1="8" y1="98" x2="212" y2="98"/>
      <g class="deploy-animate deploy-bob">
        <path class="deploy-buoy" d="M98 24 L122 24 L118 15 L102 15 Z"/>
        <line class="deploy-line" x1="110" y1="24" x2="110" y2="43"/>
        <rect class="deploy-tower" x="104" y="43" width="12" height="31" rx="2"/>
        <line class="deploy-accent" x1="99" y1="50" x2="121" y2="50"/>
        <line class="deploy-accent" x1="99" y1="65" x2="121" y2="65"/>
        <path class="deploy-line" d="M110 74 C108 82 112 88 110 94"/>
      </g>
      <path class="deploy-anchor" d="M101 98 L119 98 L114 91 L106 91 Z"/>
      <text class="deploy-tag" x="128" y="50">AVS TOWER</text>
      <text class="deploy-caption" x="128" y="64">buoyant + moored</text>
    </svg>`
  },
  towed:{
    title:'TOWED ARRAY',
    ref:'US11408961B2',
    note:'Neutrally buoyant AVS in towed-array context',
    art:`<svg viewBox="0 0 220 112" aria-hidden="true">
      <line class="deploy-water" x1="8" y1="24" x2="212" y2="24"/>
      <g class="deploy-animate deploy-tow-platform">
        <path class="deploy-ship" d="M18 20 L83 20 L94 13 L64 10 L57 4 L37 5 L33 13 L15 14 Z"/>
      </g>
      <path class="deploy-line deploy-cable" d="M82 23 C105 35 117 47 139 58 C151 64 165 66 181 66"/>
      <g class="deploy-animate deploy-tow-body">
        <rect class="deploy-tow" x="170" y="60" width="27" height="12" rx="6"/>
        <line class="deploy-accent" x1="183.5" y1="56" x2="183.5" y2="76"/>
        <line class="deploy-accent" x1="176" y1="66" x2="191" y2="66"/>
      </g>
      <text class="deploy-tag" x="18" y="88">TOWED VECTOR BODY</text>
      <text class="deploy-caption" x="18" y="102">deployment context only</text>
    </svg>`
  },
  tower:{
    title:'VISCOUS-CHANNEL TOWER',
    ref:'US11408961B2',
    note:'Multi-orientation liquid-filled channel architecture',
    art:`<svg viewBox="0 0 220 112" aria-hidden="true">
      <line class="deploy-water" x1="8" y1="24" x2="212" y2="24"/>
      <line class="deploy-bed" x1="8" y1="98" x2="212" y2="98"/>
      <g class="deploy-animate deploy-sway">
        <rect class="deploy-tower" x="104" y="38" width="12" height="44" rx="2"/>
        <line class="deploy-accent" x1="94" y1="47" x2="126" y2="59"/>
        <line class="deploy-accent" x1="94" y1="70" x2="126" y2="58"/>
        <path class="deploy-line" d="M110 82 C108 88 112 92 110 96"/>
      </g>
      <path class="deploy-anchor" d="M101 98 L119 98 L114 91 L106 91 Z"/>
      <text class="deploy-tag" x="128" y="54">CHANNEL TOWER</text>
      <text class="deploy-caption" x="128" y="68">multiple orientations</text>
    </svg>`
  }
};

let deployPanel=null;
let lastDeployment=null;
function ensureDeploymentPanel(){
  if(!stage||deployPanel)return;
  deployPanel=document.createElement('div');
  deployPanel.className='deployment-visual';
  deployPanel.setAttribute('aria-live','polite');
  deployPanel.innerHTML='<div class="deployment-head"><span>DEPLOYMENT VIEW</span><b id="deploymentVisualTitle">FLOATING / MOORED</b></div><div id="deploymentVisualArt"></div><div class="deployment-foot"><span id="deploymentVisualNote"></span><b id="deploymentVisualRef"></b></div>';
  stage.appendChild(deployPanel);
}
function renderDeployment(mode){
  ensureDeploymentPanel();
  if(!deployPanel)return;
  const scene=deploymentScenes[mode]||deploymentScenes.floating;
  if(lastDeployment===mode)return;
  lastDeployment=mode;
  const title=$('deploymentVisualTitle'),art=$('deploymentVisualArt'),note=$('deploymentVisualNote'),ref=$('deploymentVisualRef');
  if(title)title.textContent=scene.title;
  if(art)art.innerHTML=scene.art;
  if(note)note.textContent=scene.note;
  if(ref)ref.textContent=scene.ref;
  deployPanel.dataset.mode=mode;
  deployPanel.classList.remove('deployment-enter');
  void deployPanel.offsetWidth;
  deployPanel.classList.add('deployment-enter');
}
function setDeployment(mode){
  mission.dataset.deployment=mode;
  renderDeployment(mode);
  window.dispatchEvent(new CustomEvent('rhk-deployment-change',{detail:{mode}}));
}

// Visual spacing is intentionally not exposed as a model input. The hidden
// legacy range control is retained only so app.js can keep a stable scene radius.
const spacingControl=range?.closest('.control-group');
if(spacingControl){
  spacingControl.style.display='none';
  spacingControl.setAttribute('aria-hidden','true');
}
if(range){
  range.value=String(VISUAL_SPACING);
  range.tabIndex=-1;
  range.dispatchEvent(new Event('input',{bubbles:true}));
}

// Replace static patent fact cards inside the mission demo with mechanics that
// actually respond to the user's geometry controls. Prototype facts remain in
// the Technology section where they belong.
const readout=q('.mission-readout',mission);
if(readout){
  readout.innerHTML=`
    <div class="readout-block"><span>Deployment context</span><b id="demoDeployment">Floating / moored</b><small id="demoDeploymentBasis">Patent-described deployment geometry.</small></div>
    <div class="readout-block"><span>Source context</span><b id="demoSource">Generic acoustic source</b><small>No platform acoustic signature is modeled.</small></div>
    <div class="readout-block"><span>Source bearing</span><b id="demoBearing">042°</b><small>Clockwise from north, sensor to source.</small></div>
    <div class="readout-block"><span>Incoming X projection</span><b id="demoX">-0.669</b><small>Signed normalized east-axis component.</small></div>
    <div class="readout-block"><span>Incoming Y projection</span><b id="demoY">-0.743</b><small>Signed normalized north-axis component.</small></div>
    <div class="readout-block"><span>2-D vector norm</span><b id="demoNorm">1.000</b><small>sqrt(X² + Y²), geometry check only.</small></div>
    <div class="readout-block"><span>Patent reference</span><b id="demoReference">90 Hz</b><small id="demoReferenceBasis">In-air prototype evaluation.</small></div>`;
}

let mechanics=q('.mission-mechanics-note',mission);
if(stage&&!mechanics){
  mechanics=document.createElement('div');
  mechanics.className='mission-mechanics-note';
  mechanics.innerHTML='<b>VECTOR MECHANICS</b><span>Dashed geometry points from sensor to source. The solid incoming-wave vector points source → sensor, matching the signs of the normalized X/Y components. Drag the source around the display or use the bearing slider. Deployment inset is schematic and not to scale. No amplitude, range or detection-performance model is applied.</span>';
  stage.appendChild(mechanics);
}

const style=document.createElement('style');
style.textContent=`
.mission-mechanics-note{position:absolute;left:18px;right:18px;bottom:16px;z-index:6;display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border:1px solid rgba(169,181,155,.22);background:rgba(5,6,5,.76);backdrop-filter:blur(8px);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;line-height:1.45;color:#9ea79d;pointer-events:none}
.mission-mechanics-note b{color:#e7e9e3;white-space:nowrap;font-size:10px;letter-spacing:.08em}
.mission-mechanics-note span{max-width:820px}
.mission-shell .legend i.incoming{background:#d6ddcf!important;border:0!important;height:2px!important;opacity:.9}
#targetGroup{cursor:grab;touch-action:none}
#targetGroup.is-dragging{cursor:grabbing}
#incomingWaveVector{filter:drop-shadow(0 0 3px rgba(214,221,207,.2))}
.deployment-visual{position:absolute;right:16px;top:16px;z-index:7;width:min(226px,30%);min-width:190px;padding:10px 11px 9px;border:1px solid rgba(169,181,155,.24);background:rgba(5,6,5,.84);backdrop-filter:blur(10px);box-shadow:0 8px 30px rgba(0,0,0,.18);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;pointer-events:none}
.deployment-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:4px}.deployment-head span{font-size:8px;letter-spacing:.12em;color:#747d74}.deployment-head b{font-size:8px;letter-spacing:.07em;color:#e3e7df;text-align:right;font-weight:600}
#deploymentVisualArt{height:112px;overflow:hidden}#deploymentVisualArt svg{display:block;width:100%;height:112px}
.deployment-foot{display:flex;justify-content:space-between;gap:8px;border-top:1px solid rgba(169,181,155,.13);padding-top:6px}.deployment-foot span{font-size:7px;line-height:1.35;color:#828b82;max-width:150px}.deployment-foot b{font-size:7px;color:#b9c1b5;white-space:nowrap}
.deployment-enter{animation:deploymentIn .28s ease-out}
.deploy-water{stroke:#606960;stroke-width:1}.deploy-bed{stroke:#343a34;stroke-width:1;stroke-dasharray:3 3}.deploy-line{fill:none;stroke:#7d887a;stroke-width:1.2}.deploy-accent{stroke:#b6c0b1;stroke-width:1.6}.deploy-node,.deploy-core,.deploy-module,.deploy-tower,.deploy-tow{fill:#111511;stroke:#d8ded3;stroke-width:1}.deploy-core{fill:#8f9a89}.deploy-anchor{fill:#303630;stroke:#6f786d;stroke-width:1}.deploy-platform,.deploy-ship{fill:#111511;stroke:#c8d0c4;stroke-width:1}.deploy-platform-detail{fill:#171c17;stroke:#8d9789;stroke-width:1}.deploy-buoy{fill:#171c17;stroke:#d2d9ce;stroke-width:1}.deploy-tag{font:7px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#cbd2c7;letter-spacing:.08em}.deploy-caption{font:6px ui-monospace,SFMono-Regular,Menlo,monospace;fill:#6f786f}.deploy-pulse{fill:none;stroke:#9eaa98;stroke-width:1;transform-origin:114px 79px;animation:deployPulse 2.2s ease-out infinite}
.deploy-sway{transform-origin:110px 64px;animation:deploySway 4s ease-in-out infinite}.deploy-hull{animation:deployHull 5s ease-in-out infinite}.deploy-bob{animation:deployBob 3.2s ease-in-out infinite}.deploy-tow-platform{animation:deployTowPlatform 5.5s ease-in-out infinite}.deploy-tow-body{animation:deployTowBody 2.8s ease-in-out infinite}
.deployment-paused .deploy-animate,.deployment-paused .deploy-pulse{animation-play-state:paused!important}
@keyframes deploymentIn{from{opacity:.15;transform:translateY(-4px)}to{opacity:1;transform:none}}@keyframes deploySway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}@keyframes deployHull{0%,100%{transform:translateX(-2px)}50%{transform:translateX(2px)}}@keyframes deployBob{0%,100%{transform:translateY(-1.5px)}50%{transform:translateY(1.5px)}}@keyframes deployTowPlatform{0%,100%{transform:translateX(-2px)}50%{transform:translateX(3px)}}@keyframes deployTowBody{0%,100%{transform:translate(-1px,-1px)}50%{transform:translate(2px,1px)}}@keyframes deployPulse{0%{opacity:.45;transform:scale(.65)}75%,100%{opacity:0;transform:scale(1.35)}}
@media(max-width:760px){.mission-mechanics-note{position:relative;left:auto;right:auto;bottom:auto;margin:10px 0 0;display:block}.mission-mechanics-note b{display:block;margin-bottom:5px}.deployment-visual{right:10px;top:10px;width:190px;min-width:0;padding:8px}.deployment-head span{display:none}#deploymentVisualArt{height:96px}#deploymentVisualArt svg{height:96px}.deployment-foot span{display:none}}
@media(prefers-reduced-motion:reduce){.deployment-enter,.deploy-animate,.deploy-pulse{animation:none!important}}
`;
document.head.appendChild(style);

const SVG_NS='http://www.w3.org/2000/svg';
let incomingLine=null;
let incomingLabel=null;
function ensureIncomingVector(){
  if(!svg)return;
  let defs=q('defs',svg);
  if(!defs){
    defs=document.createElementNS(SVG_NS,'defs');
    svg.insertBefore(defs,svg.firstChild);
  }
  if(!$('incomingWaveArrowhead')){
    const marker=document.createElementNS(SVG_NS,'marker');
    marker.id='incomingWaveArrowhead';
    marker.setAttribute('viewBox','0 0 10 10');
    marker.setAttribute('refX','8.5');
    marker.setAttribute('refY','5');
    marker.setAttribute('markerWidth','7');
    marker.setAttribute('markerHeight','7');
    marker.setAttribute('orient','auto-start-reverse');
    const path=document.createElementNS(SVG_NS,'path');
    path.setAttribute('d','M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill','#d6ddcf');
    marker.appendChild(path);
    defs.appendChild(marker);
  }
  incomingLine=$('incomingWaveVector');
  if(!incomingLine){
    incomingLine=document.createElementNS(SVG_NS,'line');
    incomingLine.id='incomingWaveVector';
    incomingLine.setAttribute('stroke','#d6ddcf');
    incomingLine.setAttribute('stroke-width','2');
    incomingLine.setAttribute('opacity','.92');
    incomingLine.setAttribute('marker-end','url(#incomingWaveArrowhead)');
    incomingLine.setAttribute('pointer-events','none');
    const sensor=$('sensorRoot');
    svg.insertBefore(incomingLine,sensor||null);
  }
  incomingLabel=$('incomingWaveLabel');
  if(!incomingLabel){
    incomingLabel=document.createElementNS(SVG_NS,'text');
    incomingLabel.id='incomingWaveLabel';
    incomingLabel.setAttribute('fill','#d6ddcf');
    incomingLabel.setAttribute('font-family','monospace');
    incomingLabel.setAttribute('font-size','9');
    incomingLabel.setAttribute('letter-spacing','.06em');
    incomingLabel.setAttribute('text-anchor','middle');
    incomingLabel.setAttribute('pointer-events','none');
    incomingLabel.textContent='INCOMING WAVE VECTOR';
    const sensor=$('sensorRoot');
    svg.insertBefore(incomingLabel,sensor||null);
  }
}

function signed(v){return (v>=0?'+':'')+v.toFixed(3);}
function referenceValue(){const v=Math.round(+(freq?.value||90));return refBasis[v]?v:90;}
function geometry(){
  const degrees=+(bearing?.value||0);
  const beta=degrees*Math.PI/180;
  const spacing=Math.max(0,Math.min(.98,+(range?.value||VISUAL_SPACING)/8.5));
  const cx=400,cy=300,rad=245,rr=Math.max(70,spacing*rad);
  const tx=cx+rr*Math.sin(beta),ty=cy-rr*Math.cos(beta);
  return {degrees,beta,cx,cy,tx,ty};
}
function updateBars(x,y){
  const sx=$('sensorXbar'),sy=$('sensorYbar');
  if(sx){const w=75*Math.abs(x);sx.setAttribute('width',String(w));sx.setAttribute('x',x>=0?'400':String(400-w));}
  if(sy){const h=75*Math.abs(y);sy.setAttribute('height',String(h));sy.setAttribute('y',y>=0?String(300-h):'300');}
}
function updateIncomingVector(g){
  ensureIncomingVector();
  if(!incomingLine||!incomingLabel)return;
  const dx=g.cx-g.tx,dy=g.cy-g.ty,dist=Math.hypot(dx,dy)||1;
  const ux=dx/dist,uy=dy/dist;
  const startPad=24,endPad=38;
  const x1=g.tx+ux*startPad,y1=g.ty+uy*startPad;
  const x2=g.cx-ux*endPad,y2=g.cy-uy*endPad;
  incomingLine.setAttribute('x1',x1.toFixed(2));
  incomingLine.setAttribute('y1',y1.toFixed(2));
  incomingLine.setAttribute('x2',x2.toFixed(2));
  incomingLine.setAttribute('y2',y2.toFixed(2));
  const mx=(x1+x2)/2,my=(y1+y2)/2;
  const px=-uy,py=ux;
  incomingLabel.setAttribute('x',(mx+px*13).toFixed(2));
  incomingLabel.setAttribute('y',(my+py*13).toFixed(2));
}
function update(){
  const g=geometry();
  // Bearing is sensor -> source. Plane-wave propagation at the sensor is source -> sensor.
  const x=-Math.sin(g.beta);
  const y=-Math.cos(g.beta);
  const norm=Math.hypot(x,y);
  const mode=resolveDeployment();
  const basis=deploymentBasis[mode]||deploymentBasis.floating;
  const ref=referenceValue();
  if($('demoDeployment'))$('demoDeployment').textContent=basis[0];
  if($('demoDeploymentBasis'))$('demoDeploymentBasis').textContent=basis[1];
  if($('demoSource'))$('demoSource').textContent=sourceNames[target?.value||'source']||sourceNames.source;
  if($('demoBearing'))$('demoBearing').textContent=String(Math.round(g.degrees)).padStart(3,'0')+'°';
  if($('demoX'))$('demoX').textContent=signed(x);
  if($('demoY'))$('demoY').textContent=signed(y);
  if($('demoNorm'))$('demoNorm').textContent=norm.toFixed(3);
  if($('demoReference'))$('demoReference').textContent=ref+' Hz';
  if($('demoReferenceBasis'))$('demoReferenceBasis').textContent=refBasis[ref];
  updateBars(x,y);
  updateIncomingVector(g);
  setDeployment(mode);
}

function pointInSvg(event){
  if(!svg)return null;
  const matrix=svg.getScreenCTM();
  if(!matrix)return null;
  const p=svg.createSVGPoint();
  p.x=event.clientX;
  p.y=event.clientY;
  return p.matrixTransform(matrix.inverse());
}
function setBearingFromPointer(event){
  if(!bearing)return;
  const p=pointInSvg(event);
  if(!p)return;
  const dx=p.x-400,dy=p.y-300;
  if(Math.hypot(dx,dy)<34)return;
  const degrees=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;
  bearing.value=String(Math.round(degrees)%360);
  bearing.dispatchEvent(new Event('input',{bubbles:true}));
}

let dragPointer=null;
if(targetGroup&&svg&&bearing){
  targetGroup.setAttribute('tabindex','0');
  targetGroup.setAttribute('aria-label','Draggable acoustic source. Drag around the vector sensor to change source bearing.');
  let hit=q('.source-drag-hit',targetGroup);
  if(!hit){
    hit=document.createElementNS(SVG_NS,'circle');
    hit.setAttribute('class','source-drag-hit');
    hit.setAttribute('r','36');
    hit.setAttribute('fill','transparent');
    hit.setAttribute('stroke','none');
    hit.setAttribute('pointer-events','all');
    targetGroup.insertBefore(hit,targetGroup.firstChild);
  }
  targetGroup.addEventListener('pointerdown',event=>{
    if(event.button!==undefined&&event.button!==0)return;
    event.preventDefault();
    dragPointer=event.pointerId;
    targetGroup.classList.add('is-dragging');
    targetGroup.setPointerCapture?.(event.pointerId);
    setBearingFromPointer(event);
  });
  targetGroup.addEventListener('pointermove',event=>{
    if(dragPointer!==event.pointerId)return;
    event.preventDefault();
    setBearingFromPointer(event);
  });
  const endDrag=event=>{
    if(dragPointer!==event.pointerId)return;
    targetGroup.releasePointerCapture?.(event.pointerId);
    dragPointer=null;
    targetGroup.classList.remove('is-dragging');
  };
  targetGroup.addEventListener('pointerup',endDrag);
  targetGroup.addEventListener('pointercancel',endDrag);
}

// Preset buttons are deployment presets, not target-class claims. Keep their
// default source generic; users can separately select a surface or submerged
// vessel as contextual media after choosing an architecture.
qa('.patent-demo-presets button',mission).forEach(btn=>btn.addEventListener('click',()=>queueMicrotask(()=>{
  if(target&&target.value!=='source'){
    target.value='source';
    target.dispatchEvent(new Event('change',{bubbles:true}));
  }
  update();
})));
[target,config,bearing,range,freq].forEach(el=>{if(!el)return;el.addEventListener('input',()=>queueMicrotask(update));el.addEventListener('change',()=>queueMicrotask(update));});

// If a user manually selects an architecture that no longer matches the active
// preset, clear that preset so the UI does not imply a deployment combination
// the user has overridden.
config?.addEventListener('change',()=>{
  const active=q('.patent-demo-presets button.active',mission);if(!active)return;
  const expected={floating:'floating',hull:'platform',sonobuoy:'tower',towed:'tower'}[active.dataset.preset];
  if(expected&&config.value!==expected)active.classList.remove('active');
});

const reset=$('resetMission');
reset?.addEventListener('click',()=>queueMicrotask(()=>{
  if(!range)return;
  range.value=String(VISUAL_SPACING);
  range.dispatchEvent(new Event('input',{bubbles:true}));
}));

const run=$('runMission');
run?.addEventListener('click',()=>queueMicrotask(()=>{
  mission.classList.toggle('deployment-paused',/^Resume/i.test(run.textContent||''));
}));

const legend=q('.legend',mission);
if(legend){
  legend.innerHTML='<div><i></i> ILLUSTRATIVE ACOUSTIC WAVEFRONT</div><div><i class="dashed"></i> GEOMETRIC BEARING TO SOURCE</div><div><i class="incoming"></i> INCOMING WAVE VECTOR (SOURCE → SENSOR)</div>';
}

update();
window.RHKEARTH_DEMO={update,resolveDeployment,setBearingFromPointer};
})();
