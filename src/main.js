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
let gameState = 'menu'; // 'menu' | 'playing' | 'paused' | 'travel'
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
  gameState = 'playing';
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

  if (pointerLock.isLocked() && gameState === 'playing') {
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
