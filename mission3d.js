import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/controls/OrbitControls.js';

const stage = document.querySelector('.mission-stage');
if (!stage) throw new Error('Mission stage not found');

const root = document.createElement('div');
root.className = 'mission-3d';
root.setAttribute('aria-label', 'Interactive 3D conceptual maritime acoustic sensing demonstrator');
root.innerHTML = '<div class="mission-3d-ui"><span>3D conceptual mission space</span><span><strong>DRAG</strong> orbit · <strong>SCROLL</strong> zoom</span></div><div class="mission-3d-axis">Illustrative geometry only<br>No platform signature data</div>';
stage.prepend(root);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
} catch (err) {
  root.innerHTML = '<div class="mission-3d-error">3D view unavailable in this browser. The 2D demonstrator remains active.</div>';
  throw err;
}

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;
root.prepend(renderer.domElement);
stage.classList.add('has-webgl');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050605);
scene.fog = new THREE.FogExp2(0x050605, 0.055);

const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
camera.position.set(10.5, 7.2, 11.5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 7;
controls.maxDistance = 24;
controls.minPolarAngle = 0.42;
controls.maxPolarAngle = 1.47;
controls.target.set(0, -1.1, 0);
controls.update();

scene.add(new THREE.HemisphereLight(0xdde2d8, 0x111411, 1.25));
const key = new THREE.DirectionalLight(0xf4f5ef, 2.4);
key.position.set(-7, 10, 6);
scene.add(key);
const rim = new THREE.DirectionalLight(0x9ca99a, 1.35);
rim.position.set(8, 2, -7);
scene.add(rim);

const water = new THREE.Mesh(
  new THREE.PlaneGeometry(26, 26, 1, 1),
  new THREE.MeshPhysicalMaterial({ color: 0x101613, transparent: true, opacity: 0.42, roughness: 0.28, metalness: 0.05, transmission: 0.05, side: THREE.DoubleSide })
);
water.rotation.x = -Math.PI / 2;
water.position.y = 0;
scene.add(water);

const seabed = new THREE.Mesh(
  new THREE.PlaneGeometry(26, 26),
  new THREE.MeshStandardMaterial({ color: 0x080908, roughness: 1, metalness: 0 })
);
seabed.rotation.x = -Math.PI / 2;
seabed.position.y = -4.1;
scene.add(seabed);

const grid = new THREE.GridHelper(24, 24, 0x363a36, 0x171917);
grid.position.y = -4.04;
for (const m of Array.isArray(grid.material) ? grid.material : [grid.material]) {
  m.transparent = true;
  m.opacity = 0.28;
}
scene.add(grid);

// Reference rings around the sensor node.
const ringMaterial = new THREE.LineBasicMaterial({ color: 0x505650, transparent: true, opacity: 0.34 });
for (const radius of [2.1, 4.2, 6.3, 8.4]) {
  const pts = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, -1.78, Math.sin(a) * radius));
  }
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMaterial));
}

const sensorRoot = new THREE.Group();
sensorRoot.position.set(0, -1.72, 0);
scene.add(sensorRoot);

const targetRoot = new THREE.Group();
scene.add(targetRoot);

const waveRoot = new THREE.Group();
scene.add(waveRoot);

const bearingMaterial = new THREE.LineBasicMaterial({ color: 0xd1cec0, transparent: true, opacity: 0.72 });
const bearingLine = new THREE.Line(new THREE.BufferGeometry(), bearingMaterial);
scene.add(bearingLine);

const direction = new THREE.Vector3(1, 0, 0);
const arrow = new THREE.ArrowHelper(direction, sensorRoot.position.clone(), 3, 0xe3e5de, 0.28, 0.13);
scene.add(arrow);

const pale = new THREE.MeshStandardMaterial({ color: 0xd8ddd3, roughness: 0.56, metalness: 0.26 });
const dark = new THREE.MeshStandardMaterial({ color: 0x151815, roughness: 0.72, metalness: 0.14 });
const muted = new THREE.MeshStandardMaterial({ color: 0x5d645d, roughness: 0.66, metalness: 0.18 });

function disposeGroup(group) {
  while (group.children.length) {
    const c = group.children.pop();
    c.traverse?.(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material && ![pale, dark, muted].includes(o.material)) o.material.dispose?.();
    });
  }
}

function createSensor(type) {
  disposeGroup(sensorRoot);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.17, 24), dark);
  sensorRoot.add(base);
  if (type === 'floating') {
    const cross1 = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 0.12), pale);
    const cross2 = cross1.clone();
    cross2.rotation.y = Math.PI / 2;
    sensorRoot.add(cross1, cross2);
    const hub = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 12), pale);
    sensorRoot.add(hub);
    const tether = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2.15, 8), muted);
    tether.position.y = -1.1;
    sensorRoot.add(tether);
  } else if (type === 'tower') {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 1.75, 18), dark);
    tower.position.y = 0.45;
    sensorRoot.add(tower);
    for (const rot of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) {
      const channel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.09, 0.1), pale);
      channel.position.y = 0.5;
      channel.rotation.y = rot;
      sensorRoot.add(channel);
    }
  } else {
    const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 1.05, 8, 16), dark);
    pod.rotation.z = Math.PI / 2;
    sensorRoot.add(pod);
    const module = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.18, 0.45), pale);
    module.position.y = 0.32;
    sensorRoot.add(module);
  }
}

