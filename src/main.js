import * as pc from 'playcanvas';
import './styles.css';
import { createWorld } from './world/createWorld.js';
import { createPlayer } from './player/createPlayer.js';
import { createCamera } from './camera/createCamera.js';
import { bindHud } from './ui/hud.js';

const canvas = document.querySelector('#game-canvas');
const loading = document.querySelector('#loading-screen');

const app = new pc.Application(canvas, {
  graphicsDeviceOptions: { antialias: true, alpha: false, powerPreference: 'high-performance' },
  mouse: new pc.Mouse(canvas),
  keyboard: new pc.Keyboard(window)
});

app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.scene.ambientLight = new pc.Color(0.62, 0.68, 0.78);
app.scene.exposure = 1.15;
app.scene.gammaCorrection = pc.GAMMA_SRGB;
app.scene.toneMapping = pc.TONEMAP_ACES;

createWorld(app);
const player = createPlayer(app);
const camera = createCamera(app, player);
bindHud(app, player);

let cameraYaw = 0;
let cameraPitch = -0.18;
let dragging = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('pointerdown', (event) => {
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture?.(event.pointerId);
});
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('pointermove', (event) => {
  if (!dragging || event.pointerType === 'touch') return;
  cameraYaw -= (event.clientX - lastX) * 0.004;
  cameraPitch = pc.math.clamp(cameraPitch - (event.clientY - lastY) * 0.003, -0.65, 0.25);
  lastX = event.clientX;
  lastY = event.clientY;
});

const held = new Set();
window.addEventListener('keydown', (event) => {
  held.add(event.key.toLowerCase());
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key.toLowerCase())) event.preventDefault();
});
window.addEventListener('keyup', (event) => held.delete(event.key.toLowerCase()));
document.querySelectorAll('[data-key]').forEach((button) => {
  const key = button.dataset.key;
  const down = (event) => { event.preventDefault(); held.add(key); };
  const up = (event) => { event.preventDefault(); held.delete(key); };
  button.addEventListener('pointerdown', down);
  button.addEventListener('pointerup', up);
  button.addEventListener('pointerleave', up);
  button.addEventListener('pointercancel', up);
});

app.on('update', (dt) => {
  const input = {
    forward: held.has('w') || held.has('arrowup'),
    backward: held.has('s') || held.has('arrowdown'),
    left: held.has('a') || held.has('arrowleft'),
    right: held.has('d') || held.has('arrowright'),
    sprint: held.has('shift'),
    jump: held.has(' ')
  };
  player.update(dt, input, cameraYaw);
  camera.update(dt, player.entity, cameraYaw, cameraPitch);
});

window.addEventListener('resize', () => app.resizeCanvas());
app.start();
loading.classList.add('is-hidden');
document.querySelector('#toast').classList.add('show');
setTimeout(() => document.querySelector('#toast')?.classList.remove('show'), 3200);
