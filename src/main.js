import * as pc from 'playcanvas';
import '../style.css';
import { buildWorld } from './world.js';
import { createExplorer } from './player.js';

const canvas = document.getElementById('application-canvas');
const loading = document.getElementById('loading-screen');
const startScreen = document.getElementById('start-screen');
const hud = document.getElementById('hud');
const pauseScreen = document.getElementById('pause-screen');
const loadingStatus = document.getElementById('loading-status');
const coords = document.getElementById('coordinates');
const fpsLabel = document.getElementById('fps');
const notice = document.getElementById('notice');

const app = new pc.Application(canvas, {
  graphicsDeviceOptions: { antialias: true, alpha: false, powerPreference: 'high-performance' },
  mouse: new pc.Mouse(canvas),
  keyboard: new pc.Keyboard(window)
});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.scene.ambientLight = new pc.Color(0.48, 0.51, 0.48);
app.scene.gammaCorrection = pc.GAMMA_SRGB;
app.scene.toneMapping = pc.TONEMAP_ACES;
app.scene.exposure = 1.15;
app.scene.skyboxMip = 1;
app.start();

const camera = new pc.Entity('Explorer Camera');
camera.addComponent('camera', {
  clearColor: new pc.Color(0.58, 0.68, 0.72),
  fov: 76,
  nearClip: 0.1,
  farClip: 650,
  frustumCulling: true
});
app.root.addChild(camera);

loadingStatus.textContent = 'ĐANG DỰNG ĐỊA HÌNH...';
buildWorld(app, pc);
const explorer = createExplorer(app, pc, camera, canvas);

let started = false;
let paused = false;
let lastFpsUpdate = 0;
let frames = 0;
let noticeTimer = 0;

function showNotice(message) {
  notice.textContent = message;
  notice.classList.add('show');
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.classList.remove('show'), 2800);
}
function begin() {
  if (started) return;
  started = true;
  loading.classList.add('hidden');
  startScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  canvas.requestPointerLock?.();
  explorer.setActive(true);
  showNotice('Hãy khám phá khu vực và tìm trạm quan sát.');
}
function setPaused(value) {
  paused = value;
  explorer.setActive(!value && started);
  pauseScreen.classList.toggle('hidden', !value);
  if (value && document.pointerLockElement) document.exitPointerLock();
  if (!value) canvas.requestPointerLock?.();
}
document.getElementById('start-button').addEventListener('click', begin);
document.getElementById('resume-button').addEventListener('click', () => setPaused(false));
document.addEventListener('pointerlockchange', () => {
  if (!document.pointerLockElement && started && !paused) setPaused(true);
});
document.addEventListener('keydown', (event) => {
  if (event.code === 'Escape' && started && !paused) setPaused(true);
});
window.addEventListener('resize', () => app.resizeCanvas());

app.on('update', (dt) => {
  if (started && !paused) explorer.update(dt);
  frames++;
  lastFpsUpdate += dt;
  if (lastFpsUpdate >= 0.5) {
    fpsLabel.textContent = Math.round(frames / lastFpsUpdate) + ' FPS';
    frames = 0;
    lastFpsUpdate = 0;
    const p = camera.getPosition();
    coords.textContent = `X ${Math.round(p.x).toString().padStart(3,'0')} · Z ${Math.round(p.z).toString().padStart(3,'0')}`;
  }
});

loading.classList.add('hidden');
startScreen.classList.remove('hidden');
loadingStatus.textContent = 'HOÀN TẤT';
