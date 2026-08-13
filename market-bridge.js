import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';

const market=document.getElementById('market');
if(!market||market.querySelector('.market-motion'))throw new Error('Applications section unavailable or already initialized');
market.querySelector('.market-bridge')?.remove();
const head=market.querySelector('.section-head');

const section=document.createElement('section');
section.className='market-motion';
section.innerHTML=`
  <div class="mm-stage">
    <div class="mm-grid" aria-hidden="true"></div>
    <div class="mm-circle" aria-label="Real-time conceptual maritime operating picture using patent-described sensing architecture">
      <div class="mm-canvas-host"></div>
      <div class="mm-vignette"></div>
      <div class="mm-hud" aria-hidden="true">
        <span class="mm-hud-top">MARITIME OPERATING PICTURE // CONCEPT</span>
        <span class="mm-hud-left">PATENT CORE<br>102 BASE<br>104 FLOW METERS<br>106 TETHER<br>108 ANCHOR</span>
        <span class="mm-hud-right">DIRECTIONAL<br>GEOMETRY ONLY</span>
        <span class="mm-hud-bottom">NO DETECTION RANGE · NO SNR · NO CLASSIFICATION MODEL</span>
      </div>
    </div>
  </div>
  <div class="mm-copy">
    <span class="mm-kicker">DEFENSE FIRST // PATENT-IN-CONTEXT</span>
    <div class="mm-point"><h3>Distributed directional sensing</h3><p>The patent describes particle-motion sensing for recovering direction-of-arrival information in a compact footprint. The scene places that disclosed sensing concept into an illustrative maritime operating picture without representing a validated sonar system.</p></div>
    <div class="mm-point"><h3>Moored architecture</h3><p>US11287508B2 discloses a floating base with one or more flow meters, a retaining thread and an anchor. FIG. 1 shows four flow meters around the base. Those relationships are preserved in the animated sensing nodes.</p></div>
    <div class="mm-point"><h3>Surface + undersea context</h3><p>The submarine, warship, fast craft, sea state and traffic motion are illustrative context only. They are not NRL test data and do not imply detection, classification or platform integration performance.</p></div>
    <div class="mm-foot">REAL-TIME 3D VISUAL // PATENT-GROUNDED SENSOR ARCHITECTURE + ILLUSTRATIVE MARITIME CONTEXT</div>
  </div>`;
if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');
style.textContent=`
.market-motion{display:grid;grid-template-columns:minmax(500px,1.12fr) minmax(350px,.88fr);gap:46px;align-items:center;margin:30px 0 44px;padding:10px 0 26px}.mm-stage{position:relative;min-height:650px;display:flex;align-items:center;justify-content:center}.mm-grid{position:absolute;inset:16px 2% 16px 0;background-image:linear-gradient(rgba(160,171,158,.038) 1px,transparent 1px),linear-gradient(90deg,rgba(160,171,158,.038) 1px,transparent 1px);background-size:74px 74px;mask-image:radial-gradient(circle at 50% 50%,#000 0 61%,transparent 82%)}.mm-circle{position:relative;width:min(650px,96%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(210,220,207,.30);background:#07110f;box-shadow:0 24px 90px rgba(0,0,0,.46),inset 0 0 100px rgba(0,0,0,.28)}.mm-canvas-host,.mm-canvas-host canvas,.mm-vignette,.mm-hud{position:absolute;inset:0;width:100%;height:100%}.mm-canvas-host canvas{display:block}.mm-vignette{pointer-events:none;background:radial-gradient(circle at 50% 45%,transparent 46%,rgba(2,5,4,.08) 63%,rgba(1,3,2,.68) 100%),linear-gradient(180deg,rgba(1,4,4,.00),rgba(1,4,4,.08) 62%,rgba(1,3,2,.24));z-index:2}.mm-hud{z-index:3;pointer-events:none;color:#cbd3c7;font:8px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.055em}.mm-hud span{position:absolute;text-shadow:0 1px 7px rgba(0,0,0,.95)}.mm-hud-top{top:5%;left:8%;color:#aeb9aa}.mm-hud-left{left:7.5%;bottom:13%;color:#8e998c}.mm-hud-right{right:8%;top:18%;text-align:right;color:#8e998c}.mm-hud-bottom{bottom:5.3%;left:50%;transform:translateX(-50%);width:84%;text-align:center;color:#818b80}.mm-copy{padding-right:2%;display:flex;flex-direction:column;justify-content:center}.mm-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9eaa9a;margin-bottom:20px}.mm-point{padding:0 0 24px;margin-bottom:22px;border-bottom:1px solid rgba(169,181,155,.13)}.mm-point h3{margin:0 0 8px;font-size:28px;line-height:1.04;letter-spacing:-.035em}.mm-point p{margin:0;max-width:650px;color:#929a91;font-size:12px;line-height:1.58}.mm-foot{color:#697269;font:8.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em}.mm-webgl-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:15%;text-align:center;color:#8e998c;font:10px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}
@media(max-width:1000px){.market-motion{grid-template-columns:1fr;gap:24px}.mm-stage{min-height:auto;padding:8px 0}.mm-circle{width:min(610px,86vw)}.mm-copy{padding:0 5%}.mm-point h3{font-size:24px}}
@media(max-width:600px){.market-motion{margin-top:20px}.mm-grid{display:none}.mm-circle{width:92vw}.mm-point{padding-bottom:18px;margin-bottom:18px}.mm-point h3{font-size:21px}.mm-point p{font-size:11px}.mm-hud-left,.mm-hud-right{display:none}}
`;
document.head.appendChild(style);

