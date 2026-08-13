import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';

const market=document.getElementById('market');
if(!market)throw new Error('Applications section unavailable');
market.querySelector('.market-motion')?.remove();
market.querySelector('.market-bridge')?.remove();
const head=market.querySelector('.section-head');

const section=document.createElement('section');
section.className='market-motion market-motion-v2';
section.innerHTML=`
  <div class="mm-stage">
    <div class="mm-grid" aria-hidden="true"></div>
    <div class="mm-circle" aria-label="Conceptual maritime operating picture using patent-described sensing architecture">
      <div class="mm-canvas-host"></div>
      <div class="mm-vignette"></div>
      <div class="mm-hud" aria-hidden="true">
        <span class="mm-hud-top">MARITIME SENSOR ARCHITECTURE // ILLUSTRATIVE CONTEXT</span>
        <span class="mm-hud-left">PATENT FIG. 1 CORE<br>102 BASE<br>104 FLOW METERS<br>106 RETAINING THREAD<br>108 ANCHOR</span>
        <span class="mm-hud-right">DASHED LINE<br>SOURCE TO SENSOR<br>BEARING GEOMETRY</span>
        <span class="mm-hud-scale">PATENT SCALE // 6 mm MESH OD // ≈10 mm BASE RADIUS EST. @ 10 Hz<br>SENSOR MARKERS ENLARGED FOR LEGIBILITY</span>
        <span class="mm-hud-bottom">VESSEL SIZE / MOTION ARE ILLUSTRATIVE // NO DETECTION RANGE // NO SNR // NO CLASSIFICATION MODEL</span>
      </div>
    </div>
  </div>
  <div class="mm-copy">
    <span class="mm-kicker">DEFENSE FIRST // PATENT IN CONTEXT</span>
    <div class="mm-point"><h3>Patent-described moored sensing node</h3><p>The visible node marker preserves the disclosed FIG. 1 relationships: floating base 102, flow meters 104, retaining thread 106 and anchor 108. The marker is enlarged because the patent-scale hardware would be effectively invisible beside full-size vessels.</p></div>
    <div class="mm-point"><h3>Relative platform scale</h3><p>The submarine, surface combatant and fast craft are sized in realistic relative proportions to one another. They are operating-context models only and are not represented as carrying the NRL sensor.</p></div>
    <div class="mm-point"><h3>Geometry only</h3><p>Each moving source is connected to a sensing node by a bearing line. The scene does not model acoustic source level, propagation loss, probability of detection, classification, range or fielded Navy performance.</p></div>
    <div class="mm-foot">REAL-TIME 3D VISUAL // PATENT-GROUNDED SENSOR ARCHITECTURE + ILLUSTRATIVE MARITIME CONTEXT</div>
  </div>`;
