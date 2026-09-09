(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
let applying=false;

function finalize(){
  if(applying)return;
  applying=true;
  try{
    // Public presentation: keep diligence-only licensing metadata out of the page.
    qa('.patent-ip-reference').forEach(el=>el.remove());

    // This evidence block combines patent text with the published NRL prototype work.
    // Keep the label plain and specific without implying every displayed value is literal patent text.
    const boundary=q('#system .patent-boundary-kicker');
    if(boundary&&boundary.textContent!=='SOURCES // PATENTS + PUBLISHED NRL PROTOTYPE WORK'){
      boundary.textContent='SOURCES // PATENTS + PUBLISHED NRL PROTOTYPE WORK';
    }
    const disclosure=q('#system .patent-fact-disclosure span');
    if(disclosure&&disclosure.textContent!=='KEY TECHNICAL VALUES')disclosure.textContent='KEY TECHNICAL VALUES';

    // Keep the analytical cosine plot strictly mathematical. Avoid adding a phase
    // interpretation beyond what is necessary to explain the signed cosine relation.
    qa('#system .audit-readout').forEach(card=>{
      const label=q('span',card),small=q('small',card);
      if(/normalized signed response/i.test(label?.textContent||'')&&small){
        const text='Analytical R/Rmax = cos θ. The sign follows the signed cosine relation; this is not a sensitivity value.';
        if(small.textContent!==text)small.textContent=text;
      }
    });
    qa('#system .lobe-label').forEach(el=>{
      if(/PHASE-REVERSED/i.test(el.textContent||''))el.textContent='NEGATIVE COSINE LOBE';
    });
    const directivityFoot=qa('#system .directivity-foot span');
    if(directivityFoot[1]){
      const text='Negative values are the negative lobe of the signed cosine relation, not negative sensitivity.';
      if(directivityFoot[1].textContent!==text)directivityFoot[1].textContent=text;
    }

    // Passive sensor graphics must never retain circles that can read as detection range.
    qa('#market .mm10-node .ring').forEach(el=>el.remove());
  }finally{
    applying=false;
  }
}

finalize();
[250,900,2000,4000].forEach(ms=>setTimeout(finalize,ms));
const observer=new MutationObserver(()=>queueMicrotask(finalize));
observer.observe(document.body,{childList:true,subtree:true,characterData:true});
window.addEventListener('rhk-deployment-change',()=>queueMicrotask(finalize));
})();
