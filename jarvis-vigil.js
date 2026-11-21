import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { buildSentinel } from './vigil-character.js';
import { createHologram } from './vigil-hologram.js';

const view = document.getElementById('bayView');
const bay = document.querySelector('.bay');
const canvas = document.getElementById('scene');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- renderer and camera ---------- */

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101310);
scene.fog = new THREE.Fog(0x101310, 7.5, 15);

const camera = new THREE.PerspectiveCamera(33, 1.2, 0.1, 40);
camera.position.set(1.5, 1.7, 5.6);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0.18, 1.0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enablePan = false;
controls.enableZoom = false;
controls.minPolarAngle = 1.08;
controls.maxPolarAngle = 1.58;
controls.minAzimuthAngle = -0.62;
controls.maxAzimuthAngle = 1.08;
controls.update();

let userOrbited = false;
controls.addEventListener('start', () => { userOrbited = true; });

/* ---------- light ---------- */

const hemi = new THREE.HemisphereLight(0x94a8a2, 0x1a1510, 0.55);
scene.add(hemi);

const key = new THREE.DirectionalLight(0xffe0bd, 2.5);
key.position.set(3.2, 5.6, 4.4);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
key.shadow.camera.left = -2.8;
key.shadow.camera.right = 2.8;
key.shadow.camera.top = 3.2;
key.shadow.camera.bottom = -0.4;
key.shadow.camera.near = 0.5;
key.shadow.camera.far = 14;
key.shadow.bias = -0.0006;
key.shadow.normalBias = 0.02;
scene.add(key);
scene.add(key.target);
key.target.position.set(0.15, 0.9, 0);

const rim = new THREE.DirectionalLight(0x7ef4e9, 1.9);
rim.position.set(-4.2, 3.4, -3.4);
scene.add(rim);

const kick = new THREE.DirectionalLight(0xff5848, 0.7);
kick.position.set(4.2, 2.0, -3.0);
scene.add(kick);

/* ---------- stage ---------- */

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(6, 72),
  new THREE.MeshStandardMaterial({ color: 0x161916, roughness: 0.96, metalness: 0.08 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const pad = new THREE.Mesh(
  new THREE.CircleGeometry(2.35, 72),
  new THREE.MeshStandardMaterial({ color: 0x1b1e1a, roughness: 0.9, metalness: 0.15 })
);
pad.rotation.x = -Math.PI / 2;
pad.position.y = 0.006;
pad.receiveShadow = true;
scene.add(pad);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(2.35, 0.0065, 6, 96),
  new THREE.MeshStandardMaterial({ color: 0x8d7448, metalness: 0.9, roughness: 0.35 })
);
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.012;
scene.add(ring);

for (const x of [-2.4, 0, 2.4]) {
  const rib = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 4.6, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x191c18, roughness: 0.8, metalness: 0.2 })
  );
  rib.position.set(x, 2.3, -2.9);
  scene.add(rib);
}

/* the window edge VIGIL sits on */
const ledge = new THREE.Group();
const ledgeBody = new THREE.Mesh(
  new RoundedBoxGeometry(1.02, 0.52, 0.8, 3, 0.025),
  new THREE.MeshStandardMaterial({ color: 0x1e211d, roughness: 0.72, metalness: 0.25 })
);
ledgeBody.position.set(1.35, 0.26, -0.08);
ledgeBody.castShadow = true;
ledgeBody.receiveShadow = true;
ledge.add(ledgeBody);

const ledgeTrim = new THREE.Mesh(
  new THREE.BoxGeometry(0.95, 0.014, 0.018),
  new THREE.MeshStandardMaterial({ color: 0xa07e45, metalness: 0.95, roughness: 0.3 })
);
ledgeTrim.position.set(1.35, 0.517, 0.319);
ledge.add(ledgeTrim);

