import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/controls/OrbitControls.js';

const stage=document.querySelector('.mission-stage');
const mission=document.querySelector('.mission-shell');
if(!stage||!mission)throw new Error('Mission stage not found');

const root=document.createElement('div');
root.className='mission-3d';
root.setAttribute('aria-label','Interactive 3D conceptual view of patent-described acoustic vector sensor deployment geometry');
root.innerHTML='<div class="mission-3d-ui"><span id="mission3dMode">Floating / moored patent concept</span><span><strong>DRAG</strong> orbit · <strong>SCROLL</strong> zoom · <em id="mission3dRef">90 Hz: in-air prototype test</em></span></div><div class="mission-3d-axis">Source-bearing line: sensor → source<br>Incoming propagation vector: source → sensor<br>Geometry only, no range or SNR model</div>';
stage.prepend(root);

let renderer;
try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
}catch(err){
  root.innerHTML='<div class="mission-3d-error">3D view unavailable in this browser. The 2D patent concept view remains active.</div>';
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.92;
root.prepend(renderer.domElement);
stage.classList.add('has-webgl');

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x050605);
scene.fog=new THREE.FogExp2(0x050605,.055);
const camera=new THREE.PerspectiveCamera(43,1,.1,100);
camera.position.set(10.5,7.2,11.5);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.dampingFactor=.055;
controls.enablePan=false;
controls.minDistance=7;
controls.maxDistance=24;
controls.minPolarAngle=.42;
controls.maxPolarAngle=1.47;
controls.target.set(0,-1.15,0);
controls.update();

scene.add(new THREE.HemisphereLight(0xdde2d8,0x111411,1.25));
const key=new THREE.DirectionalLight(0xf4f5ef,2.4);key.position.set(-7,10,6);scene.add(key);
const rim=new THREE.DirectionalLight(0x9ca99a,1.35);rim.position.set(8,2,-7);scene.add(rim);

const water=new THREE.Mesh(
  new THREE.PlaneGeometry(26,26),
  new THREE.MeshPhysicalMaterial({color:0x101613,transparent:true,opacity:.42,roughness:.28,metalness:.05,transmission:.05,side:THREE.DoubleSide})
);
water.rotation.x=-Math.PI/2;
scene.add(water);
const seabed=new THREE.Mesh(new THREE.PlaneGeometry(26,26),new THREE.MeshStandardMaterial({color:0x080908,roughness:1,metalness:0}));
seabed.rotation.x=-Math.PI/2;
seabed.position.y=-4.1;
scene.add(seabed);
const grid=new THREE.GridHelper(24,24,0x363a36,0x171917);
grid.position.y=-4.04;
for(const m of Array.isArray(grid.material)?grid.material:[grid.material]){m.transparent=true;m.opacity=.24;}
scene.add(grid);

const sensorRoot=new THREE.Group();
const targetRoot=new THREE.Group();
const waveRoot=new THREE.Group();
const deploymentRoot=new THREE.Group();
scene.add(sensorRoot,targetRoot,waveRoot,deploymentRoot);

const bearingMaterial=new THREE.LineBasicMaterial({color:0xd1cec0,transparent:true,opacity:.58});
const bearingLine=new THREE.Line(new THREE.BufferGeometry(),bearingMaterial);
scene.add(bearingLine);
// Arrow shows the acoustic propagation direction from source toward sensor.
const propagationArrow=new THREE.ArrowHelper(new THREE.Vector3(-1,0,0),new THREE.Vector3(),3,0xe3e5de,.28,.13);
scene.add(propagationArrow);

const pale=new THREE.MeshStandardMaterial({color:0xd8ddd3,roughness:.56,metalness:.26});
const dark=new THREE.MeshStandardMaterial({color:0x151815,roughness:.72,metalness:.14});
const muted=new THREE.MeshStandardMaterial({color:0x5d645d,roughness:.66,metalness:.18});
const accent=new THREE.MeshStandardMaterial({color:0xbec8ba,roughness:.48,metalness:.18});
const shared=[pale,dark,muted,accent];
function disposeGroup(group){
  while(group.children.length){
    const c=group.children.pop();
    c.traverse?.(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&!shared.includes(o.material))o.material.dispose?.();});
  }
}
function lineBetween(a,b,opacity=.65){
  const mat=new THREE.LineBasicMaterial({color:0x7f887c,transparent:true,opacity});
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),mat);
}
function meshTile(w=.34,h=.42){
  const g=new THREE.Group();
  const frame=new THREE.Mesh(new THREE.BoxGeometry(w,.035,h),pale);g.add(frame);
  const core=new THREE.Mesh(new THREE.BoxGeometry(w*.68,.02,h*.68),dark);core.position.y=.026;g.add(core);
  return g;
}