if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');
style.textContent=`
.market-motion-v2{display:grid;grid-template-columns:minmax(500px,1.12fr) minmax(350px,.88fr);gap:46px;align-items:center;margin:30px 0 44px;padding:10px 0 26px}.market-motion-v2 .mm-stage{position:relative;min-height:650px;display:flex;align-items:center;justify-content:center}.market-motion-v2 .mm-grid{position:absolute;inset:16px 2% 16px 0;background-image:linear-gradient(rgba(160,171,158,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(160,171,158,.03) 1px,transparent 1px);background-size:74px 74px;mask-image:radial-gradient(circle at 50% 50%,#000 0 58%,transparent 82%)}.market-motion-v2 .mm-circle{position:relative;width:min(650px,96%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(210,220,207,.30);background:#07110f;box-shadow:0 24px 90px rgba(0,0,0,.46),inset 0 0 100px rgba(0,0,0,.28)}.market-motion-v2 .mm-canvas-host,.market-motion-v2 .mm-canvas-host canvas,.market-motion-v2 .mm-vignette,.market-motion-v2 .mm-hud{position:absolute;inset:0;width:100%;height:100%}.market-motion-v2 .mm-canvas-host canvas{display:block}.market-motion-v2 .mm-vignette{pointer-events:none;background:radial-gradient(circle at 50% 45%,transparent 52%,rgba(2,5,4,.09) 70%,rgba(1,3,2,.62) 100%),linear-gradient(180deg,rgba(1,4,4,0),rgba(1,4,4,.06) 62%,rgba(1,3,2,.22));z-index:2}.market-motion-v2 .mm-hud{z-index:3;pointer-events:none;color:#cbd3c7;font:8px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.055em}.market-motion-v2 .mm-hud>span{position:absolute;text-shadow:0 1px 7px rgba(0,0,0,.95)}.market-motion-v2 .mm-hud-top{top:11%;left:19%;max-width:60%;color:#aeb9aa}.market-motion-v2 .mm-hud-left{left:16%;bottom:25%;color:#8e998c}.market-motion-v2 .mm-hud-right{right:16%;top:23%;text-align:right;color:#8e998c}.market-motion-v2 .mm-hud-scale{left:50%;bottom:14.5%;transform:translateX(-50%);width:68%;text-align:center;color:#9aa69a;font-size:6.8px}.market-motion-v2 .mm-hud-bottom{bottom:9%;left:50%;transform:translateX(-50%);width:68%;text-align:center;color:#7e897e;font-size:6.5px}.market-motion-v2 .mm-copy{padding-right:2%;display:flex;flex-direction:column;justify-content:center}.market-motion-v2 .mm-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9eaa9a;margin-bottom:20px}.market-motion-v2 .mm-point{padding:0 0 24px;margin-bottom:22px;border-bottom:1px solid rgba(169,181,155,.13)}.market-motion-v2 .mm-point h3{margin:0 0 8px;font-size:28px;line-height:1.04;letter-spacing:-.035em}.market-motion-v2 .mm-point p{margin:0;max-width:650px;color:#929a91;font-size:12px;line-height:1.58}.market-motion-v2 .mm-foot{color:#697269;font:8.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em}.market-motion-v2 .mm-webgl-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:15%;text-align:center;color:#8e998c;font:10px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}@media(max-width:1000px){.market-motion-v2{grid-template-columns:1fr;gap:24px}.market-motion-v2 .mm-stage{min-height:auto;padding:8px 0}.market-motion-v2 .mm-circle{width:min(610px,86vw)}.market-motion-v2 .mm-copy{padding:0 5%}.market-motion-v2 .mm-point h3{font-size:24px}}@media(max-width:600px){.market-motion-v2{margin-top:20px}.market-motion-v2 .mm-grid{display:none}.market-motion-v2 .mm-circle{width:92vw}.market-motion-v2 .mm-point{padding-bottom:18px;margin-bottom:18px}.market-motion-v2 .mm-point h3{font-size:21px}.market-motion-v2 .mm-point p{font-size:11px}.market-motion-v2 .mm-hud-left,.market-motion-v2 .mm-hud-right{display:none}.market-motion-v2 .mm-hud-top{left:18%;top:10%;max-width:64%}.market-motion-v2 .mm-hud-scale{width:70%;bottom:15%;font-size:5.8px}.market-motion-v2 .mm-hud-bottom{width:70%;font-size:5.6px}}
`;
document.head.appendChild(style);

const host=section.querySelector('.mm-canvas-host');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(err){host.innerHTML='<div class="mm-webgl-fallback">Real-time 3D view unavailable in this browser.</div>';throw err;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.04;
renderer.localClippingEnabled=false;
host.appendChild(renderer.domElement);

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x06100f);
scene.fog=new THREE.FogExp2(0x071512,.037);
const camera=new THREE.PerspectiveCamera(42,1,.05,100);
camera.position.set(12.5,8.1,15.0);
camera.lookAt(0,-.82,0);
scene.add(new THREE.HemisphereLight(0xd8e1dc,0x06100e,1.55));
const key=new THREE.DirectionalLight(0xf0f4ef,2.7);key.position.set(-7,11,5);scene.add(key);
const rim=new THREE.DirectionalLight(0x88a497,1.25);rim.position.set(8,3,-7);scene.add(rim);
const surfaceLight=new THREE.DirectionalLight(0xb8d8d0,.78);surfaceLight.position.set(1,8,2);scene.add(surfaceLight);