const ledgeFoot = new THREE.Mesh(
  new THREE.BoxGeometry(1.1, 0.03, 0.88),
  new THREE.MeshStandardMaterial({ color: 0x111310, roughness: 0.95 })
);
ledgeFoot.position.set(1.35, 0.016, -0.08);
ledge.add(ledgeFoot);
scene.add(ledge);

/* ---------- character ---------- */

const actor = buildSentinel();
scene.add(actor.root);

const hologram = createHologram(scene, camera);

/* ---------- states ---------- */

const STATES = {
  idle: {
    label: 'Idle', note: 'Standing by. Watching the desktop.', tone: 'cyan', core: 100,
    station: { x: 0.12, z: 0.56, yaw: 0.04 }, panel: null,
  },
  walk: {
    label: 'Walk', note: 'Patrolling the edge of the screen.', tone: 'cyan', core: 94,
    station: null, panel: null,
  },
  watch: {
    label: 'Watch', note: 'Tracking your cursor. The visor follows.', tone: 'bright', core: 100,
    station: { x: 0.12, z: 0.56, yaw: 0.0 }, panel: null,
  },
  sit: {
    label: 'Sit', note: 'Perched on a window edge, legs hanging.', tone: 'dim', core: 72,
    station: { x: 1.33, z: 0.38, yaw: 0.02 }, panel: null,
  },
  work: {
    label: 'Work', note: 'Building the dashboard shell. Watching for quota.', tone: 'cyan', core: 100,
    station: { x: -0.34, z: 0.42, yaw: 0.5 }, panel: 'work',
  },
  rest: {
    label: 'Rest', note: 'Low power. Core dimmed. Still listening.', tone: 'dim', core: 12,
    station: { x: 1.33, z: 0.38, yaw: 0.02 }, panel: null,
  },
  blocked: {
    label: 'Blocked', note: 'Needs your approval. Nothing has been changed.', tone: 'amber', core: 100,
    station: { x: -0.18, z: 0.5, yaw: 0.1 }, panel: 'blocked',
  },
  error: {
    label: 'Error', note: 'A step failed. The checkpoint is saved.', tone: 'red', core: 86,
    station: { x: -0.42, z: 0.44, yaw: 0.12 }, panel: 'error',
  },
  done: {
    label: 'Done', note: 'Build verified. Waiting for your sign-off.', tone: 'bright', core: 100,
    station: { x: 0.06, z: 0.48, yaw: -0.04 }, panel: 'done',
  },
};

const PANEL_POS = {
  work: new THREE.Vector3(0.95, 1.34, 0.42),
  blocked: new THREE.Vector3(0.92, 1.38, 0.38),
  error: new THREE.Vector3(1.02, 1.18, 0.34),
  done: new THREE.Vector3(1.02, 1.4, 0.36),
};

let currentState = 'idle';
let mode = 'atStation';
let station = STATES.idle.station;
let patrolDir = 1;
let visualSpeed = 0;
let walkPhase = 0;
let walkWeight = 0;
let timeInState = 0;
let pointerX = 0;
let pointerY = 0;

/* ---------- pose model ---------- */

function blankPose() {
  return {
    hipY: 0.95, hipRotY: 0, hipRotZ: 0,
    torsoX: 0, torsoY: 0, torsoZ: 0,
    headX: 0, headY: 0, headZ: 0,
    lHipX: 0, lHipY: 0, lHipZ: -0.038, lKneeX: 0.04, lAnkleX: 0,
    rHipX: 0, rHipY: 0, rHipZ: 0.038, rKneeX: 0.04, rAnkleX: 0,
    lShoulderX: 0, lShoulderY: 0, lShoulderZ: -0.07, lElbowX: 0.12,
    rShoulderX: 0, rShoulderY: 0, rShoulderZ: 0.07, rElbowX: 0.12,
  };
}

const poseTarget = blankPose();
const poseCurrent = blankPose();