function createSensor(type){
  disposeGroup(sensorRoot);
  if(type==='floating'){
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.2,28),dark);sensorRoot.add(base);
    const hub=new THREE.Mesh(new THREE.SphereGeometry(.16,18,12),pale);hub.position.y=.12;sensorRoot.add(hub);
    [[.78,0,Math.PI/2],[-.78,0,Math.PI/2],[0,.78,0],[0,-.78,0]].forEach(([x,z,r])=>{
      const arm=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x)>.1?.62:.08,.06,Math.abs(z)>.1?.62:.08),muted);arm.position.set(x*.48,.08,z*.48);sensorRoot.add(arm);
      const tile=meshTile();tile.position.set(x,.09,z);tile.rotation.y=r;sensorRoot.add(tile);
    });
  }else if(type==='tower'){
    const tower=new THREE.Mesh(new THREE.CylinderGeometry(.34,.4,1.85,24),dark);tower.position.y=.48;sensorRoot.add(tower);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.12,24),accent);cap.position.y=1.42;sensorRoot.add(cap);
    for(const rot of [0,Math.PI/2,Math.PI/4]){
      const channel=new THREE.Mesh(new THREE.BoxGeometry(1.15,.1,.12),pale);channel.position.y=.5;channel.rotation.y=rot;sensorRoot.add(channel);
      const throat=new THREE.Mesh(new THREE.BoxGeometry(.22,.14,.16),dark);throat.position.y=.5;throat.rotation.y=rot;sensorRoot.add(throat);
    }
  }else{
    // Hull is contextual geometry. The highlighted block is the conceptual sensor module.
    const hull=new THREE.Mesh(new THREE.CapsuleGeometry(.55,2.45,10,24),dark);hull.rotation.z=Math.PI/2;sensorRoot.add(hull);
    const sail=new THREE.Mesh(new THREE.BoxGeometry(.52,.44,.28),muted);sail.position.set(.15,.52,0);sensorRoot.add(sail);
    const module=new THREE.Mesh(new THREE.BoxGeometry(.38,.18,.48),pale);module.position.set(.25,-.48,.42);sensorRoot.add(module);
  }
}

function createTarget(type){
  disposeGroup(targetRoot);
  if(type==='surface'){
    const hull=new THREE.Mesh(new THREE.BoxGeometry(2.1,.36,.72),dark);hull.scale.z=.72;targetRoot.add(hull);
    const bow=new THREE.Mesh(new THREE.ConeGeometry(.38,.9,4),dark);bow.rotation.z=-Math.PI/2;bow.position.x=1.48;targetRoot.add(bow);
    const deck=new THREE.Mesh(new THREE.BoxGeometry(.75,.28,.48),pale);deck.position.set(-.15,.31,0);targetRoot.add(deck);
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.7,8),pale);mast.position.set(-.08,.8,0);targetRoot.add(mast);
  }else if(type==='submarine'){
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,2.25,8,20),dark);body.rotation.z=Math.PI/2;targetRoot.add(body);
    const sail=new THREE.Mesh(new THREE.BoxGeometry(.44,.42,.26),pale);sail.position.set(.1,.44,0);targetRoot.add(sail);
    const fin=new THREE.Mesh(new THREE.BoxGeometry(.55,.06,1.45),muted);fin.position.x=-1.25;targetRoot.add(fin);
  }else{
    targetRoot.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.48,2),pale));
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.3,8),muted);stem.position.y=-.8;targetRoot.add(stem);
  }
}

function createDeployment(mode){
  disposeGroup(deploymentRoot);
  if(mode==='floating'||mode==='sonobuoy'){
    const anchor=new THREE.Mesh(new THREE.BoxGeometry(1.05,.28,.82),muted);anchor.position.set(0,-3.88,0);deploymentRoot.add(anchor);
    deploymentRoot.add(lineBetween(new THREE.Vector3(0,sensorRoot.position.y-.05,0),new THREE.Vector3(0,-3.73,0),.7));
  }else if(mode==='towed'){
    const towPoint=new THREE.Vector3(-6.4,-1.05,0);
    deploymentRoot.add(lineBetween(new THREE.Vector3(0,sensorRoot.position.y+.1,0),towPoint,.72));
    const node=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),muted);node.position.copy(towPoint);deploymentRoot.add(node);
  }
}

