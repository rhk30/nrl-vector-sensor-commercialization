(()=>{'use strict';
const svg=document.querySelector('.scene-panel svg');
if(!svg)return;
const NS='http://www.w3.org/2000/svg';
const make=(tag,attrs={})=>{const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e};

let defs=svg.querySelector('defs');
if(!defs){defs=make('defs');svg.insertBefore(defs,svg.firstChild)}
if(!svg.querySelector('#rhkWakeFade')){
  const grad=make('linearGradient',{id:'rhkWakeFade',x1:'0%',y1:'0%',x2:'100%',y2:'0%'});
  grad.append(
    make('stop',{offset:'0%','stop-color':'#d8ddd4','stop-opacity':'0'}),
    make('stop',{offset:'58%','stop-color':'#d8ddd4','stop-opacity':'.2'}),
    make('stop',{offset:'100%','stop-color':'#d8ddd4','stop-opacity':'0'})
  );
  defs.appendChild(grad);
}
if(!svg.querySelector('#rhkHazeFade')){
  const haze=make('linearGradient',{id:'rhkHazeFade',x1:'0%',y1:'0%',x2:'0%',y2:'100%'});
  haze.append(
    make('stop',{offset:'0%','stop-color':'#d8ddd4','stop-opacity':'0'}),
    make('stop',{offset:'45%','stop-color':'#d8ddd4','stop-opacity':'.12'}),
    make('stop',{offset:'100%','stop-color':'#d8ddd4','stop-opacity':'0'})
  );
  defs.appendChild(haze);
}

function group(scene){return svg.querySelector(`.scene-group[data-scene="${scene}"]`)}
function addWake(scene,x,y,w=120,rot=0){
  const g=group(scene);if(!g)return;
  const p1=make('path',{d:`M ${x-w} ${y} Q ${x-w*.58} ${y-3.5} ${x} ${y}`,'class':'rhk-wake','stroke':'url(#rhkWakeFade)','stroke-width':'1.05','fill':'none','transform':`rotate(${rot} ${x} ${y})`});
  const p2=make('path',{d:`M ${x-w*.9} ${y+5} Q ${x-w*.48} ${y+1.5} ${x-4} ${y+3}`,'class':'rhk-wake-secondary','stroke':'url(#rhkWakeFade)','stroke-width':'.7','fill':'none','transform':`rotate(${rot} ${x} ${y})`});
  g.insertBefore(p2,g.firstChild);g.insertBefore(p1,g.firstChild);
}
function addDepthBand(scene,y,opacity=.05){const g=group(scene);if(!g)return;g.insertBefore(make('rect',{x:'54',y:String(y),width:'692',height:'1',fill:'#d7d9d2',opacity:String(opacity),'class':'rhk-depth-band'}),g.firstChild)}
function addBearingGlow(scene,x1,y1,x2,y2){const g=group(scene);if(!g)return;g.appendChild(make('line',{x1,y1,x2,y2,'class':'rhk-bearing-glow','stroke':'#d2d5cd','stroke-width':'.8','stroke-dasharray':'2 11'}))}
function addHaze(scene,y,height=170){const g=group(scene);if(!g)return;g.insertBefore(make('rect',{x:'0',y:String(y),width:'800',height:String(height),fill:'url(#rhkHazeFade)','class':'rhk-haze'}),g.firstChild)}

// Keep the wind scene exactly as-is.
addWake('fleet',510,165,156,0);
addWake('swcc',510,267,100,0);
addWake('harbor',450,270,132,0);
addWake('subsea',665,143,108,0);

addDepthBand('subsea',360,.05);addDepthBand('fleet',410,.045);addDepthBand('swcc',392,.035);addDepthBand('harbor',372,.035);
addHaze('subsea',305,190);addHaze('fleet',350,160);addHaze('swcc',330,180);addHaze('harbor',320,180);

addBearingGlow('subsea','280','455','565','445');
addBearingGlow('fleet','510','278','230','520');
addBearingGlow('swcc','355','470','510','250');
addBearingGlow('harbor','275','430','450','245');

// Subtle continuous motion only. Same scenes, just smoother and more natural.
const motion={
  subsea:{x:.7,y:.22,period:19,craftX:-1.6,craftY:.35,craftPeriod:15},
  fleet:{x:.5,y:.16,period:21,craftX:1.1,craftY:.22,craftPeriod:18},
  swcc:{x:.42,y:.18,period:18,craftX:1.5,craftY:.32,craftPeriod:13},
  harbor:{x:.34,y:.13,period:23,craftX:.8,craftY:.18,craftPeriod:20}
};
const nativeTranslate=new WeakMap();
['subsea','fleet','swcc','harbor'].forEach(id=>{
  const g=group(id);if(g)nativeTranslate.set(g,g.style.translate||'');
});

let raf=0,start=performance.now();
function tick(now){
  const t=(now-start)/1000;
  Object.entries(motion).forEach(([id,m])=>{
    const g=group(id);if(!g)return;
    const gx=Math.sin((t/m.period)*Math.PI*2)*m.x;
    const gy=Math.cos((t/m.period)*Math.PI*2)*m.y;
    g.style.translate=`${gx}px ${gy}px`;

    const craft=g.querySelector('.craft-drift,.sub-drift');
    if(craft && id!=='fleet'){
      const cx=Math.sin((t/m.craftPeriod)*Math.PI*2)*m.craftX;
      const cy=Math.sin((t/m.craftPeriod)*Math.PI*2+Math.PI/3)*m.craftY;
      craft.style.translate=`${cx}px ${cy}px`;
    }
  });
  raf=requestAnimationFrame(tick);
}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches)raf=requestAnimationFrame(tick);
window.addEventListener('pagehide',()=>cancelAnimationFrame(raf),{once:true});
})();