function poseIdle(t) {
  const p = blankPose();
  const breath = Math.sin(t * 1.35);
  p.hipY = 0.95 + 0.0035 * breath;
  p.torsoX = 0.014 + 0.012 * breath;
  p.torsoY = 0.035 * Math.sin(t * 0.31);
  p.headX = -0.025 + 0.012 * Math.sin(t * 0.47);
  p.headY = 0.2 * Math.sin(t * 0.36) + 0.045 * Math.sin(t * 1.1);
  p.headZ = 0.02 * Math.sin(t * 0.27);
  p.lShoulderX = 0.02 * Math.sin(t * 1.35 + 0.5);
  p.rShoulderX = -0.02 * Math.sin(t * 1.35);
  p.lElbowX = 0.13 + 0.02 * Math.sin(t * 1.35);
  p.rElbowX = 0.12 + 0.02 * Math.sin(t * 1.35 + 1);
  p.lHipZ = -0.055;
  p.rHipZ = 0.055;
  return p;
}

function poseWalk(t, phase) {
  const p = blankPose();
  const swing = 0.56;
  p.hipY = 0.95 + 0.025 * Math.cos(phase * 2) - 0.007;
  p.hipRotZ = 0.018 * Math.sin(phase);
  p.torsoX = 0.055 + 0.012 * Math.cos(phase * 2);
  p.torsoY = -0.06 * Math.sin(phase);
  p.torsoZ = 0.012 * Math.sin(phase);
  p.headX = -0.035;
  p.headY = 0.035 * Math.sin(phase);
  p.lHipX = -swing * Math.sin(phase);
  p.rHipX = swing * Math.sin(phase);
  p.lKneeX = 0.12 + 0.62 * Math.max(0, Math.sin(phase + 0.7));
  p.rKneeX = 0.12 + 0.62 * Math.max(0, Math.sin(phase + Math.PI + 0.7));
  p.lAnkleX = THREE.MathUtils.clamp(-(p.lHipX + p.lKneeX) * 0.48, -0.4, 0.42);
  p.rAnkleX = THREE.MathUtils.clamp(-(p.rHipX + p.rKneeX) * 0.48, -0.4, 0.42);
  p.lShoulderX = 0.34 * Math.sin(phase);
  p.rShoulderX = -0.34 * Math.sin(phase);
  p.lElbowX = 0.24 + 0.1 * Math.max(0, -Math.sin(phase));
  p.rElbowX = 0.24 + 0.1 * Math.max(0, Math.sin(phase));
  p.lShoulderZ = -0.09;
  p.rShoulderZ = 0.09;
  return p;
}

function poseWatch(t) {
  const p = blankPose();
  p.hipY = 0.951 + 0.003 * Math.sin(t * 1.2);
  p.torsoX = 0.09;
  p.torsoY = -0.08;
  p.headX = -0.07 + pointerY * 0.16;
  p.headY = 0.1 + pointerX * 0.5;
  p.headZ = 0.035;
  p.lShoulderX = 0.04;
  p.lElbowX = 0.18;
  p.rShoulderX = -0.5;
  p.rShoulderZ = 0.18;
  p.rElbowX = -1.35;
  p.lHipZ = -0.06;
  p.rHipZ = 0.06;
  return p;
}

function sitLegs(p, t) {
  p.lHipX = -1.45;
  p.lHipZ = -0.1;
  p.lKneeX = 1.28 + Math.sin(t * 0.35) * 0.015;
  p.lAnkleX = 0.16;
  p.rHipX = -1.38;
  p.rHipZ = 0.09;
  p.rKneeX = 1.4 + Math.sin(t * 0.31 + 1) * 0.015;
  p.rAnkleX = 0.11;
}

function poseSit(t) {
  const p = blankPose();
  p.hipY = 0.6;
  p.torsoX = -0.12;
  p.torsoY = 0.045;
  p.headX = -0.02;
  p.headY = 0.12 * Math.sin(t * 0.4);
  sitLegs(p, t);
  p.lShoulderX = 0.22;
  p.rShoulderX = 0.2;
  p.lShoulderZ = -0.14;
  p.rShoulderZ = 0.14;
  p.lElbowX = 0.12;
  p.rElbowX = 0.16;
  return p;
}

