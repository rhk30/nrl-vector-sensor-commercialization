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
        <span class="mm-hud-right">SOURCE TO NODE<br>BEARING GEOMETRY</span>
        <div class="mm-alert mm-alert-undersea"><i></i><span>UNDERSEA CONTACT</span><small>ILLUSTRATIVE CUE</small></div>
        <div class="mm-alert mm-alert-surface"><i></i><span>SURFACE CONTACT</span><small>ILLUSTRATIVE CUE</small></div>
        <span class="mm-hud-legend">DASHED = SOURCE / NODE GEOMETRY &nbsp;&nbsp; SOLID = RECEIVER PATH</span>
        <span class="mm-hud-bottom">NO DETECTION RANGE / NO SNR / NO CLASSIFICATION MODEL</span>
      </div>
    </div>
  </div>
  <div class="mm-copy">
    <span class="mm-kicker">DEFENSE FIRST // PATENT-IN-CONTEXT</span>
    <div class="mm-point"><h3>Distributed directional sensing</h3><p>The patent describes particle-motion sensing for recovering direction-of-arrival information in a compact footprint. The scene places that disclosed sensing concept into an illustrative maritime operating picture without representing a validated sonar system.</p></div>
    <div class="mm-point"><h3>Moored architecture</h3><p>US11287508B2 discloses a floating base with one or more flow meters, a retaining thread and an anchor. FIG. 1 shows four flow meters around the base. Those relationships are preserved in the animated sensing nodes.</p></div>
    <div class="mm-point"><h3>Contact geometry, not a detection claim</h3><p>Each illustrative vessel is associated with the nearest sensing node by a bearing line. Contact cues are scripted presentation events only. They do not represent detection probability, range, classification, source strength or NRL-validated operational performance.</p></div>
    <div class="mm-foot">REAL-TIME 3D VISUAL // PATENT-GROUNDED SENSOR ARCHITECTURE + ILLUSTRATIVE MARITIME CONTEXT</div>
  </div>`;
if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');
style.textContent=`
.market-motion{display:grid;grid-template-columns:minmax(500px,1.12fr) minmax(350px,.88fr);gap:46px;align-items:center;margin:30px 0 44px;padding:10px 0 26px}.mm-stage{position:relative;min-height:650px;display:flex;align-items:center;justify-content:center}.mm-grid{position:absolute;inset:16px 2% 16px 0;background-image:linear-gradient(rgba(160,171,158,.038) 1px,transparent 1px),linear-gradient(90deg,rgba(160,171,158,.038) 1px,transparent 1px);background-size:74px 74px;mask-image:radial-gradient(circle at 50% 50%,#000 0 61%,transparent 82%)}.mm-circle{position:relative;width:min(650px,96%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(210,220,207,.30);background:#07110f;box-shadow:0 24px 90px rgba(0,0,0,.46),inset 0 0 100px rgba(0,0,0,.28)}.mm-canvas-host,.mm-canvas-host canvas,.mm-vignette,.mm-hud{position:absolute;inset:0;width:100%;height:100%}.mm-canvas-host canvas{display:block}.mm-vignette{pointer-events:none;background:radial-gradient(circle at 50% 45%,transparent 48%,rgba(2,5,4,.08) 65%,rgba(1,3,2,.66) 100%),linear-gradient(180deg,rgba(1,4,4,0),rgba(1,4,4,.07) 62%,rgba(1,3,2,.24));z-index:2}.mm-hud{z-index:3;pointer-events:none;color:#cbd3c7;font:8px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.055em}.mm-hud>span{position:absolute;text-shadow:0 1px 7px rgba(0,0,0,.95)}.mm-hud-top{top:9%;left:16%;color:#aeb9aa}.mm-hud-left{left:14%;bottom:22%;color:#8e998c}.mm-hud-right{right:14%;top:21%;text-align:right;color:#8e998c}.mm-hud-legend{left:50%;bottom:13.5%;transform:translateX(-50%);width:68%;text-align:center;color:#8d988b;font-size:7px}.mm-hud-bottom{bottom:8.5%;left:50%;transform:translateX(-50%);width:66%;text-align:center;color:#818b80;font-size:7px}.mm-alert{position:absolute;display:grid;grid-template-columns:8px 1fr;gap:0 7px;align-items:center;padding:7px 9px;border:1px solid rgba(209,218,207,.23);background:rgba(5,9,7,.62);backdrop-filter:blur(2px);text-shadow:0 1px 7px rgba(0,0,0,.95);opacity:.28;transition:opacity .5s ease,transform .5s ease}.mm-alert i{grid-row:1/3;width:6px;height:6px;border-radius:50%;background:#cfd8cc;box-shadow:0 0 10px rgba(207,216,204,.45)}.mm-alert span{font-size:7px;color:#dfe5dc;letter-spacing:.08em}.mm-alert small{font-size:6px;color:#818b80;letter-spacing:.07em}.mm-alert-undersea{left:14%;top:27%}.mm-alert-surface{right:14%;top:39%;text-align:left}.mm-alert.active{opacity:.95;transform:translateY(-2px)}.mm-copy{padding-right:2%;display:flex;flex-direction:column;justify-content:center}.mm-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9eaa9a;margin-bottom:20px}.mm-point{padding:0 0 24px;margin-bottom:22px;border-bottom:1px solid rgba(169,181,155,.13)}.mm-point h3{margin:0 0 8px;font-size:28px;line-height:1.04;letter-spacing:-.035em}.mm-point p{margin:0;max-width:650px;color:#929a91;font-size:12px;line-height:1.58}.mm-foot{color:#697269;font:8.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em}.mm-webgl-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:15%;text-align:center;color:#8e998c;font:10px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}
@media(max-width:1000px){.market-motion{grid-template-columns:1fr;gap:24px}.mm-stage{min-height:auto;padding:8px 0}.mm-circle{width:min(610px,86vw)}.mm-copy{padding:0 5%}.mm-point h3{font-size:24px}}
@media(max-width:600px){.market-motion{margin-top:20px}.mm-grid{display:none}.mm-circle{width:92vw}.mm-point{padding-bottom:18px;margin-bottom:18px}.mm-point h3{font-size:21px}.mm-point p{font-size:11px}.mm-hud-left,.mm-hud-right,.mm-hud-legend{display:none}.mm-hud-top{left:18%;top:10%}.mm-hud-bottom{width:62%;font-size:6px}.mm-alert-undersea{left:17%;top:25%}.mm-alert-surface{right:17%;top:37%}}
`;
document.head.appendChild(style);

const host=section.querySelector('.mm-canvas-host');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(err){host.innerHTML='<div class="mm-webgl-fallback">Real-time 3D view unavailable in this browser.</div>';throw err;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;host.appendChild(renderer.domElement);

const scene=new THREE.Scene();scene.background=new THREE.Color(0x06100f);scene.fog=new THREE.FogExp2(0x071512,.041);
const camera=new THREE.PerspectiveCamera(43,1,.1,100);camera.position.set(11.8,7.6,14.1);camera.lookAt(0,-.9,0);
scene.add(new THREE.HemisphereLight(0xd8e1dc,0x06100e,1.55));
const key=new THREE.DirectionalLight(0xf0f4ef,2.7);key.position.set(-7,11,5);scene.add(key);
const rim=new THREE.DirectionalLight(0x88a497,1.28);rim.position.set(8,3,-7);scene.add(rim);
const surfaceLight=new THREE.DirectionalLight(0xb8d8d0,.72);surfaceLight.position.set(1,8,2);scene.add(surfaceLight);

function seabedHeight(x,z){return -4+.42*Math.sin(x*.53)*Math.cos(z*.44)+.17*Math.sin((x+z)*1.06)+.12*Math.cos(x*.27-z*.68);}
const terrainGeo=new THREE.PlaneGeometry(24,24,70,70);terrainGeo.rotateX(-Math.PI/2);const tp=terrainGeo.attributes.position;
for(let i=0;i<tp.count;i++)tp.setY(i,seabedHeight(tp.getX(i),tp.getZ(i)));
terrainGeo.computeVertexNormals();scene.add(new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({color:0x101b16,roughness:.96,metalness:.01})));
const terrainWire=new THREE.Mesh(terrainGeo.clone(),new THREE.MeshBasicMaterial({color:0x69796d,wireframe:true,transparent:true,opacity:.045,depthWrite:false}));terrainWire.position.y=.02;scene.add(terrainWire);

const surfaceGeo=new THREE.PlaneGeometry(25,25,60,60);surfaceGeo.rotateX(-Math.PI/2);const surfaceBase=surfaceGeo.attributes.position.array.slice();
const surfaceMat=new THREE.MeshPhysicalMaterial({color:0x285652,transparent:true,opacity:.46,roughness:.18,metalness:.02,transmission:.02,side:THREE.DoubleSide,depthWrite:false});
const surface=new THREE.Mesh(surfaceGeo,surfaceMat);surface.position.y=.92;scene.add(surface);
const surfaceLines=new THREE.Mesh(surfaceGeo.clone(),new THREE.MeshBasicMaterial({color:0xb0d2ca,wireframe:true,transparent:true,opacity:.085,depthWrite:false}));surfaceLines.position.y=.935;scene.add(surfaceLines);
const horizon=new THREE.Mesh(new THREE.PlaneGeometry(25,.05),new THREE.MeshBasicMaterial({color:0xcbe0da,transparent:true,opacity:.34,depthWrite:false,side:THREE.DoubleSide}));horizon.position.set(0,.94,-1);horizon.rotation.x=-Math.PI/2;scene.add(horizon);
function waveHeight(x,z,t){return .075*Math.sin(x*.68+t*.62)+.045*Math.sin(z*.91-t*.51)+.025*Math.sin((x+z)*1.31+t*.37);}
function updateSurface(t){for(const mesh of [surface,surfaceLines]){const a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++){const bi=i*3,x=surfaceBase[bi],z=surfaceBase[bi+2];a.setY(i,waveHeight(x,z,t));}a.needsUpdate=true;}surface.geometry.computeVertexNormals();surfaceMat.opacity=.44+.025*Math.sin(t*.33);}

const particleCount=330;const pts=new Float32Array(particleCount*3);for(let i=0;i<particleCount;i++){pts[i*3]=(Math.random()-.5)*20;pts[i*3+1]=-3.25+Math.random()*3.95;pts[i*3+2]=(Math.random()-.5)*20;}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pts,3));const particles=new THREE.Points(pg,new THREE.PointsMaterial({color:0xa7b7ae,size:.022,transparent:true,opacity:.2,depthWrite:false}));scene.add(particles);

const pale=new THREE.MeshStandardMaterial({color:0xd4dbd2,roughness:.45,metalness:.24});
const muted=new THREE.MeshStandardMaterial({color:0x66736a,roughness:.61,metalness:.13});
const dark=new THREE.MeshStandardMaterial({color:0x101712,roughness:.73,metalness:.08});
const submarineMat=new THREE.MeshStandardMaterial({color:0x151a17,roughness:.48,metalness:.18});
const shipMat=new THREE.MeshStandardMaterial({color:0x78827c,roughness:.48,metalness:.18});
const fastMat=new THREE.MeshStandardMaterial({color:0x292f2b,roughness:.52,metalness:.13});
function line(a,b,opacity=.42,dashed=false,color=0x9eaa9d){const mat=dashed?new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:.16,gapSize:.13}):new THREE.LineBasicMaterial({color,transparent:true,opacity});const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),mat);if(dashed)l.computeLineDistances();return l;}

function makeNode(x,z,s=.7){const g=new THREE.Group();g.position.set(x,-2.05,z);g.userData.baseScale=s;const base=new THREE.Mesh(new THREE.CylinderGeometry(.42*s,.42*s,.18*s,28),dark);g.add(base);const hub=new THREE.Mesh(new THREE.SphereGeometry(.11*s,16,10),pale);hub.position.y=.13*s;g.add(hub);[[.73,0,Math.PI/2],[-.73,0,Math.PI/2],[0,.73,0],[0,-.73,0]].forEach(([xx,zz,r])=>{const arm=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(xx)>.1?.52*s:.055*s,.045*s,Math.abs(zz)>.1?.52*s:.055*s),muted);arm.position.set(xx*.5*s,.08*s,zz*.5*s);g.add(arm);const meter=new THREE.Mesh(new THREE.BoxGeometry(.25*s,.09*s,.36*s),pale);meter.position.set(xx*s,.09*s,zz*s);meter.rotation.y=r;g.add(meter);});const bottom=new THREE.Vector3(x,g.position.y-.08*s,z),ay=seabedHeight(x,z)+.12,anchorPos=new THREE.Vector3(x,ay,z);scene.add(line(bottom,anchorPos,.4,true));const anchor=new THREE.Mesh(new THREE.BoxGeometry(.7*s,.16*s,.5*s),muted);anchor.position.copy(anchorPos);anchor.position.y-=.08*s;scene.add(anchor);scene.add(g);return g;}
const nodePositions=[[-4.1,-2.6],[3.6,-2.8],[-2.5,3.3],[4.0,2.7],[0,.3]];const nodes=nodePositions.map((n,i)=>makeNode(n[0],n[1],i===4?.86:.58));

function lathedBody(profile,material){const points=profile.map(([r,y])=>new THREE.Vector2(r,y));const geo=new THREE.LatheGeometry(points,34);geo.rotateZ(-Math.PI/2);return new THREE.Mesh(geo,material);}
function makeSubmarine(){const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);root.rotation.order='YXZ';const hull=lathedBody([[.05,-1.62],[.20,-1.50],[.33,-1.18],[.40,-.55],[.41,.15],[.37,.78],[.27,1.23],[.12,1.52],[.035,1.64]],submarineMat);visual.add(hull);const sail=new THREE.Mesh(new THREE.BoxGeometry(.48,.55,.23),submarineMat);sail.position.set(.12,.42,0);visual.add(sail);const sailCap=new THREE.Mesh(new THREE.BoxGeometry(.40,.10,.26),submarineMat);sailCap.position.set(.20,.72,0);sailCap.rotation.z=-.09;visual.add(sailCap);const mast1=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.43,10),pale);mast1.position.set(.16,.94,0);visual.add(mast1);const mast2=mast1.clone();mast2.scale.y=.72;mast2.position.set(-.02,.88,.07);visual.add(mast2);for(const z of [-.58,.58]){const plane=new THREE.Mesh(new THREE.BoxGeometry(.66,.045,.28),muted);plane.position.set(.72,.02,z*.42);visual.add(plane);}const sternPlane=new THREE.Mesh(new THREE.BoxGeometry(.52,.045,1.18),muted);sternPlane.position.x=-1.30;visual.add(sternPlane);const rudderTop=new THREE.Mesh(new THREE.BoxGeometry(.46,.62,.045),muted);rudderTop.position.set(-1.31,.24,0);visual.add(rudderTop);const rudderBottom=rudderTop.clone();rudderBottom.position.y=-.24;visual.add(rudderBottom);const pumpjet=new THREE.Mesh(new THREE.TorusGeometry(.20,.035,10,28),pale);pumpjet.rotation.y=Math.PI/2;pumpjet.position.x=-1.60;visual.add(pumpjet);for(let i=0;i<7;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.02,.29,.045),muted);blade.position.x=-1.60;blade.rotation.x=i*Math.PI/3.5;visual.add(blade);}root.userData.visual=visual;scene.add(root);return root;}
const submarine=makeSubmarine();
const subCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-4.8,-1.8,-2.4),new THREE.Vector3(-2.9,-2.17,2.2),new THREE.Vector3(.3,-1.72,3.8),new THREE.Vector3(4.0,-2.16,1.7),new THREE.Vector3(4.3,-1.68,-2.6),new THREE.Vector3(.7,-2.00,-4.0),new THREE.Vector3(-3.5,-1.64,-3.3)],true,'catmullrom',.58);

function extrudedHull(points,height,material){const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)shape.lineTo(points[i][0],points[i][1]);shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035});geo.rotateX(Math.PI/2);geo.translate(0,height*.5,0);return new THREE.Mesh(geo,material);}
function makeWarship(){const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);root.rotation.order='YXZ';visual.scale.setScalar(.88);const hull=extrudedHull([[-1.45,-.34],[.85,-.34],[1.45,-.06],[1.56,0],[1.45,.06],[.85,.34],[-1.45,.34]],.30,shipMat);visual.add(hull);const deck=new THREE.Mesh(new THREE.BoxGeometry(1.25,.16,.52),shipMat);deck.position.set(-.12,.28,0);visual.add(deck);const bridge=new THREE.Mesh(new THREE.BoxGeometry(.52,.33,.44),pale);bridge.position.set(.22,.50,0);visual.add(bridge);const upper=new THREE.Mesh(new THREE.BoxGeometry(.36,.19,.32),muted);upper.position.set(.06,.75,0);visual.add(upper);const mast=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,.68,8),pale);mast.position.set(.02,1.05,0);visual.add(mast);const yard=new THREE.Mesh(new THREE.BoxGeometry(.48,.025,.025),pale);yard.position.set(.02,1.18,0);visual.add(yard);const radar=new THREE.Mesh(new THREE.BoxGeometry(.18,.12,.035),pale);radar.position.set(.02,1.24,0);radar.rotation.y=.3;visual.add(radar);const gunBase=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,.10,14),muted);gunBase.position.set(.88,.38,0);visual.add(gunBase);const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.52,8),pale);barrel.rotation.z=Math.PI/2;barrel.position.set(1.10,.45,0);visual.add(barrel);root.userData.visual=visual;scene.add(root);return root;}
const warship=makeWarship();
const warCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-4.4,.98,-3.5),new THREE.Vector3(-2.4,.98,-1.8),new THREE.Vector3(1.0,.98,-1.0),new THREE.Vector3(4.2,.98,.4),new THREE.Vector3(2.9,.98,3.5),new THREE.Vector3(-1.5,.98,4.0),new THREE.Vector3(-4.2,.98,1.7)],true,'catmullrom',.62);

function makeFastCraft(){const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);root.rotation.order='YXZ';visual.scale.setScalar(.72);const hull=extrudedHull([[-1.05,-.28],[.55,-.28],[1.12,-.05],[1.22,0],[1.12,.05],[.55,.28],[-1.05,.28]],.24,fastMat);visual.add(hull);const cabin=new THREE.Mesh(new THREE.BoxGeometry(.66,.34,.48),fastMat);cabin.position.set(.10,.38,0);cabin.rotation.z=-.03;visual.add(cabin);const windscreen=new THREE.Mesh(new THREE.BoxGeometry(.08,.20,.42),pale);windscreen.position.set(.45,.48,0);windscreen.rotation.z=-.28;visual.add(windscreen);const archLeft=new THREE.Mesh(new THREE.BoxGeometry(.035,.68,.035),pale);archLeft.position.set(-.18,.72,-.18);visual.add(archLeft);const archRight=archLeft.clone();archRight.position.z=.18;visual.add(archRight);const archTop=new THREE.Mesh(new THREE.BoxGeometry(.035,.035,.40),pale);archTop.position.set(-.18,1.05,0);visual.add(archTop);const sensorMast=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.46,8),pale);sensorMast.position.set(-.18,1.28,0);visual.add(sensorMast);const engine1=new THREE.Mesh(new THREE.BoxGeometry(.24,.26,.18),muted);engine1.position.set(-1.12,.12,-.17);visual.add(engine1);const engine2=engine1.clone();engine2.position.z=.17;visual.add(engine2);root.userData.visual=visual;scene.add(root);return root;}
const fastCraft=makeFastCraft();
const fastCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(4.5,1.00,-3.3),new THREE.Vector3(2.7,1.00,-1.4),new THREE.Vector3(3.7,1.00,2.3),new THREE.Vector3(.4,1.00,4.3),new THREE.Vector3(-3.8,1.00,2.9),new THREE.Vector3(-4.4,1.00,-.4),new THREE.Vector3(-1.2,1.00,-3.7)],true,'catmullrom',.66);

function curvePosition(curve,u){return curve.getPointAt(((u%1)+1)%1);}function curveTangent(curve,u){return curve.getTangentAt(((u%1)+1)%1).normalize();}
function lerpAngle(current,target,alpha){let d=(target-current+Math.PI)%(Math.PI*2)-Math.PI;if(d<-Math.PI)d+=Math.PI*2;return current+d*alpha;}
function orientNoRoll(root,tangent,alpha=.08){const yaw=Math.atan2(-tangent.z,tangent.x);const pitch=Math.asin(THREE.MathUtils.clamp(tangent.y,-1,1));root.rotation.y=lerpAngle(root.rotation.y,yaw,alpha);root.rotation.z=THREE.MathUtils.lerp(root.rotation.z,pitch,alpha);root.rotation.x=0;}
function orientSurface(root,tangent,alpha=.08){const yaw=Math.atan2(-tangent.z,tangent.x);root.rotation.y=lerpAngle(root.rotation.y,yaw,alpha);root.rotation.x=0;}

const acousticRoot=new THREE.Group();scene.add(acousticRoot);const ringMat=new THREE.MeshBasicMaterial({color:0xb6c3b6,transparent:true,opacity:.13,side:THREE.DoubleSide,depthWrite:false});const rings=[];for(let i=0;i<4;i++){const r=new THREE.Mesh(new THREE.RingGeometry(.98,1.01,64),ringMat.clone());r.rotation.x=-Math.PI/2;r.userData.offset=i/4;acousticRoot.add(r);rings.push(r);}
function makeAssociation(color=0xd2d7cf,opacity=.34){const mat=new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:.17,gapSize:.14});const l=new THREE.Line(new THREE.BufferGeometry(),mat);scene.add(l);return l;}
const subAssociation=makeAssociation(0xdbe2d8,.44),warAssociation=makeAssociation(0xc5d0c6,.30),fastAssociation=makeAssociation(0xb6c4b7,.27);
const receiverMat=new THREE.LineBasicMaterial({color:0x9eaa9d,transparent:true,opacity:.22});const receiver=new THREE.Line(new THREE.BufferGeometry(),receiverMat);scene.add(receiver);
function nearestNode(pos){let best=nodes[0],bestD=Infinity;for(const n of nodes){const d=(n.position.x-pos.x)**2+(n.position.z-pos.z)**2;if(d<bestD){bestD=d;best=n;}}return best;}
function connect(lineObj,node,obj){lineObj.geometry.setFromPoints([node.position,obj.position]);lineObj.computeLineDistances?.();}

function makeWake(){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]);return new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:0xd3e1dc,transparent:true,opacity:.18}));}
const warWake=makeWake(),fastWake=makeWake();scene.add(warWake,fastWake);
function updateWake(wake,pos,tangent,width,length){const back=tangent.clone().multiplyScalar(-length);const side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize().multiplyScalar(width);const p=pos.clone();p.y=.955;const a=p.clone().add(side),b=p.clone().add(back).add(side.clone().multiplyScalar(2.2)),c=p.clone().sub(side),d=p.clone().add(back).sub(side.clone().multiplyScalar(2.2));wake.geometry.setFromPoints([a,b,c,d]);}

const underseaAlert=section.querySelector('.mm-alert-undersea'),surfaceAlert=section.querySelector('.mm-alert-surface');
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();updateSurface(t);particles.rotation.y=t*.008;
  const su=(t*.018)%1,sp=curvePosition(subCurve,su),st=curveTangent(subCurve,su);submarine.position.copy(sp);orientNoRoll(submarine,st,.08);submarine.userData.visual.rotation.x=0;submarine.userData.visual.rotation.z=0;
  const wu=(t*.009)%1,wp=curvePosition(warCurve,wu),wt=curveTangent(warCurve,wu);wp.y=.99+waveHeight(wp.x,wp.z,t)+.022*Math.sin(t*.55);warship.position.copy(wp);orientSurface(warship,wt,.055);warship.userData.visual.rotation.x=THREE.MathUtils.lerp(warship.userData.visual.rotation.x,.010*Math.sin(t*.72),.04);warship.userData.visual.rotation.z=THREE.MathUtils.lerp(warship.userData.visual.rotation.z,.008*Math.sin(t*.47),.04);updateWake(warWake,wp,wt,.14,1.05);
  const fu=(t*.015+0.36)%1,fp=curvePosition(fastCurve,fu),ft=curveTangent(fastCurve,fu);fp.y=1.00+waveHeight(fp.x,fp.z,t)+.038*Math.sin(t*1.1);fastCraft.position.copy(fp);orientSurface(fastCraft,ft,.07);fastCraft.userData.visual.rotation.x=THREE.MathUtils.lerp(fastCraft.userData.visual.rotation.x,.018*Math.sin(t*.95),.055);fastCraft.userData.visual.rotation.z=THREE.MathUtils.lerp(fastCraft.userData.visual.rotation.z,.014*Math.sin(t*1.05),.055);updateWake(fastWake,fp,ft,.10,.72);

  acousticRoot.position.copy(submarine.position);rings.forEach(r=>{const q=(t*.15+r.userData.offset)%1,s=.35+q*2.35;r.scale.setScalar(s);r.material.opacity=(1-q)*.14;});
  const subNode=nearestNode(submarine.position),warNode=nearestNode(warship.position),fastNode=nearestNode(fastCraft.position);connect(subAssociation,subNode,submarine);connect(warAssociation,warNode,warship);connect(fastAssociation,fastNode,fastCraft);
  receiver.geometry.setFromPoints([nodes[4].position,warship.position]);
  const underseaOn=(Math.floor(t/6)%2)===0,surfaceOn=(Math.floor((t+2.5)/7)%2)===0;underseaAlert?.classList.toggle('active',underseaOn);surfaceAlert?.classList.toggle('active',surfaceOn);
  nodes.forEach(n=>n.scale.setScalar(1));if(underseaOn)subNode.scale.setScalar(1.05);if(surfaceOn){warNode.scale.setScalar(1.035);fastNode.scale.setScalar(1.025);}

  camera.position.x=11.8+Math.sin(t*.05)*.38;camera.position.z=14.1+Math.cos(t*.044)*.42;camera.position.y=7.6+Math.sin(t*.035)*.16;camera.lookAt(0,-.82,0);renderer.render(scene,camera);
}
function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();animate();
