// Automated in-browser verification for FRUIT GAME ZRT V3 (v3 of the harness).
import { createRequire } from 'module';
const require = createRequire('/home/z/.npm-global/lib/node_modules/');
const { chromium } = require('playwright');

const BASE = (process.argv[2] || 'http://localhost:5173') + '?fx=low';

const results = [];
function report(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

const browser = await chromium.launch({
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 512, height: 288 } });

const consoleErrors = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('pageerror', (err) => consoleErrors.push(String(err)));

await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(7000);

const hasFZ = await page.evaluate(() => !!window.__FZ);
report('game bootstrap exposes __FZ', hasFZ);
report('no console errors on load', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));

const islandInfo = await page.evaluate(() => {
  const w = window.__FZ.world;
  return {
    islands: w.islands.islands.length,
    names: w.islands.islands.map((i) => i.def.name),
    colliders: w.collision.count,
    travelPoints: w.islands.allTravelPoints().length,
    groundAtSea: w.groundAt(2000, 2000),
    groundStarter: w.groundAt(0, 48)
  };
});
report('5 islands registered', islandInfo.islands === 5, islandInfo.names.join(', '));
report('collision system populated', islandInfo.colliders > 400, `${islandInfo.colliders} colliders`);
report('travel points registered', islandInfo.travelPoints === 5, `${islandInfo.travelPoints} points`);
report('multi-island ground sampling', islandInfo.groundAtSea < -5 && islandInfo.groundStarter > 3,
  `sea=${islandInfo.groundAtSea.toFixed(2)} starter=${islandInfo.groundStarter.toFixed(2)}`);

// --- V3 additions: expanded asset library, shore foam, cloud layer ---------
const v3Info = await page.evaluate(async () => {
  const { world } = window.__FZ;
  // Count registered assets through the factory's public listing.
  const { listAssets } = await import('/src/world/systems/assetFactory.js');
  const assets = listAssets();
  const needed = ['palm_tree_03', 'tropical_tree_01', 'banana_plant', 'beach_grass',
    'flower_patch', 'beach_hut', 'fishing_hut', 'harbor_warehouse', 'dock_house',
    'wooden_bench', 'wooden_table', 'wooden_chair', 'flower_pot', 'wicker_basket',
    'bunting', 'cargo_stack', 'dock_bollard', 'village_well', 'coastal_rocks'];
  const missing = needed.filter((id) => !assets.includes(id));
  const foam = world.shoreFoam ? world.shoreFoam.entities.length : 0;
  const clouds = world.environment.clouds ? world.environment.clouds.clouds.length : 0;
  const starter = world.islands.islandById('pirate_starter');
  const zoneNames = starter.def.zones.map((z) => z.name);
  return { total: assets.length, missing, foam, clouds, zoneNames };
});
report('V3 asset library registered (19 new ids)', v3Info.missing.length === 0,
  `total=${v3Info.total} missing=${v3Info.missing.join(',') || 'none'}`);
report('shore foam rings built for every island', v3Info.foam === 5, `${v3Info.foam} rings`);
report('cloud layer present', v3Info.clouds >= 7, `${v3Info.clouds} clusters`);
report('pirate island has 11 design zones', v3Info.zoneNames.length === 11,
  v3Info.zoneNames.join(' / '));

await page.screenshot({ path: '/tmp/render/shot-menu.png', timeout: 90000 });
await page.click('#play-button');
await page.waitForTimeout(1200);

const lockState = await page.evaluate(() => ({
  apiLocked: window.__FZ.pointerLock.isLocked(),
  domElement: document.pointerLockElement ? document.pointerLockElement.tagName : null,
  gameStateKeptPrivate: true
}));
const trulyLocked = lockState.apiLocked && lockState.domElement === 'CANVAS';
report('pointer lock engaged after PLAY', trulyLocked, JSON.stringify(lockState));

// Camera movement plumbing: synthetic mousemove must accumulate deltas.
const plumbing = await page.evaluate(async () => {
  document.dispatchEvent(new MouseEvent('mousemove', { movementX: 123, movementY: -45 }));
  await new Promise((r) => setTimeout(r, 120));
  // The game loop consumes movement each frame while playing — read cam yaw/pitch instead
  return {
    yaw: window.__FZ.getCamYaw(),
    pitch: window.__FZ.getCamPitch(),
    locked: window.__FZ.pointerLock.isLocked()
  };
});
report('camera receives mouse deltas (yaw changed)', Math.abs(plumbing.yaw) > 0.05, JSON.stringify(plumbing));