function poseRest(t) {
  const p = blankPose();
  p.hipY = 0.6;
  p.torsoX = 0.46;
  p.torsoY = 0.02;
  p.headX = 0.31;
  p.headY = -0.1;
  p.headZ = 0.03;
  sitLegs(p, t);
  p.lShoulderX = -0.5;
  p.rShoulderX = -0.5;
  p.lShoulderZ = -0.16;
  p.rShoulderZ = 0.16;
  p.lElbowX = -0.85;
  p.rElbowX = -0.9;
  return p;
}

function poseWork(t) {
  const p = blankPose();
  p.hipY = 0.951 + 0.003 * Math.sin(t * 1.5);
  p.torsoX = 0.035;
  p.torsoY = 0.11;
  p.headX = -0.01;
  p.headY = 0.3 + 0.03 * Math.sin(t * 0.7);
  p.lShoulderX = 0.06;
  p.lElbowX = 0.2;
  p.rShoulderX = -0.88;
  p.rShoulderZ = 0.06;
  p.rElbowX = -0.5;
  p.lHipZ = -0.055;
  p.rHipZ = 0.055;
  return p;
}

function poseBlocked(t) {
  const p = blankPose();
  p.hipY = 0.947;
  p.hipRotZ = 0.018;
  p.torsoX = 0.01;
  p.torsoY = -0.06;
  p.headX = -0.03 + 0.02 * Math.sin(t * 0.9);
  p.headY = 0.26 * Math.sin(t * 0.55);
  p.headZ = -0.045;
  p.lShoulderX = -0.5;
  p.rShoulderX = -0.5;
  p.lShoulderZ = 0.62;
  p.rShoulderZ = -0.62;
  p.lElbowX = -1.95;
  p.rElbowX = -1.95;
  p.lHipZ = -0.07;
  p.rHipZ = 0.05;
  return p;
}

function poseError(t) {
  const p = blankPose();
  p.hipY = 0.53;
  p.torsoX = 0.52;
  p.torsoY = 0.1;
  p.torsoZ = -0.03;
  p.headX = 0.32 + 0.015 * Math.sin(t * 2.2);
  p.headY = 0.12;
  p.lHipX = -1.3;
  p.lHipZ = -0.1;
  p.lKneeX = 0.55;
  p.lAnkleX = 0.7;
  p.rHipX = 0.55;
  p.rHipZ = 0.08;
  p.rKneeX = 1.02;
  p.rAnkleX = 0.2;
  p.lShoulderX = -0.65;
  p.lShoulderZ = -0.14;
  p.lElbowX = -0.75;
  p.rShoulderX = 0.1;
  p.rShoulderZ = 0.12;
  p.rElbowX = 0.3;
  return p;
}

function poseDone(t) {
  const p = blankPose();
  p.hipY = 0.952;
  p.torsoX = -0.055;
  p.torsoY = 0.02;
  p.headX = -0.1;
  p.headY = 0.06;
  p.headZ = -0.02;
  p.rShoulderX = -0.62;
  p.rShoulderZ = -0.8;
  p.rElbowX = -1.9;
  p.lShoulderX = 0.02;
  p.lElbowX = 0.12;
  p.lHipZ = -0.06;
  p.rHipZ = 0.06;
  return p;
}

function statePose(state, t) {
  switch (state) {
    case 'watch': return poseWatch(t);
    case 'sit': return poseSit(t);
    case 'work': return poseWork(t);
    case 'rest': return poseRest(t);
    case 'blocked': return poseBlocked(t);
    case 'error': return poseError(t);
    case 'done': return poseDone(t);
    default: return poseIdle(t);
  }
}

/* ---------- look ---------- */

