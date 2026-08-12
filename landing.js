(()=>{'use strict';
// RHKEARTH presentation layer. Content remains the independent NRL technology assessment.
document.title='RHKEARTH | Independent Maritime Technology Assessment';
const brand=document.querySelector('.brand strong');if(brand)brand.textContent='RHKEARTH';
const brandSub=document.querySelector('.brand small');if(brandSub){brandSub.textContent='';brandSub.style.display='none';}
[
  ['editorial.css','editorial.css?v=2'],
  ['hero-fix.css','hero-fix.css?v=4'],
  ['hero-polish.css','hero-polish.css?v=1'],
  ['sensor-realism.css','sensor-realism.css?v=1']
].forEach(([key,href])=>{
  if(!document.querySelector(`link[data-rhk-style="${key}"]`)){
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href=href;
    l.dataset.rhkStyle=key;
    document.head.appendChild(l);
  }
});

const scenes=[
{id:'subsea',kicker:'MILITARY CONCEPT // UNDERSEA',title:'Subsea surveillance',copy:'Illustrative moored or distributed vector-sensor nodes estimate bearing to a low-frequency submerged acoustic source without requiring a large local array.'},
{id:'fleet',kicker:'MILITARY CONCEPT // SURFACE FLEET',title:'Surface fleet integration',copy:'A compact sensing module could be evaluated for surface-combatant, tow-body, unmanned or distributed acoustic architectures where aperture and platform integration matter.'},
{id:'swcc',kicker:'MILITARY CONCEPT // LITTORAL',title:'Special operations craft',copy:'Near-shore nodes could provide passive directional acoustic awareness around small-craft operating areas, approaches and constrained littoral environments.'},
{id:'harbor',kicker:'COMMERCIAL + SECURITY // PORTS',title:'Harbor and infrastructure monitoring',copy:'Directional passive sensing can add source bearing to vessel, machinery and subsea-infrastructure acoustic events around ports and critical waterways.'},
{id:'wind',kicker:'COMMERCIAL // OFFSHORE ENERGY',title:'Offshore wind monitoring',copy:'Vector sensing could complement passive acoustic monitoring by adding direction-of-arrival context around construction, operations and marine-life monitoring programs.'}
];
let idx=0,timer=null;const dur=7000,$=id=>document.getElementById(id);function show(i,user=false){idx=(i+scenes.length)%scenes.length;const s=scenes[idx];document.querySelectorAll('.scene-group').forEach(g=>g.classList.toggle('active',g.dataset.scene===s.id));document.querySelectorAll('.scene-btn').forEach((b,n)=>b.classList.toggle('active',n===idx));if($('sceneKicker'))$('sceneKicker').textContent=s.kicker;if($('sceneTitle'))$('sceneTitle').textContent=s.title;if($('sceneCopy'))$('sceneCopy').textContent=s.copy;if($('sceneIndex'))$('sceneIndex').textContent=String(idx+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');const p=$('sceneProgress');if(p){p.classList.remove('running');void p.offsetWidth;p.classList.add('running')}if(user)restart()}
function restart(){clearInterval(timer);timer=setInterval(()=>show(idx+1),dur)}document.querySelectorAll('.scene-btn').forEach((b,i)=>b.addEventListener('click',()=>show(i,true)));document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(timer);else restart()});show(0);restart();

// Enhance the cover composition without changing the preferred wind scene.
const loadHeroPolish=()=>import('./hero-polish.js?v=1').catch(err=>console.warn('RHKEARTH cover polish fallback:',err));
// Enhance the public patent model without changing the underlying screening equations.
const loadSensor=()=>import('./sensor-realism.js?v=1').catch(err=>console.warn('RHKEARTH sensor cutaway fallback:',err));
const load3D=()=>import('./mission3d.js?v=2').catch(err=>console.warn('RHKEARTH 3D demonstrator fallback:',err));
if(document.readyState==='complete'){loadHeroPolish();loadSensor();load3D();}else window.addEventListener('load',()=>{loadHeroPolish();loadSensor();load3D();},{once:true});
})();