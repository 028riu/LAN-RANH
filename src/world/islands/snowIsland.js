// Frostpeak Isle — snowfields, pine forests, a trapper camp and two
// cosy snow-themed cabins near the landing.
import { fishingBoat } from '../../assets/buildings/dockPieces.js';

export function layout(env) {
  const { def } = env;
  const T = def.theme;
  const P = (id, opts) => env.placeAsset(id, { theme: T, ...opts });

  // --- Landing dock + cabins ---------------------------------------------------
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
    kit.pushFrame([seaX + 4.8, deckY - 0.6, seaZ], 190);
    fishingBoat(kit, mats, {});
    kit.popFrame();
  });

  env.travelPoints = env.travelPoints || [];
  env.travelPoints.push({
    x: seaX + 2.9, z: seaZ, r: 3.4,
    label: 'Sail from Frostpeak Isle',
    islandId: def.id,
    deckY
  });

  // Landing camp
  P('campfire', { position: [3, 99] });
  P('wooden_crate', { position: [-2, 101], rotationY: -14 });
  P('wooden_barrel', { position: [4.8, 102.5] });
  P('cargo_stack', { position: [8.0, 100.0], rotationY: -18, variant: 2 });
  P('wooden_bench', { position: [-3.5, 95.5], rotationY: 140, length: 2.0 });
  P('dock_bollard', { position: [6.2, 108.5], rotationY: 10 });
  P('flag_decor', { position: [7, 95], height: 5.5 });

  // Cabins (same modules, snow theme)
  P('house_wood_small', { position: [-10, 84], rotationY: 150 });
  P('house_wood_large', { position: [-24, 96], rotationY: 110 });
  P('wooden_fence', { position: [-16, 90], rotationY: 40, length: 5 });
  P('signpost', {
    position: [-4, 88], rotationY: 170,
    signs: [
      { text: 'FROSTPEAK', yaw: -50 },
      { text: 'PINES', yaw: 60 }
    ]
  });

  // --- Vegetation ----------------------------------------------------------------
  const exclusions = [
    { x: dock.x, z: dock.z, r: 26 },
    { x: -10, z: 84, r: 14 },
    { x: -24, z: 96, r: 14 },
    { x: 0, z: 100, r: 14 }
  ];

  env.scatter({
    asset: 'pine_tree', count: 78, seed: 401,
    center: [0, 0], radius: 120,
    minHeight: 1.2, maxSlope: 0.7,
    scale: [0.8, 1.4], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'pine_tree', count: 20, seed: 402,
    center: [-45, -20], radius: 50,
    minHeight: 1.2, maxSlope: 0.65,
    scale: [1.0, 1.45], rotation: 'random', theme: T,
    exclude: exclusions
  });
  // Summit pine approach — denser toward Frostpeak
  env.scatter({
    asset: 'pine_tree', count: 16, seed: 407,
    center: [30, 20], radius: 42,
    minHeight: 2.0, maxSlope: 0.7,
    scale: [0.9, 1.4], rotation: 'random', theme: T,
    exclude: exclusions
  });

  env.scatterGroup({
    count: 150, seed: 403,
    center: [0, 0], radius: 125,
    minHeight: 1.0, maxSlope: 0.75,
    exclude: exclusions, theme: T,
    weighted: [
      { asset: 'bush_snow', weight: 5, place: (e, i, x, z, yaw, s) => e.placeAsset('bush_snow', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true }) },
      { asset: 'grass_tuft_01', weight: 3, place: (e, i, x, z, yaw, s) => e.placeAsset('grass_tuft_01', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false }) },
      { asset: 'rock_01', weight: 2, place: (e, i, x, z, yaw, s) => e.placeAsset('rock_01', { position: [x, z], rotationY: yaw, scale: s * 0.8, theme: T }) }
    ]
  });

  // Granite boulders + icy shore
  env.scatter({
    asset: 'rock_02', count: 18, seed: 404,
    center: [0, 0], radius: 120,
    minHeight: 0.8, maxSlope: 0.85,
    scale: [0.9, 1.7], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'rock_01', count: 18, seed: 405,
    center: [0, 0], innerRadius: 118, radius: 175,
    minHeight: -1.8, maxHeight: 1.4,
    scale: [0.9, 1.7], rotation: 'random', theme: T
  });
  env.scatter({
    asset: 'cliff_rock', count: 9, seed: 406,
    center: [0, 0], innerRadius: 125, radius: 180,
    minHeight: -2.5, maxHeight: 2.8,
    scale: [1.0, 1.7], rotation: 'random', theme: T
  });
  // Frost-coated sea stacks + windswept grass on the shore ring
  env.scatter({
    asset: 'coastal_rocks', count: 10, seed: 408,
    center: [0, 0], innerRadius: 122, radius: 170,
    minHeight: -1.8, maxHeight: 1.4,
    scale: [0.8, 1.4], rotation: 'random', theme: T,
    place: (e, i, x, z, yaw, s) => e.placeAsset('coastal_rocks', { position: [x, z], rotationY: yaw, scale: s, theme: T, wet: true })
  });
  env.scatter({
    asset: 'beach_grass', count: 44, seed: 409,
    center: [0, 0], innerRadius: 92, radius: 148,
    minHeight: 0.5, maxHeight: 2.2,
    scale: [0.7, 1.2], rotation: 'random', theme: T,
    detail: true, collide: false,
    place: (e, i, x, z, yaw, s) => e.placeAsset('beach_grass', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false })
  });

  // Summit marker
  P('flag_decor', { position: [30, 20], height: 7, variant: 1 });
  P('rock_03', { position: [33, 23], rotationY: 20, scale: 1.2 });
}