function createTarget(type) {
  disposeGroup(targetRoot);
  if (type === 'surface') {
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.36, 0.72), dark);
    hull.scale.z = 0.72;
    targetRoot.add(hull);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.9, 4), dark);
    bow.rotation.z = -Math.PI / 2;
    bow.position.x = 1.48;
    targetRoot.add(bow);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.28, 0.48), pale);
    deck.position.set(-0.15, 0.31, 0);
    targetRoot.add(deck);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8), pale);
    mast.position.set(-0.08, 0.8, 0);
    targetRoot.add(mast);
  } else if (type === 'submarine') {
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 2.25, 8, 20), dark);
    body.rotation.z = Math.PI / 2;
    targetRoot.add(body);
    const sail = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.42, 0.26), pale);
    sail.position.set(0.1, 0.44, 0);
    targetRoot.add(sail);
    const fin1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 1.45), muted);
    fin1.position.x = -1.25;
    targetRoot.add(fin1);
  } else {
    const source = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48, 2), pale);
    targetRoot.add(source);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3, 8), muted);
    stem.position.y = -0.8;
    targetRoot.add(stem);
  }
}

const waveMeshes = [];
for (let i = 0; i < 5; i++) {
  const material = new THREE.MeshBasicMaterial({ color: 0xbec8ba, wireframe: true, transparent: true, opacity: 0.16, depthWrite: false });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 14), material);
  mesh.userData.offset = i / 5;
  waveRoot.add(mesh);
  waveMeshes.push(mesh);
}

const ids = {
  target: document.getElementById('targetType'),
  config: document.getElementById('sensorConfig'),
  range: document.getElementById('missionRange'),
  bearing: document.getElementById('missionBearing'),
  freq: document.getElementById('missionFreq'),
  source: document.getElementById('missionSource'),
  noise: document.getElementById('missionNoise')
};

let lastTarget = null;
let lastConfig = null;
let running = true;

function getState() {
  return {
    target: ids.target?.value || 'surface',
    config: ids.config?.value || 'floating',
    range: +(ids.range?.value || 3.2),
    bearing: +(ids.bearing?.value || 62),
    freq: +(ids.freq?.value || 180),
    source: +(ids.source?.value || 146),
    noise: +(ids.noise?.value || 82)
  };
}

function updateScene() {
  const s = getState();
  if (s.target !== lastTarget) {
    createTarget(s.target);
    lastTarget = s.target;
  }
  if (s.config !== lastConfig) {
    createSensor(s.config);
    lastConfig = s.config;
  }

  const radius = THREE.MathUtils.lerp(1.55, 8.2, Math.min(1, s.range / 8.5));
  const a = THREE.MathUtils.degToRad(90 - s.bearing);
  const targetY = s.target === 'surface' ? 0.34 : (s.target === 'submarine' ? -2.15 : -1.55);
  targetRoot.position.set(Math.cos(a) * radius, targetY, Math.sin(a) * radius);
  targetRoot.rotation.y = -a;
  waveRoot.position.copy(targetRoot.position);

  const from = sensorRoot.position.clone();
  const to = targetRoot.position.clone();
  bearingLine.geometry.dispose();
  bearingLine.geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
  const dir = to.clone().sub(from).normalize();
  const len = to.distanceTo(from);
  arrow.position.copy(from);
  arrow.setDirection(dir);
  arrow.setLength(Math.min(len, 4.1), 0.32, 0.15);

  // A subtle visual response to selected SNR, intentionally heuristic.
  const rm = Math.max(1, s.range * 1000);
  const tl = 20 * Math.log10(rm) + 0.00035 * Math.pow(s.freq / 100, 2) * s.range;
  const snr = (s.source - tl) - s.noise;
  const strength = THREE.MathUtils.clamp((snr + 12) / 28, 0.08, 1);
  bearingMaterial.opacity = 0.22 + strength * 0.62;
  waveMeshes.forEach(w => { w.userData.strength = strength; });
}

Object.values(ids).forEach(el => {
  if (!el) return;
  el.addEventListener('input', updateScene);
  el.addEventListener('change', updateScene);
});

const pauseButton = document.getElementById('runMission');
if (pauseButton) pauseButton.addEventListener('click', () => { running = !running; });

updateScene();

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  if (running) {
    const s = getState();
    const rate = THREE.MathUtils.lerp(0.23, 0.62, (s.freq - 10) / 490);
    waveMeshes.forEach((w, i) => {
      const q = (t * rate + w.userData.offset) % 1;
      const scale = 0.35 + q * 3.25;
      w.scale.setScalar(scale);
      w.material.opacity = (1 - q) * 0.17 * (0.45 + 0.55 * (w.userData.strength || 0.5));
    });
    targetRoot.position.y += Math.sin(t * 0.75) * 0.00065;
    water.material.opacity = 0.39 + Math.sin(t * 0.35) * 0.018;
  }
  controls.update();
  renderer.render(scene, camera);
}

function resize() {
  const w = Math.max(1, root.clientWidth);
  const h = Math.max(1, root.clientHeight);
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(root);
resize();
animate();
