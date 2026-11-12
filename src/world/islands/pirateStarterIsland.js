// Pirate Starter Island — the full settlement layout (V3 enrichment).
//
// Zones: harbour & arrival pier, village square with the well, market lane,
// captain's terrace, training clearing, palm grove, watchtower hill,
// scenic lookout with a summit deck, hidden cove with a sea cave, the
// coastal row (warehouse / dock house / fishing hut) and the south beach.
//
// Everything here is assembled from the shared asset modules — no
// building or tree geometry is authored in this file.
import { cargoBoat, fishingBoat } from '../../assets/buildings/dockPieces.js';

export function layout(env) {
  const { def } = env;
  const T = def.theme;
  const P = (id, opts) => env.placeAsset(id, { theme: T, ...opts });

  // ------------------------------------------------------------------
  // Harbour + arrival pier
  // ------------------------------------------------------------------
  const dock = def.travelDock;
  const pierResult = P('dock_pier', {
    position: [dock.x, dock.z],
    rotationY: dock.rotationY,
    length: dock.length,
    width: dock.width
  });
  const deckY = (pierResult && pierResult.deckY) || 2.3;

  // Travel boat moored at the sea end + fishing boats alongside
  const rotRad = dock.rotationY * Math.PI / 180;
  const seaX = dock.x - Math.sin(rotRad) * (dock.length / 2 - 4);
  const seaZ = dock.z - Math.cos(rotRad) * (dock.length / 2 - 4);
  cargoBoatIntoBatch(env, seaX + 5.4, seaZ + 1.5, deckY, 24, T);
  fishingBoatIntoBatch(env, dock.x + 6.2, dock.z + 14, deckY, 205, T);
  fishingBoatIntoBatch(env, dock.x - 6.4, dock.z + 4, deckY, 160, T, 1);

  // Quay dressing: bollards with rope runs, cargo stacks staged for loading
  P('dock_bollard', { position: [6.2, 117.5], rotationY: 15 });
  P('dock_bollard', { position: [-6.0, 119.0], rotationY: -10, variant: 1 });
  P('dock_bollard', { position: [-5.2, 125.5], rotationY: 0 });
  P('cargo_stack', { position: [7.4, 112.5], rotationY: 8 });
  P('cargo_stack', { position: [-7.0, 112.0], rotationY: -14, variant: 1 });
  P('wooden_crate', { position: [5.4, dock.z - 16], rotationY: 14 });
  P('wooden_crate', { position: [6.2, dock.z - 15.1], rotationY: -8, variant: 1 });
  P('wooden_barrel', { position: [-5.6, dock.z - 14], variant: 1 });
  P('wooden_barrel', { position: [-4.7, dock.z - 15.2] });
  P('hanging_lantern', { position: [3.4, deckY + 1.9, dock.z - 8], rotationY: 180 });

  // Harbourmaster's dock house beside the pier foot (overlooking the water)
  P('dock_house', { position: [9.5, 106.5], rotationY: -24 });
  P('flower_pot', { position: [7.6, 104.6], variant: 1 });
  P('flower_pot', { position: [11.4, 104.9], variant: 2 });

  // Harbour signpost
  P('signpost', {
    position: [7.5, dock.z - 20], rotationY: 20,
    signs: [
      { text: 'SETTLEMENT', yaw: -30 },
      { text: 'MARKET', yaw: -95 },
      { text: 'LOOKOUT', yaw: 55 }
    ]
  });

  // Travel point: beside the cargo boat on the pier
  env.travelPoints = env.travelPoints || [];
  env.travelPoints.push({
    x: seaX + 3.4, z: seaZ + 0.6, r: 3.6,
    label: 'Sail from Pirate Starter Island',
    islandId: def.id,
    deckY
  });

  // ------------------------------------------------------------------
  // Harbour warehouse — the big cargo building west of the coastal row
  // ------------------------------------------------------------------
  P('harbor_warehouse', { position: [-26, 96], rotationY: -90 });
  P('dock_bollard', { position: [-33.5, 89.5], rotationY: 70, variant: 1 });
  P('cargo_stack', { position: [-33.2, 98.5], rotationY: 12, variant: 2 });
  P('wooden_barrel', { position: [-20.2, 103.5] });
  P('hanging_lantern', { position: [-33.2, 4.1, 92.4], rotationY: 0 });

  // ------------------------------------------------------------------
  // Village square (0, 48) — heart of the settlement
  // ------------------------------------------------------------------
  P('pirate_captain_house', { position: [48, 42], rotationY: -83 });
  P('house_wood_large', { position: [-22, 38], rotationY: 90 });
  P('house_wood_small', { position: [10, 64], rotationY: -144 });
  P('house_wood_small', { position: [-6, 16], rotationY: 12, variant: 1 });
  P('house_stone', { position: [-30, 66], rotationY: 135 });

  // The well anchors the square; campfire and benches around it
  P('village_well', { position: [0, 50] });
  P('campfire', { position: [5.5, 44.5] });
  P('wooden_bench', { position: [-3.6, 46.5], rotationY: 115, length: 2.0 });
  P('wooden_bench', { position: [3.4, 54.5], rotationY: -60, length: 2.0 });
  P('wooden_barrel', { position: [3.2, 49.5] });
  P('wooden_crate', { position: [-3.4, 50], rotationY: 25 });
  P('flower_pot', { position: [-2.9, 55.6], variant: 0 });
  P('flower_pot', { position: [2.2, 55.9], variant: 1 });
  P('flower_patch', { position: [-4.8, 54.2] });
  P('flower_patch', { position: [6.1, 52.8] });

  // Bunting strung across the square, twice, for a festival feel
  P('bunting', { position: [-7.5, 58.5], rotationY: 8, length: 15, height: 3.4 });
  P('bunting', { position: [9.5, 40.5], rotationY: 95, length: 11, height: 3.1 });

  // Training clearing
  P('training_dummy', { position: [48, -48] });
  P('training_dummy', { position: [44, -44], rotationY: 40 });
  P('wooden_crate', { position: [46.5, -52], rotationY: -12 });
  P('wooden_bench', { position: [44.5, -54.5], rotationY: 40, length: 1.9 });

  // Fences around the training clearing (gaps for entry)
  P('wooden_fence', { position: [42, -40], rotationY: 90, length: 7 });
  P('wooden_fence', { position: [54, -40], rotationY: 90, length: 7 });
  P('wooden_fence', { position: [42, -56], rotationY: 90, length: 7 });
  P('wooden_fence', { position: [54, -56], rotationY: 90, length: 7 });

  // Flags along the main paths
  P('flag_decor', { position: [4.5, 52], height: 6 });
  for (const [lx, lz] of [[-2, 66], [3, 78], [-2, 90], [4, 102]]) {
    P('flag_decor', { position: [lx, lz], height: 4.6 });
  }

  // ------------------------------------------------------------------
  // Market lane (-58, 30)
  // ------------------------------------------------------------------
  P('market_stall', { position: [-66, 30], rotationY: 90, variant: 0 });
  P('market_stall', { position: [-58.5, 28], rotationY: 90, variant: 1 });
  P('market_stall', { position: [-51, 30], rotationY: 90, variant: 2 });
  P('weapon_shop', { position: [-40, 24], rotationY: 90 });

  // Market dressing: vendor tables behind the stalls, baskets, chairs,
  // bunting spans between the stall posts
  P('wooden_table', { position: [-63.5, 25.5], rotationY: 90, length: 2.2 });
  P('wooden_table', { position: [-55.8, 23.8], rotationY: 90, length: 2.2 });
  P('wooden_chair', { position: [-63.4, 27.6], rotationY: 95 });
  P('wooden_chair', { position: [-55.7, 25.9], rotationY: 85 });
  P('wicker_basket', { position: [-66.5, 33.8] });
  P('wicker_basket', { position: [-58.9, 32.2], variant: 1 });
  P('wicker_basket', { position: [-51.4, 33.6] });
  P('bunting', { position: [-66, 35.2], rotationY: 4, length: 17, height: 3.3 });
  P('wooden_crate', { position: [-62, 34.5], rotationY: 8 });
  P('wooden_crate', { position: [-61, 35.3], rotationY: -20, variant: 1 });
  P('wooden_barrel', { position: [-55, 34.8] });
  P('wooden_barrel', { position: [-47.5, 27], variant: 1 });
  P('treasure_chest', { position: [-44, 19], rotationY: -70, variant: 1 });
  P('rope_decor', { position: [-58, 36], variant: 0 });
  P('flower_patch', { position: [-46.5, 33.5] });
  P('flower_patch', { position: [-70.5, 25.5] });

  P('signpost', {
    position: [-14, 52], rotationY: -35,
    signs: [
      { text: 'MARKET', yaw: -60 },
      { text: 'PALM GROVE', yaw: 15 },
      { text: 'HIDDEN COVE', yaw: -140 }
    ]
  });

  // ------------------------------------------------------------------
  // Watchtower + lookout hill with the summit viewing deck
  // ------------------------------------------------------------------
  P('watchtower', { position: [36, 72], rotationY: -124 });
  P('flag_decor', { position: [80, 4], height: 7, variant: 1 });
  P('campfire', { position: [76, -4] });
  P('rock_03', { position: [84, -6], rotationY: 30 });
  P('rock_01', { position: [74, 8] });
  lookoutDeck(env, T);

  // ------------------------------------------------------------------
  // Coastal row + hidden cove sea cave
  // ------------------------------------------------------------------
  P('coastal_house', { position: [-52, 92], rotationY: 86 });
  P('storage_house', { position: [14, 96], rotationY: -90 });
  P('fishing_hut', { position: [-40, 103], rotationY: 205 });
  P('fishing_boat', { position: [-58, 104], rotationY: -35 });
  P('wooden_barrel', { position: [-48, 96] });
  P('wicker_basket', { position: [-36.5, 106.5], variant: 1 });

  // Sea cave: cliff rocks arch around a dark mouth at the cove
  P('cliff_rock', { position: [-118, -72], rotationY: 15, scale: 1.35 });
  P('cliff_rock', { position: [-124, -82], rotationY: 70, scale: 1.5 });
  P('cliff_rock', { position: [-118, -92], rotationY: 130, scale: 1.3 });
  P('cliff_rock', { position: [-108, -96], rotationY: 200, scale: 1.15 });
  P('cliff_rock', { position: [-104, -82], rotationY: 260, scale: 1.2 });
  P('rock_02', { position: [-113, -80], scale: 1.2 });
  // Inside the cave: treasure
  P('treasure_chest', { position: [-116, -84], rotationY: 30, variant: 1 });
  P('wooden_barrel', { position: [-113, -87], variant: 1 });
  P('hanging_lantern', { position: [-116, 2.6, -84], rotationY: 0 });

  // ------------------------------------------------------------------
  // South beach — shade huts + dune grass
  // ------------------------------------------------------------------
  P('beach_hut', { position: [-26, -128], rotationY: 205 });
  P('beach_hut', { position: [22, -124], rotationY: 155, variant: 1 });
  P('wooden_barrel', { position: [-22.5, -124.5], variant: 1 });
  P('wicker_basket', { position: [18.5, -120.5] });
  P('campfire', { position: [-3, -126] });
  P('wooden_bench', { position: [1.5, -124.0], rotationY: 190, length: 2.0 });

  // ------------------------------------------------------------------
  // Vegetation
  // ------------------------------------------------------------------
  const nearPath = (x, z) => (Math.abs(x) < 8 && z > 30 && z < 130) ? 0.04 : 1;
  const exclusions = [
    { x: 0, z: 48, r: 22 },      // square
    { x: 48, z: 42, r: 20 },     // captain
    { x: -58, z: 30, r: 26 },    // market
    { x: 36, z: 72, r: 16 },     // watchtower
    { x: 14, z: 96, r: 14 },     // storage
    { x: 0, z: 120, r: 26 },     // harbour
    { x: 80, z: 0, r: 24 },      // lookout
    { x: -26, z: 96, r: 16 },    // warehouse
    { x: -40, z: 103, r: 12 },   // fishing hut
    { x: 9.5, z: 106.5, r: 10 }, // dock house
    { x: -26, z: -128, r: 12 },  // beach hut west
    { x: 22, z: -124, r: 12 }    // beach hut east
  ];

  // Palm grove (dense, mixed species) + island-wide palms
  env.scatter({
    asset: 'palm_tree_01', count: 24, seed: 101,
    center: [-8, -78], radius: 52,
    minHeight: 1.6, maxSlope: 0.62,
    scale: [0.85, 1.25], rotation: 'random',
    exclude: exclusions, theme: T
  });
  env.scatter({
    asset: 'palm_tree_02', count: 12, seed: 102,
    center: [-8, -78], radius: 44,
    minHeight: 1.6, maxSlope: 0.62,
    scale: [0.85, 1.2], rotation: 'random',
    exclude: exclusions, theme: T
  });
  env.scatter({
    asset: 'palm_tree_03', count: 14, seed: 108,
    center: [-8, -78], radius: 48,
    minHeight: 1.6, maxSlope: 0.62,
    scale: [0.85, 1.2], rotation: 'random',
    exclude: exclusions, theme: T
  });
  env.scatter({
    asset: 'palm_tree_03', count: 10, seed: 109,
    center: [60, -60], radius: 100,
    minHeight: 1.4, maxSlope: 0.6,
    scale: [0.8, 1.15], rotation: 'random',
    exclude: exclusions, density: nearPath, theme: T
  });
  env.scatter({
    asset: 'coconut_tree', count: 16, seed: 103,
    center: [-40, -30], radius: 105,
    minHeight: 1.8, maxSlope: 0.6,
    scale: [0.85, 1.15], rotation: 'random',
    exclude: exclusions, density: nearPath, theme: T
  });
  env.scatter({
    asset: 'palm_tree_01', count: 12, seed: 104,
    center: [60, -60], radius: 100,
    minHeight: 1.8, maxSlope: 0.6,
    scale: [0.8, 1.15], rotation: 'random',
    exclude: exclusions, density: nearPath, theme: T
  });

  // Broadleaf trees frame the eastern meadow and the area near the cove
  env.scatter({
    asset: 'tropical_tree_01', count: 9, seed: 110,
    center: [42, -56], radius: 62,
    minHeight: 1.8, maxSlope: 0.55,
    scale: [0.9, 1.3], rotation: 'random',
    exclude: exclusions, theme: T
  });
  env.scatter({
    asset: 'tropical_tree_01', count: 6, seed: 111,
    center: [-72, -48], radius: 44,
    minHeight: 1.8, maxSlope: 0.55,
    scale: [0.9, 1.25], rotation: 'random',
    exclude: exclusions, theme: T
  });

  // Banana plants tuck into the grove edges (understorey)
  env.scatter({
    asset: 'banana_plant', count: 20, seed: 112,
    center: [-8, -78], radius: 58,
    minHeight: 1.8, maxSlope: 0.55,
    scale: [0.85, 1.25], rotation: 'random',
    exclude: exclusions, theme: T
  });

  // Undergrowth (micro-detail layer)
  env.scatterGroup({
    count: 240, seed: 105,
    center: [0, 0], radius: 150,
    minHeight: 1.5, maxSlope: 0.7,
    exclude: exclusions, detail: true, theme: T,
    weighted: [
      { asset: 'grass_tuft_01', weight: 5, place: (e, i, x, z, yaw, s) => e.placeAsset('grass_tuft_01', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false }) },
      { asset: 'grass_tuft_02', weight: 3, place: (e, i, x, z, yaw, s) => e.placeAsset('grass_tuft_02', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false }) },
      { asset: 'bush_tropical_01', weight: 3, place: (e, i, x, z, yaw, s) => e.placeAsset('bush_tropical_01', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true }) },
      { asset: 'bush_tropical_02', weight: 2, place: (e, i, x, z, yaw, s) => e.placeAsset('bush_tropical_02', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true }) },
      { asset: 'flower_01', weight: 2, place: (e, i, x, z, yaw, s) => e.placeAsset('flower_01', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false }) },
      { asset: 'fern_01', weight: 1, place: (e, i, x, z, yaw, s) => e.placeAsset('fern_01', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false }) }
    ]
  });

  // Beach grass ring along the dune line (detail layer, wind-combed)
  env.scatter({
    asset: 'beach_grass', count: 90, seed: 113,
    center: [0, 0], innerRadius: 96, radius: 158,
    minHeight: 0.6, maxHeight: 2.4,
    scale: [0.8, 1.4], rotation: 'random', theme: T,
    detail: true, collide: false,
    place: (e, i, x, z, yaw, s) => e.placeAsset('beach_grass', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false })
  });

  // Flower patches sprinkled along the settlement edges
  env.scatter({
    asset: 'flower_patch', count: 14, seed: 114,
    center: [0, 30], radius: 95,
    minHeight: 1.6, maxSlope: 0.5,
    scale: [0.8, 1.3], rotation: 'random', theme: T,
    exclude: exclusions, collide: false,
    place: (e, i, x, z, yaw, s) => e.placeAsset('flower_patch', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false })
  });

  // Inland + coastal rocks
  env.scatter({
    asset: 'rock_01', count: 18, seed: 106,
    center: [0, 0], radius: 150,
    minHeight: 0.6, maxSlope: 0.8,
    scale: [0.8, 1.6], rotation: 'random', theme: T,
    exclude: [{ x: 0, z: 120, r: 30 }]
  });
  env.scatter({
    asset: 'rock_02', count: 10, seed: 107,
    center: [0, 0], radius: 150,
    minHeight: 0.8, maxSlope: 0.85,
    scale: [0.9, 1.4], rotation: 'random', theme: T,
    exclude: [{ x: 0, z: 120, r: 30 }]
  });
  // Wet coastal rocks + sea stacks near the waterline
  env.scatter({
    asset: 'coastal_rocks', count: 14, seed: 115,
    center: [0, 0], innerRadius: 135, radius: 185,
    minHeight: -1.6, maxHeight: 1.4,
    scale: [0.8, 1.5], rotation: 'random', theme: T,
    place: (e, i, x, z, yaw, s) => e.placeAsset('coastal_rocks', { position: [x, z], rotationY: yaw, scale: s, theme: T, wet: true })
  });
  env.scatter({
    asset: 'rock_01', count: 16, seed: 116,
    center: [0, 0], innerRadius: 138, radius: 185,
    minHeight: -1.6, maxHeight: 1.4,
    scale: [0.9, 1.7], rotation: 'random', theme: T,
    place: (e, i, x, z, yaw, s) => e.placeAsset('rock_01', { position: [x, z], rotationY: yaw, scale: s, theme: T, wet: true })
  });
  env.scatter({
    asset: 'cliff_rock', count: 9, seed: 117,
    center: [0, 0], innerRadius: 150, radius: 195,
    minHeight: -2.5, maxHeight: 2.5,
    scale: [0.9, 1.6], rotation: 'random', theme: T
  });

  // Path network: harbour → square → market / captain / lookout / coast
  paths(env, T);
}

