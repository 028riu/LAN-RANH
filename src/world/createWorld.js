import * as pc from 'playcanvas';
import { WORLD_CONFIG } from './worldConfig.js';

function material(color, roughness = 0.9, emissive = null) {
  const m = new pc.StandardMaterial();
  m.diffuse = new pc.Color(color[0], color[1], color[2]);
  m.roughness = roughness;
  if (emissive) m.emissive = new pc.Color(emissive[0], emissive[1], emissive[2]);
  m.update();
  return m;
}

function primitive(app, name, type, position, scale, mat, rotation = [0, 0, 0]) {
  const e = new pc.Entity(name);
  e.addComponent('render', { type, material: mat });
  e.setPosition(position[0], position[1], position[2]);
  e.setLocalScale(scale[0], scale[1], scale[2]);
  e.setEulerAngles(rotation[0], rotation[1], rotation[2]);
  app.root.addChild(e);
  return e;
}

function buildPirateStarterIsland(app, island, mats) {
  const { x, z } = island;
  const groundY = (island.elevation ?? 0) + island.height + 1.8;

  // Overlapping flattened landforms create an irregular coastline silhouette.
  // This is a visual terrain blockout; walkable collision is still being developed.
  const landforms = [
    [0, 0, 118, 2.6, 92],
    [-64, 10, 78, 2.6, 68],
    [68, 22, 78, 2.6, 66],
    [-28, -62, 84, 2.6, 62],
    [54, -66, 68, 2.6, 58],
    [4, 72, 74, 2.6, 52],
    [-112, -38, 42, 2.6, 38],
    [112, 60, 40, 2.6, 34]
  ];
  landforms.forEach(([ox, oz, sx, sy, sz], i) => {
    primitive(app, `Pirate Island terrain lobe ${i + 1}`, 'sphere',
      [x + ox, groundY - 1.3, z + oz], [sx, sy, sz], mats.starterGrass);
  });

  // Pale sand shelves frame the main landmass and form two readable beaches.
  const beaches = [
    [-10, 112, 88, 1.45, 27, -7],
    [-112, 28, 52, 1.45, 32, 18],
    [106, -30, 48, 1.45, 34, -24],
    [-82, -100, 62, 1.45, 28, 22],
    [42, -116, 70, 1.45, 25, -12]
  ];
  beaches.forEach(([ox, oz, sx, sy, sz, yaw], i) => {
    primitive(app, `Pirate Island sand shelf ${i + 1}`, 'sphere',
      [x + ox, groundY - 2.15, z + oz], [sx, sy, sz], mats.starterSand, [0, yaw, 0]);
  });

  // Rocky shoulders and a small cove on the western side.
  const rocks = [
    [-145, 52, 19, 15, 23], [-132, -14, 22, 18, 18],
    [136, 42, 24, 19, 20], [118, -82, 25, 18, 19],
    [-86, -128, 18, 13, 20], [8, 132, 21, 15, 15],
    [-150, -78, 17, 13, 15]
  ];
  rocks.forEach(([ox, oz, sx, sy, sz], i) => {
    primitive(app, `Pirate Island coastal rock ${i + 1}`, 'sphere',
      [x + ox, groundY - 1.7, z + oz], [sx, sy, sz], mats.starterRock);
  });

  // Raised green knoll for the future lookout landmark.
  primitive(app, 'Pirate Island upper lookout hill', 'sphere',
    [x + 82, groundY + 1.1, z + 8], [43, 5.2, 38], mats.starterGrass);

  // Simple wooden arrival pier at the northern beach.
  const dock = primitive(app, 'Pirate Island arrival dock', 'box',
    [x - 8, groundY - 0.25, z + 126], [25, 2, 78], mats.wood);
  dock.setEulerAngles(0, -8, 0);
  for (let i = 0; i < 4; i += 1) {
    primitive(app, `Pirate dock post ${i + 1}`, 'cylinder',
      [x - 17 + (i % 2) * 18, groundY - 1.5, z + 101 + Math.floor(i / 2) * 48],
      [2.2, 8, 2.2], mats.wood);
  }

  // A small path guide: a sequence of low, warm stone pads from dock to village.
  for (let i = 0; i < 6; i += 1) {
    primitive(app, `Pirate Island path stone ${i + 1}`, 'box',
      [x - 5 + Math.sin(i * 0.7) * 4, groundY + 0.08, z + 82 - i * 13],
      [12, 0.45, 8], mats.pathStone, [0, Math.sin(i) * 9, 0]);
  }
}

