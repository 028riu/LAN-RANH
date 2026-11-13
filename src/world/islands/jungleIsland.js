// Jungle Isle — dense rainforest: giant canopy trees, fern thickets,
// a vine landing camp, a ruined shack and the Fern Pond clearing.
import { fishingBoat } from '../../assets/buildings/dockPieces.js';

export function layout(env) {
  const { def } = env;
  const T = def.theme;
  const P = (id, opts) => env.placeAsset(id, { theme: T, ...opts });

  // --- Landing dock + camp -------------------------------------------------
  const dock = def.travelDock;
  const pierResult = P('dock_pier', {
    position: [dock.x, dock.z],
    rotationY: dock.rotationY,
    length: dock.length,
    width: dock.width
  });
  const deckY = (pierResult && pierResult.deckY) || 2.2;

  const rotRad = dock.rotationY * Math.PI / 180;
  const seaX = dock.x - Math.sin(rotRad) * (dock.length / 2 - 3);
  const seaZ = dock.z - Math.cos(rotRad) * (dock.length / 2 - 3);
  env.extraKit((kit) => {
    const mats = env.mats.forTheme(T);
    kit.pushFrame([seaX + 4.8, deckY - 0.6, seaZ], 200);
    fishingBoat(kit, mats, {});
    kit.popFrame();
  });

  env.travelPoints = env.travelPoints || [];
  env.travelPoints.push({
    x: seaX + 2.9, z: seaZ, r: 3.4,
    label: 'Sail from Jungle Isle',
    islandId: def.id,
    deckY
  });

  // Landing camp
  P('campfire', { position: [3, 95] });
  P('wooden_crate', { position: [-2.5, 97], rotationY: 12 });
  P('wooden_crate', { position: [-1.6, 97.8], variant: 1 });
  P('wooden_barrel', { position: [5, 98.5] });
  P('wooden_table', { position: [6.5, 95.5], rotationY: 70, length: 2.0 });
  P('wooden_bench', { position: [4.2, 92.5], rotationY: 200, length: 2.0 });
  P('wicker_basket', { position: [8.2, 97.0] });
  P('flower_patch', { position: [1.2, 91.0] });
  P('signpost', {
    position: [-4, 93], rotationY: 160,
    signs: [
      { text: 'DEEPWOOD', yaw: -40 },
      { text: 'FERN POND', yaw: 70 }
    ]
  });
  P('flag_decor', { position: [6, 91], height: 5, variant: 1 });

  // Ruined settler shack deep in the woods
  P('house_wood_small', { position: [-38, -18], rotationY: 150 });
  P('house_wood_large', { position: [34, -34], rotationY: -35 });
  P('wooden_fence', { position: [-33, -12], rotationY: 70, length: 4.5 });
  P('treasure_chest', { position: [-34, -22], rotationY: 210, variant: 1 });
  P('wooden_barrel', { position: [-41, -14], variant: 1 });

  // --- Jungle vegetation ----------------------------------------------------
  const exclusions = [
    { x: dock.x, z: dock.z, r: 26 },
    { x: 0, z: 95, r: 14 },
    { x: -38, z: -18, r: 12 }
  ];

  // Giant canopy trees
  env.scatter({
    asset: 'jungle_tree', count: 64, seed: 201,
    center: [0, 0], radius: 118,
    minHeight: 1.6, maxSlope: 0.68,
    scale: [0.8, 1.35], rotation: 'random', theme: T,
    exclude: exclusions
  });
  // Broadleaf trees break up the canopy height around clearings
  env.scatter({
    asset: 'tropical_tree_01', count: 10, seed: 210,
    center: [-25, 45], radius: 52,
    minHeight: 1.6, maxSlope: 0.6,
    scale: [0.9, 1.3], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'tropical_tree_01', count: 7, seed: 211,
    center: [35, -45], radius: 45,
    minHeight: 1.6, maxSlope: 0.6,
    scale: [0.85, 1.25], rotation: 'random', theme: T,
    exclude: exclusions
  });
  // Banana plants fill the understorey edges
  env.scatter({
    asset: 'banana_plant', count: 26, seed: 212,
    center: [0, 0], radius: 115,
    minHeight: 1.6, maxSlope: 0.6,
    scale: [0.8, 1.3], rotation: 'random', theme: T,
    exclude: exclusions
  });
  // Palms near the landing beaches
  env.scatter({
    asset: 'palm_tree_01', count: 18, seed: 202,
    center: [0, 60], radius: 70,
    minHeight: 1.4, maxSlope: 0.6,
    scale: [0.85, 1.2], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'palm_tree_02', count: 10, seed: 203,
    center: [-60, -30], radius: 60,
    minHeight: 1.6, maxSlope: 0.6,
    scale: [0.85, 1.15], rotation: 'random', theme: T,
    exclude: exclusions
  });

  // Understorey: ferns dominate
  env.scatterGroup({
    count: 260, seed: 204,
    center: [0, 0], radius: 125,
    minHeight: 1.4, maxSlope: 0.75,
    exclude: exclusions, theme: T,
    weighted: [
      { asset: 'fern_01', weight: 6, place: (e, i, x, z, yaw, s) => e.placeAsset('fern_01', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false }) },
      { asset: 'bush_tropical_01', weight: 4, place: (e, i, x, z, yaw, s) => e.placeAsset('bush_tropical_01', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true }) },
      { asset: 'bush_tropical_02', weight: 3, place: (e, i, x, z, yaw, s) => e.placeAsset('bush_tropical_02', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true }) },
      { asset: 'grass_tuft_02', weight: 3, place: (e, i, x, z, yaw, s) => e.placeAsset('grass_tuft_02', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false }) },
      { asset: 'flower_01', weight: 1, place: (e, i, x, z, yaw, s) => e.placeAsset('flower_01', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false }) }
    ]
  });

  // Mossy boulders + jungle cliffs
  env.scatter({
    asset: 'rock_02', count: 16, seed: 205,
    center: [0, 0], radius: 120,
    minHeight: 1.0, maxSlope: 0.85,
    scale: [0.9, 1.7], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'cliff_rock', count: 10, seed: 206,
    center: [0, 0], innerRadius: 120, radius: 175,
    minHeight: -2.5, maxHeight: 3.0,
    scale: [1.0, 1.7], rotation: 'random', theme: T
  });
  env.scatter({
    asset: 'rock_01', count: 14, seed: 207,
    center: [0, 0], innerRadius: 120, radius: 175,
    minHeight: -1.5, maxHeight: 1.6,
    scale: [0.9, 1.6], rotation: 'random', theme: T
  });
  // Sea-stack clusters on the intertidal ring
  env.scatter({
    asset: 'coastal_rocks', count: 10, seed: 213,
    center: [0, 0], innerRadius: 128, radius: 175,
    minHeight: -1.6, maxHeight: 1.4,
    scale: [0.8, 1.4], rotation: 'random', theme: T,
    place: (e, i, x, z, yaw, s) => e.placeAsset('coastal_rocks', { position: [x, z], rotationY: yaw, scale: s, theme: T, wet: true })
  });
  // Beach grass along the dune line (detail layer)
  env.scatter({
    asset: 'beach_grass', count: 60, seed: 214,
    center: [0, 0], innerRadius: 92, radius: 150,
    minHeight: 0.6, maxHeight: 2.4,
    scale: [0.8, 1.4], rotation: 'random', theme: T,
    detail: true, collide: false,
    place: (e, i, x, z, yaw, s) => e.placeAsset('beach_grass', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false })
  });

  // --- Fern Pond: still water disc in the valley ----------------------------
  const pond = def.zones.find((z) => z.id === 'pond');
  if (pond) {
    const py = env.groundAt(pond.x, pond.z);
    env.extraKit((kit) => {
      const mats = env.mats.forTheme(T);
      kit.cyl(mats.pondWater, [pond.x, py + 0.18, pond.z], 8.5, 0.12, 22);
      kit.cyl(mats.pondWater, [pond.x + 4, py + 0.14, pond.z - 3], 4.5, 0.12, 16);
    });
    env.scatter({
      asset: 'fern_01', count: 16, seed: 208,
      center: [pond.x, pond.z], radius: 16,
      minHeight: py - 2, maxHeight: py + 3,
      scale: [1.0, 1.6], rotation: 'random', theme: T,
      exclude: [{ x: pond.x, z: pond.z, r: 7 }]
    });
  }
}