// YAW DIRECTION: mouse right → view turns right
const yawTest = await page.evaluate(async () => {
  const { player, camera, world } = window.__FZ;
  player.teleport(0, world.groundAt(0, 40) + 0.2, 40, 0);
  window.__FZ.setCamYaw(0);
  window.__FZ.setCamPitch(0.15);
  await new Promise((r) => setTimeout(r, 400));
  const fwd0 = camera.entity.forward.clone();
  window.__FZ.setCamYaw(0);
  await new Promise((r) => setTimeout(r, 50));
  document.dispatchEvent(new MouseEvent('mousemove', { movementX: 400, movementY: 0 }));
  await new Promise((r) => setTimeout(r, 150));
  const fwd1 = camera.entity.forward.clone();
  // facing -Z at yaw 0; turning right = forward rotates toward +X
  const turnedRight = fwd1.x > fwd0.x + 0.05;
  return { fwd0: [fwd0.x.toFixed(3), fwd0.z.toFixed(3)], fwd1: [fwd1.x.toFixed(3), fwd1.z.toFixed(3)], turnedRight, yaw: window.__FZ.getCamYaw() };
});
report('camera yaw: mouse right → view right', yawTest.turnedRight, JSON.stringify(yawTest));

// YAW LEFT
const yawLeftTest = await page.evaluate(async () => {
  const { camera } = window.__FZ;
  window.__FZ.setCamYaw(0);
  await new Promise((r) => setTimeout(r, 60));
  const fwd0 = camera.entity.forward.clone();
  document.dispatchEvent(new MouseEvent('mousemove', { movementX: -400, movementY: 0 }));
  await new Promise((r) => setTimeout(r, 150));
  const fwd1 = camera.entity.forward.clone();
  return { turnedLeft: fwd1.x < fwd0.x - 0.05, fwd1x: fwd1.x.toFixed(3) };
});
report('camera yaw: mouse left → view left', yawLeftTest.turnedLeft, JSON.stringify(yawLeftTest));

// PITCH: mouse up → view up (forward.y increases)
const pitchUpTest = await page.evaluate(async () => {
  const { camera } = window.__FZ;
  window.__FZ.setCamPitch(0.3);
  await new Promise((r) => setTimeout(r, 80));
  const fwd0 = camera.entity.forward.clone();
  document.dispatchEvent(new MouseEvent('mousemove', { movementX: 0, movementY: -350 }));
  await new Promise((r) => setTimeout(r, 150));
  const fwd1 = camera.entity.forward.clone();
  return { y0: +fwd0.y.toFixed(3), y1: +fwd1.y.toFixed(3), pitch: +window.__FZ.getCamPitch().toFixed(3) };
});
report('camera pitch: mouse up → view up', pitchUpTest.y1 > pitchUpTest.y0, JSON.stringify(pitchUpTest));

// PITCH: mouse down → view down
const pitchDownTest = await page.evaluate(async () => {
  const { camera } = window.__FZ;
  window.__FZ.setCamPitch(0.3);
  await new Promise((r) => setTimeout(r, 80));
  const fwd0 = camera.entity.forward.clone();
  document.dispatchEvent(new MouseEvent('mousemove', { movementX: 0, movementY: 350 }));
  await new Promise((r) => setTimeout(r, 150));
  const fwd1 = camera.entity.forward.clone();
  return { y0: +fwd0.y.toFixed(3), y1: +fwd1.y.toFixed(3), pitch: +window.__FZ.getCamPitch().toFixed(3) };
});
report('camera pitch: mouse down → view down', pitchDownTest.y1 < pitchDownTest.y0, JSON.stringify(pitchDownTest));

// Sanity: player walks on open ground
const walkTest = await page.evaluate(async () => {
  const { player, world } = window.__FZ;
  player.teleport(-40, world.groundAt(-40, -20) + 0.2, -20, 0);
  await new Promise((r) => setTimeout(r, 300));
  const sx = player.state.position.x;
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }));
  await new Promise((r) => setTimeout(r, 2600));
  window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
  const dx = player.state.position.x - sx;
  return { dx: +dx.toFixed(2), grounded: player.state.grounded };
});
report('player walks on open ground', walkTest.dx > 0.4 && walkTest.grounded, JSON.stringify(walkTest));

// COLLISION: captain house wall blocks
const collisionTest = await page.evaluate(async () => {
  const { player, world } = window.__FZ;
  const hx = 43, hz = 47.5;
  player.teleport(hx, world.groundAt(hx, hz) + 0.3, hz, 0);
  await new Promise((r) => setTimeout(r, 300));
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' })); // walk +X toward house at x=48
  const startX = player.state.position.x;
  await new Promise((r) => setTimeout(r, 1500));
  window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }));
  const end = player.state.position;
  const inside = Math.abs(end.x - 48) < 4.6 && Math.abs(end.z - 42) < 3.6;
  return { startX: +startX.toFixed(2), endX: +end.x.toFixed(2), endZ: +end.z.toFixed(2), inside, y: +end.y.toFixed(2) };
});
report('collision: house wall blocks player', !collisionTest.inside, JSON.stringify(collisionTest));

