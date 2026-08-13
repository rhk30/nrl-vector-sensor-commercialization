import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';

const market=document.getElementById('market');
if(!market||market.querySelector('.market-motion'))throw new Error('Applications section unavailable or already initialized');
const old=market.querySelector('.market-bridge');if(old)old.remove();
const head=market.querySelector('.section-head');

const section=document.createElement('section');
section.className='market-motion';
section.innerHTML=`
  <div class="mm-stage">
    <div class="mm-grid" aria-hidden="true"></div>
    <div class="mm-circle" aria-label="Animated conceptual maritime operating picture using patent-described sensing architecture">
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
    <div class="mm-point"><h3>Distributed directional sensing</h3><p>The patent describes particle-motion sensing for recovering direction-of-arrival information in a compact footprint. The animation places that disclosed sensing idea into a maritime operating context without representing a validated sonar system.</p></div>
    <div class="mm-point"><h3>Moored architecture</h3><p>US11287508B2 discloses a floating base with one or more flow meters, a retaining thread and an anchor. FIG. 1 shows four flow meters around the base. Those relationships are preserved in the animated sensing nodes.</p></div>
    <div class="mm-point"><h3>Surface + undersea context</h3><p>Submerged and surface traffic are illustrative operating context only. Their motion, terrain, sea state and network geometry are not NRL data and do not imply detection or classification performance.</p></div>
    <div class="mm-foot">REAL-TIME 3D VISUAL // PATENT-GROUNDED SENSOR ARCHITECTURE + ILLUSTRATIVE MARITIME CONTEXT</div>
  </div>`;
if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');
style.textContent=`
.market-motion{display:grid;grid-template-columns:minmax(460px,1.08fr) minmax(350px,.92fr);gap:54px;align-items:center;margin:34px 0 46px;padding:18px 0 28px}.mm-stage{position:relative;min-height:650px;display:flex;align-items:center;justify-content:center}.mm-grid{position:absolute;inset:18px 3% 18px 0;background-image:linear-gradient(rgba(160,171,158,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(160,171,158,.045) 1px,transparent 1px);background-size:78px 78px;mask-image:radial-gradient(circle at 48% 50%,#000 0 62%,transparent 82%)}.mm-circle{position:relative;width:min(620px,94%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(210,220,207,.25);background:#050706;box-shadow:0 22px 90px rgba(0,0,0,.42),inset 0 0 90px rgba(0,0,0,.30)}.mm-canvas-host,.mm-canvas-host canvas,.mm-vignette,.mm-hud{position:absolute;inset:0;width:100%;height:100%}.mm-canvas-host canvas{display:block}.mm-vignette{pointer-events:none;background:radial-gradient(circle at 50% 46%,transparent 42%,rgba(3,4,3,.08) 61%,rgba(2,3,2,.65) 100%),linear-gradient(180deg,rgba(3,4,3,.04),rgba(3,4,3,.18));z-index:2}.mm-hud{z-index:3;pointer-events:none;color:#cbd3c7;font:8px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.055em}.mm-hud span{position:absolute;text-shadow:0 1px 7px rgba(0,0,0,.9)}.mm-hud-top{top:5.2%;left:8%;color:#aeb9aa}.mm-hud-left{left:7.5%;bottom:13%;color:#8e998c}.mm-hud-right{right:8%;top:18%;text-align:right;color:#8e998c}.mm-hud-bottom{bottom:5.5%;left:50%;transform:translateX(-50%);width:84%;text-align:center;color:#778177}.mm-copy{padding-right:4%;display:flex;flex-direction:column;justify-content:center}.mm-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9eaa9a;margin-bottom:20px}.mm-point{padding:0 0 25px;margin-bottom:23px;border-bottom:1px solid rgba(169,181,155,.13)}.mm-point h3{margin:0 0 8px;font-size:28px;line-height:1.04;letter-spacing:-.035em}.mm-point p{margin:0;max-width:650px;color:#929a91;font-size:12px;line-height:1.58}.mm-foot{color:#697269;font:8.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em}.mm-webgl-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:15%;text-align:center;color:#8e998c;font:10px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}
@media(max-width:1000px){.market-motion{grid-template-columns:1fr;gap:24px}.mm-stage{min-height:auto;padding:8px 0}.mm-circle{width:min(590px,84vw)}.mm-copy{padding:0 5%}.mm-point h3{font-size:24px}}
@media(max-width:600px){.market-motion{margin-top:20px}.mm-grid{display:none}.mm-circle{width:91vw}.mm-point{padding-bottom:18px;margin-bottom:18px}.mm-point h3{font-size:21px}.mm-point p{font-size:11px}.mm-hud-left,.mm-hud-right{display:none}}
`;
document.head.appendChild(style);