function buildIsland(app, island, mats) {
  if (island.id === 'pirate-starter') {
    buildPirateStarterIsland(app, island, mats);
    return;
  }

  const { x, z, width, depth } = island;
  const elevation = island.elevation ?? 0;
  const top = elevation + island.height;
  primitive(app, island.name + ' rocky mass', 'cylinder',
    [x, elevation + island.height * 0.30, z],
    [width, island.height * 0.60, depth], mats.rock);
  primitive(app, island.name + ' shoreline', 'cylinder',
    [x, elevation + island.height * 0.70, z],
    [width, island.height * 0.22, depth], mats.sand);
  primitive(app, island.name + ' terrain', 'sphere',
    [x, top - 1.2, z], [width * 0.96, 2.6, depth * 0.94], material(island.color));

  const landmarkHeight = Math.max(10, island.height * 1.5);
  const landmarkMat = island.biome === 'volcanic' ? mats.lavaRock :
    island.biome === 'frozen' ? mats.ice : mats.landmark;
  primitive(app, island.name + ' landmark', 'cone',
    [x + width * 0.12, top + landmarkHeight * 0.42, z - depth * 0.10],
    [Math.max(8, width * 0.075), landmarkHeight, Math.max(8, depth * 0.075)], landmarkMat);
  const dock = primitive(app, island.name + ' dock marker', 'box',
    [x - width * 0.18, top + 1.2, z + depth * 0.42],
    [Math.max(12, width * 0.24), 2.4, 12], mats.wood);
  dock.setEulerAngles(0, -18, 0);

  if (island.role === 'floating') {
    primitive(app, island.name + ' cloud base', 'sphere',
      [x, elevation - 9, z], [width * 0.55, 12, depth * 0.52], mats.cloud);
  }
  if (island.role === 'underwater') {
    primitive(app, island.name + ' underwater marker', 'sphere',
      [x, elevation + 18, z], [width * 0.24, 16, depth * 0.24], mats.glass);
  }
}

export function createWorld(app) {
  const mats = {
    water: material([0.025, 0.20, 0.29], 0.24),
    rock: material([0.25, 0.29, 0.30]),
    sand: material([0.72, 0.61, 0.40]),
    landmark: material([0.46, 0.36, 0.25]),
    wood: material([0.30, 0.18, 0.10]),
    lavaRock: material([0.18, 0.13, 0.12], 0.8, [0.16, 0.035, 0.008]),
    ice: material([0.62, 0.78, 0.86], 0.35),
    cloud: material([0.78, 0.85, 0.90], 1),
    glass: material([0.05, 0.36, 0.47], 0.18, [0.01, 0.08, 0.11]),
    starterGrass: material([0.24, 0.43, 0.25], 0.96),
    starterSand: material([0.78, 0.68, 0.49], 0.98),
    starterRock: material([0.28, 0.31, 0.30], 0.94),
    pathStone: material([0.53, 0.48, 0.38], 0.96)
  };
  primitive(app, 'Sea 1 Ocean', 'plane', [0, -2, 0],
    [WORLD_CONFIG.bounds.width, 1, WORLD_CONFIG.bounds.depth], mats.water);
  for (const island of WORLD_CONFIG.islands) buildIsland(app, island, mats);

  const sun = new pc.Entity('Sea 1 Sun');
  sun.addComponent('light', { type:'directional', color:new pc.Color(1,0.88,0.72),
    intensity:1.7, castShadows:true, shadowResolution:2048 });
  sun.setEulerAngles(48,32,0);
  app.root.addChild(sun);
  const fill = new pc.Entity('Sea 1 Sky Fill');
  fill.addComponent('light', { type:'omni', color:new pc.Color(0.48,0.67,1),
    intensity:0.35, range:700 });
  fill.setPosition(-2000,180,0);
  app.root.addChild(fill);
  return { config: WORLD_CONFIG };
}
