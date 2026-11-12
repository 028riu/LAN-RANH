import * as pc from 'playcanvas';
import './styles.css';
import { createWorld } from './world/createWorld.js';
import { buildCharacter } from './player/characterMesh.js';
import { createPlayer } from './player/createPlayer.js';
import { createCamera } from './camera/createCamera.js';
import { createPointerLock } from './input/pointerLock.js';
import { bindMainMenu } from './ui/mainMenu.js';
import { bindPauseMenu } from './ui/pauseMenu.js';
import { bindHud } from './ui/hud.js';
import { createIslandConnection } from './world/systems/islandConnectionSystem.js';
import { WORLD_CONFIG } from './world/worldConfig.js';

// --- Bootstrap ---
const canvas = document.querySelector('#game-canvas');
const loadingScreen = document.querySelector('#loading-screen');

const app = new pc.Application(canvas, {
  graphicsDeviceOptions: { antialias: true, alpha: false, powerPreference: 'high-performance' },
  mouse: new pc.Mouse(canvas),
  keyboard: new pc.Keyboard(window)
});

app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.scene.exposure = 1.18;
app.scene.gammaCorrection = pc.GAMMA_SRGB;
app.scene.toneMapping = pc.TONEMAP_ACES;

// --- Build world + character + camera ---
const world = createWorld(app);
const character = buildCharacter(app);
const player = createPlayer(app, character, world);
const camera = createCamera(app, world);
camera.setInitial(player.state.position);

// --- HUD + travel ---
const hud = bindHud(app, player, world);

// --- Input state ---
const held = new Set();
const input = () => ({
  forward: held.has('w') || held.has('arrowup'),
  backward: held.has('s') || held.has('arrowdown'),
  left: held.has('a') || held.has('arrowleft'),
  right: held.has('d') || held.has('arrowright'),
  sprint: held.has('shift'),
  jump: held.has(' ')
});

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  held.add(key);
  // Free-fly inspection mode: F toggles it without opening the pause menu.
  if (key === 'f' && (gameState === 'playing' || gameState === 'fly')) {
    if (gameState === 'fly') exitFlyMode();
    else enterFlyMode();
    return;
  }
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    event.preventDefault();
  }
  // Interact (sail) — only while playing and pointer locked
  if (key === 'e' && gameState === 'playing' && pointerLock.isLocked()) {
    travel.handleInteractKey();
  }
  // ESC while the travel menu is open closes it and re-locks
  if (key === 'escape' && travel.menuOpen) {
    travel.closeMenu();
  }
});
window.addEventListener('keyup', (event) => held.delete(event.key.toLowerCase()));
window.addEventListener('blur', () => held.clear());

// --- Pointer lock + game state machine ---
// Camera orbit state. PITCH SEMANTICS (fixed in V2):
//   pitch = camera elevation ABOVE the target.
//   mouse up  (movementY < 0) → pitch DECREASES → camera sinks → looks UP
//   mouse down (movementY > 0) → pitch INCREASES → camera rises → looks DOWN
let cameraYaw = 0;
let cameraPitch = 0.15;
let gameState = 'menu'; // 'menu' | 'playing' | 'paused' | 'travel' | 'fly'
let elapsedTime = 0;

const pointerLock = createPointerLock(canvas);
const camCfg = WORLD_CONFIG.camera;

function startGame() {
  mainMenu.hide();
  hud.showHud();
  hud.hidePrompt();
  pointerLock.request();
}

function pauseGame() {
  if (gameState !== 'playing') return;
  gameState = 'paused';
  pauseMenu.show();
  hud.hidePrompt();
}

function resumeGame() {
  pauseMenu.hide();
  hud.hidePrompt();
  pointerLock.request();
}

function restartGame() {
  player.respawn();
  camera.setInitial(player.state.position);
  cameraYaw = 0;
  cameraPitch = 0.15;
  pauseMenu.hide();
  hud.hidePrompt();
  pointerLock.request();
}

pointerLock.on('locked', () => {
  // Keep the inspection state when the mouse is captured for camera look.
  if (gameState !== 'fly') gameState = 'playing';
  mainMenu.hide();
  pauseMenu.hide();
  hud.showHud();
  hud.hidePrompt();
});

pointerLock.on('unlocked', () => {
  if (gameState === 'playing') {
    pauseGame();
  } else if (gameState === 'paused') {
    hud.showPrompt();
    promptClickable();
  }
  // In fly mode, ESC only releases the mouse; flight remains active.
  // 'travel' and 'menu' states handle their own UI — no pause prompt.
});

pointerLock.on('error', () => {
  if (gameState === 'playing' || gameState === 'paused') {
    hud.showPrompt();
    promptClickable();
  }
});

const promptEl = document.querySelector('#pointer-prompt');

function promptClickable() {
  promptEl.onclick = () => {
    pointerLock.request();
  };
}

// --- Free-fly inspection mode (for world / asset design) ---
const flyPanel = document.querySelector('#fly-panel');
const flySpeedInput = document.querySelector('#fly-speed');
const flySpeedValue = document.querySelector('#fly-speed-value');
const flyMouseButton = document.querySelector('#fly-mouse-button');
const flyExitButton = document.querySelector('#fly-exit-button');
let flySpeed = 18;