const host=section.querySelector('.mm-canvas-host');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(err){host.innerHTML='<div class="mm-webgl-fallback">Real-time 3D view unavailable in this browser.</div>';throw err;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;host.appendChild(renderer.domElement);

const scene=new THREE.Scene();scene.background=new THREE.Color(0x050706);scene.fog=new THREE.FogExp2(0x07100d,.046);
const camera=new THREE.PerspectiveCamera(42,1,.1,100);camera.position.set(10.2,8.9,12.4);camera.lookAt(0,-.9,0);
scene.add(new THREE.HemisphereLight(0xd5dcd1,0x07100d,1.32));
const key=new THREE.DirectionalLight(0xe9eee7,2.55);key.position.set(-7,11,6);scene.add(key);
const rim=new THREE.DirectionalLight(0x819284,1.15);rim.position.set(8,2,-7);scene.add(rim);

// Procedural seabed. Context only, not geographic data.
function seabedHeight(x,z){return -4+.4*Math.sin(x*.53)*Math.cos(z*.44)+.16*Math.sin((x+z)*1.06)+.12*Math.cos(x*.27-z*.68);}
const terrainGeo=new THREE.PlaneGeometry(24,24,70,70);terrainGeo.rotateX(-Math.PI/2);const tp=terrainGeo.attributes.position;
for(let i=0;i<tp.count;i++){tp.setY(i,seabedHeight(tp.getX(i),tp.getZ(i)));}
terrainGeo.computeVertexNormals();
scene.add(new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({color:0x101914,roughness:.97,metalness:.01})));
const terrainWire=new THREE.Mesh(terrainGeo.clone(),new THREE.MeshBasicMaterial({color:0x5f6b61,wireframe:true,transparent:true,opacity:.045,depthWrite:false}));terrainWire.position.y=.02;scene.add(terrainWire);

// Animated semi-transparent ocean surface. It is a visual sea-state cue, not data.
const surfaceGeo=new THREE.PlaneGeometry(24,24,48,48);surfaceGeo.rotateX(-Math.PI/2);const surfaceBase=surfaceGeo.attributes.position.array.slice();
const surfaceMat=new THREE.MeshPhysicalMaterial({color:0x17241e,transparent:true,opacity:.19,roughness:.24,metalness:.03,side:THREE.DoubleSide,depthWrite:false});
const surface=new THREE.Mesh(surfaceGeo,surfaceMat);surface.position.y=.86;scene.add(surface);
const surfaceWire=new THREE.Mesh(surfaceGeo.clone(),new THREE.MeshBasicMaterial({color:0x9aa89b,wireframe:true,transparent:true,opacity:.025,depthWrite:false}));surfaceWire.position.y=.88;scene.add(surfaceWire);
function waveHeight(x,z,t){return .055*Math.sin(x*.78+t*.75)+.035*Math.sin(z*.92-t*.58)+.018*Math.sin((x+z)*1.45+t*.42);}
function updateSurface(t){const a=surface.geometry.attributes.position;for(let i=0;i<a.count;i++){const bi=i*3,x=surfaceBase[bi],z=surfaceBase[bi+2];a.setY(i,waveHeight(x,z,t));}a.needsUpdate=true;surface.geometry.computeVertexNormals();const wa=surfaceWire.geometry.attributes.position;for(let i=0;i<wa.count;i++){const bi=i*3,x=surfaceBase[bi],z=surfaceBase[bi+2];wa.setY(i,waveHeight(x,z,t));}wa.needsUpdate=true;}