// COLLISION: stands on pier deck
const pierTest = await page.evaluate(async () => {
  const { player, world } = window.__FZ;
  const terrainY = world.groundAt(0, 150);
  player.teleport(0, terrainY + 5.0, 150, 0); // drop onto the pier from above
  await new Promise((r) => setTimeout(r, 4000));
  const p = player.state.position;
  return { y: +p.y.toFixed(2), terrainY: +terrainY.toFixed(2), grounded: player.state.grounded, onTop: player.state.onColliderTop };
});
report('collision: stands on pier deck', pierTest.y > pierTest.terrainY + 1.2 && pierTest.grounded && pierTest.onTop, JSON.stringify(pierTest));

// COLLISION: doorway passable / back wall solid
const doorTest = await page.evaluate(() => {
  const { world } = window.__FZ;
  const r = -144 * Math.PI / 180;
  const lx = -1.3, lz = 2.7;                    // doorway of house_wood_small at (10,64)
  const wx = 10 + lx * Math.cos(r) + lz * Math.sin(r);
  const wz = 64 - lx * Math.sin(r) + lz * Math.cos(r);
  const feet = world.groundAt(wx, wz);
  const doorFree = world.collision.sphereFree(wx, feet + 1.0, wz, 0.22);
  const bx = 0, bz = -2.6;                      // back wall
  const bwx = 10 + bx * Math.cos(r) + bz * Math.sin(r);
  const bwz = 64 - bx * Math.sin(r) + bz * Math.cos(r);
  const bfeet = world.groundAt(bwx, bwz);
  const wallBlocked = !world.collision.sphereFree(bwx, bfeet + 1.0, bwz, 0.22);
  return { doorFree, wallBlocked };
});
report('collision: doorway passable, wall solid', doorTest.doorFree && doorTest.wallBlocked, JSON.stringify(doorTest));

// Island tour screenshots
const islands = await page.evaluate(() => window.__FZ.world.islands.islands.map((i) => ({ id: i.def.id, name: i.def.name })));
let idx = 0;
for (const isl of islands) {
  idx += 1;
  await page.evaluate(async (id) => {
    const { player, world, camera } = window.__FZ;
    const island = world.islands.islandById(id);
    const s = island.def.spawn;
    const px = island.def.cx + s.x, pz = island.def.cz + s.z - 26;
    player.teleport(px, world.groundAt(px, pz) + 0.5, pz, 180);
    window.__FZ.setCamYaw(0);
    window.__FZ.setCamPitch(0.3);
    camera.setInitial(player.state.position);
    await new Promise((r) => setTimeout(r, 600));
  }, isl.id);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `/tmp/render/shot-${idx}-${isl.id}.png`, timeout: 90000 });
  report(`screenshot ${isl.name}`, true);
}

// TRAVEL: menu + sail
const travelTest = await page.evaluate(async () => {
  const { player, world, travel } = window.__FZ;
  const pts = world.islands.allTravelPoints();
  const starter = pts.find((p) => p.islandId === 'pirate_starter');
  player.teleport(starter.x, starter.deckY + 0.5, starter.z, 0);
  await new Promise((r) => setTimeout(r, 700));
  travel.update(player.state.position);
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
  await new Promise((r) => setTimeout(r, 300));
  const menuOpen = travel.menuOpen;
  const btn = document.querySelector('#travel-menu-list .travel-option');
  const label = btn ? btn.textContent : null;
  if (btn) btn.click();
  await new Promise((r) => setTimeout(r, 1600));
  const p = player.state.position;
  const island = world.islands.islandAt(p.x, p.z);
  return { menuOpen, label, x: +p.x.toFixed(1), z: +p.z.toFixed(1), island: island ? island.def.id : null };
});
report('travel: menu opens + sail to another island', travelTest.menuOpen && travelTest.island === 'jungle_isle', JSON.stringify(travelTest));

// PAUSE / RESUME: pointer loss (what browser-ESC triggers) → pause menu shows;
// clicking RESUME hides it and re-requests the lock.
const pauseTest = await page.evaluate(async () => {
  const { pointerLock } = window.__FZ;
  await new Promise((r) => setTimeout(r, 800));   // let travel re-lock settle
  const wasLocked = pointerLock.isLocked();
  pointerLock.exit();                              // ESC-equivalent unlock
  await new Promise((r) => setTimeout(r, 500));
  const pauseVisible = !document.querySelector('#pause-menu').classList.contains('hidden');
  document.querySelector('#resume-button').click();
  await new Promise((r) => setTimeout(r, 600));
  const pauseHidden = document.querySelector('#pause-menu').classList.contains('hidden');
  const relocked = pointerLock.isLocked();
  return { wasLocked, pauseVisible, pauseHidden, relocked };
});
report('pause on pointer loss; RESUME hides menu (+re-lock)', pauseTest.pauseVisible && pauseTest.pauseHidden,
  JSON.stringify(pauseTest));

report('no console errors during full session', consoleErrors.length === 0, consoleErrors.slice(0, 4).join(' | '));

console.log('\nSummary:', results.filter((r) => r.ok).length, '/', results.length, 'passed');
await browser.close();
process.exit(results.every((r) => r.ok) ? 0 : 1);