function seabedHeight(x,z){return -4.05+.34*Math.sin(x*.50)*Math.cos(z*.42)+.12*Math.sin((x+z)*.92)+.09*Math.cos(x*.25-z*.61);}
const terrainGeo=new THREE.PlaneGeometry(25,25,64,64);terrainGeo.rotateX(-Math.PI/2);const tp=terrainGeo.attributes.position;
for(let i=0;i<tp.count;i++)tp.setY(i,seabedHeight(tp.getX(i),tp.getZ(i)));
terrainGeo.computeVertexNormals();
scene.add(new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({color:0x101b16,roughness:.96,metalness:.01})));
const terrainWire=new THREE.Mesh(terrainGeo.clone(),new THREE.MeshBasicMaterial({color:0x69796d,wireframe:true,transparent:true,opacity:.035,depthWrite:false}));terrainWire.position.y=.02;scene.add(terrainWire);

const surfaceGeo=new THREE.PlaneGeometry(25,25,56,56);surfaceGeo.rotateX(-Math.PI/2);const surfaceBase=surfaceGeo.attributes.position.array.slice();
const surfaceMat=new THREE.MeshPhysicalMaterial({color:0x2b6460,transparent:true,opacity:.53,roughness:.22,metalness:.01,transmission:.01,side:THREE.DoubleSide,depthWrite:false});
const surface=new THREE.Mesh(surfaceGeo,surfaceMat);surface.position.y=.92;scene.add(surface);
const surfaceLines=new THREE.Mesh(surfaceGeo.clone(),new THREE.MeshBasicMaterial({color:0xc0ddd5,wireframe:true,transparent:true,opacity:.10,depthWrite:false}));surfaceLines.position.y=.938;scene.add(surfaceLines);
const horizon=new THREE.Mesh(new THREE.PlaneGeometry(25,.045),new THREE.MeshBasicMaterial({color:0xd0e5df,transparent:true,opacity:.30,depthWrite:false,side:THREE.DoubleSide}));horizon.position.set(0,.945,-1);horizon.rotation.x=-Math.PI/2;scene.add(horizon);
function waveHeight(x,z,t){return .060*Math.sin(x*.68+t*.55)+.035*Math.sin(z*.88-t*.44)+.018*Math.sin((x+z)*1.22+t*.34);}
function updateSurface(t){for(const mesh of [surface,surfaceLines]){const a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++){const bi=i*3,x=surfaceBase[bi],z=surfaceBase[bi+2];a.setY(i,waveHeight(x,z,t));}a.needsUpdate=true;}surface.geometry.computeVertexNormals();surfaceMat.opacity=.51+.02*Math.sin(t*.28);}

const pale=new THREE.MeshStandardMaterial({color:0xd4dbd2,roughness:.45,metalness:.24});
const muted=new THREE.MeshStandardMaterial({color:0x66736a,roughness:.61,metalness:.13});
const dark=new THREE.MeshStandardMaterial({color:0x101712,roughness:.73,metalness:.08});
const submarineMat=new THREE.MeshStandardMaterial({color:0x141916,roughness:.47,metalness:.19});
const shipMat=new THREE.MeshStandardMaterial({color:0x77817b,roughness:.48,metalness:.18});
const fastMat=new THREE.MeshStandardMaterial({color:0x292f2b,roughness:.52,metalness:.13});
function line(a,b,opacity=.42,dashed=false,color=0x9eaa9d){const mat=dashed?new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:.16,gapSize:.13}):new THREE.LineBasicMaterial({color,transparent:true,opacity});const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),mat);if(dashed)l.computeLineDistances();return l;}