function syncFlySpeed() {
  flySpeed = Number(flySpeedInput.value) || 18;
  flySpeedValue.textContent = flySpeed.toFixed(0) + ' u/s';
}
flySpeedInput.addEventListener('input', syncFlySpeed);

function enterFlyMode() {
  if (gameState !== 'playing') return;
  gameState = 'fly';
  hud.showHud();
  hud.hidePrompt();
  flyPanel.classList.remove('hidden');
  pointerLock.exit(); // release cursor so the speed slider is usable
  player.state.horizontal.set(0, 0, 0);
  player.state.vertical = 0;
  hud.showToast('FREE FLY ENABLED — F: exit flight', 2600);
}

function exitFlyMode() {
  if (gameState !== 'fly') return;
  gameState = 'playing';
  flyPanel.classList.add('hidden');
  player.state.horizontal.set(0, 0, 0);
  player.state.vertical = 0;
  pointerLock.request();
  hud.showToast('Free Fly disabled', 1800);
}

flyMouseButton.addEventListener('click', () => {
  if (gameState === 'fly') pointerLock.request();
});
flyExitButton.addEventListener('click', exitFlyMode);

// Start directly in inspection flight from the title screen.
const designFlyButton = document.querySelector('#design-fly-button');
designFlyButton.addEventListener('click', () => {
  if (gameState !== 'menu') return;
  player.respawn();
  camera.setInitial(player.state.position);
  cameraYaw = 0;
  cameraPitch = 0.15;
  mainMenu.hide();
  hud.showHud();
  hud.hidePrompt();
  gameState = 'fly';
  flyPanel.classList.remove('hidden');
  syncFlySpeed();
  hud.showToast('DESIGN FLY — WASD move · Space up · Ctrl down · F exit', 3600);
});

function updateFly(dt) {
  const i = input();
  const yaw = cameraYaw;
  const pitch = cameraPitch;
  const forward = new pc.Vec3(-Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch));
  const right = new pc.Vec3(Math.cos(yaw), 0, -Math.sin(yaw));
  const move = new pc.Vec3();
  if (i.forward) move.add(forward);
  if (i.backward) move.sub(forward);
  if (i.right) move.add(right);
  if (i.left) move.sub(right);
  if (i.jump) move.y += 1;
  if (held.has('control') || held.has('c')) move.y -= 1;
  if (move.lengthSq() > 0) move.normalize();
  const multiplier = i.sprint ? 3 : 1;
  const p = player.state.position;
  p.x += move.x * flySpeed * multiplier * dt;
  p.y += move.y * flySpeed * multiplier * dt;
  p.z += move.z * flySpeed * multiplier * dt;
  player.entity.setLocalPosition(p);
  player.state.horizontal.set(0, 0, 0);
  player.state.vertical = 0;
  camera.update(dt, player.entity, cameraYaw, cameraPitch);
}

const mainMenu = bindMainMenu(startGame);
const pauseMenu = bindPauseMenu(resumeGame, restartGame);

// --- Island travel (boats) ---
const travel = createIslandConnection(world, hud, {
  onMenuOpen() {
    gameState = 'travel';
    pointerLock.exit(); // free the cursor so destinations are clickable
  },
  onMenuClose() {
    if (gameState === 'travel') {
      pointerLock.request();
    }
  }
});
world.onTravelArrive = (x, y, z, yaw) => {
  player.teleport(x, y, z, yaw);
  camera.setInitial(player.state.position);
  cameraYaw = 0;
  cameraPitch = 0.15;
};

// --- Per-frame update ---
app.on('update', (dt) => {
  elapsedTime += dt;

  world.followSky(camera.entity);
  world.updateOcean(dt, elapsedTime);
  world.updateDetail(camera.getPosition());

  if (pointerLock.isLocked() && (gameState === 'playing' || gameState === 'fly')) {
    const m = pointerLock.consumeMovement();
    const sens = camCfg.sensitivity;
    // Mouse right (m.x > 0) → yaw decreases → view turns right (verified).
    cameraYaw -= m.x * sens;
    // Mouse up (m.y < 0) → pitch decreases → camera lowers → view looks up.
    cameraPitch = pc.math.clamp(cameraPitch + m.y * sens, camCfg.minPitch, camCfg.maxPitch);
  }

  if (gameState === 'playing') {
    const i = input();
    player.update(dt, i, cameraYaw);
    camera.update(dt, player.entity, cameraYaw, cameraPitch);
    travel.update(player.entity.getLocalPosition());
  } else if (gameState === 'fly') {
    updateFly(dt);
  } else {
    camera.update(0.0, player.entity, cameraYaw, cameraPitch);
  }
});

window.addEventListener('resize', () => app.resizeCanvas());

// --- Start ---
app.start();
loadingScreen.classList.add('is-hidden');
mainMenu.show();
hud.showToast('Welcome to the ZRT Archipelago — 5 islands to explore', 3400);

// Expose for debugging / automated checks (does not affect production builds)
if (typeof window !== 'undefined') {
  window.__FZ = {
    app, world, player, camera, character, pointerLock, travel,
    getCamYaw: () => cameraYaw,
    getCamPitch: () => cameraPitch,
    setCamYaw: (v) => { cameraYaw = v; },
    setCamPitch: (v) => { cameraPitch = v; }
  };
}

export { app, world, player, camera };