const host=section.querySelector('.mm-canvas-host');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(err){host.innerHTML='<div class="mm-webgl-fallback">Real-time 3D view unavailable in this browser.</div>';throw err;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;host.appendChild(renderer.domElement);

const scene=new THREE.Scene();scene.background=new THREE.Color(0x06100f);scene.fog=new THREE.FogExp2(0x071512,.041);
const camera=new THREE.PerspectiveCamera(43,1,.1,100);camera.position.set(10.7,7.1,12.8);camera.lookAt(0,-.9,0);
scene.add(new THREE.HemisphereLight(0xd8e1dc,0x06100e,1.55));
const key=new THREE.DirectionalLight(0xf0f4ef,2.7);key.position.set(-7,11,5);scene.add(key);
const rim=new THREE.DirectionalLight(0x88a497,1.28);rim.position.set(8,3,-7);scene.add(rim);
const surfaceLight=new THREE.DirectionalLight(0xb8d8d0,.72);surfaceLight.position.set(1,8,2);scene.add(surfaceLight);

function seabedHeight(x,z){return -4+.42*Math.sin(x*.53)*Math.cos(z*.44)+.17*Math.sin((x+z)*1.06)+.12*Math.cos(x*.27-z*.68);}
const terrainGeo=new THREE.PlaneGeometry(24,24,70,70);terrainGeo.rotateX(-Math.PI/2);const tp=terrainGeo.attributes.position;
for(let i=0;i<tp.count;i++)tp.setY(i,seabedHeight(tp.getX(i),tp.getZ(i)));
terrainGeo.computeVertexNormals();
scene.add(new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({color:0x101b16,roughness:.96,metalness:.01})));
const terrainWire=new THREE.Mesh(terrainGeo.clone(),new THREE.MeshBasicMaterial({color:0x69796d,wireframe:true,transparent:true,opacity:.045,depthWrite:false}));terrainWire.position.y=.02;scene.add(terrainWire);