const waveMeshes=[];
for(let i=0;i<5;i++){
  const material=new THREE.MeshBasicMaterial({color:0xbec8ba,wireframe:true,transparent:true,opacity:.13,depthWrite:false});
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,22,14),material);mesh.userData.offset=i/5;waveRoot.add(mesh);waveMeshes.push(mesh);
}

const ids={
  target:document.getElementById('targetType'),
  config:document.getElementById('sensorConfig'),
  range:document.getElementById('missionRange'),
  bearing:document.getElementById('missionBearing'),
  freq:document.getElementById('missionFreq')
};
const refText={10:'10 Hz: floating-base size estimate',90:'90 Hz: in-air prototype test',530:'530 Hz: prototype fundamental'};
const modeText={floating:'Floating / moored patent concept',hull:'Hull / AUV mounting concept',platform:'Hull / AUV mounting concept',sonobuoy:'Sonobuoy tower patent concept',towed:'Neutrally buoyant towed-array concept',tower:'Viscous-channel tower concept'};
let lastTarget=null,lastConfig=null,lastDeployment=null;
function getDeployment(){return mission.dataset.deployment||(ids.config?.value==='platform'?'platform':ids.config?.value==='tower'?'tower':'floating');}
function getState(){return{target:ids.target?.value||'source',config:ids.config?.value||'floating',range:+(ids.range?.value||3.2),bearing:+(ids.bearing?.value||62),freq:+(ids.freq?.value||90),deployment:getDeployment()};}
function updateScene(){
  const s=getState();
  if(s.target!==lastTarget){createTarget(s.target);lastTarget=s.target;}
  if(s.config!==lastConfig){createSensor(s.config);lastConfig=s.config;}
  sensorRoot.position.set(0,s.config==='platform'?-1.25:s.config==='tower'?-1.62:-1.72,0);
  if(s.deployment!==lastDeployment){createDeployment(s.deployment);lastDeployment=s.deployment;}
  else if(s.deployment==='floating'||s.deployment==='sonobuoy'||s.deployment==='towed'){createDeployment(s.deployment);}

  const radius=THREE.MathUtils.lerp(1.9,8.2,Math.min(1,s.range/8.5));
  const a=THREE.MathUtils.degToRad(90-s.bearing);
  const targetY=s.target==='surface'?.12:(s.target==='submarine'?-2.15:-1.55);
  targetRoot.position.set(Math.cos(a)*radius,targetY,Math.sin(a)*radius);
  targetRoot.rotation.y=-a;
  waveRoot.position.copy(targetRoot.position);

  const sensor=sensorRoot.position.clone();
  const source=targetRoot.position.clone();
  bearingLine.geometry.dispose();
  bearingLine.geometry=new THREE.BufferGeometry().setFromPoints([sensor,source]);

  // Propagation / particle-motion direction is source -> sensor, opposite the
  // source-bearing line. This is the vector whose components project onto mesh normals.
  const propagation=sensor.clone().sub(source);
  const len=propagation.length();
  propagation.normalize();
  propagationArrow.position.copy(source);
  propagationArrow.setDirection(propagation);
  propagationArrow.setLength(Math.min(len,4.4),.32,.15);

  const ref=document.getElementById('mission3dRef');
  if(ref){const f=Math.round(s.freq);ref.textContent=refText[f]||'Patent reference context';}
  const mode=document.getElementById('mission3dMode');if(mode)mode.textContent=modeText[s.deployment]||modeText[s.config]||'Patent concept space';
}

Object.values(ids).forEach(el=>{if(!el)return;el.addEventListener('input',updateScene);el.addEventListener('change',updateScene);});
window.addEventListener('rhk-deployment-change',()=>updateScene());
updateScene();

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();
  waveMeshes.forEach(w=>{const q=(t*.32+w.userData.offset)%1,scale=.35+q*3.25;w.scale.setScalar(scale);w.material.opacity=(1-q)*.13;});
  water.material.opacity=.39+Math.sin(t*.35)*.018;
  controls.update();renderer.render(scene,camera);
}
function resize(){const w=Math.max(1,root.clientWidth),h=Math.max(1,root.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(root);
resize();animate();