const look = {
  color: new THREE.Color(0x74f3e8),
  core: 1.35, visor: 1.2, glow: 0.5, light: 1.2, rim: 1.9,
};
const tmpColor = new THREE.Color();
const baseRim = new THREE.Color(0x7ef4e9);

const LOOKS = {
  idle: { color: 0x74f3e8, core: 1.35, visor: 1.2, glow: 0.5, light: 1.2, rim: 1.9 },
  walk: { color: 0x6ff1e5, core: 1.3, visor: 1.15, glow: 0.45, light: 1.1, rim: 1.85 },
  watch: { color: 0x8cfff6, core: 1.7, visor: 1.95, glow: 0.65, light: 1.7, rim: 2.0 },
  sit: { color: 0x69e7dd, core: 0.8, visor: 0.6, glow: 0.24, light: 0.6, rim: 1.35 },
  work: { color: 0x7df7ee, core: 1.6, visor: 1.1, glow: 0.55, light: 1.5, rim: 1.8 },
  rest: { color: 0x5fd8d0, core: 0.25, visor: 0.18, glow: 0.04, light: 0.06, rim: 0.7 },
  blocked: { color: 0xffb257, core: 1.5, visor: 1.3, glow: 0.65, light: 1.6, rim: 1.6 },
  error: { color: 0xff5a4c, core: 1.9, visor: 1.6, glow: 0.85, light: 2.2, rim: 1.7 },
  done: { color: 0x9bfff7, core: 2.1, visor: 1.8, glow: 1.0, light: 2.4, rim: 2.1 },
};

function updateLook(dt, t) {
  const target = LOOKS[currentState] || LOOKS.idle;
  const k = 1 - Math.exp(-4 * dt);
  look.color.lerp(tmpColor.setHex(target.color), k);
  look.core = THREE.MathUtils.damp(look.core, target.core, 4, dt);
  look.visor = THREE.MathUtils.damp(look.visor, target.visor, 4, dt);
  look.glow = THREE.MathUtils.damp(look.glow, target.glow, 4, dt);
  look.light = THREE.MathUtils.damp(look.light, target.light, 4, dt);
  look.rim = THREE.MathUtils.damp(look.rim, target.rim, 3, dt);

  let pulse = 1;
  if (currentState === 'idle') pulse = 1 + 0.09 * Math.sin(t * 2.1);
  else if (currentState === 'watch') pulse = 1 + 0.05 * Math.sin(t * 3.1);
  else if (currentState === 'rest') pulse = 0.9 + 0.08 * Math.sin(t * 0.62);
  else if (currentState === 'error') pulse = 1 + 0.28 * Math.sin(t * 17) * Math.sin(t * 6.7);
  else if (currentState === 'done') pulse = 1 + 0.12 * Math.sin(t * 2.4);
  else if (currentState === 'work') pulse = 1 + 0.04 * Math.sin(t * 1.7);
  pulse = Math.max(0.25, pulse);

  for (const m of actor.coreMats) {
    m.emissive.copy(look.color);
    m.emissiveIntensity = look.core * pulse;
  }
  actor.visorMat.emissive.copy(look.color);
  actor.visorMat.emissiveIntensity = look.visor * pulse;

  actor.coreGlow.material.color.copy(look.color);
  actor.coreGlow.material.opacity = Math.min(1, look.glow * pulse);
  actor.visorGlow.material.color.copy(look.color);
  actor.visorGlow.material.opacity = Math.min(1, look.visor * 0.16 * pulse);

  actor.coreLight.color.copy(look.color);
  actor.coreLight.intensity = look.light * pulse;

  rim.color.copy(baseRim).lerp(look.color, 0.55);
  rim.intensity = look.rim;
  kick.intensity = currentState === 'error' ? 1.2 : 0.7;
}

/* ---------- movement ---------- */

const dampAngle = (a, b, lambda, dt) => {
  const delta = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + delta * (1 - Math.exp(-lambda * dt));
};

