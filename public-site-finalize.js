(()=>{'use strict';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));

function finalize(){
  // Public presentation: keep diligence-only licensing metadata out of the page.
  qa('.patent-ip-reference').forEach(el=>el.remove());

  // This evidence block combines patent text with the published NRL prototype work.
  // Do not label every displayed unit or interpretation as literally patent-stated.
  const boundary=q('#system .patent-boundary-kicker');
  if(boundary&&/PATENT-STATED|PATENT-REPORTED/i.test(boundary.textContent||'')){
    boundary.textContent='SOURCE-GROUNDED // PATENT + PUBLISHED NRL PROTOTYPE WORK';
  }
  const disclosure=q('#system .patent-fact-disclosure span');
  if(disclosure)disclosure.textContent='KEY SOURCE-GROUNDED VALUES';

  // Keep the analytical cosine plot strictly mathematical. Avoid adding a phase
  // interpretation beyond what is necessary to explain the signed cosine relation.
  qa('#system .audit-readout').forEach(card=>{
    const label=q('span',card),small=q('small',card);
    if(/normalized signed response/i.test(label?.textContent||'')&&small){
      small.textContent='Analytical R/Rmax = cos θ. The sign follows the signed cosine relation; this is not a sensitivity value.';
    }
  });
  qa('#system .lobe-label').forEach(el=>{
    if(/PHASE-REVERSED/i.test(el.textContent||''))el.textContent='NEGATIVE COSINE LOBE';
  });
  const directivityFoot=qa('#system .directivity-foot span');
  if(directivityFoot[1])directivityFoot[1].textContent='Negative values are the negative lobe of the signed cosine relation, not negative sensitivity.';

  // Passive sensor graphics must never retain circles that can read as detection range.
  qa('#market .mm10-node .ring').forEach(el=>el.remove());
}

finalize();
[250,900,2000,4000].forEach(ms=>setTimeout(finalize,ms));
window.addEventListener('rhk-deployment-change',()=>queueMicrotask(finalize));
})();