// Suspended particles add parallax and underwater depth.
const particleCount=360;const pts=new Float32Array(particleCount*3);for(let i=0;i<particleCount;i++){pts[i*3]=(Math.random()-.5)*20;pts[i*3+1]=-3.25+Math.random()*3.9;pts[i*3+2]=(Math.random()-.5)*20;}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pts,3));const particles=new THREE.Points(pg,new THREE.PointsMaterial({color:0xa7b2a8,size:.022,transparent:true,opacity:.2,depthWrite:false}));scene.add(particles);

const pale=new THREE.MeshStandardMaterial({color:0xcdd5ca,roughness:.48,metalness:.22});
const dark=new THREE.MeshStandardMaterial({color:0x111712,roughness:.74,metalness:.08});
const muted=new THREE.MeshStandardMaterial({color:0x566258,roughness:.64,metalness:.12});
const hullMat=new THREE.MeshStandardMaterial({color:0x151b17,roughness:.56,metalness:.12});
function line(a,b,opacity=.42,dashed=false){const mat=dashed?new THREE.LineDashedMaterial({color:0x9eaa9d,transparent:true,opacity,dashSize:.16,gapSize:.13}):new THREE.LineBasicMaterial({color:0x9eaa9d,transparent:true,opacity});const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),mat);if(dashed)l.computeLineDistances();return l;}

// Patent-grounded sensing node: floating base 102, four flow meters 104 shown in
// FIG. 1, retaining thread 106 and anchor 108.
function makeNode(x,z,s=.7){const g=new THREE.Group();g.position.set(x,-2.05,z);const base=new THREE.Mesh(new THREE.CylinderGeometry(.42*s,.42*s,.18*s,28),dark);g.add(base);const hub=new THREE.Mesh(new THREE.SphereGeometry(.11*s,16,10),pale);hub.position.y=.13*s;g.add(hub);[[.73,0,Math.PI/2],[-.73,0,Math.PI/2],[0,.73,0],[0,-.73,0]].forEach(([xx,zz,r])=>{const arm=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(xx)>.1?.52*s:.055*s,.045*s,Math.abs(zz)>.1?.52*s:.055*s),muted);arm.position.set(xx*.5*s,.08*s,zz*.5*s);g.add(arm);const meter=new THREE.Mesh(new THREE.BoxGeometry(.25*s,.09*s,.36*s),pale);meter.position.set(xx*s,.09*s,zz*s);meter.rotation.y=r;g.add(meter);});const bottom=new THREE.Vector3(x,g.position.y-.08*s,z),ay=seabedHeight(x,z)+.12,anchorPos=new THREE.Vector3(x,ay,z);scene.add(line(bottom,anchorPos,.38,true));const anchor=new THREE.Mesh(new THREE.BoxGeometry(.7*s,.16*s,.5*s),muted);anchor.position.copy(anchorPos);anchor.position.y-=.08*s;scene.add(anchor);scene.add(g);return g;}
const nodePositions=[[-4.4,-2.8],[3.9,-3.2],[-2.7,3.7],[4.6,3.2],[0,.3]];const nodes=nodePositions.map((n,i)=>makeNode(n[0],n[1],i===4?.86:.58));