// Readable ocean surface. The geometry is intentionally visible so the viewer can
// immediately distinguish surface traffic from the submerged operating picture.
const surfaceGeo=new THREE.PlaneGeometry(25,25,60,60);surfaceGeo.rotateX(-Math.PI/2);const surfaceBase=surfaceGeo.attributes.position.array.slice();
const surfaceMat=new THREE.MeshPhysicalMaterial({color:0x234b49,transparent:true,opacity:.39,roughness:.16,metalness:.02,transmission:.03,side:THREE.DoubleSide,depthWrite:false});
const surface=new THREE.Mesh(surfaceGeo,surfaceMat);surface.position.y=.92;scene.add(surface);
const surfaceLines=new THREE.Mesh(surfaceGeo.clone(),new THREE.MeshBasicMaterial({color:0xa7cbc3,wireframe:true,transparent:true,opacity:.065,depthWrite:false}));surfaceLines.position.y=.935;scene.add(surfaceLines);
const horizon=new THREE.Mesh(new THREE.PlaneGeometry(25,.045),new THREE.MeshBasicMaterial({color:0xc3ddd5,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide}));horizon.position.set(0,.94,-1);horizon.rotation.x=-Math.PI/2;scene.add(horizon);
function waveHeight(x,z,t){return .075*Math.sin(x*.68+t*.62)+.045*Math.sin(z*.91-t*.51)+.025*Math.sin((x+z)*1.31+t*.37);}
function updateSurface(t){for(const mesh of [surface,surfaceLines]){const a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++){const bi=i*3,x=surfaceBase[bi],z=surfaceBase[bi+2];a.setY(i,waveHeight(x,z,t));}a.needsUpdate=true;}surface.geometry.computeVertexNormals();surfaceMat.opacity=.37+.025*Math.sin(t*.33);}

const particleCount=330;const pts=new Float32Array(particleCount*3);for(let i=0;i<particleCount;i++){pts[i*3]=(Math.random()-.5)*20;pts[i*3+1]=-3.25+Math.random()*3.95;pts[i*3+2]=(Math.random()-.5)*20;}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pts,3));const particles=new THREE.Points(pg,new THREE.PointsMaterial({color:0xa7b7ae,size:.022,transparent:true,opacity:.2,depthWrite:false}));scene.add(particles);

const pale=new THREE.MeshStandardMaterial({color:0xd4dbd2,roughness:.45,metalness:.24});
const muted=new THREE.MeshStandardMaterial({color:0x66736a,roughness:.61,metalness:.13});
const dark=new THREE.MeshStandardMaterial({color:0x101712,roughness:.73,metalness:.08});
const submarineMat=new THREE.MeshStandardMaterial({color:0x151a17,roughness:.48,metalness:.18});
const shipMat=new THREE.MeshStandardMaterial({color:0x78827c,roughness:.48,metalness:.18});
const fastMat=new THREE.MeshStandardMaterial({color:0x292f2b,roughness:.52,metalness:.13});
function line(a,b,opacity=.42,dashed=false,color=0x9eaa9d){const mat=dashed?new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:.16,gapSize:.13}):new THREE.LineBasicMaterial({color,transparent:true,opacity});const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),mat);if(dashed)l.computeLineDistances();return l;}

// Patent-grounded sensing node: 102 base, four 104 flow meters as shown in FIG. 1,
// 106 retaining thread and 108 anchor. Vehicle models below are context only.
function makeNode(x,z,s=.7){const g=new THREE.Group();g.position.set(x,-2.05,z);const base=new THREE.Mesh(new THREE.CylinderGeometry(.42*s,.42*s,.18*s,28),dark);g.add(base);const hub=new THREE.Mesh(new THREE.SphereGeometry(.11*s,16,10),pale);hub.position.y=.13*s;g.add(hub);[[.73,0,Math.PI/2],[-.73,0,Math.PI/2],[0,.73,0],[0,-.73,0]].forEach(([xx,zz,r])=>{const arm=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(xx)>.1?.52*s:.055*s,.045*s,Math.abs(zz)>.1?.52*s:.055*s),muted);arm.position.set(xx*.5*s,.08*s,zz*.5*s);g.add(arm);const meter=new THREE.Mesh(new THREE.BoxGeometry(.25*s,.09*s,.36*s),pale);meter.position.set(xx*s,.09*s,zz*s);meter.rotation.y=r;g.add(meter);});const bottom=new THREE.Vector3(x,g.position.y-.08*s,z),ay=seabedHeight(x,z)+.12,anchorPos=new THREE.Vector3(x,ay,z);scene.add(line(bottom,anchorPos,.4,true));const anchor=new THREE.Mesh(new THREE.BoxGeometry(.7*s,.16*s,.5*s),muted);anchor.position.copy(anchorPos);anchor.position.y-=.08*s;scene.add(anchor);scene.add(g);return g;}
const nodePositions=[[-4.4,-2.8],[3.9,-3.2],[-2.7,3.7],[4.6,3.2],[0,.3]];const nodes=nodePositions.map((n,i)=>makeNode(n[0],n[1],i===4?.86:.58));