function markerRing(radius=.18){const g=new THREE.Group();const ring=new THREE.Mesh(new THREE.RingGeometry(radius*.96,radius,42),new THREE.MeshBasicMaterial({color:0xc9d3c7,transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;g.add(ring);const crossMat=new THREE.LineBasicMaterial({color:0xc9d3c7,transparent:true,opacity:.38});g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-radius*1.45,0,0),new THREE.Vector3(radius*1.45,0,0)]),crossMat));g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,-radius*1.45),new THREE.Vector3(0,0,radius*1.45)]),crossMat));return g;}
function makeNode(x,z,central=false){
  const g=new THREE.Group();g.position.set(x,-2.18,z);g.userData.collisionRadius=.28;
  // The actual patent-scale hardware would be far too small to resolve next to
  // full-size vessels. This tiny core is intentionally surrounded by a visible marker.
  const coreScale=central?.075:.060;
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.42*coreScale,.42*coreScale,.18*coreScale,20),dark);g.add(base);
  [[.73,0],[-.73,0],[0,.73],[0,-.73]].forEach(([xx,zz])=>{const meter=new THREE.Mesh(new THREE.BoxGeometry(.22*coreScale,.08*coreScale,.32*coreScale),pale);meter.position.set(xx*coreScale,.08*coreScale,zz*coreScale);g.add(meter);});
  const marker=markerRing(central?.22:.18);marker.position.y=.02;g.add(marker);
  const ay=seabedHeight(x,z)+.10,anchorPos=new THREE.Vector3(x,ay,z);scene.add(line(new THREE.Vector3(x,g.position.y,z),anchorPos,.33,true));
  const anchor=new THREE.Mesh(new THREE.BoxGeometry(.22,.08,.16),muted);anchor.position.copy(anchorPos);anchor.position.y-=.04;scene.add(anchor);
  scene.add(g);return g;
}
const nodePositions=[[-4.1,-2.5],[3.7,-2.7],[-2.7,3.0],[3.9,2.9],[0,.2]];
const nodes=nodePositions.map((n,i)=>makeNode(n[0],n[1],i===4));

function lathedBody(profile,material){const points=profile.map(([r,y])=>new THREE.Vector2(r,y));const geo=new THREE.LatheGeometry(points,34);geo.rotateZ(-Math.PI/2);return new THREE.Mesh(geo,material);}
function makeSubmarine(){const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);root.rotation.order='YXZ';visual.scale.setScalar(.98);const hull=lathedBody([[.04,-1.62],[.18,-1.50],[.31,-1.18],[.39,-.55],[.40,.15],[.36,.78],[.26,1.23],[.11,1.52],[.03,1.64]],submarineMat);visual.add(hull);const sail=new THREE.Mesh(new THREE.BoxGeometry(.46,.53,.22),submarineMat);sail.position.set(.10,.42,0);visual.add(sail);const sailCap=new THREE.Mesh(new THREE.BoxGeometry(.38,.09,.25),submarineMat);sailCap.position.set(.18,.71,0);sailCap.rotation.z=-.08;visual.add(sailCap);const mast1=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.39,10),pale);mast1.position.set(.14,.91,0);visual.add(mast1);const mast2=mast1.clone();mast2.scale.y=.72;mast2.position.set(-.02,.85,.06);visual.add(mast2);const sternPlane=new THREE.Mesh(new THREE.BoxGeometry(.48,.04,1.06),muted);sternPlane.position.x=-1.29;visual.add(sternPlane);const rudder=new THREE.Mesh(new THREE.BoxGeometry(.40,.72,.04),muted);rudder.position.set(-1.30,.03,0);visual.add(rudder);const pumpjet=new THREE.Mesh(new THREE.TorusGeometry(.18,.032,10,26),pale);pumpjet.rotation.y=Math.PI/2;pumpjet.position.x=-1.58;visual.add(pumpjet);root.userData.visual=visual;root.userData.collisionRadius=1.72;scene.add(root);return root;}
const submarine=makeSubmarine();

