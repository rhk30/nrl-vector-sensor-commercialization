(()=>{'use strict';
// RHKEARTH presentation layer. Content remains an independent NRL technology assessment.
document.title='RHKEARTH | Independent Maritime Technology Assessment';
const brand=document.querySelector('.brand strong');if(brand)brand.textContent='RHKEARTH';
const brandSub=document.querySelector('.brand small');if(brandSub){brandSub.textContent='';brandSub.style.display='none';}

// Remove internal-planning blocks from the public diligence section.
document.querySelector('#diligence .roadmap')?.remove();
document.querySelector('#diligence .split')?.remove();
document.querySelector('#diligence .questions')?.remove();

// Site-wide punctuation rule: no em dashes in rendered copy, including content
// inserted later by enhancement scripts.
function removeEmDashes(root=document.body){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{if(node.nodeValue&&node.nodeValue.includes('—'))node.nodeValue=node.nodeValue.replaceAll('—',' / ');});
}
removeEmDashes();
const punctuationGuard=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
  if(node.nodeType===Node.TEXT_NODE){if(node.nodeValue?.includes('—'))node.nodeValue=node.nodeValue.replaceAll('—',' / ');}
  else if(node.nodeType===Node.ELEMENT_NODE)removeEmDashes(node);
})));
punctuationGuard.observe(document.body,{childList:true,subtree:true});

[
  ['editorial.css','editorial.css?v=2'],
  ['hero-fix.css','hero-fix.css?v=4'],
  ['hero-polish.css','hero-polish.css?v=3'],
  ['hero-media.css','hero-media.css?v=3'],
  ['sensor-realism.css','sensor-realism.css?v=3'],
  ['formula-layout.css','formula-layout.css?v=1'],
  ['patent-accuracy.css','patent-accuracy.css?v=2'],
  ['patent-strict.css','patent-strict.css?v=3']
].forEach(([key,href])=>{
  if(!document.querySelector(`link[data-rhk-style="${key}"]`)){
    const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset.rhkStyle=key;document.head.appendChild(l);
  }
});

const scenes=[
  {id:'subsea',kicker:'PATENT-ALIGNED CONCEPT // UNDERSEA',title:'Subsea platform sensing',copy:'The patent states that the vector sensor may be mounted on the hull of a vessel such as a submarine or AUV, and describes detecting low-frequency sound near pressure-release surfaces.'},
  {id:'fleet',kicker:'PATENT-ALIGNED CONCEPT // SURFACE NETWORK',title:'Fleet-connected sensing',copy:'The patent describes external receivers including ships and central controllers that can aggregate data from multiple floating-base vector sensors. The Navy footage is operating context, not a claimed installation.'},
  {id:'swcc',kicker:'PATENT-ALIGNED CONCEPT // SHALLOW WATER',title:'Littoral sensing',copy:'The patent expressly describes mooring the sensor in shallow water close to an air/water boundary. The small-craft scene visualizes that disclosed deployment geometry in a littoral context.'},
  {id:'harbor',kicker:'DUAL-USE EVALUATION // SHALLOW WATER',title:'Harbor monitoring',copy:'A potential commercialization context built around patent-described acoustic source localization, shallow-water deployment and slowly varying viscous-flow sensing. No harbor deployment is claimed.'},
  {id:'wind',kicker:'DUAL-USE EVALUATION // OFFSHORE',title:'Offshore monitoring',copy:'A potential environmental-monitoring context for directional acoustic sensing. Offshore-wind deployment is not claimed by the patents and is shown only as a commercialization hypothesis.'}
];
let idx=0,timer=null;const dur=8000,$=id=>document.getElementById(id);
function show(i){
  idx=(i+scenes.length)%scenes.length;const s=scenes[idx];
  document.querySelectorAll('.scene-group').forEach(g=>g.classList.toggle('active',g.dataset.scene===s.id));
  document.querySelectorAll('.scene-btn').forEach((b,n)=>b.classList.toggle('active',n===idx));
  if($('sceneKicker'))$('sceneKicker').textContent=s.kicker;
  if($('sceneTitle'))$('sceneTitle').textContent=s.title;
  if($('sceneCopy'))$('sceneCopy').textContent=s.copy;
  if($('sceneIndex'))$('sceneIndex').textContent=String(idx+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');
  const p=$('sceneProgress');if(p){p.classList.remove('running');void p.offsetWidth;p.classList.add('running');}
}
function restart(){clearInterval(timer);timer=setInterval(()=>show(idx+1),dur);}
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(timer);else restart();});
show(0);restart();

const loadHeroMedia=()=>import('./hero-media.js?v=3').catch(err=>console.warn('RHKEARTH cover media fallback:',err));
const loadHeroPolish=()=>import('./hero-polish.js?v=3').catch(err=>console.warn('RHKEARTH cover polish fallback:',err));
const loadSensor=()=>import('./sensor-realism.js?v=3').catch(err=>console.warn('RHKEARTH sensor cutaway fallback:',err));
const loadPatentAccuracy=()=>import('./patent-accuracy.js?v=2').catch(err=>console.warn('RHKEARTH patent-accuracy layer fallback:',err));
const loadPatentStrict=()=>import('./patent-strict.js?v=3').catch(err=>console.warn('RHKEARTH patent-strict layer fallback:',err));
const load3D=()=>import('./mission3d.js?v=3').catch(err=>console.warn('RHKEARTH 3D demonstrator fallback:',err));
function loadEnhancements(){loadHeroMedia();loadHeroPolish();loadSensor().then(loadPatentAccuracy).then(loadPatentStrict);load3D();}
if(document.readyState==='complete')loadEnhancements();else window.addEventListener('load',loadEnhancements,{once:true});
})();