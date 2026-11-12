// Dune Desert Isle — rolling sand, cactus fields, a ruined outpost and
// the dry oasis.
import { fishingBoat } from '../../assets/buildings/dockPieces.js';

export function layout(env) {
  const { def } = env;
  const T = def.theme;
  const P = (id, opts) => env.placeAsset(id, { theme: T, ...opts });

  // --- Landing dock ----------------------------------------------------------
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
    kit.pushFrame([seaX + 4.8, deckY - 0.6, seaZ], 160);
    fishingBoat(kit, mats, { variant: 1 });
    kit.popFrame();
  });

  env.travelPoints = env.travelPoints || [];
  env.travelPoints.push({
    x: seaX + 2.9, z: seaZ, r: 3.4,
    label: 'Sail from Dune Desert Isle',
    islandId: def.id,
    deckY
  });

  // Landing camp + caravan
  P('campfire', { position: [2.5, 99] });
  P('wooden_crate', { position: [-2, 101], rotationY: 20 });
  P('wooden_barrel', { position: [4.5, 102] });
  P('cargo_stack', { position: [8.5, 100.5], rotationY: -8, variant: 2 });
  P('wooden_bench', { position: [-4.5, 96.5], rotationY: 120, length: 2.0 });
  P('market_stall', { position: [-6, 97], rotationY: 60, variant: 1 });
  P('flag_decor', { position: [6.5, 95], height: 5.5 });

  // --- Ruined outpost (42, 18) ------------------------------------------------
  const ruins = def.zones.find((z) => z.id === 'ruins');
  if (ruins) {
    P('house_stone', { position: [ruins.x, ruins.z], rotationY: 200 });
    // Broken colonnade
    for (let i = 0; i < 5; i += 1) {
      P('rock_03', {
        position: [ruins.x - 10 + i * 5, ruins.z + 9 + Math.sin(i) * 1.5],
        rotationY: i * 24, scale: i === 2 ? 0.7 : 1.0
      });
    }
    P('rock_02', { position: [ruins.x + 8, ruins.z - 8], scale: 1.3 });
    P('rock_02', { position: [ruins.x - 6, ruins.z - 10], scale: 1.0 });
    P('treasure_chest', { position: [ruins.x + 4, ruins.z + 4], rotationY: 120, variant: 1 });
    P('wooden_crate', { position: [ruins.x - 4, ruins.z + 5], rotationY: -30 });
    P('cargo_stack', { position: [ruins.x - 8, ruins.z + 6], rotationY: 40, variant: 2 });
    P('wicker_basket', { position: [ruins.x + 2, ruins.z - 6], variant: 1 });
    P('signpost', {
      position: [ruins.x - 12, ruins.z - 2], rotationY: 80,
      signs: [
        { text: 'RUINS', yaw: 0 },
        { text: 'OASIS', yaw: 95 }
      ]
    });
  }

  // --- Desert vegetation --------------------------------------------------------
  const exclusions = [
    { x: dock.x, z: dock.z, r: 26 },
    { x: 0, z: 100, r: 16 }
  ];
  if (ruins) exclusions.push({ x: ruins.x, z: ruins.z, r: 16 });

  env.scatter({
    asset: 'cactus', count: 46, seed: 301,
    center: [0, 0], radius: 130,
    minHeight: 1.2, maxSlope: 0.6,
    scale: [0.8, 1.4], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'bush_dry', count: 52, seed: 302,
    center: [0, 0], radius: 135,
    minHeight: 0.9, maxSlope: 0.7,
    scale: [0.8, 1.5], rotation: 'random', theme: T,
    exclude: exclusions, collide: false,
    place: (e, i, x, z, yaw, s) => e.placeAsset('bush_dry', { position: [x, z], rotationY: yaw, scale: s, theme: T, collide: false })
  });
  env.scatter({
    asset: 'dead_tree', count: 10, seed: 303,
    center: [20, -30], radius: 80,
    minHeight: 1.2, maxSlope: 0.65,
    scale: [0.9, 1.3], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'grass_tuft_02', count: 60, seed: 304,
    center: [0, 0], radius: 130,
    minHeight: 0.8, maxSlope: 0.7,
    scale: [0.7, 1.2], rotation: 'random', theme: T,
    exclude: exclusions, collide: false,
    place: (e, i, x, z, yaw, s) => e.placeAsset('grass_tuft_02', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false })
  });

  // Cactus groves: dense intentional clusters rather than uniform spread
  for (const [gx, gz, gc, gseed] of [[-20, 45, 9, 311], [55, -35, 8, 312], [-65, -55, 7, 313]]) {
    env.scatter({
      asset: 'cactus', count: gc, seed: gseed,
      center: [gx, gz], radius: 16,
      minHeight: 1.0, maxSlope: 0.55,
      scale: [0.8, 1.35], rotation: 'random', theme: T,
      exclude: exclusions
    });
  }
  // Broadleaf shade trees around the oasis only
  env.scatter({
    asset: 'tropical_tree_01', count: 5, seed: 315,
    center: [10, -52], radius: 22,
    minHeight: 1.0, maxSlope: 0.5,
    scale: [0.85, 1.15], rotation: 'random', theme: T,
    exclude: exclusions
  });

  // Sandstone boulders + mesas
  env.scatter({
    asset: 'rock_02', count: 20, seed: 305,
    center: [0, 0], radius: 130,
    minHeight: 0.8, maxSlope: 0.85,
    scale: [1.0, 1.9], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'rock_03', count: 12, seed: 306,
    center: [-30, -20], radius: 90,
    minHeight: 1.0, maxSlope: 0.75,
    scale: [0.9, 1.6], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'cliff_rock', count: 9, seed: 307,
    center: [0, 0], innerRadius: 130, radius: 185,
    minHeight: -2.5, maxHeight: 2.5,
    scale: [1.0, 1.8], rotation: 'random', theme: T
  });
  // Sea stacks + dune grass on the shoreline ring (detail layer)
  env.scatter({
    asset: 'coastal_rocks', count: 9, seed: 316,
    center: [0, 0], innerRadius: 132, radius: 180,
    minHeight: -1.6, maxHeight: 1.4,
    scale: [0.8, 1.4], rotation: 'random', theme: T,
    place: (e, i, x, z, yaw, s) => e.placeAsset('coastal_rocks', { position: [x, z], rotationY: yaw, scale: s, theme: T, wet: true })
  });
  env.scatter({
    asset: 'beach_grass', count: 50, seed: 317,
    center: [0, 0], innerRadius: 95, radius: 155,
    minHeight: 0.6, maxHeight: 2.4,
    scale: [0.75, 1.3], rotation: 'random', theme: T,
    detail: true, collide: false,
    place: (e, i, x, z, yaw, s) => e.placeAsset('beach_grass', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false })
  });

  // --- Dry oasis (10, -52): waterhole + palms -----------------------------------
  const oasis = def.zones.find((z) => z.id === 'oasis');
  if (oasis) {
    const oy = env.groundAt(oasis.x, oasis.z);
    env.extraKit((kit) => {
      const mats = env.mats.forTheme(T);
      kit.cyl(mats.pondWater, [oasis.x, oy + 0.14, oasis.z], 7.0, 0.12, 20);
    });
    env.scatter({
      asset: 'palm_tree_01', count: 7, seed: 308,
      center: [oasis.x, oasis.z], radius: 14,
      minHeight: oy - 1, maxHeight: oy + 3,
      scale: [0.85, 1.15], rotation: 'random', theme: T,
      exclude: [{ x: oasis.x, z: oasis.z, r: 8 }]
    });
    env.scatter({
      asset: 'grass_tuft_01', count: 18, seed: 309,
      center: [oasis.x, oasis.z], radius: 15,
      minHeight: oy - 1, maxHeight: oy + 3,
      scale: [0.9, 1.3], rotation: 'random', theme: T,
      exclude: [{ x: oasis.x, z: oasis.z, r: 7.5 }],
      place: (e, i, x, z, yaw, s) => e.placeAsset('grass_tuft_01', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false })
    });
  }
}
