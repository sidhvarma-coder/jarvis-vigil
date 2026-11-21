import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const MAT = {
  armor: new THREE.MeshStandardMaterial({ color: 0x2b2f33, metalness: 0.82, roughness: 0.34 }),
  armorLight: new THREE.MeshStandardMaterial({ color: 0x3a3f44, metalness: 0.78, roughness: 0.3 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x171a1d, metalness: 0.6, roughness: 0.48 }),
  cloth: new THREE.MeshStandardMaterial({ color: 0x23262a, metalness: 0.12, roughness: 0.88 }),
  red: new THREE.MeshStandardMaterial({ color: 0x762022, metalness: 0.55, roughness: 0.38 }),
  redDark: new THREE.MeshStandardMaterial({ color: 0x4b1517, metalness: 0.42, roughness: 0.52 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xb48749, metalness: 1.0, roughness: 0.28 }),
  sole: new THREE.MeshStandardMaterial({ color: 0x0b0c0d, metalness: 0.1, roughness: 0.92 }),
  core: new THREE.MeshStandardMaterial({
    color: 0x061f1e, emissive: 0x68f3e8, emissiveIntensity: 1.5,
    metalness: 0.3, roughness: 0.22, toneMapped: false,
  }),
  visor: new THREE.MeshStandardMaterial({
    color: 0x061f1e, emissive: 0x7cf7ed, emissiveIntensity: 1.35,
    metalness: 0.45, roughness: 0.2, side: THREE.DoubleSide, toneMapped: false,
  }),
};

const shadow = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

function rbox(w, h, d, r, mat) {
  const rad = Math.max(0.004, Math.min(r, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002));
  return shadow(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, rad), mat));
}

function capsule(r, total, mat) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, total - r * 2), 4, 12), mat);
  return shadow(m);
}