function lathedBody(profile,material){const points=profile.map(([r,y])=>new THREE.Vector2(r,y));const geo=new THREE.LatheGeometry(points,34);geo.rotateZ(-Math.PI/2);return new THREE.Mesh(geo,material);}

// Recognizable submarine: tapered teardrop hull, sail, masts, bow planes,
// stern planes, rudders and a shrouded propulsor. Local +X is forward.
function makeSubmarine(){const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);
  const hull=lathedBody([[.05,-1.62],[.20,-1.50],[.33,-1.18],[.40,-.55],[.41,.15],[.37,.78],[.27,1.23],[.12,1.52],[.035,1.64]],submarineMat);visual.add(hull);
  const sail=new THREE.Mesh(new THREE.BoxGeometry(.48,.55,.23),submarineMat);sail.position.set(.12,.42,0);visual.add(sail);
  const sailCap=new THREE.Mesh(new THREE.BoxGeometry(.40,.10,.26),submarineMat);sailCap.position.set(.20,.72,0);sailCap.rotation.z=-.09;visual.add(sailCap);
  const mast1=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.43,10),pale);mast1.position.set(.16,.94,0);visual.add(mast1);const mast2=mast1.clone();mast2.scale.y=.72;mast2.position.set(-.02,.88,.07);visual.add(mast2);
  for(const z of [-.58,.58]){const plane=new THREE.Mesh(new THREE.BoxGeometry(.66,.045,.28),muted);plane.position.set(.72,.02,z*.42);visual.add(plane);}
  const sternPlane=new THREE.Mesh(new THREE.BoxGeometry(.52,.045,1.18),muted);sternPlane.position.x=-1.30;visual.add(sternPlane);
  const rudderTop=new THREE.Mesh(new THREE.BoxGeometry(.46,.62,.045),muted);rudderTop.position.set(-1.31,.24,0);visual.add(rudderTop);const rudderBottom=rudderTop.clone();rudderBottom.position.y=-.24;visual.add(rudderBottom);
  const pumpjet=new THREE.Mesh(new THREE.TorusGeometry(.20,.035,10,28),pale);pumpjet.rotation.y=Math.PI/2;pumpjet.position.x=-1.60;visual.add(pumpjet);
  for(let i=0;i<7;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.02,.29,.045),muted);blade.position.x=-1.60;blade.rotation.x=i*Math.PI/3.5;visual.add(blade);}
  root.userData.visual=visual;scene.add(root);return root;}
const submarine=makeSubmarine();
const subCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-5.7,-1.8,-2.8),new THREE.Vector3(-3.5,-2.25,2.6),new THREE.Vector3(.4,-1.72,4.5),new THREE.Vector3(4.7,-2.28,2.0),new THREE.Vector3(5.2,-1.65,-3.2),new THREE.Vector3(.8,-2.03,-5.0),new THREE.Vector3(-4.1,-1.62,-4.1)],true,'catmullrom',.56);

// Pointed warship hull from an extruded top-down polygon.
function extrudedHull(points,height,material){const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)shape.lineTo(points[i][0],points[i][1]);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035});geo.rotateX(Math.PI/2);geo.translate(0,height*.5,0);return new THREE.Mesh(geo,material);}
function makeWarship(){const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);
  const hull=extrudedHull([[-1.45,-.34],[.85,-.34],[1.45,-.06],[1.56,0],[1.45,.06],[.85,.34],[-1.45,.34]],.30,shipMat);visual.add(hull);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(1.25,.16,.52),shipMat);deck.position.set(-.12,.28,0);visual.add(deck);
  const bridge=new THREE.Mesh(new THREE.BoxGeometry(.52,.33,.44),pale);bridge.position.set(.22,.50,0);visual.add(bridge);
  const upper=new THREE.Mesh(new THREE.BoxGeometry(.36,.19,.32),muted);upper.position.set(.06,.75,0);visual.add(upper);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.68,8),pale);mast.position.set(.02,1.05,0);visual.add(mast);
  const yard=new THREE.Mesh(new THREE.BoxGeometry(.48,.025,.025),pale);yard.position.set(.02,1.18,0);visual.add(yard);
  const radar=new THREE.Mesh(new THREE.BoxGeometry(.18,.12,.035),pale);radar.position.set(.02,1.24,0);radar.rotation.y=.3;visual.add(radar);
  const gunBase=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,.10,14),muted);gunBase.position.set(.88,.38,0);visual.add(gunBase);const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.52,8),pale);barrel.rotation.z=Math.PI/2;barrel.position.set(1.10,.45,0);visual.add(barrel);
  root.userData.visual=visual;scene.add(root);return root;}