// ---------------------------------------------------------------------------
// Summit viewing deck at the scenic lookout: planked platform, railing,
// steps, bench and a telescope rail — the reward for climbing the hill.
// ---------------------------------------------------------------------------
function lookoutDeck(env, T) {
  const mats = env.mats.forTheme(T);
  const VX = 80;
  const VZ = 2;
  const vy = env.groundAt(VX, VZ);
  const deckY = vy + 0.5;
  const W = 5.4;
  const D = 4.4;

  env.extraKit((kit) => {
    // Deck planks (walkable)
    for (let i = 0; i < 7; i += 1) {
      kit.box(mats.wall, [-W / 2 + 0.25 + i * (W - 0.5) / 6, deckY, VZ], [(W - 0.5) / 6 - 0.04, 0.14, D]);
    }
    kit.colliderBox([VX, deckY - 0.1, VZ], [W, 0.5, D], { y0: vy - 1.2, y1: deckY + 0.07 });
    // Support posts down to the slope
    for (const [ox, oz] of [[-W / 2 + 0.3, -D / 2 + 0.3], [W / 2 - 0.3, -D / 2 + 0.3], [-W / 2 + 0.3, D / 2 - 0.3], [W / 2 - 0.3, D / 2 - 0.3]]) {
      const gy = env.groundAt(VX + ox, VZ + oz);
      const h = deckY - gy;
      if (h > 0.15) kit.box(mats.woodBarrel, [VX + ox, gy + h / 2 - 0.1, VZ + oz], [0.22, h, 0.22]);
    }
    // Railings on three sides (front opens toward the sea view / steps)
    kit.pushFrame([VX, deckY, VZ], 0);
    railing(kit, mats, -W / 2 + 0.1, -D / 2 + 0.1, -W / 2 + 0.1, D / 2 - 0.1);
    railing(kit, mats, W / 2 - 0.1, -D / 2 + 0.1, W / 2 - 0.1, D / 2 - 0.1);
    railing(kit, mats, -W / 2 + 0.1, D / 2 - 0.1, W / 2 - 0.1, D / 2 - 0.1);
    kit.popFrame();
    // Two steps down on the south side
    const s1 = env.groundAt(VX, VZ + D / 2 + 1.1);
    kit.box(mats.woodBarrel, [VX, (deckY + s1) / 2 + 0.25, VZ + D / 2 + 0.55], [2.2, deckY - s1, 0.9]);
    kit.colliderBox([VX, (deckY + s1) / 2 + 0.25, VZ + D / 2 + 0.55], [2.2, deckY - s1, 0.9], { y0: s1 - 0.5, y1: deckY - 0.35 });
  });

  // Bench facing the view + lantern
  env.placeAsset('wooden_bench', {
    position: [VX - 1.2, deckY + 0.07, VZ - 1.3],
    rotationY: 0, length: 2.0, theme: T
  });
  env.placeAsset('hanging_lantern', {
    position: [VX + 1.9, deckY + 2.2, VZ - 1.6], rotationY: 0, theme: T
  });
}

