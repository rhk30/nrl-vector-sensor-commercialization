(()=>{'use strict';
document.title='RHKEARTH';
const brand=document.querySelector('.brand strong');if(brand)brand.textContent='RHKEARTH';
const brandSub=document.querySelector('.brand small');if(brandSub){brandSub.textContent='';brandSub.style.display='none';}

const logoUrl='./rhkearth-logo.svg?v=2';
const mark=document.querySelector('.brand .mark');
if(mark){mark.classList.add('rhkearth-logo-mark');mark.setAttribute('aria-label','RHKEARTH logo');mark.innerHTML=`<img src="${logoUrl}" alt="" aria-hidden="true">`;}
const brandStyle=document.createElement('style');
brandStyle.textContent=`.brand{gap:10px!important}.brand .rhkearth-logo-mark{width:26px!important;height:26px!important;border:0!important;background:none!important;display:flex!important;align-items:center!important;justify-content:center!important;flex:0 0 26px!important}.brand .rhkearth-logo-mark img{display:block!important;width:26px!important;height:26px!important;object-fit:contain!important}.brand .rhkearth-logo-mark:before,.brand .rhkearth-logo-mark:after{display:none!important}`;
document.head.appendChild(brandStyle);
let favicon=document.querySelector('link[rel~="icon"]');if(!favicon){favicon=document.createElement('link');favicon.rel='icon';document.head.appendChild(favicon);}favicon.type='image/svg+xml';favicon.href=logoUrl;
let apple=document.querySelector('link[rel="apple-touch-icon"]');if(!apple){apple=document.createElement('link');apple.rel='apple-touch-icon';document.head.appendChild(apple);}apple.href=logoUrl;
const absoluteLogo='https://rhkearth.com/rhkearth-logo.svg';
const shareTitle='RHKEARTH | Hear the field. Resolve the direction.';
const shareDescription='RHKEARTH is an early-stage deep-tech venture focused on compact underwater acoustic sensing and low-frequency sound localization. We are exploring technologies that enable distributed, directional sensing for maritime defense, environmental monitoring, autonomous systems, and ocean research.';
function setMeta(selector,attr,value){let el=document.head.querySelector(selector);if(!el){el=document.createElement('meta');const m=selector.match(/meta\[(property|name)="([^"]+)"\]/);if(m)el.setAttribute(m[1],m[2]);document.head.appendChild(el);}el.setAttribute(attr,value);}
setMeta('meta[property="og:title"]','content',shareTitle);setMeta('meta[property="og:description"]','content',shareDescription);setMeta('meta[property="og:url"]','content','https://rhkearth.com/');setMeta('meta[property="og:image"]','content',absoluteLogo);setMeta('meta[property="og:type"]','content','website');setMeta('meta[name="twitter:card"]','content','summary');setMeta('meta[name="twitter:title"]','content',shareTitle);setMeta('meta[name="twitter:description"]','content',shareDescription);setMeta('meta[name="twitter:image"]','content',absoluteLogo);

document.querySelector('#diligence')?.remove();document.querySelectorAll('a[href="#diligence"]').forEach(a=>a.remove());document.querySelector('#market .path')?.remove();
['missionSource','missionNoise','missionFreq'].forEach(id=>document.getElementById(id)?.closest('.control-group')?.remove());
const earlyMetrics=document.querySelectorAll('.metrics .metric');if(earlyMetrics[3]){const l=earlyMetrics[3].querySelector('.label'),v=earlyMetrics[3].querySelector('.value'),s=earlyMetrics[3].querySelector('.sub');if(l)l.textContent='Prototype fundamental';if(v)v.textContent='530 Hz';if(s)s.textContent='reported for the first mesh prototype';}
const earlyMission=document.querySelector('#mission .section-head .section-title p');if(earlyMission)earlyMission.textContent='Choose a patent-described deployment context and inspect source-bearing geometry. The demonstrator does not calculate detection performance.';
document.querySelectorAll('.mission-stage svg text').forEach(t=>{if(/KM/i.test(t.textContent||''))t.style.display='none';});

function removeEmDashes(root=document.body){if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(node=>{if(node.nodeValue&&node.nodeValue.includes('—'))node.nodeValue=node.nodeValue.replaceAll('—',' / ');});}
removeEmDashes();const punctuationGuard=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE){if(node.nodeValue?.includes('—'))node.nodeValue=node.nodeValue.replaceAll('—',' / ');}else if(node.nodeType===Node.ELEMENT_NODE)removeEmDashes(node);})));punctuationGuard.observe(document.body,{childList:true,subtree:true});

[
  ['editorial.css','editorial.css?v=2'],
  ['hero-fix.css','hero-fix.css?v=5'],
  ['hero-polish.css','hero-polish.css?v=3'],
  ['hero-media.css','hero-media.css?v=5'],
  ['sensor-realism.css','sensor-realism.css?v=5'],
  ['formula-layout.css','formula-layout.css?v=1'],
  ['patent-accuracy.css','patent-accuracy.css?v=2'],
  ['patent-strict.css','patent-strict.css?v=3']
].forEach(([key,href])=>{if(!document.querySelector(`link[data-rhk-style="${key}"]`)){const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.dataset.rhkStyle=key;document.head.appendChild(l);}});

