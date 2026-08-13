(()=>{'use strict';
const $=id=>document.getElementById(id);
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const mission=q('.mission-shell');
if(!mission)return;

const controls=q('.mission-controls',mission);
const stage=q('.mission-stage',mission);
const svg=q('svg',stage);
const readout=q('.mission-readout',mission);
const bearing=$('missionBearing');
const range=$('missionRange');
const target=$('targetType');
const config=$('sensorConfig');
const targetGroup=$('targetGroup');
const DISPLAY_SPACING=6;
const DEFAULT_BEARING=315;

const deployments={
  floating:{name:'Floating / moored',patent:'US11287508B2',config:'floating',basis:'Floating base with one or more flow meters, coupled by a retaining thread to an anchor; FIG. 1 shows four flow meters.'},
  hull:{name:'Hull / AUV mounting',patent:'US11287508B2',config:'platform',basis:'The specification describes implementations mounted on a submarine or AUV hull.'},
  sonobuoy:{name:'Sonobuoy tower',patent:'US11408961B2',config:'tower',basis:'The specification describes a positively buoyant AVS tower configured as a sonobuoy and moored above an anchor.'},
  towed:{name:'Towed array',patent:'US11408961B2',config:'tower',basis:'The specification expressly lists towed arrays among applications for neutrally buoyant AVS embodiments.'}
};

function wrap(v){return((v%360)+360)%360;}
function clean(v){return Math.abs(v)<5e-4?0:v;}
function signed(v){v=clean(v);return(v<0?'−':'+')+Math.abs(v).toFixed(3);}
function degrees(v){return String(Math.round(wrap(v))%360).padStart(3,'0')+'°';}
function cardinal(v){const dirs=['N','NE','E','SE','S','SW','W','NW'];return dirs[Math.round(wrap(v)/45)%8];}
function geometry(){
  const beta=wrap(+(bearing?.value||0));
  const r=beta*Math.PI/180;
  const east=clean(-Math.sin(r));
  const north=clean(-Math.cos(r));
  return{beta,heading:wrap(beta+180),east,north,norm:Math.hypot(east,north)};
}
function activeDeployment(){
  const active=q('.patent-demo-presets button.active',mission)?.dataset.preset;
  return deployments[active]?active:'floating';
}
function plotGeometry(){
  const g=geometry();
  const cx=400,cy=300,rad=245;
  const spacing=Math.max(0,Math.min(.98,DISPLAY_SPACING/8.5));
  const rr=Math.max(70,spacing*rad);
  const a=g.beta*Math.PI/180;
  return{...g,cx,cy,tx:cx+rr*Math.sin(a),ty:cy-rr*Math.cos(a)};
}

// Establish one clean default state. The selected source is illustrative only;
// the numerical solution depends only on bearing.
if(range){
  range.value=String(DISPLAY_SPACING);
  range.tabIndex=-1;
  const group=range.closest('.control-group');
  if(group){group.style.display='none';group.setAttribute('aria-hidden','true');}
  range.dispatchEvent(new Event('input',{bubbles:true}));
}
if(target){target.value='source';target.dispatchEvent(new Event('change',{bubbles:true}));}
if(bearing){bearing.value=String(DEFAULT_BEARING);bearing.dispatchEvent(new Event('input',{bubbles:true}));}

// Remove duplicate / non-model controls. Deployment presets are the architecture
// control; the legacy architecture selector remains hidden only for the drawing code.
const configGroup=config?.closest('.control-group');
if(configGroup){configGroup.style.display='none';configGroup.setAttribute('aria-hidden','true');}
$('missionFreq')?.closest('.control-group')?.remove();
q('.mission-actions',mission)?.remove();

const presetGroup=q('.patent-demo-presets',mission)?.closest('.control-group');
if(presetGroup){
  const label=q('label span',presetGroup);if(label)label.textContent='Deployment context';
}
const targetGroupControl=target?.closest('.control-group');
if(targetGroupControl){
  const label=q('label span',targetGroupControl);if(label)label.textContent='Source illustration';
  let help=q('.control-help',targetGroupControl);if(!help){help=document.createElement('div');help.className='control-help';targetGroupControl.appendChild(help);}
  help.textContent='Visual context only. Source type does not enter the direction calculation.';
}
const bearingGroup=bearing?.closest('.control-group');
if(bearingGroup){
  const label=q('label span',bearingGroup);if(label)label.textContent='Source bearing β';
  let help=q('.control-help',bearingGroup);if(!help){help=document.createElement('div');help.className='control-help';bearingGroup.appendChild(help);}
  help.textContent='Drag the source on the plot or use the slider. Radius is fixed for display; no physical range is modeled.';
}

// Ensure the mechanics layer has created its patent-deployment schematic, then
// move it out of the plot and into the controls where it belongs.
window.RHKEARTH_DEMO?.update?.();
let deploymentVisual=q('.deployment-visual',mission);
if(deploymentVisual&&controls&&presetGroup){
  presetGroup.insertAdjacentElement('afterend',deploymentVisual);
  const head=q('.deployment-head span',deploymentVisual);if(head)head.textContent='DEPLOYMENT SCHEMATIC';
}

// Replace the multi-generation guide with one compact, non-redundant basis strip.
let guide=q('.patent-demo-guide',mission);
if(!guide){guide=document.createElement('section');guide.className='patent-demo-guide';const grid=q('.mission-grid',mission);if(grid)mission.insertBefore(guide,grid);}
guide.innerHTML=`
  <div class="demo-basis-title">Patent basis and model boundary</div>
  <div class="demo-basis-grid">
    <div><span>Selected embodiment</span><b id="basisEmbodiment"></b><small id="basisPatent"></small></div>
    <div><span>Patent-described basis</span><p id="basisSupport"></p></div>
    <div><span>Model boundary</span><p>Normalized 2-D direction geometry only. No range, amplitude, SNR, bearing accuracy, source signature, underwater sensitivity, or detection performance is calculated.</p></div>
  </div>`;

// The right column is now a geometry solution, not a second description of the
// controls. Each displayed number is derived from the current bearing.
if(readout)readout.innerHTML=`
  <div class="geo-head"><span>DIRECTION SOLUTION</span><small>East / North coordinate convention</small></div>
  <div class="geo-primary"><span>Source bearing β</span><b id="geoBearing">315°</b><small>Clockwise from north, sensor → source.</small></div>
  <div class="geo-row"><span>Incoming heading</span><b id="geoHeading">135°</b><small id="geoHeadingCardinal">SE · source → sensor</small></div>
  <div class="geo-components">
    <div><span>k̂ East</span><b id="geoEast">+0.707</b></div>
    <div><span>k̂ North</span><b id="geoNorth">−0.707</b></div>
  </div>
  <div class="geo-equation"><span>Normalized propagation direction</span><code>k̂ = (−sin β, −cos β)</code><small id="geoNorm">||k̂|| = 1.000</small></div>
  <div class="geo-meaning" id="geoMeaning">Source NW of sensor. Incoming propagation is toward the SE.</div>`;

// Strip nonessential visual cues from the plot. Unlabeled circles and animated
// concentric rings can read as range / sonar output even though no range exists.
if(svg){
  $('stageRangeLabel')?.setAttribute('display','none');
  $('bearingCone')?.setAttribute('display','none');
  $('scanLine')?.setAttribute('display','none');
  $('sensorXbar')?.setAttribute('display','none');
  $('sensorYbar')?.setAttribute('display','none');
  $('incomingWaveLabel')?.setAttribute('display','none');
  $('northBearing')?.setAttribute('display','none');
  qa('.wave-ring',svg).forEach(r=>r.setAttribute('display','none'));
  const firstGrid=q(':scope > g',svg);if(firstGrid)qa('circle',firstGrid).forEach(c=>c.setAttribute('display','none'));
  qa('text',svg).forEach(t=>{
    const text=(t.textContent||'').trim();
    if(text==='N / 000°')t.textContent='N';
    else if(text==='090°')t.textContent='E';
    else if(text==='180°')t.textContent='S';
    else if(text==='270°')t.textContent='W';
  });
}

const SVG_NS='http://www.w3.org/2000/svg';
let sourceTag=$('cleanSourceTag');
let sensorTag=$('cleanSensorTag');
if(svg&&!sourceTag){sourceTag=document.createElementNS(SVG_NS,'text');sourceTag.id='cleanSourceTag';sourceTag.textContent='SOURCE';sourceTag.setAttribute('class','clean-stage-tag');sourceTag.setAttribute('pointer-events','none');svg.appendChild(sourceTag);}
if(svg&&!sensorTag){sensorTag=document.createElementNS(SVG_NS,'text');sensorTag.id='cleanSensorTag';sensorTag.textContent='SENSOR';sensorTag.setAttribute('class','clean-stage-tag');sensorTag.setAttribute('pointer-events','none');svg.appendChild(sensorTag);}

function updatePlot(){
  if(!svg)return;
  const p=plotGeometry();
  if(targetGroup)targetGroup.setAttribute('transform',`translate(${p.tx.toFixed(2)} ${p.ty.toFixed(2)})`);
  const bearingLine=$('trueBearingLine');
  if(bearingLine){bearingLine.setAttribute('x1',p.cx);bearingLine.setAttribute('y1',p.cy);bearingLine.setAttribute('x2',p.tx);bearingLine.setAttribute('y2',p.ty);bearingLine.setAttribute('stroke','#a88f58');bearingLine.setAttribute('stroke-width','1.15');bearingLine.setAttribute('stroke-dasharray','5 7');bearingLine.setAttribute('opacity','.72');}
  const incoming=$('incomingWaveVector');
  if(incoming){
    const dx=p.cx-p.tx,dy=p.cy-p.ty,d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
    incoming.setAttribute('x1',(p.tx+ux*26).toFixed(2));incoming.setAttribute('y1',(p.ty+uy*26).toFixed(2));
    incoming.setAttribute('x2',(p.cx-ux*38).toFixed(2));incoming.setAttribute('y2',(p.cy-uy*38).toFixed(2));
    incoming.setAttribute('stroke','#d7ddd2');incoming.setAttribute('stroke-width','2');incoming.setAttribute('opacity','.9');
  }
  if(sourceTag){sourceTag.setAttribute('x',(p.tx+14).toFixed(1));sourceTag.setAttribute('y',(p.ty-12).toFixed(1));}
  if(sensorTag){sensorTag.setAttribute('x',(p.cx+17).toFixed(1));sensorTag.setAttribute('y',(p.cy+29).toFixed(1));}
  const oldTarget=$('stageTargetLabel');if(oldTarget)oldTarget.setAttribute('display','none');
}

function updateReadout(){
  const g=geometry();
  const deployment=deployments[activeDeployment()]||deployments.floating;
  if($('basisEmbodiment'))$('basisEmbodiment').textContent=deployment.name;
  if($('basisPatent'))$('basisPatent').textContent=deployment.patent;
  if($('basisSupport'))$('basisSupport').textContent=deployment.basis;
  if($('geoBearing'))$('geoBearing').textContent=degrees(g.beta);
  if($('geoHeading'))$('geoHeading').textContent=degrees(g.heading);
  if($('geoHeadingCardinal'))$('geoHeadingCardinal').textContent=cardinal(g.heading)+' · source → sensor';
  if($('geoEast'))$('geoEast').textContent=signed(g.east);
  if($('geoNorth'))$('geoNorth').textContent=signed(g.north);
  if($('geoNorm'))$('geoNorm').textContent='||k̂|| = '+g.norm.toFixed(3);
  if($('geoMeaning'))$('geoMeaning').textContent='Source '+cardinal(g.beta)+' of sensor. Incoming propagation is toward the '+cardinal(g.heading)+'.';
  const strong=q('label strong',bearingGroup||document);if(strong)strong.textContent=degrees(g.beta);
  updatePlot();
}

// Deployment controls change deployment only. Capture phase blocks older scenario
// listeners that silently imposed hard-coded source, bearing, or spacing values.
qa('.patent-demo-presets button',mission).forEach(btn=>{
  btn.addEventListener('click',event=>{
    event.preventDefault();event.stopImmediatePropagation();
    const key=btn.dataset.preset;
    const d=deployments[key];if(!d)return;
    qa('.patent-demo-presets button',mission).forEach(b=>b.classList.toggle('active',b===btn));
    mission.dataset.deployment=key;
    if(config){config.value=d.config;config.dispatchEvent(new Event('change',{bubbles:true}));}
    window.dispatchEvent(new CustomEvent('rhk-deployment-change',{detail:{mode:key}}));
    queueMicrotask(()=>{
      deploymentVisual=q('.deployment-visual',mission)||deploymentVisual;
      if(deploymentVisual&&presetGroup&&deploymentVisual.parentElement!==controls)presetGroup.insertAdjacentElement('afterend',deploymentVisual);
      updateReadout();
    });
  },true);
});

[bearing,target].forEach(el=>{if(!el)return;el.addEventListener('input',()=>queueMicrotask(updateReadout));el.addEventListener('change',()=>queueMicrotask(updateReadout));});
window.addEventListener('rhk-deployment-change',()=>queueMicrotask(updateReadout));

const legend=q('.legend',mission);if(legend)legend.innerHTML='<div><i class="dashed"></i> SENSOR → SOURCE BEARING</div><div><i class="incoming"></i> SOURCE → SENSOR PROPAGATION</div>';
const mechanics=q('.mission-mechanics-note',mission);if(mechanics)mechanics.remove();

const style=document.createElement('style');
style.textContent=`
.mission-grid{grid-template-columns:280px minmax(0,1fr) 250px!important;min-height:570px!important}
.mission-controls{padding:18px!important;background:#0b0d0b!important}.mission-readout{padding:18px!important;background:#0b0d0b!important}
.control-help{margin-top:8px;color:#707870;font:9px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}.control-group{padding:16px 0!important}.patent-demo-presets{gap:7px!important}
.patent-demo-guide{padding:15px 18px!important;background:#080a08!important;border-bottom:1px solid rgba(169,181,155,.15)!important}.demo-basis-title{font:600 15px/1.2 system-ui,sans-serif;color:#edf0e9;margin-bottom:12px}.demo-basis-grid{display:grid;grid-template-columns:.82fr 1.45fr 1.25fr;gap:22px}.demo-basis-grid span{display:block;color:#737c73;font:8px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;text-transform:uppercase}.demo-basis-grid b{display:block;margin-top:5px;color:#edf0e9;font:600 11px/1.35 system-ui,sans-serif}.demo-basis-grid small{display:block;margin-top:2px;color:#8f988e;font:8px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace}.demo-basis-grid p{margin:5px 0 0;color:#899289;font-size:9px;line-height:1.5}
.mission-controls .deployment-visual{position:relative!important;inset:auto!important;width:100%!important;min-width:0!important;margin:0 0 4px!important;padding:9px 10px 8px!important;background:#090b09!important;border:1px solid rgba(169,181,155,.15)!important;box-shadow:none!important;pointer-events:none}.mission-controls .deployment-head{margin-bottom:2px!important}.mission-controls .deployment-head span{font-size:8px!important}.mission-controls .deployment-head b{display:none!important}.mission-controls #deploymentVisualArt{height:104px!important}.mission-controls #deploymentVisualArt svg{width:100%!important;height:104px!important;min-height:0!important;max-height:104px!important}.mission-controls .deployment-foot{display:none!important}
.mission-stage{min-height:570px!important;background:#070907!important}.mission-stage:before{opacity:.45}.mission-stage>svg{min-height:570px!important}.clean-stage-tag{fill:#aeb6aa;font:8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em}.mission-stage svg text{font-size:9px}.mission-stage svg>g:first-of-type line{stroke:#222822!important;opacity:.9}.legend{left:16px!important;bottom:14px!important;padding:8px 10px!important;background:rgba(7,9,7,.88)!important;border-color:rgba(169,181,155,.15)!important;color:#7d867d!important;font-size:8px!important;line-height:1.75!important}.legend i.incoming{display:inline-block;width:16px;height:2px!important;background:#d7ddd2!important;border:0!important;vertical-align:middle;margin-right:7px}.legend i.dashed{height:1px!important}
.geo-head{padding-bottom:13px;border-bottom:1px solid #293029}.geo-head span{display:block;color:#a8b39f;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em}.geo-head small{display:block;margin-top:4px;color:#626a62;font-size:9px}.geo-primary{padding:18px 0;border-bottom:1px solid #293029}.geo-primary span,.geo-row span,.geo-components span,.geo-equation span{display:block;color:#777f77;font:8px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.07em;text-transform:uppercase}.geo-primary b{display:block;margin-top:5px;color:#f0f2ed;font:500 27px/1 ui-monospace,SFMono-Regular,Menlo,monospace}.geo-primary small,.geo-row small{display:block;margin-top:5px;color:#656d65;font-size:9px;line-height:1.4}.geo-row{padding:16px 0;border-bottom:1px solid #293029}.geo-row b{display:block;margin-top:5px;color:#e9ece6;font:500 18px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace}.geo-components{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #293029}.geo-components>div{padding:15px 0}.geo-components>div+div{padding-left:14px;border-left:1px solid #293029}.geo-components b{display:block;margin-top:5px;color:#e9ece6;font:500 15px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace}.geo-equation{padding:15px 0;border-bottom:1px solid #293029}.geo-equation code{display:block;margin-top:7px;color:#cbd3c7;font:11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}.geo-equation small{display:block;margin-top:5px;color:#737b73;font:9px ui-monospace,SFMono-Regular,Menlo,monospace}.geo-meaning{margin-top:15px;padding:11px 12px;border-left:2px solid #a9b59b;background:#0d100d;color:#a7aea5;font-size:10px;line-height:1.5}
@media(max-width:1050px){.mission-grid{grid-template-columns:250px minmax(0,1fr) 230px!important}.demo-basis-grid{gap:14px}}
@media(max-width:820px){.mission-grid{grid-template-columns:1fr!important}.mission-controls,.mission-readout{border:0!important}.mission-controls{border-bottom:1px solid #293029!important}.mission-readout{border-top:1px solid #293029!important}.demo-basis-grid{grid-template-columns:1fr}.mission-controls .deployment-visual{max-width:360px!important}.mission-stage,.mission-stage>svg{min-height:500px!important}}
`;
document.head.appendChild(style);

// Mathematical sanity checks for the displayed coordinate convention.
for(const [b,e,n] of [[0,0,-1],[90,-1,0],[180,0,1],[270,1,0],[315,Math.SQRT1_2,-Math.SQRT1_2]]){
  const r=b*Math.PI/180,ee=clean(-Math.sin(r)),nn=clean(-Math.cos(r));
  console.assert(Math.abs(ee-e)<1e-12&&Math.abs(nn-n)<1e-12,'RHKEARTH direction component check',b);
  console.assert(Math.abs(Math.hypot(ee,nn)-1)<1e-12,'RHKEARTH unit norm check',b);
}

updateReadout();
})();