function railing(kit, mats, ax, az, bx, bz) {
  const dx = bx - ax;
  const dz = bz - az;
  const len = Math.hypot(dx, dz);
  if (len < 0.2) return;
  const yaw = Math.atan2(dx, dz) * 180 / Math.PI;
  const mx = (ax + bx) / 2;
  const mz = (az + bz) / 2;
  kit.pushFrame([mx, 0, mz], yaw);
  const posts = Math.max(2, Math.round(len / 1.6) + 1);
  for (let i = 0; i < posts; i += 1) {
    const p = -len / 2 + (len / (posts - 1)) * i;
    kit.box(mats.trim, [0, 0.5, p], [0.11, 1.0, 0.11]);
  }
  kit.box(mats.wall, [0, 0.94, 0], [0.09, 0.1, len]);
  kit.box(mats.wall, [0, 0.55, 0], [0.07, 0.08, len]);
  kit.popFrame();
}

// ---------------------------------------------------------------------------
// Stone slab paths along the main walking routes (visual guide + traction).
// ---------------------------------------------------------------------------
function paths(env, T) {
  const mats = env.mats.forTheme(T);
  const routes = [
    // Harbour → square (original main street)
    [[0, 128], [2, 104], [-2, 80], [0, 52]],
    // Square → market lane
    [[-9, 45], [-22, 40], [-36, 35], [-48, 31]],
    // Square → captain's terrace
    [[11, 50], [24, 47], [36, 45], [44, 46]],
    // Square → lookout switchback
    [[13, 44], [28, 32], [44, 24], [58, 14], [70, 6]],
    // Square → coastal row branch
    [[-13, 62], [-22, 74], [-30, 85], [-42, 92]],
    // Square → palm grove
    [[-2, 32], [-4, 12], [-6, -14], [-8, -40]]
  ];
  env.extraKit((kit) => {
    for (const route of routes) {
      for (let s = 0; s < route.length - 1; s += 1) {
        const [ax, az] = route[s];
        const [bx, bz] = route[s + 1];
        const segLen = Math.hypot(bx - ax, bz - az);
        const steps = Math.max(2, Math.round(segLen / 1.7));
        const yawBase = Math.atan2(bx - ax, bz - az) * 180 / Math.PI;
        for (let i = 0; i <= steps; i += 1) {
          const t = i / steps;
          // Tiny lateral wander so the path feels hand-laid, but the slabs
          // overlap into one continuous strip (no scattered shards).
          const x = ax + (bx - ax) * t + Math.sin((s * 7 + i) * 1.7) * 0.18;
          const z = az + (bz - az) * t + Math.cos((s * 5 + i) * 1.3) * 0.15;
          const y = env.groundAt(x, z);
          if (y < 0.7) continue;             // don't pave the beach
          if (env.slopeAt(x, z) > 0.42) continue;  // no floating slabs on cliffs
          kit.box(mats.foundation, [x, y + 0.03, z], [1.7, 0.17, 1.95], [0, yawBase, 0]);
        }
      }
    }
  });
}

// Helpers that inject boats via a transient kit into the island batch.
function cargoBoatIntoBatch(env, x, z, waterY, yawDeg, T) {
  const mats = env.mats.forTheme(T);
  env.extraKit((kit) => {
    kit.pushFrame([x, waterY - 0.25, z], yawDeg);
    cargoBoat(kit, mats, {});
    kit.popFrame();
  });
}

function fishingBoatIntoBatch(env, x, z, waterY, yawDeg, T, variant = 0) {
  const mats = env.mats.forTheme(T);
  env.extraKit((kit) => {
    kit.pushFrame([x, waterY - 0.35, z], yawDeg);
    fishingBoat(kit, mats, { variant });
    kit.popFrame();
  });
}