function updateMovement(dt) {
  timeInState += dt;
  let moving = false;
  let targetSpeed = 0;
  let yawTarget = actor.root.rotation.y;

  if (currentState === 'walk') {
    mode = 'patrol';
    const speed = 0.52;
    actor.root.position.x += patrolDir * speed * dt;
    if (actor.root.position.x > 0.72) { actor.root.position.x = 0.72; patrolDir = -1; }
    if (actor.root.position.x < -1.05) { actor.root.position.x = -1.05; patrolDir = 1; }
    actor.root.position.z += (0.62 - actor.root.position.z) * (1 - Math.exp(-3 * dt));
    yawTarget = patrolDir > 0 ? Math.PI / 2 : -Math.PI / 2;
    moving = true;
    targetSpeed = speed;
  } else {
    const st = station;
    const dx = st.x - actor.root.position.x;
    const dz = st.z - actor.root.position.z;
    const d = Math.hypot(dx, dz);

    if (mode === 'travelling') {
      const arrive = (currentState === 'sit' || currentState === 'rest') ? 0.24 : 0.07;
      if (d > arrive) {
        const speed = THREE.MathUtils.clamp(d * 2.0, 0.4, 1.1);
        const step = Math.min(d, speed * dt);
        actor.root.position.x += (dx / d) * step;
        actor.root.position.z += (dz / d) * step;
        yawTarget = d > 0.34 ? Math.atan2(dx, dz) : st.yaw;
        moving = true;
        targetSpeed = speed;
      } else {
        mode = 'atStation';
      }
    }

    if (mode === 'atStation') {
      const settle = 1 - Math.exp(-3.6 * dt);
      actor.root.position.x += (st.x - actor.root.position.x) * settle;
      actor.root.position.z += (st.z - actor.root.position.z) * settle;
      yawTarget = st.yaw;
    }
  }

  actor.root.rotation.y = dampAngle(actor.root.rotation.y, yawTarget, mode === 'atStation' ? 4 : 8, dt);
  visualSpeed += (targetSpeed - visualSpeed) * (1 - Math.exp(-5 * dt));
  if (moving) walkPhase += visualSpeed * 6.7 * dt;

  const walking = currentState === 'walk' || (mode === 'travelling' && visualSpeed > 0.06);
  walkWeight += ((walking ? 1 : 0) - walkWeight) * (1 - Math.exp(-6 * dt));
  return { moving, targetSpeed };
}

/* ---------- apply pose ---------- */

function composePose(t) {
  const base = statePose(currentState, t);
  const stride = poseWalk(t, walkPhase);
  const w = THREE.MathUtils.clamp(walkWeight, 0, 1);

  for (const key in poseTarget) {
    poseTarget[key] = base[key] + (stride[key] - base[key]) * w;
  }

  const lambda = 15;
  for (const key in poseCurrent) {
    const rate = key === 'hipY' ? 6.5 : lambda;
    poseCurrent[key] = THREE.MathUtils.damp(poseCurrent[key], poseTarget[key], rate, dtGlobal);
  }

  const r = actor;
  r.hips.position.y = poseCurrent.hipY;
  r.hips.rotation.z = poseCurrent.hipRotZ;
  r.hips.rotation.y = poseCurrent.hipRotY;
  r.torso.rotation.set(poseCurrent.torsoX, poseCurrent.torsoY, poseCurrent.torsoZ);
  r.head.rotation.set(poseCurrent.headX, poseCurrent.headY, poseCurrent.headZ);

  r.legs.L.hip.rotation.set(poseCurrent.lHipX, poseCurrent.lHipY, poseCurrent.lHipZ);
  r.legs.R.hip.rotation.set(poseCurrent.rHipX, poseCurrent.rHipY, poseCurrent.rHipZ);
  r.legs.L.knee.rotation.x = poseCurrent.lKneeX;
  r.legs.R.knee.rotation.x = poseCurrent.rKneeX;
  r.legs.L.ankle.rotation.x = poseCurrent.lAnkleX;
  r.legs.R.ankle.rotation.x = poseCurrent.rAnkleX;

  r.arms.L.shoulder.rotation.set(poseCurrent.lShoulderX, poseCurrent.lShoulderY, poseCurrent.lShoulderZ);
  r.arms.R.shoulder.rotation.set(poseCurrent.rShoulderX, poseCurrent.rShoulderY, poseCurrent.rShoulderZ);
  r.arms.L.elbow.rotation.x = poseCurrent.lElbowX;
  r.arms.R.elbow.rotation.x = poseCurrent.rElbowX;
}

