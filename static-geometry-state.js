(()=>{'use strict';
const physics=document.getElementById('physics');if(!physics||document.getElementById('angle'))return;
const angle=document.createElement('input');
angle.id='angle';angle.type='hidden';angle.value='20';angle.disabled=true;angle.tabIndex=-1;
angle.setAttribute('aria-hidden','true');angle.dataset.role='fixed-illustrative-geometry';
physics.appendChild(angle);
})();
