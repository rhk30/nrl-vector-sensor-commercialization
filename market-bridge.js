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
    <div class="mm-circle" aria-label="Animated conceptual undersea operating picture using patent-described sensing architecture">
      <div class="mm-canvas-host"></div>
      <div class="mm-vignette"></div>
      <div class="mm-hud" aria-hidden="true">
        <span class="mm-hud-top">UNDERSEA OPERATING PICTURE // CONCEPT</span>
        <span class="mm-hud-left">PATENT CORE<br>102 BASE<br>104 FLOW METERS<br>106 TETHER<br>108 ANCHOR</span>
        <span class="mm-hud-right">DIRECTIONAL<br>GEOMETRY ONLY</span>
        <span class="mm-hud-bottom">NO DETECTION RANGE · NO SNR · NO CLASSIFICATION MODEL</span>
      </div>
    </div>
  </div>
  <div class="mm-copy">
    <span class="mm-kicker">DEFENSE FIRST // PATENT-IN-CONTEXT</span>
    <div class="mm-point"><h3>Distributed directional sensing</h3><p>The patent describes particle-motion sensing for recovering direction-of-arrival information in a compact footprint. The animation turns that disclosed sensing idea into a live undersea operating picture without pretending it is a validated sonar display.</p></div>
    <div class="mm-point"><h3>Moored architecture</h3><p>US11287508B2 discloses a floating base with one or more flow meters, a retaining thread and an anchor. FIG. 1 shows four flow meters around the base. Those patent elements are carried into the animated nodes.</p></div>
    <div class="mm-point"><h3>Networked receiver path</h3><p>The disclosure also contemplates external devices and centralized aggregation of measurements from multiple vector sensors. Terrain, contact motion and network geometry are illustrative context only.</p></div>
    <div class="mm-foot">REAL-TIME 3D VISUAL // PATENT-GROUNDED ARCHITECTURE + ILLUSTRATIVE OPERATING CONTEXT</div>
  </div>`;
if(head)head.insertAdjacentElement('afterend',section);else market.prepend(section);

const style=document.createElement('style');
style.textContent=`
.market-motion{display:grid;grid-template-columns:minmax(440px,1.03fr) minmax(360px,.97fr);gap:58px;align-items:center;margin:34px 0 46px;padding:24px 0 30px}.mm-stage{position:relative;min-height:640px;display:flex;align-items:center;justify-content:center}.mm-grid{position:absolute;inset:24px 4% 24px 0;background-image:linear-gradient(rgba(160,171,158,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(160,171,158,.06) 1px,transparent 1px);background-size:72px 72px;mask-image:radial-gradient(circle at 46% 50%,#000 0 64%,transparent 80%)}.mm-circle{position:relative;width:min(600px,92%);aspect-ratio:1;border-radius:50%;overflow:hidden;border:1px solid rgba(210,220,207,.28);background:#050706;box-shadow:0 22px 90px rgba(0,0,0,.42),inset 0 0 90px rgba(0,0,0,.32)}.mm-canvas-host,.mm-canvas-host canvas,.mm-vignette,.mm-hud{position:absolute;inset:0;width:100%;height:100%}.mm-canvas-host canvas{display:block}.mm-vignette{pointer-events:none;background:radial-gradient(circle at 50% 48%,transparent 38%,rgba(3,4,3,.08) 58%,rgba(2,3,2,.64) 100%),linear-gradient(180deg,rgba(3,4,3,.03),rgba(3,4,3,.25));z-index:2}.mm-hud{z-index:3;pointer-events:none;color:#cbd3c7;font:8px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.055em}.mm-hud span{position:absolute;text-shadow:0 1px 7px rgba(0,0,0,.9)}.mm-hud-top{top:5.4%;left:8%;color:#aeb9aa}.mm-hud-left{left:7.5%;bottom:13%;color:#8e998c}.mm-hud-right{right:8%;top:19%;text-align:right;color:#8e998c}.mm-hud-bottom{bottom:5.5%;left:50%;transform:translateX(-50%);width:82%;text-align:center;color:#778177}.mm-copy{padding-right:4%;display:flex;flex-direction:column;justify-content:center}.mm-kicker{font:10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;color:#9eaa9a;margin-bottom:20px}.mm-point{padding:0 0 27px;margin-bottom:25px;border-bottom:1px solid rgba(169,181,155,.13)}.mm-point:last-of-type{margin-bottom:14px}.mm-point h3{margin:0 0 8px;font-size:29px;line-height:1.04;letter-spacing:-.035em}.mm-point p{margin:0;max-width:650px;color:#929a91;font-size:12px;line-height:1.58}.mm-foot{color:#697269;font:8.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.05em}.mm-webgl-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:15%;text-align:center;color:#8e998c;font:10px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace}
@media(max-width:1000px){.market-motion{grid-template-columns:1fr;gap:26px}.mm-stage{min-height:auto;padding:10px 0}.mm-circle{width:min(580px,82vw)}.mm-copy{padding:0 5%}.mm-point h3{font-size:24px}}
@media(max-width:600px){.market-motion{margin-top:22px}.mm-grid{display:none}.mm-circle{width:90vw}.mm-point{padding-bottom:20px;margin-bottom:20px}.mm-point h3{font-size:21px}.mm-point p{font-size:11px}.mm-hud-left,.mm-hud-right{display:none}}
`;
document.head.appendChild(style);

const host=section.querySelector('.mm-canvas-host');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch(err){host.innerHTML='<div class="mm-webgl-fallback">Real-time 3D view unavailable in this browser.</div>';throw err;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.86;host.appendChild(renderer.domElement);

const scene=new THREE.Scene();scene.background=new THREE.Color(0x050706);scene.fog=new THREE.FogExp2(0x06100d,.052);
const camera=new THREE.PerspectiveCamera(43,1,.1,100);camera.position.set(9.8,9.4,11.8);camera.lookAt(0,-1.2,0);
scene.add(new THREE.HemisphereLight(0xd0d8cd,0x07100d,1.28));
const key=new THREE.DirectionalLight(0xe9eee7,2.5);key.position.set(-7,11,7);scene.add(key);
const rim=new THREE.DirectionalLight(0x7f9182,1.2);rim.position.set(8,2,-7);scene.add(rim);

// Procedural seabed relief. Context only, not geographic data.
const terrainGeo=new THREE.PlaneGeometry(24,24,70,70);terrainGeo.rotateX(-Math.PI/2);const p=terrainGeo.attributes.position;
for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,-4+.42*Math.sin(x*.55)*Math.cos(z*.43)+.18*Math.sin((x+z)*1.08)+.13*Math.cos(x*.25-z*.7));}
terrainGeo.computeVertexNormals();
scene.add(new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({color:0x101914,roughness:.96,metalness:.01})));
const terrainWire=new THREE.Mesh(terrainGeo.clone(),new THREE.MeshBasicMaterial({color:0x5f6b61,wireframe:true,transparent:true,opacity:.075,depthWrite:false}));terrainWire.position.y=.02;scene.add(terrainWire);

// Faint water surface gives depth without turning the animation into a range plot.
const surface=new THREE.Mesh(new THREE.PlaneGeometry(24,24),new THREE.MeshPhysicalMaterial({color:0x101b17,transparent:true,opacity:.16,roughness:.35,metalness:0,side:THREE.DoubleSide}));surface.rotation.x=-Math.PI/2;surface.position.y=.8;scene.add(surface);

// Suspended particulate field for underwater motion/parallax.
const particleCount=380;const pts=new Float32Array(particleCount*3);for(let i=0;i<particleCount;i++){pts[i*3]=(Math.random()-.5)*20;pts[i*3+1]=-3.3+Math.random()*4;pts[i*3+2]=(Math.random()-.5)*20;}
const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pts,3));const particles=new THREE.Points(pg,new THREE.PointsMaterial({color:0xa7b2a8,size:.025,transparent:true,opacity:.22,depthWrite:false}));scene.add(particles);

const pale=new THREE.MeshStandardMaterial({color:0xcdd5ca,roughness:.48,metalness:.22});
const dark=new THREE.MeshStandardMaterial({color:0x111712,roughness:.74,metalness:.08});
const muted=new THREE.MeshStandardMaterial({color:0x566258,roughness:.64,metalness:.12});
function line(a,b,opacity=.42,dashed=false){const mat=dashed?new THREE.LineDashedMaterial({color:0x9eaa9d,transparent:true,opacity,dashSize:.16,gapSize:.13}):new THREE.LineBasicMaterial({color:0x9eaa9d,transparent:true,opacity});const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),mat);if(dashed)l.computeLineDistances();return l;}
function seabedHeight(x,z){return -4+.42*Math.sin(x*.55)*Math.cos(z*.43)+.18*Math.sin((x+z)*1.08)+.13*Math.cos(x*.25-z*.7);}

// Patent-grounded node: floating base 102, four flow meters 104 shown in FIG. 1,
// retaining thread 106 and anchor 108. Shape is conceptual, relationships are literal.
function makeNode(x,z,s=.7){const g=new THREE.Group();g.position.set(x,-2.05,z);const base=new THREE.Mesh(new THREE.CylinderGeometry(.42*s,.42*s,.18*s,28),dark);g.add(base);const hub=new THREE.Mesh(new THREE.SphereGeometry(.11*s,16,10),pale);hub.position.y=.13*s;g.add(hub);[[.73,0,Math.PI/2],[-.73,0,Math.PI/2],[0,.73,0],[0,-.73,0]].forEach(([xx,zz,r])=>{const arm=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(xx)>.1?.52*s:.055*s,.045*s,Math.abs(zz)>.1?.52*s:.055*s),muted);arm.position.set(xx*.5*s,.08*s,zz*.5*s);g.add(arm);const meter=new THREE.Mesh(new THREE.BoxGeometry(.25*s,.09*s,.36*s),pale);meter.position.set(xx*s,.09*s,zz*s);meter.rotation.y=r;g.add(meter);});
  const bottom=new THREE.Vector3(x,g.position.y-.08*s,z),ay=seabedHeight(x,z)+.12;const anchorPos=new THREE.Vector3(x,ay,z);scene.add(line(bottom,anchorPos,.42,true));const anchor=new THREE.Mesh(new THREE.BoxGeometry(.7*s,.16*s,.5*s),muted);anchor.position.copy(anchorPos);anchor.position.y-=.08*s;scene.add(anchor);scene.add(g);return g;}
const nodePositions=[[-4.4,-2.8],[3.9,-3.2],[-2.7,3.7],[4.6,3.2],[0,.3]];const nodes=nodePositions.map((n,i)=>makeNode(n[0],n[1],i===4?.86:.58));

// Surface receiver concept, visually separate from patent hardware.
const receiver=new THREE.Group();const rh=new THREE.Mesh(new THREE.BoxGeometry(1.4,.22,.55),dark);receiver.add(rh);const deck=new THREE.Mesh(new THREE.BoxGeometry(.55,.28,.38),pale);deck.position.set(-.05,.24,0);receiver.add(deck);receiver.position.set(5.3,.7,-5.2);scene.add(receiver);
for(const n of nodes){scene.add(line(n.position.clone(),receiver.position.clone(),.11,true));}

// Generic submerged acoustic contact. It is not a claimed target model.
const contact=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.34,1.65,8,18),dark);body.rotation.z=Math.PI/2;contact.add(body);const sail=new THREE.Mesh(new THREE.BoxGeometry(.34,.33,.22),pale);sail.position.set(.05,.36,0);contact.add(sail);const fin=new THREE.Mesh(new THREE.BoxGeometry(.35,.045,.95),muted);fin.position.x=-.95;contact.add(fin);scene.add(contact);

// Directional lines from nodes to contact. Geometry only.
const bearingLines=nodes.map(()=>{const l=line(new THREE.Vector3(),new THREE.Vector3(),.18,true);scene.add(l);return l;});

// Expanding wire-sphere wavefronts centered on contact. Decorative acoustic field cue.
const waves=[];for(let i=0;i<4;i++){const m=new THREE.MeshBasicMaterial({color:0xb9c4ba,wireframe:true,transparent:true,opacity:.08,depthWrite:false});const w=new THREE.Mesh(new THREE.SphereGeometry(1,22,14),m);w.userData.offset=i/4;scene.add(w);waves.push(w);}

// Thin tactical rings around the central patent node, not physical range markings.
for(const r of [1.1,1.75,2.45]){const curve=new THREE.EllipseCurve(0,0,r,r,0,Math.PI*2);const points=curve.getPoints(80).map(v=>new THREE.Vector3(v.x,-2.02,v.y));const ring=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x89958b,transparent:true,opacity:.12}));scene.add(ring);}

const clock=new THREE.Clock();
function updateBearingLines(){nodes.forEach((n,i)=>{bearingLines[i].geometry.dispose();bearingLines[i].geometry=new THREE.BufferGeometry().setFromPoints([n.position.clone(),contact.position.clone()]);bearingLines[i].computeLineDistances();});}
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();
  // Contact follows a smooth 3-D patrol path to create an actual live mission picture.
  const a=t*.19;contact.position.set(Math.cos(a)*4.9,-1.75+.26*Math.sin(t*.31),Math.sin(a*.86)*4.2);contact.rotation.y=-a+.2*Math.sin(t*.2);
  updateBearingLines();
  waves.forEach(w=>{const q=(t*.24+w.userData.offset)%1;const scale=.35+q*3.3;w.position.copy(contact.position);w.scale.setScalar(scale);w.material.opacity=(1-q)*.07;});
  // Gentle current-like particle drift.
  particles.rotation.y=t*.012;surface.material.opacity=.15+.018*Math.sin(t*.27);
  // Camera motion inspired by a live 3-D operating picture, not an orbit control.
  camera.position.x=9.8+Math.sin(t*.075)*1.35;camera.position.z=11.8+Math.cos(t*.063)*1.15;camera.position.y=9.3+Math.sin(t*.052)*.45;camera.lookAt(0,-1.2,0);
  renderer.render(scene,camera);
}
function resize(){const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();animate();
