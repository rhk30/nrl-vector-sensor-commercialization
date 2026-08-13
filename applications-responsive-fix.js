(()=>{
'use strict';
if(document.getElementById('rhk-applications-responsive-fix'))return;
const style=document.createElement('style');
style.id='rhk-applications-responsive-fix';
style.textContent=`
@media(max-width:620px){
  .market-motion-v10{grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:100%!important;min-width:0!important;overflow:visible!important}
  .market-motion-v10 .mm10-stage,.market-motion-v10 .mm10-copy{width:100%!important;max-width:100%!important;min-width:0!important}
  .market-motion-v10 .mm10-circle{width:100%!important;max-width:100%!important;margin-inline:auto!important}
  .market-motion-v10 .mm10-copy{padding-left:0!important;padding-right:0!important}
}
`;
document.head.appendChild(style);
})();