// Submarine model. Local +X is the forward axis so orientation can follow the
// actual path tangent instead of sliding/rotating like an icon.
function makeSubmarine(){
  const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.34,1.85,12,28),hullMat);body.rotation.z=Math.PI/2;visual.add(body);
  const bow=new THREE.Mesh(new THREE.SphereGeometry(.34,24,14,0,Math.PI),hullMat);bow.scale.set(1.15,1,1);bow.position.x=1.1;visual.add(bow);
  const sail=new THREE.Mesh(new THREE.BoxGeometry(.42,.34,.22),pale);sail.position.set(.08,.36,0);visual.add(sail);
  const sailTop=new THREE.Mesh(new THREE.BoxGeometry(.19,.14,.12),muted);sailTop.position.set(.08,.58,0);visual.add(sailTop);
  const sternFin=new THREE.Mesh(new THREE.BoxGeometry(.5,.05,1.0),muted);sternFin.position.x=-1.08;visual.add(sternFin);
  const sternVert=new THREE.Mesh(new THREE.BoxGeometry(.48,.72,.05),muted);sternVert.position.x=-1.08;visual.add(sternVert);
  const prop=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.05,16),pale);prop.rotation.z=Math.PI/2;prop.position.x=-1.32;visual.add(prop);
  root.userData.visual=visual;scene.add(root);return root;
}
const contact=makeSubmarine();
const subCurve=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-5.7,-1.7,-2.8),new THREE.Vector3(-3.2,-2.2,2.8),new THREE.Vector3(.5,-1.75,4.6),new THREE.Vector3(4.8,-2.3,2.1),new THREE.Vector3(5.2,-1.6,-3.4),new THREE.Vector3(.8,-2.05,-5.1),new THREE.Vector3(-4.1,-1.6,-4.2)
],true,'catmullrom',.55);
const forwardAxis=new THREE.Vector3(1,0,0),tmpQuat=new THREE.Quaternion();
function orientForward(root,tangent,roll=0){tmpQuat.setFromUnitVectors(forwardAxis,tangent.clone().normalize());root.quaternion.slerp(tmpQuat,.09);root.userData.visual.rotation.x+= (roll-root.userData.visual.rotation.x)*.075;}

// Surface vessel model. Also uses +X as the forward axis.
function makeShip(scale=.9){
  const root=new THREE.Group(),visual=new THREE.Group();root.add(visual);visual.scale.setScalar(scale);
  const hull=new THREE.Mesh(new THREE.BoxGeometry(2.1,.28,.72),hullMat);hull.position.y=-.04;visual.add(hull);
  const bow=new THREE.Mesh(new THREE.ConeGeometry(.37,.8,4),hullMat);bow.rotation.z=-Math.PI/2;bow.rotation.y=Math.PI/4;bow.position.x=1.42;visual.add(bow);
  const deck=new THREE.Mesh(new THREE.BoxGeometry(.82,.26,.5),pale);deck.position.set(-.14,.24,0);visual.add(deck);
  const bridge=new THREE.Mesh(new THREE.BoxGeometry(.42,.26,.38),muted);bridge.position.set(-.05,.48,0);visual.add(bridge);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.62,8),pale);mast.position.set(-.08,.9,0);visual.add(mast);
  const wakeL=line(new THREE.Vector3(-1.15,-.16,-.18),new THREE.Vector3(-2.3,-.16,-.8),.15,false);const wakeR=line(new THREE.Vector3(-1.15,-.16,.18),new THREE.Vector3(-2.3,-.16,.8),.15,false);visual.add(wakeL,wakeR);
  root.userData.visual=visual;scene.add(root);return root;
}
const shipA=makeShip(.78),shipB=makeShip(.62);
const shipCurveA=new THREE.CatmullRomCurve3([new THREE.Vector3(-6.7,0,4.6),new THREE.Vector3(-2.4,0,5.7),new THREE.Vector3(2.1,0,4.9),new THREE.Vector3(6.2,0,2.9),new THREE.Vector3(6.6,0,-2.6),new THREE.Vector3(1.8,0,-4.8),new THREE.Vector3(-4.7,0,-4.5)],true,'catmullrom',.65);
const shipCurveB=new THREE.CatmullRomCurve3([new THREE.Vector3(5.8,0,5.5),new THREE.Vector3(2.6,0,6.3),new THREE.Vector3(-1.4,0,5.9),new THREE.Vector3(-5.7,0,3.2),new THREE.Vector3(-6.1,0,-1.9),new THREE.Vector3(-1.9,0,-5.7),new THREE.Vector3(4.5,0,-4.7)],true,'catmullrom',.65);
function updateShip(ship,curve,u,t,rollAmp=.015){const p=curve.getPointAt(u),tan=curve.getTangentAt(u).normalize();const sea=surface.position.y+waveHeight(p.x,p.z,t)+.13;ship.position.set(p.x,sea,p.z);orientForward(ship,tan,rollAmp*Math.sin(t*1.1+u*10));}