const warship=makeWarship();
const warCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-6,.98,-4.8),new THREE.Vector3(-2.8,.98,-2.2),new THREE.Vector3(1.2,.98,-1.2),new THREE.Vector3(5.8,.98,.5),new THREE.Vector3(3.6,.98,4.7),new THREE.Vector3(-1.8,.98,5.5),new THREE.Vector3(-5.7,.98,2.1)],true,'catmullrom',.62);

// Low-profile SWCC-style fast craft, deliberately distinct from the larger ship.
function makeFastCraft(){const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);visual.scale.setScalar(.82);
  const hull=extrudedHull([[-1.05,-.28],[.55,-.28],[1.12,-.05],[1.22,0],[1.12,.05],[.55,.28],[-1.05,.28]],.24,fastMat);visual.add(hull);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(.66,.34,.48),fastMat);cabin.position.set(.10,.38,0);cabin.rotation.z=-.03;visual.add(cabin);
  const windscreen=new THREE.Mesh(new THREE.BoxGeometry(.08,.20,.42),pale);windscreen.position.set(.45,.48,0);windscreen.rotation.z=-.28;visual.add(windscreen);
  const archLeft=new THREE.Mesh(new THREE.BoxGeometry(.035,.68,.035),pale);archLeft.position.set(-.18,.72,-.18);visual.add(archLeft);const archRight=archLeft.clone();archRight.position.z=.18;visual.add(archRight);const archTop=new THREE.Mesh(new THREE.BoxGeometry(.035,.035,.40),pale);archTop.position.set(-.18,1.05,0);visual.add(archTop);
  const sensorMast=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.46,8),pale);sensorMast.position.set(-.18,1.28,0);visual.add(sensorMast);
  const engine1=new THREE.Mesh(new THREE.BoxGeometry(.24,.26,.18),muted);engine1.position.set(-1.12,.12,-.17);visual.add(engine1);const engine2=engine1.clone();engine2.position.z=.17;visual.add(engine2);
  root.userData.visual=visual;scene.add(root);return root;}
const fastCraft=makeFastCraft();
const fastCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(5.8,1.00,-4.3),new THREE.Vector3(3.2,1.00,-1.6),new THREE.Vector3(4.7,1.00,2.7),new THREE.Vector3(.5,1.00,5.7),new THREE.Vector3(-4.9,1.00,3.6),new THREE.Vector3(-5.8,1.00,-.6),new THREE.Vector3(-1.4,1.00,-4.8)],true,'catmullrom',.66);

const forwardAxis=new THREE.Vector3(1,0,0);const targetQuat=new THREE.Quaternion();
function orientAlong(root,tangent,alpha=.08){targetQuat.setFromUnitVectors(forwardAxis,tangent.clone().normalize());root.quaternion.slerp(targetQuat,alpha);}
function curvePosition(curve,u){return curve.getPointAt(((u%1)+1)%1);}
function curveTangent(curve,u){return curve.getTangentAt(((u%1)+1)%1).normalize();}