function put(mesh, parent, x = 0, y = 0, z = 0) {
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.22, 'rgba(180,255,250,0.65)');
  g.addColorStop(0.55, 'rgba(70,220,215,0.18)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function buildSentinel() {
  const root = new THREE.Group();
  root.name = 'VIGIL';

  const hips = new THREE.Group();
  hips.position.y = 0.95;
  root.add(hips);

  /* pelvis and belt */
  put(rbox(0.31, 0.17, 0.23, 0.035, MAT.armor), hips, 0, 0.02, 0);
  put(rbox(0.13, 0.11, 0.025, 0.015, MAT.red), hips, 0, 0.005, 0.115);
  put(rbox(0.34, 0.036, 0.245, 0.012, MAT.brass), hips, 0, 0.105, 0);
  put(rbox(0.085, 0.13, 0.19, 0.03, MAT.redDark), hips, -0.165, 0.01, 0.005).rotation.z = 0.1;
  put(rbox(0.085, 0.13, 0.19, 0.03, MAT.redDark), hips, 0.165, 0.01, 0.005).rotation.z = -0.1;

  const torso = new THREE.Group();
  torso.position.y = 0.07;
  hips.add(torso);

  /* waist and chest */
  put(rbox(0.255, 0.15, 0.195, 0.03, MAT.cloth), torso, 0, 0.045, 0);
  put(rbox(0.235, 0.012, 0.2, 0.005, MAT.brass), torso, 0, 0.02, 0);
  put(rbox(0.235, 0.012, 0.2, 0.005, MAT.dark), torso, 0, 0.085, 0);
  put(rbox(0.405, 0.3, 0.26, 0.05, MAT.armor), torso, 0, 0.28, 0);
  put(rbox(0.43, 0.12, 0.255, 0.04, MAT.armorLight), torso, 0, 0.385, -0.002);
  put(rbox(0.3, 0.05, 0.225, 0.018, MAT.dark), torso, 0, 0.44, 0);
  put(rbox(0.275, 0.032, 0.2, 0.01, MAT.brass), torso, 0, 0.462, 0);

  /* chest plate and core */
  put(rbox(0.31, 0.185, 0.035, 0.04, MAT.red), torso, 0, 0.285, 0.142);
  put(rbox(0.24, 0.02, 0.015, 0.005, MAT.brass), torso, 0, 0.365, 0.163);
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.059, 0.011, 10, 32), MAT.brass);
  coreRing.position.set(0, 0.285, 0.171);
  torso.add(coreRing);
  const coreDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.018, 32), MAT.core);
  coreDisc.rotation.x = Math.PI / 2;
  coreDisc.position.set(0, 0.285, 0.172);
  torso.add(coreDisc);
  const coreLens = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.012, 28), MAT.core);
  coreLens.rotation.x = Math.PI / 2;
  coreLens.position.set(0, 0.285, 0.184);
  torso.add(coreLens);

  for (const s of [-1, 1]) {
    put(rbox(0.052, 0.014, 0.012, 0.004, MAT.dark), torso, s * 0.152, 0.23, 0.152);
    put(rbox(0.052, 0.014, 0.012, 0.004, MAT.dark), torso, s * 0.152, 0.26, 0.155);
  }

  /* back pack */
  put(rbox(0.28, 0.23, 0.095, 0.03, MAT.dark), torso, 0, 0.29, -0.162);
  put(rbox(0.19, 0.018, 0.012, 0.005, MAT.brass), torso, 0, 0.21, -0.213);
  put(rbox(0.19, 0.018, 0.012, 0.005, MAT.brass), torso, 0, 0.37, -0.213);

  /* neck */
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.057, 0.067, 0.1, 16), MAT.dark);
  neck.position.y = 0.49;
  torso.add(neck);

  /* head */
  const head = new THREE.Group();
  head.position.y = 0.5;
  torso.add(head);

  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.112, 28, 20), MAT.armor);
  helmet.scale.set(1.0, 1.16, 1.03);
  helmet.position.y = 0.13;
  head.add(shadow(helmet));

  const crown = rbox(0.016, 0.05, 0.15, 0.006, MAT.red);
  crown.position.set(0, 0.253, -0.012);
  crown.rotation.x = 0.12;
  head.add(crown);

  const visor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1185, 0.1185, 0.052, 28, 1, true, -1.18, 2.36),
    MAT.visor
  );
  visor.position.set(0, 0.147, 0.003);
  head.add(visor);

  const brow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1188, 0.1188, 0.012, 28, 1, true, -1.2, 2.4),
    MAT.brass
  );
  brow.position.set(0, 0.179, 0.001);
  head.add(brow);

  const jaw = rbox(0.105, 0.06, 0.07, 0.02, MAT.dark);
  jaw.position.set(0, 0.063, 0.079);
  head.add(jaw);

  for (const s of [-1, 1]) {
    const cheek = rbox(0.028, 0.075, 0.07, 0.012, MAT.red);
    cheek.position.set(s * 0.101, 0.105, 0.057);
    cheek.rotation.y = s * 0.22;
    head.add(cheek);
  }

  /* arms */
  const arms = {};
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    const shoulder = new THREE.Group();
    shoulder.position.set(s * 0.272, 0.4, 0);
    torso.add(shoulder);

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.066, 16, 12), MAT.dark);
    shoulder.add(shadow(ball));

    const pauldron = rbox(0.195, 0.105, 0.215, 0.04, MAT.red);
    pauldron.position.set(s * 0.026, 0.045, 0);
    pauldron.rotation.z = s * -0.14;
    shoulder.add(pauldron);
    const pauldronTrim = rbox(0.11, 0.012, 0.02, 0.004, MAT.brass);
    pauldronTrim.position.set(s * 0.02, 0.098, 0.098);
    shoulder.add(pauldronTrim);

    const upper = capsule(0.05, 0.3, MAT.armor);
    upper.position.y = -0.152;
    shoulder.add(upper);
    const upperBand = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.016, 14), MAT.brass);
    upperBand.position.y = -0.272;
    shoulder.add(upperBand);

    const elbow = new THREE.Group();
    elbow.position.y = -0.302;
    shoulder.add(elbow);
    const elbowCap = new THREE.Mesh(new THREE.SphereGeometry(0.052, 14, 10), MAT.dark);
    elbow.add(shadow(elbowCap));

    const forearm = capsule(0.046, 0.28, MAT.armor);
    forearm.position.y = -0.144;
    elbow.add(forearm);
    const gauntlet = rbox(0.105, 0.225, 0.12, 0.026, MAT.armorLight);
    gauntlet.position.set(0, -0.152, 0.012);
    elbow.add(gauntlet);
    const gauntletPlate = rbox(0.024, 0.18, 0.098, 0.01, MAT.red);
    gauntletPlate.position.set(s * 0.062, -0.15, 0.014);
    elbow.add(gauntletPlate);
    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 14), MAT.brass);
    wrist.position.y = -0.282;
    elbow.add(wrist);

    const hand = rbox(0.076, 0.105, 0.088, 0.022, MAT.dark);
    hand.position.set(0, -0.336, 0.012);
    elbow.add(hand);
    const knuckle = rbox(0.066, 0.022, 0.03, 0.008, MAT.brass);
    knuckle.position.set(0, -0.308, 0.056);
    elbow.add(knuckle);

    arms[side] = { shoulder, elbow, hand };
  }

  /* legs */
  const legs = {};
  for (const side of ['L', 'R']) {
    const s = side === 'L' ? -1 : 1;
    const hip = new THREE.Group();
    hip.position.set(s * 0.112, -0.012, 0);
    hips.add(hip);

    const hipBall = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), MAT.dark);
    hip.add(shadow(hipBall));

    const thigh = capsule(0.074, 0.42, MAT.armor);
    thigh.position.y = -0.21;
    hip.add(thigh);
    const thighPlate = rbox(0.113, 0.2, 0.026, 0.018, MAT.red);
    thighPlate.position.set(0, -0.19, 0.07);
    hip.add(thighPlate);

    const knee = new THREE.Group();
    knee.position.y = -0.42;
    hip.add(knee);
    const kneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.062, 14, 10), MAT.dark);
    knee.add(shadow(kneeCap));
    const kneePad = rbox(0.128, 0.105, 0.11, 0.03, MAT.red);
    kneePad.position.set(0, -0.005, 0.035);
    knee.add(kneePad);

    const shin = capsule(0.06, 0.40, MAT.armor);
    shin.position.y = -0.2;
    knee.add(shin);
    const shinGuard = rbox(0.108, 0.235, 0.045, 0.018, MAT.armorLight);
    shinGuard.position.set(0, -0.195, 0.058);
    knee.add(shinGuard);
    const shinTrim = rbox(0.014, 0.17, 0.012, 0.004, MAT.brass);
    shinTrim.position.set(0, -0.19, 0.084);
    knee.add(shinTrim);

    const ankle = new THREE.Group();
    ankle.position.y = -0.418;
    knee.add(ankle);

    const boot = rbox(0.14, 0.1, 0.255, 0.03, MAT.dark);
    boot.position.set(0, -0.055, 0.05);
    ankle.add(boot);
    const toe = rbox(0.13, 0.056, 0.11, 0.024, MAT.red);
    toe.position.set(0, -0.068, 0.15);
    ankle.add(toe);
    const sole = rbox(0.148, 0.03, 0.275, 0.008, MAT.sole);
    sole.position.set(0, -0.111, 0.055);
    ankle.add(sole);
    const heel = rbox(0.12, 0.05, 0.055, 0.012, MAT.brass);
    heel.position.set(0, -0.072, -0.062);
    ankle.add(heel);

    legs[side] = { hip, knee, ankle };
  }

  /* glow */
  const tex = glowTexture();
  const coreGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, color: 0x7df7ee, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  coreGlow.scale.setScalar(0.42);
  coreGlow.position.set(0, 0.285, 0.2);
  torso.add(coreGlow);

  const visorGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, color: 0x8afaf1, transparent: true, opacity: 0.3,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }));
  visorGlow.scale.setScalar(0.24);
  visorGlow.position.set(0, 0.148, 0.128);
  head.add(visorGlow);

  const coreLight = new THREE.PointLight(0x6ef4e9, 1.25, 1.1, 2);
  coreLight.position.set(0, 0.29, 0.26);
  torso.add(coreLight);

  return {
    root, hips, torso, head,
    arms, legs,
    coreMats: [coreDisc.material, coreLens.material],
    visorMat: MAT.visor,
    coreGlow, visorGlow, coreLight,
    glowTex: tex,
  };
}
