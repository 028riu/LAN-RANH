// Ember Volcanic Isle — basalt fields, a glowing caldera, lava pools
// and a hardened ash landing camp.
import { fishingBoat } from '../../assets/buildings/dockPieces.js';

export function layout(env) {
  const { def } = env;
  const T = def.theme;
  const P = (id, opts) => env.placeAsset(id, { theme: T, ...opts });

  // --- Landing dock + camp ---------------------------------------------------
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
    kit.pushFrame([seaX + 4.8, deckY - 0.6, seaZ], 170);
    fishingBoat(kit, mats, { variant: 1 });
    kit.popFrame();
  });

  env.travelPoints = env.travelPoints || [];
  env.travelPoints.push({
    x: seaX + 2.9, z: seaZ, r: 3.4,
    label: 'Sail from Ember Volcanic Isle',
    islandId: def.id,
    deckY
  });

  // Landing camp (iron-banded, hardened)
  P('campfire', { position: [2.5, 120] });
  P('wooden_crate', { position: [-2.2, 122], rotationY: 16 });
  P('wooden_barrel', { position: [4.6, 123.5], variant: 1 });
  P('cargo_stack', { position: [8.2, 121.0], rotationY: -12, variant: 1 });
  P('dock_bollard', { position: [6.4, 129.0], rotationY: 10, variant: 1 });
  P('weapon_shop', { position: [-8, 114], rotationY: 140 });
  P('flag_decor', { position: [6.5, 116], height: 5.5, variant: 1 });
  P('signpost', {
    position: [-3.5, 112], rotationY: 175,
    signs: [
      { text: 'CALDERA', yaw: -55 },
      { text: 'EMBER FIELDS', yaw: 65 }
    ]
  });

  // --- Vegetation: burnt + mineral ---------------------------------------------
  const exclusions = [
    { x: dock.x, z: dock.z, r: 28 },
    { x: 0, z: 118, r: 16 },
    { x: -15, z: -10, r: 30 }   // caldera
  ];

  env.scatter({
    asset: 'dead_tree', count: 24, seed: 501,
    center: [0, 0], radius: 110,
    minHeight: 1.0, maxSlope: 0.7,
    scale: [0.8, 1.4], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'bush_dry', count: 30, seed: 502,
    center: [0, 0], radius: 115,
    minHeight: 0.8, maxSlope: 0.7,
    scale: [0.7, 1.2], rotation: 'random', theme: T,
    exclude: exclusions, collide: false,
    place: (e, i, x, z, yaw, s) => e.placeAsset('bush_dry', { position: [x, z], rotationY: yaw, scale: s, theme: T, collide: false })
  });

  // Basalt boulder fields
  env.scatter({
    asset: 'rock_02', count: 26, seed: 503,
    center: [0, 0], radius: 115,
    minHeight: 0.6, maxSlope: 0.9,
    scale: [0.9, 1.9], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'rock_03', count: 14, seed: 504,
    center: [40, 25], radius: 70,
    minHeight: 0.8, maxSlope: 0.8,
    scale: [0.9, 1.6], rotation: 'random', theme: T,
    exclude: exclusions
  });
  env.scatter({
    asset: 'rock_01', count: 16, seed: 505,
    center: [0, 0], innerRadius: 112, radius: 165,
    minHeight: -1.8, maxHeight: 1.6,
    scale: [0.9, 1.7], rotation: 'random', theme: T
  });
  env.scatter({
    asset: 'cliff_rock', count: 11, seed: 506,
    center: [0, 0], innerRadius: 118, radius: 172,
    minHeight: -2.5, maxHeight: 3.0,
    scale: [1.0, 1.8], rotation: 'random', theme: T
  });
  // Charred sea stacks + hardy shore grass on the shoreline ring
  env.scatter({
    asset: 'coastal_rocks', count: 12, seed: 507,
    center: [0, 0], innerRadius: 118, radius: 168,
    minHeight: -1.8, maxHeight: 1.4,
    scale: [0.8, 1.5], rotation: 'random', theme: T,
    place: (e, i, x, z, yaw, s) => e.placeAsset('coastal_rocks', { position: [x, z], rotationY: yaw, scale: s, theme: T, wet: true })
  });
  env.scatter({
    asset: 'beach_grass', count: 46, seed: 508,
    center: [0, 0], innerRadius: 90, radius: 145,
    minHeight: 0.5, maxHeight: 2.2,
    scale: [0.7, 1.2], rotation: 'random', theme: T,
    detail: true, collide: false,
    place: (e, i, x, z, yaw, s) => e.placeAsset('beach_grass', { position: [x, z], rotationY: yaw, scale: s, theme: T, detail: true, collide: false })
  });

  // --- Caldera lava lake + glowing cracks ---------------------------------------
  const caldera = def.zones.find((z) => z.id === 'caldera');
  if (caldera) {
    const cy = env.groundAt(caldera.x, caldera.z);
    env.extraKit((kit) => {
      const mats = env.mats.forTheme(T);
      // Lava lake surface (emissive)
      kit.cyl(mats.lava, [caldera.x, cy + 0.3, caldera.z], 10.5, 0.14, 26);
      kit.cyl(mats.lava, [caldera.x + 9, cy + 0.26, caldera.z + 4], 5.0, 0.14, 18);
      // Glowing crust islands
      kit.cyl(mats.foundation, [caldera.x - 3, cy + 0.36, caldera.z + 2], 2.6, 0.18, 12);
      kit.cyl(mats.foundation, [caldera.x + 5, cy + 0.34, caldera.z - 3], 1.8, 0.18, 10);
      // Ember rocks around the rim
      for (let i = 0; i < 7; i += 1) {
        const a = (i / 7) * Math.PI * 2;
        kit.box(mats.ember, [caldera.x + Math.cos(a) * 12.5, cy + 0.5, caldera.z + Math.sin(a) * 12.5], [0.5, 0.4, 0.5], [0, i * 40, 0]);
      }
    });
    // Warning sign at the rim
    P('signpost', {
      position: [caldera.x + 15, caldera.z + 12], rotationY: 210,
      signs: [{ text: 'DANGER', yaw: 0 }]
    });
    P('rock_02', { position: [caldera.x + 17, caldera.z + 14], scale: 1.1 });
  }

  // Small lava pools across the fields
  const pools = [[30, 40], [-45, 30], [10, -55]];
  for (const [lx, lz] of pools) {
    const ly = env.groundAt(lx, lz);
    env.extraKit((kit) => {
      const mats = env.mats.forTheme(T);
      kit.cyl(mats.lava, [lx, ly + 0.16, lz], 3.6, 0.12, 16);
      for (let i = 0; i < 4; i += 1) {
        const a = (i / 4) * Math.PI * 2 + lx;
        kit.box(mats.ember, [lx + Math.cos(a) * 4.2, ly + 0.35, lz + Math.sin(a) * 4.2], [0.4, 0.3, 0.4], [0, i * 30, 0]);
      }
    });
  }
}