// Acoustic geometry: rings around the submerged contact and bearing to central node.
const acousticRoot=new THREE.Group();scene.add(acousticRoot);const ringMat=new THREE.MeshBasicMaterial({color:0xb6c3b6,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false});const rings=[];for(let i=0;i<4;i++){const r=new THREE.Mesh(new THREE.RingGeometry(.98,1.01,64),ringMat.clone());r.rotation.x=-Math.PI/2;r.userData.offset=i/4;acousticRoot.add(r);rings.push(r);}
const bearingMat=new THREE.LineDashedMaterial({color:0xd2d7cf,transparent:true,opacity:.38,dashSize:.17,gapSize:.14});const bearing=new THREE.Line(new THREE.BufferGeometry(),bearingMat);scene.add(bearing);
const receiverMat=new THREE.LineDashedMaterial({color:0x9eaa9d,transparent:true,opacity:.24,dashSize:.14,gapSize:.16});const receiver=new THREE.Line(new THREE.BufferGeometry(),receiverMat);scene.add(receiver);

// Restrained wakes help surface motion read as forward travel rather than icon drift.
function makeWake(){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]);return new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xd3e1dc,transparent:true,opacity:.18}));}
const warWake=makeWake(),fastWake=makeWake();scene.add(warWake,fastWake);
function updateWake(wake,pos,tangent,width,length){const back=tangent.clone().multiplyScalar(-length);const side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize().multiplyScalar(width);const p=pos.clone();p.y=.955;const a=p.clone().add(side),b=p.clone().add(back).add(side.clone().multiplyScalar(2.2)),c=p.clone().sub(side),d=p.clone().add(back).sub(side.clone().multiplyScalar(2.2));wake.geometry.setFromPoints([a,b,c,d]);}

const clock=new THREE.Clock();let cameraPhase=0;
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();cameraPhase+=.00035;
  updateSurface(t);
  particles.rotation.y=t*.008;

  const su=(t*.020)%1,sp=curvePosition(subCurve,su),st=curveTangent(subCurve,su);submarine.position.copy(sp);orientAlong(submarine,st,.075);const subTurn=curveTangent(subCurve,su+.008).cross(curveTangent(subCurve,su-.008)).y;submarine.userData.visual.rotation.x+=(THREE.MathUtils.clamp(subTurn*2.0,-.12,.12)-submarine.userData.visual.rotation.x)*.045;

  const wu=(t*.010)%1,wp=curvePosition(warCurve,wu),wt=curveTangent(warCurve,wu);wp.y=.99+waveHeight(wp.x,wp.z,t)+.025*Math.sin(t*.55);warship.position.copy(wp);orientAlong(warship,wt,.055);warship.userData.visual.rotation.x+=(.012*Math.sin(t*.72)-warship.userData.visual.rotation.x)*.035;warship.userData.visual.rotation.z+=(.010*Math.sin(t*.47)-warship.userData.visual.rotation.z)*.035;updateWake(warWake,wp,wt,.16,1.25);

  const fu=(t*.017+0.36)%1,fp=curvePosition(fastCurve,fu),ft=curveTangent(fastCurve,fu);fp.y=1.00+waveHeight(fp.x,fp.z,t)+.045*Math.sin(t*1.15);fastCraft.position.copy(fp);orientAlong(fastCraft,ft,.075);const fastTurn=curveTangent(fastCurve,fu+.01).cross(curveTangent(fastCurve,fu-.01)).y;fastCraft.userData.visual.rotation.x+=(THREE.MathUtils.clamp(fastTurn*2.4,-.16,.16)-fastCraft.userData.visual.rotation.x)*.06;fastCraft.userData.visual.rotation.z+=(.022*Math.sin(t*1.05)-fastCraft.userData.visual.rotation.z)*.055;updateWake(fastWake,fp,ft,.11,.85);

  acousticRoot.position.copy(submarine.position);rings.forEach(r=>{const q=(t*.17+r.userData.offset)%1,s=.35+q*2.5;r.scale.setScalar(s);r.material.opacity=(1-q)*.14;});
  const center=nodes[4].position.clone();bearing.geometry.setFromPoints([center,submarine.position]);bearing.computeLineDistances();receiver.geometry.setFromPoints([center,warship.position]);receiver.computeLineDistances();

  camera.position.x=10.7+Math.sin(t*.055)*.55;camera.position.z=12.8+Math.cos(t*.047)*.58;camera.position.y=7.1+Math.sin(t*.038)*.22;camera.lookAt(0,-.78,0);
  renderer.render(scene,camera);
}
function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();animate();
