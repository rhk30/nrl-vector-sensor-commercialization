(()=>{'use strict';
const rewrites=new Map([
  ['Operating imagery is context only. Patent overlays distinguish source-bearing geometry and disclosed architecture from any claim of a validated installation.','Photos and video provide context only. The overlays show source-bearing geometry and patent-described architecture.'],
  ['Start with the disclosed architecture, then inspect the mesh physics. Reported prototype measurements are separated from analytical relationships, estimates and illustrative geometry.','The architecture and mesh views keep reported measurements separate from calculations, estimates and schematic geometry.'],
  ['Configure a patent-described deployment context and place a generic source around it. The demonstrator explains architecture and direction-of-arrival geometry only; it does not calculate sonar performance.','Choose a patent-described deployment and move a generic source around the sensor. The display shows direction geometry only and does not calculate sonar performance.'],
  ['Patent-described deployment contexts are separated from commercialization hypotheses. No existing customer deployment, program-of-record status, detection range or fielded Navy capability is claimed.','Patent deployment concepts and RHKEARTH application ideas are labeled separately. The site does not claim customers, program-of-record status, detection range or fielded Navy use.'],
  ['These are potential RHKEARTH applications, not patent deployment claims. They remain contingent on technical validation, customer need and appropriate rights.','These are RHKEARTH application ideas, not patent deployment claims. They still require technical validation, customer demand and appropriate rights.'],
  ['The platform image is context. The overlay isolates patent-described vector sensing, source-bearing geometry and the external receiver/controller concept without representing a validated installation.','The platform image provides context only. The overlay shows patent-described vector sensing, source-bearing geometry and the external receiver/controller path.'],
  ['US11408961B2 describes neutrally buoyant AVS embodiments for towed-array use. The Navy footage is operating context, not a fielded sensor configuration.','US11408961B2 describes neutrally buoyant AVS embodiments for towed-array use. The Navy footage provides context only.'],
  ['Multiple moored directional nodes are shown only to explain a potential localization concept. No harbor deployment, accuracy, detection range or network performance is claimed.','The moored nodes show a possible localization concept. The site does not claim a harbor deployment, accuracy, detection range or network performance.'],
  ['Potential sensing context only. No deployment, customer adoption or validated performance is implied.','Possible evaluation context only. No deployment, customer adoption or validated performance is claimed.'],
  ['Ports, transits and high-traffic waterways are potential evaluation environments for directional acoustic sensing.','Ports, transits and high-traffic waterways could be used to evaluate directional acoustic sensing.'],
  ['Fixed and mobile offshore infrastructure creates a complex acoustic environment worth evaluating only after technical validation.','Offshore infrastructure creates a complex acoustic environment that could be evaluated after technical validation.'],
  ['Construction, operation and environmental monitoring around offshore energy infrastructure are potential dual-use evaluation paths.','Construction, operations and environmental monitoring around offshore energy infrastructure are possible evaluation areas.'],
  ['Marine seismic surveys are a strong acoustic-source context for evaluating directional observation concepts; no claimed detection performance is implied.','Marine seismic surveys provide a strong acoustic-source context for testing directional observation concepts. No detection performance is claimed.'],
  ['Working vessels and biologically sensitive environments represent another possible observation context, contingent on customer need and validation.','Working vessels and biologically sensitive areas are another possible observation context, subject to customer need and technical validation.'],
  ['Evaluation imagery is illustrative only. These are RHKEARTH commercialization hypotheses, not patent deployment claims or validated sensor installations.','The media shows possible commercial settings. It does not show patent deployments or validated sensor installations.'],
  ['Patent-grounded mechanism and prototype data. The cutaway includes one fixed analytical geometry example; no performance simulation is applied.','Patent-based mechanism and prototype data. The cutaway uses one fixed analytical geometry example and does not simulate performance.'],
  ['The cutaway above shows the sensing mechanism. The graph below isolates the patent-described normalized cosine directivity relative to the mesh normal.','The cutaway shows the sensing mechanism. The graph shows the normalized cosine relation described in the patent.'],
  ['Patent-grounded conceptual cutaway','Concept cutaway based on patent disclosure'],
  ['STATIC PATENT-GROUNDED EXHIBIT','STATIC PATENT-BASED EXHIBIT'],
  ['Key source-grounded technology facts','Key technical values from cited sources'],
  ['KEY SOURCE-GROUNDED VALUES','KEY TECHNICAL VALUES'],
  ['KEY PATENT-STATED VALUES','KEY TECHNICAL VALUES'],
  ['SOURCE-GROUNDED // PATENT + PUBLISHED NRL PROTOTYPE WORK','SOURCES // PATENTS + PUBLISHED NRL PROTOTYPE WORK']
]);
const attrs=['aria-label','title','alt','placeholder','content'];
let busy=false;
function normalize(value){
  if(!value)return value;
  let out=value.replace(/\s*\u2014\s*/g,' - ').replace(/\u2013/g,'-');
  const trimmed=out.trim();
  const replacement=rewrites.get(trimmed);
  if(replacement!==undefined){
    const start=out.indexOf(trimmed);
    out=out.slice(0,start)+replacement+out.slice(start+trimmed.length);
  }
  return out;
}
function clean(root=document.body){
  if(!root||busy)return;
  busy=true;
  try{
    const nodes=[];
    if(root.nodeType===Node.TEXT_NODE)nodes.push(root);
    else{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){const p=node.parentElement?.tagName;return p==='SCRIPT'||p==='STYLE'?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}});
      while(walker.nextNode())nodes.push(walker.currentNode);
    }
    nodes.forEach(node=>{const next=normalize(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next;});
    if(root.nodeType===Node.ELEMENT_NODE){
      const elements=[root,...root.querySelectorAll('*')];
      elements.forEach(el=>attrs.forEach(name=>{if(!el.hasAttribute(name))return;const old=el.getAttribute(name),next=normalize(old);if(next!==old)el.setAttribute(name,next);}));
    }
  }finally{busy=false;}
}
clean();
const observer=new MutationObserver(records=>{
  if(busy)return;
  records.forEach(record=>{
    if(record.type==='characterData')clean(record.target);
    else if(record.type==='attributes')clean(record.target);
    else record.addedNodes.forEach(node=>clean(node));
  });
});
observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:attrs});
})();
