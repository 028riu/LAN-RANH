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

function primitive(app, name, type, position, scale, mat) {
  const e = new pc.Entity(name);
  e.addComponent('render', { type, material: mat });
  e.setPosition(position[0], position[1], position[2]);
  e.setLocalScale(scale[0], scale[1], scale[2]);
  app.root.addChild(e);
  return e;
}

function buildIsland(app, island, mats) {
  const { x, z, width, depth } = island;
  const elevation = island.elevation ?? 0;
  const top = elevation + island.height;
  primitive(app, island.name + ' rocky mass', 'cylinder',
    [x, elevation + island.height * 0.30, z],
    [width * 0.50, island.height * 0.60, depth * 0.50], mats.rock);
  primitive(app, island.name + ' shoreline', 'cylinder',
    [x, elevation + island.height * 0.70, z],
    [width * 0.50, island.height * 0.22, depth * 0.50], mats.sand);
  primitive(app, island.name + ' terrain', 'sphere',
    [x, top - 1.2, z], [width * 0.48, 2.6, depth * 0.47], material(island.color));

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
    glass: material([0.05, 0.36, 0.47], 0.18, [0.01, 0.08, 0.11])
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