const scenes=[
  {id:'subsea',kicker:'PATENT-ALIGNED CONCEPT // UNDERSEA',title:'Subsea platform sensing',copy:'The patent states that the vector sensor may be mounted on the hull of a vessel such as a submarine or AUV, and describes detecting low-frequency sound near pressure-release surfaces.'},
  {id:'fleet',kicker:'PATENT-ALIGNED CONCEPT // SURFACE NETWORK',title:'Fleet-connected sensing',copy:'The patent describes external receivers including ships and central controllers that can aggregate data from multiple floating-base vector sensors. The Navy footage is operating context, not a claimed installation.'},
  {id:'swcc',kicker:'PATENT-ALIGNED CONCEPT // SHALLOW WATER',title:'Littoral sensing',copy:'The patent expressly describes mooring the sensor in shallow water close to an air/water boundary. The small-craft scene visualizes that disclosed deployment geometry in a littoral context.'},
  {id:'harbor',kicker:'DUAL-USE EVALUATION // SHALLOW WATER',title:'Harbor monitoring',copy:'A potential commercialization context built around patent-described acoustic source localization, shallow-water deployment and slowly varying viscous-flow sensing. No harbor deployment is claimed.'},
  {id:'wind',kicker:'DUAL-USE EVALUATION // OFFSHORE',title:'Offshore monitoring',copy:'A potential environmental-monitoring context for directional acoustic sensing. Offshore-wind deployment is not claimed by the patents and is shown only as a commercialization hypothesis.'}
];
let idx=0,timer=null;const dur=8000,$=id=>document.getElementById(id);
function show(i){idx=(i+scenes.length)%scenes.length;const s=scenes[idx];document.querySelectorAll('.scene-group').forEach(g=>g.classList.toggle('active',g.dataset.scene===s.id));document.querySelectorAll('.scene-btn').forEach((b,n)=>b.classList.toggle('active',n===idx));if($('sceneKicker'))$('sceneKicker').textContent=s.kicker;if($('sceneTitle'))$('sceneTitle').textContent=s.title;if($('sceneCopy'))$('sceneCopy').textContent=s.copy;if($('sceneIndex'))$('sceneIndex').textContent=String(idx+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');const p=$('sceneProgress');if(p){p.classList.remove('running');void p.offsetWidth;p.classList.add('running');}}
function restart(){clearInterval(timer);timer=setInterval(()=>show(idx+1),dur);}document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(timer);else restart();});show(0);restart();

const loadHeroMedia=()=>import('./hero-media.js?v=5').catch(err=>console.warn('RHKEARTH cover media fallback:',err));
const loadHeroPolish=()=>import('./hero-polish.js?v=3').catch(err=>console.warn('RHKEARTH cover polish fallback:',err));
const loadSensor=()=>import('./sensor-realism.js?v=5').catch(err=>console.warn('RHKEARTH sensor cutaway fallback:',err));
const loadPatentAccuracy=()=>import('./patent-accuracy.js?v=2').catch(err=>console.warn('RHKEARTH patent-accuracy layer fallback:',err));
const loadPatentStrict=()=>import('./patent-strict.js?v=3').catch(err=>console.warn('RHKEARTH patent-strict layer fallback:',err));
const loadDemoMechanics=()=>import('./demo-mechanics.js?v=2').catch(err=>console.warn('RHKEARTH demonstrator mechanics fallback:',err));
const loadFinalAudit=()=>import('./patent-final-audit.js?v=1').catch(err=>console.warn('RHKEARTH final patent audit fallback:',err));
const loadTechnologyUnified=()=>import('./technology-unified.js?v=1').catch(err=>console.warn('RHKEARTH unified technology exhibit fallback:',err));
const loadPatentGuide=()=>import('./demo-patent-guide.js?v=2').catch(err=>console.warn('RHKEARTH patent guide fallback:',err));
const loadMarketBridge=()=>import('./market-bridge.js?v=2').catch(err=>console.warn('RHKEARTH applications bridge fallback:',err));
const load3D=()=>import('./mission3d-audited.js?v=1').catch(err=>console.warn('RHKEARTH audited 3D demonstrator fallback:',err));
function loadEnhancements(){loadHeroMedia();loadHeroPolish();loadSensor().then(loadPatentAccuracy).then(loadPatentStrict).then(loadDemoMechanics).then(loadFinalAudit).then(loadTechnologyUnified).then(loadPatentGuide).then(loadMarketBridge).then(load3D);}
if(document.readyState==='complete')loadEnhancements();else window.addEventListener('load',loadEnhancements,{once:true});
})();