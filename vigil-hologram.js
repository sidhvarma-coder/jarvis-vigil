import * as THREE from 'three';

const CONTENT = {
  work: {
    tone: '#8ffbf1',
    dim: '#4e8c87',
    kicker: 'Active task',
    title: 'Jarvis Dashboard',
    line: 'Building the dashboard shell.',
    checks: '3 of 8 checks',
    progress: 0.38,
    leftLabel: 'Worker',
    leftValue: 'OpenCode',
    rightLabel: 'Checkpoint',
    rightValue: '2 min ago',
    clock: '21:04',
  },
  blocked: {
    tone: '#ffc06a',
    dim: '#8b6b3f',
    kicker: 'Approval needed',
    title: 'Waiting on you',
    line: 'Nothing has been changed yet.',
    checks: 'Paused at step 4',
    progress: 0.5,
    leftLabel: 'Message sent',
    leftValue: 'Telegram · 2 min ago',
    rightLabel: 'Next action',
    rightValue: 'Reply approve',
    clock: '21:06',
  },
  error: {
    tone: '#ff7c6e',
    dim: '#8f4b44',
    kicker: 'Step failed',
    title: 'Checkpoint saved',
    line: 'The worker stopped cleanly. Ready to retry.',
    checks: 'Resume at step 4',
    progress: 0.44,
    leftLabel: 'Worker',
    leftValue: 'Freebuff',
    rightLabel: 'Last save',
    rightValue: 'Just now',
    clock: '21:07',
  },
  done: {
    tone: '#a9fff7',
    dim: '#578f8b',
    kicker: 'Build verified',
    title: 'Jarvis Dashboard',
    line: 'All checks passed. Waiting for your sign-off.',
    checks: '8 of 8 checks',
    progress: 1,
    leftLabel: 'Worker',
    leftValue: 'OpenCode',
    rightLabel: 'Duration',
    rightValue: '41 min',
    clock: '21:45',
  },
};

const W = 1024;
const H = 660;

function draw(canvas, data) {
  const ctx = canvas.getContext('2d');
  const tone = data ? data.tone : '#8ffbf1';
  const dim = data ? data.dim : '#4e8c87';

  ctx.clearRect(0, 0, W, H);

  // translucent screen
  ctx.fillStyle = 'rgba(4, 18, 17, 0.82)';
  ctx.fillRect(0, 0, W, H);

  if (!data) return;

  // frame
  ctx.strokeStyle = 'rgba(143, 251, 241, 0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // left signal bar
  ctx.fillStyle = tone;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(20, 20, 7, 120);
  ctx.globalAlpha = 1;

  // scanlines
  ctx.fillStyle = 'rgba(170, 255, 248, 0.028)';
  for (let y = 22; y < H - 22; y += 5) ctx.fillRect(22, y, W - 44, 1);

  // top line
  ctx.fillStyle = dim;
  ctx.beginPath();
  ctx.arc(62, 62, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '500 21px Archivo, Arial, sans-serif';
  ctx.fillStyle = dim;
  ctx.fillText('JARVIS / DESKTOP', 82, 70);
  ctx.textAlign = 'right';
  ctx.fillText(data.clock, W - 58, 70);
  ctx.textAlign = 'left';

  // kicker
  ctx.font = '600 24px Archivo, Arial, sans-serif';
  ctx.fillStyle = tone;
  ctx.fillText(data.kicker, 58, 168);

  // title
  ctx.font = '700 55px Archivo, Arial, sans-serif';
  ctx.fillStyle = '#eefaf6';
  ctx.fillText(data.title, 58, 236);

  // body
  ctx.font = '400 24px Archivo, Arial, sans-serif';
  ctx.fillStyle = 'rgba(207, 231, 226, 0.72)';
  ctx.fillText(data.line, 58, 286);

  // progress
  const barY = 352;
  ctx.fillStyle = 'rgba(180, 255, 247, 0.12)';
  ctx.fillRect(58, barY, W - 116, 9);
  ctx.save();
  ctx.shadowColor = tone;
  ctx.shadowBlur = 16;
  ctx.fillStyle = tone;
  ctx.fillRect(58, barY, (W - 116) * data.progress, 9);
  ctx.restore();

  ctx.font = '500 21px Archivo, Arial, sans-serif';
  ctx.fillStyle = tone;
  ctx.textAlign = 'right';
  ctx.fillText(data.checks, W - 58, barY + 44);
  ctx.textAlign = 'left';

  // divider block, not a hairline
  ctx.fillStyle = 'rgba(180, 255, 247, 0.07)';
  ctx.fillRect(58, 420, W - 116, 3);

  // footer columns
  const columns = [
    [data.leftLabel, data.leftValue],
    [data.rightLabel, data.rightValue],
  ];
  columns.forEach(([label, value], i) => {
    const x = 58 + i * 460;
    ctx.font = '500 19px Archivo, Arial, sans-serif';
    ctx.fillStyle = dim;
    ctx.fillText(label, x, 486);
    ctx.font = '500 23px Archivo, Arial, sans-serif';
    ctx.fillStyle = 'rgba(232, 248, 244, 0.9)';
    ctx.fillText(value, x, 522);
  });

  // status strip at the bottom
  ctx.fillStyle = 'rgba(180, 255, 247, 0.06)';
  ctx.fillRect(20, H - 84, W - 40, 64);
  ctx.font = '500 20px Archivo, Arial, sans-serif';
  ctx.fillStyle = dim;
  ctx.fillText('VIGIL / CORE LINK SECURE', 58, H - 46);

  const pulse = Math.sin(Date.now() / 380) * 0.5 + 0.5;
  ctx.fillStyle = tone;
  ctx.globalAlpha = 0.45 + pulse * 0.5;
  ctx.beginPath();
  ctx.arc(W - 76, H - 52, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function createHologram(scene, camera) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    toneMapped: false,
  });

  const group = new THREE.Group();
  group.position.set(0.96, 1.36, 0.4);
  group.visible = false;
  scene.add(group);

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.63), material);
  group.add(plane);

  let mode = null;
  let opacity = 0;
  let changedAt = 0;
  let currentTarget = new THREE.Vector3(0.96, 1.36, 0.4);

  function setMode(next) {
    if (next === mode) return;
    mode = next;
    if (next) {
      draw(canvas, CONTENT[next]);
      texture.needsUpdate = true;
      changedAt = performance.now();
    }
  }

  function update(dt, t, targetPos) {
    const target = mode ? 0.93 : 0;
    opacity += (target - opacity) * (1 - Math.exp(-8 * dt));
    material.opacity = opacity;

    if (opacity < 0.015) {
      group.visible = false;
      return;
    }
    group.visible = true;

    currentTarget.lerp(targetPos, 1 - Math.exp(-3.5 * dt));
    group.position.set(currentTarget.x, currentTarget.y + Math.sin(t * 1.25) * 0.008, currentTarget.z);
    group.lookAt(camera.position);
    group.rotateZ(0.012);

    const flickerAge = performance.now() - changedAt;
    const flicker = flickerAge < 260 ? 0.85 + Math.random() * 0.15 : 1;
    material.opacity = opacity * flicker;
    group.scale.setScalar(0.965 + opacity * 0.035);
  }

  draw(canvas, null);

  return { group, setMode, update, material };
}