function extrudedHull(points,height,material){const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)shape.lineTo(points[i][0],points[i][1]);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035});geo.rotateX(Math.PI/2);geo.translate(0,height*.5,0);return new THREE.Mesh(geo,material);}
function makeWarship(){const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);root.rotation.order='YXZ';visual.scale.setScalar(1.34);const hull=extrudedHull([[-1.45,-.34],[.88,-.34],[1.46,-.08],[1.58,0],[1.46,.08],[.88,.34],[-1.45,.34]],.30,shipMat);visual.add(hull);const deck=new THREE.Mesh(new THREE.BoxGeometry(1.28,.16,.50),shipMat);deck.position.set(-.10,.28,0);visual.add(deck);const bridge=new THREE.Mesh(new THREE.BoxGeometry(.52,.33,.42),pale);bridge.position.set(.22,.50,0);visual.add(bridge);const upper=new THREE.Mesh(new THREE.BoxGeometry(.35,.18,.30),muted);upper.position.set(.05,.74,0);visual.add(upper);const mast=new THREE.Mesh(new THREE.CylinderGeometry(.020,.020,.66,8),pale);mast.position.set(.02,1.03,0);visual.add(mast);const yard=new THREE.Mesh(new THREE.BoxGeometry(.46,.022,.022),pale);yard.position.set(.02,1.16,0);visual.add(yard);const radar=new THREE.Mesh(new THREE.BoxGeometry(.17,.11,.032),pale);radar.position.set(.02,1.22,0);visual.add(radar);const gunBase=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.09,14),muted);gunBase.position.set(.88,.38,0);visual.add(gunBase);const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.020,.020,.46,8),pale);barrel.rotation.z=Math.PI/2;barrel.position.set(1.08,.44,0);visual.add(barrel);root.userData.visual=visual;root.userData.collisionRadius=2.15;scene.add(root);return root;}
const warship=makeWarship();

function makeFastCraft(){const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);root.rotation.order='YXZ';visual.scale.setScalar(.30);const hull=extrudedHull([[-1.05,-.28],[.55,-.28],[1.12,-.05],[1.22,0],[1.12,.05],[.55,.28],[-1.05,.28]],.24,fastMat);visual.add(hull);const cabin=new THREE.Mesh(new THREE.BoxGeometry(.66,.34,.48),fastMat);cabin.position.set(.10,.38,0);cabin.rotation.z=-.03;visual.add(cabin);const windscreen=new THREE.Mesh(new THREE.BoxGeometry(.08,.20,.42),pale);windscreen.position.set(.45,.48,0);windscreen.rotation.z=-.28;visual.add(windscreen);const arch=new THREE.Mesh(new THREE.BoxGeometry(.035,.68,.40),pale);arch.position.set(-.18,.72,0);visual.add(arch);const mast=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.42,8),pale);mast.position.set(-.18,1.23,0);visual.add(mast);root.userData.visual=visual;root.userData.collisionRadius=.48;scene.add(root);return root;}
const fastCraft=makeFastCraft();

const subCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-4.3,-2.55,-2.8),new THREE.Vector3(-2.5,-2.35,2.0),new THREE.Vector3(.2,-2.58,3.5),new THREE.Vector3(3.4,-2.35,1.9),new THREE.Vector3(3.8,-2.60,-2.6),new THREE.Vector3(.5,-2.40,-3.7),new THREE.Vector3(-3.1,-2.62,-3.1)],true,'catmullrom',.56);
const warCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-4.1,.98,-2.7),new THREE.Vector3(-2.2,.98,-1.75),new THREE.Vector3(.4,.98,-1.45),new THREE.Vector3(3.5,.98,-.95),new THREE.Vector3(4.2,.98,.35),new THREE.Vector3(2.4,.98,1.20),new THREE.Vector3(-.8,.98,1.25),new THREE.Vector3(-3.6,.98,.20)],true,'catmullrom',.58);
const fastCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(3.7,1.0,3.2),new THREE.Vector3(1.9,1.0,3.75),new THREE.Vector3(-.3,1.0,3.55),new THREE.Vector3(-2.8,1.0,2.95),new THREE.Vector3(-3.5,1.0,2.20),new THREE.Vector3(-1.4,1.0,1.95),new THREE.Vector3(1.2,1.0,2.12),new THREE.Vector3(3.3,1.0,2.45)],true,'catmullrom',.60);
function curvePosition(curve,u){return curve.getPointAt(((u%1)+1)%1);}function curveTangent(curve,u){return curve.getTangentAt(((u%1)+1)%1).normalize();}
function lerpAngle(current,target,alpha){let d=(target-current+Math.PI)%(Math.PI*2)-Math.PI;if(d<-Math.PI)d+=Math.PI*2;return current+d*alpha;}
function orientSub(root,tangent,alpha=.07){const yaw=Math.atan2(-tangent.z,tangent.x),pitch=Math.asin(THREE.MathUtils.clamp(tangent.y,-.18,.18));root.rotation.y=lerpAngle(root.rotation.y,yaw,alpha);root.rotation.z=THREE.MathUtils.lerp(root.rotation.z,pitch,alpha);root.rotation.x=0;root.userData.visual.rotation.x=0;}
function orientSurface(root,tangent,alpha=.06){const yaw=Math.atan2(-tangent.z,tangent.x);root.rotation.y=lerpAngle(root.rotation.y,yaw,alpha);root.rotation.x=0;}
function keepInside(pos,maxRadius){const r=Math.hypot(pos.x,pos.z);if(r>maxRadius){const k=maxRadius/r;pos.x*=k;pos.z*=k;}return pos;}
function pushFromPoint(pos,point,minDist,strength=1){const dx=pos.x-point.x,dz=pos.z-point.z,d=Math.hypot(dx,dz)||.0001;if(d<minDist){const push=(minDist-d)*strength;pos.x+=dx/d*push;pos.z+=dz/d*push;}return pos;}
function separate2D(a,b,minDist){const dx=a.x-b.x,dz=a.z-b.z,d=Math.hypot(dx,dz)||.0001;if(d<minDist){const push=(minDist-d)*.5;a.x+=dx/d*push;a.z+=dz/d*push;b.x-=dx/d*push;b.z-=dz/d*push;}return [a,b];}
function constrainSub(pos){nodes.forEach(n=>pushFromPoint(pos,n.position,.92,.82));keepInside(pos,4.55);const floor=seabedHeight(pos.x,pos.z)+.70;pos.y=Math.max(pos.y,floor);pos.y=Math.min(pos.y,-.62);return pos;}
function constrainSurface(wp,fp){keepInside(wp,4.55);keepInside(fp,4.55);separate2D(wp,fp,2.45);return [wp,fp];}

const ringMat=new THREE.MeshBasicMaterial({color:0xb6c3b6,transparent:true,opacity:.11,side:THREE.DoubleSide,depthWrite:false});
const acousticRoot=new THREE.Group();scene.add(acousticRoot);const rings=[];for(let i=0;i<4;i++){const r=new THREE.Mesh(new THREE.RingGeometry(.98,1.01,64),ringMat.clone());r.rotation.x=-Math.PI/2;r.userData.offset=i/4;acousticRoot.add(r);rings.push(r);}
function makeAssociation(color=0xd2d7cf,opacity=.32){const mat=new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:.17,gapSize:.14});const l=new THREE.Line(new THREE.BufferGeometry(),mat);scene.add(l);return l;}
const subAssociation=makeAssociation(0xdbe2d8,.42),warAssociation=makeAssociation(0xc5d0c6,.29),fastAssociation=makeAssociation(0xb6c4b7,.25);
function nearestNode(pos){let best=nodes[0],bestD=Infinity;for(const n of nodes){const d=(n.position.x-pos.x)**2+(n.position.z-pos.z)**2;if(d<bestD){bestD=d;best=n;}}return best;}
function connect(lineObj,node,obj){lineObj.geometry.setFromPoints([node.position,obj.position]);lineObj.computeLineDistances();}