/* ---------- UI ---------- */

const ui = {
  label: document.getElementById('stateLabel'),
  note: document.getElementById('stateNote'),
  core: document.getElementById('coreValue'),
  buttons: Array.from(document.querySelectorAll('.state-btn')),
};

function renderUI() {
  const s = STATES[currentState];
  bay.dataset.tone = s.tone;
  ui.label.textContent = s.label;
  ui.note.textContent = s.note;
  ui.core.textContent = s.core + '%';
  for (const b of ui.buttons) {
    const on = b.dataset.state === currentState;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  if (!reduceMotion) {
    ui.label.animate(
      [{ opacity: 0.25, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 240, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
    );
    ui.note.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 300, easing: 'ease-out' }
    );
  }
}

function setState(next) {
  if (!STATES[next] || next === currentState) return;
  currentState = next;
  timeInState = 0;
  station = STATES[next].station || STATES.idle.station;
  mode = next === 'walk' ? 'patrol' : 'travelling';
  if (next !== 'walk') {
    const d = Math.hypot(station.x - actor.root.position.x, station.z - actor.root.position.z);
    if (d < 0.07) mode = 'atStation';
  }
  hologram.setMode(STATES[next].panel);
  renderUI();
}

for (const b of ui.buttons) {
  b.addEventListener('click', () => setState(b.dataset.state));
}

view.addEventListener('pointermove', (e) => {
  const r = view.getBoundingClientRect();
  pointerX = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
  pointerY = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
});
view.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });

/* ---------- layout and render ---------- */

let dtGlobal = 0.016;
let last = performance.now();

function fitCamera() {
  const w = view.clientWidth;
  const h = view.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;

  const vFov = (camera.fov * Math.PI) / 180;
  const halfTan = Math.tan(vFov / 2);
  const distV = 1.72 / halfTan;
  const distH = 1.86 / (halfTan * camera.aspect);
  const dist = Math.max(distV, distH, 5.0);

  if (!userOrbited) {
    const dir = new THREE.Vector3(1.24, 0.66, 5.35).normalize();
    camera.position.copy(controls.target).addScaledVector(dir, dist);
    camera.lookAt(controls.target);
    controls.update();
  }
  camera.updateProjectionMatrix();
}

new ResizeObserver(fitCamera).observe(view);
fitCamera();

actor.root.position.set(STATES.idle.station.x, 0, STATES.idle.station.z);
actor.root.rotation.y = STATES.idle.station.yaw;
renderUI();

function update(dt, t) {
  dtGlobal = dt;
  updateMovement(dt);
  composePose(t);
  updateLook(dt, t);
  hologram.setMode(STATES[currentState].panel);
  hologram.update(dt, t, PANEL_POS[STATES[currentState].panel] || PANEL_POS.work);
}

let firstFrame = true;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
  last = now;
  const t = now / 1000;

  update(dt, t);
  renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    window.__vigilReady = true;
    bay.classList.add('is-ready');
  }
}

document.addEventListener('visibilitychange', () => {
  last = performance.now();
});

window.__vigilSetState = setState;
window.__vigil = { setState, actor, camera, controls, states: Object.keys(STATES) };

requestAnimationFrame(frame);