// One surface receiver/data endpoint, visually separate from patent hardware.
const receiver=new THREE.Group();const rh=new THREE.Mesh(new THREE.BoxGeometry(1.25,.2,.5),dark);receiver.add(rh);const rd=new THREE.Mesh(new THREE.BoxGeometry(.48,.25,.34),pale);rd.position.set(-.05,.23,0);receiver.add(rd);receiver.position.set(5.2,.83,-5.1);scene.add(receiver);
for(const n of nodes){scene.add(line(n.position.clone(),receiver.position.clone(),.08,true));}

// Directional geometry from patent-grounded nodes to illustrative contact.
const bearingLines=nodes.map(()=>{const l=line(new THREE.Vector3(),new THREE.Vector3(),.16,true);scene.add(l);return l;});
function updateBearingLines(){nodes.forEach((n,i)=>{bearingLines[i].geometry.dispose();bearingLines[i].geometry=new THREE.BufferGeometry().setFromPoints([n.position.clone(),contact.position.clone()]);bearingLines[i].computeLineDistances();});}

// Acoustic field cue only. Not a detection radius.
const waves=[];for(let i=0;i<4;i++){const m=new THREE.MeshBasicMaterial({color:0xb9c4ba,wireframe:true,transparent:true,opacity:.07,depthWrite:false});const w=new THREE.Mesh(new THREE.SphereGeometry(1,22,14),m);w.userData.offset=i/4;scene.add(w);waves.push(w);}
for(const r of [1.1,1.75,2.45]){const curve=new THREE.EllipseCurve(0,0,r,r,0,Math.PI*2);const points=curve.getPoints(80).map(v=>new THREE.Vector3(v.x,-2.02,v.y));scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x89958b,transparent:true,opacity:.11})));}

const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();
  updateSurface(t);
  // Submarine follows path tangent, with depth-driven pitch and restrained bank.
  const u=(t*.027)%1,p=subCurve.getPointAt(u),tan=subCurve.getTangentAt(u).normalize(),tanAhead=subCurve.getTangentAt((u+.006)%1).normalize();
  contact.position.copy(p);const cross=new THREE.Vector3().crossVectors(tan,tanAhead);const bank=THREE.MathUtils.clamp(-cross.y*1.8,-.12,.12);orientForward(contact,tan,bank);
  updateShip(shipA,shipCurveA,(t*.012)%1,t,.018);updateShip(shipB,shipCurveB,(.43+t*.009)%1,t,.013);
  updateBearingLines();
  waves.forEach(w=>{const q=(t*.22+w.userData.offset)%1;const scale=.35+q*3.2;w.position.copy(contact.position);w.scale.setScalar(scale);w.material.opacity=(1-q)*.065;});
  particles.rotation.y=t*.01;
  // Slow observer drift, not an amusement-park orbit.
  camera.position.x=10.2+Math.sin(t*.052)*.95;camera.position.z=12.4+Math.cos(t*.047)*.8;camera.position.y=8.9+Math.sin(t*.039)*.32;camera.lookAt(0,-.85,0);
  renderer.render(scene,camera);
}
function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();animate();