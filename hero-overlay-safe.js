(()=>{
'use strict';
const panel=document.querySelector('.scene-panel');
const svg=panel?.querySelector('svg');
if(!panel||!svg)return;

function enforceSafeArea(){
  const svgRect=svg.getBoundingClientRect();
  if(!svgRect.width)return;
  const viewBox=svg.viewBox?.baseVal;
  const vw=viewBox?.width||800;
  const scale=vw/svgRect.width;
  const leftPx=svgRect.left+22;
  const rightPx=svgRect.right-22;
  svg.querySelectorAll('.scene-group text.rhk-label,.scene-group text.rhk-sub,.scene-group text.rhk-kicker,.scene-group text.rhk-plain').forEach(t=>{
    const r=t.getBoundingClientRect();
    if(!r.width)return;
    let shiftPx=0;
    if(r.left<leftPx)shiftPx=leftPx-r.left;
    if(r.right>rightPx)shiftPx=rightPx-r.right;
    if(Math.abs(shiftPx)<.5)return;
    const shift=shiftPx*scale;
    const x=Number(t.getAttribute('x'));
    if(Number.isFinite(x))t.setAttribute('x',String(x+shift));
    else{
      const existing=t.dataset.safeShift?Number(t.dataset.safeShift):0;
      const next=existing+shift;
      t.dataset.safeShift=String(next);
      t.style.translate=`${next}px 0px`;
    }
  });
}

const run=()=>requestAnimationFrame(()=>requestAnimationFrame(enforceSafeArea));
run();
window.addEventListener('resize',run,{passive:true});
new MutationObserver(run).observe(svg,{subtree:true,attributes:true,attributeFilter:['class']});
})();