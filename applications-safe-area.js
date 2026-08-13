(()=>{
'use strict';
function fixReceiverLabel(){
  const svg=document.querySelector('.market-motion-v10 .mm10-scene');
  if(!svg)return false;
  const label=[...svg.querySelectorAll('text')].find(t=>(t.textContent||'').trim()==='EXTERNAL RECEIVER / CONTROLLER');
  const dot=svg.querySelector('.mm10-receiver-dot');
  const data=svg.querySelector('.mm10-data');
  if(!label)return false;

  // Keep the receiver callout comfortably inside the circular safe area.
  if(dot){dot.setAttribute('cx','642');dot.setAttribute('cy','184');}
  if(data){data.setAttribute('x2','642');data.setAttribute('y2','184');}

  label.setAttribute('x','642');
  label.setAttribute('y','154');
  label.setAttribute('text-anchor','middle');
  label.textContent='';
  const ns='http://www.w3.org/2000/svg';
  const a=document.createElementNS(ns,'tspan');
  a.setAttribute('x','642');a.setAttribute('dy','0');a.textContent='EXTERNAL RECEIVER';
  const b=document.createElementNS(ns,'tspan');
  b.setAttribute('x','642');b.setAttribute('dy','12');b.textContent='CONTROLLER';
  label.append(a,b);
  return true;
}

if(!fixReceiverLabel()){
  const root=document.getElementById('market')||document.body;
  const observer=new MutationObserver(()=>{if(fixReceiverLabel())observer.disconnect();});
  observer.observe(root,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),15000);
}
})();