function makeWake(){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]);return new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xd3e1dc,transparent:true,opacity:.15,depthWrite:false}));}
const warWake=makeWake(),fastWake=makeWake();scene.add(warWake,fastWake);
function updateWake(wake,pos,tangent,width,length){const back=tangent.clone().multiplyScalar(-length),side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize().multiplyScalar(width),p=pos.clone();p.y=.96;const a=p.clone().add(side),b=p.clone().add(back).add(side.clone().multiplyScalar(2.1)),c=p.clone().sub(side),d=p.clone().add(back).sub(side.clone().multiplyScalar(2.1));wake.geometry.setFromPoints([a,b,c,d]);}

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);const t=clock.getElapsedTime();updateSurface(t);
  const su=(t*.015)%1,sp=constrainSub(curvePosition(subCurve,su)),st=curveTangent(subCurve,su);submarine.position.copy(sp);orientSub(submarine,st,.07);submarine.userData.visual.rotation.z=THREE.MathUtils.lerp(submarine.userData.visual.rotation.z,.008*Math.sin(t*.32),.025);
  const wu=(t*.0065)%1,wp=curvePosition(warCurve,wu),wt=curveTangent(warCurve,wu);const fu=(t*.013+0.31)%1,fp=curvePosition(fastCurve,fu),ft=curveTangent(fastCurve,fu);constrainSurface(wp,fp);
  wp.y=.99+waveHeight(wp.x,wp.z,t)+.012*Math.sin(t*.48);fp.y=1.00+waveHeight(fp.x,fp.z,t)+.025*Math.sin(t*.92);
  warship.position.copy(wp);orientSurface(warship,wt,.05);warship.userData.visual.rotation.x=THREE.MathUtils.lerp(warship.userData.visual.rotation.x,.003*Math.sin(t*.55),.03);warship.userData.visual.rotation.z=THREE.MathUtils.lerp(warship.userData.visual.rotation.z,.006*Math.sin(t*.65),.03);
  fastCraft.position.copy(fp);orientSurface(fastCraft,ft,.065);fastCraft.userData.visual.rotation.x=THREE.MathUtils.lerp(fastCraft.userData.visual.rotation.x,.006*Math.sin(t*.85),.04);fastCraft.userData.visual.rotation.z=THREE.MathUtils.lerp(fastCraft.userData.visual.rotation.z,.010*Math.sin(t*.98),.04);
  updateWake(warWake,wp,wt,.17,1.30);updateWake(fastWake,fp,ft,.05,.36);
  acousticRoot.position.copy(submarine.position);rings.forEach(r=>{const q=(t*.13+r.userData.offset)%1,s=.30+q*1.75;r.scale.setScalar(s);r.material.opacity=(1-q)*.11;});
  connect(subAssociation,nearestNode(submarine.position),submarine);connect(warAssociation,nearestNode(warship.position),warship);connect(fastAssociation,nearestNode(fastCraft.position),fastCraft);
  camera.position.x=12.5+Math.sin(t*.035)*.22;camera.position.z=15.0+Math.cos(t*.032)*.24;camera.position.y=8.1+Math.sin(t*.026)*.10;camera.lookAt(0,-.82,0);renderer.render(scene,camera);
}
function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();animate();
