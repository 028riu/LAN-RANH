import * as pc from 'playcanvas';

function makePrimitive(app, name, type, position, scale, material) {
  const entity = new pc.Entity(name);
  entity.addComponent('render', { type, material });
  entity.setPosition(...position);
  entity.setLocalScale(...scale);
  app.root.addChild(entity);
  return entity;
}

function makeMaterial(color, opts = {}) {
  const material = new pc.StandardMaterial();
  material.diffuse = new pc.Color(...color);
  material.roughness = opts.roughness ?? 0.86;
  if (opts.emissive) material.emissive = new pc.Color(...opts.emissive);
  material.update();
  return material;
}

export function createWorld(app) {
  const sand = makeMaterial([0.76, 0.66, 0.43]);
  const grass = makeMaterial([0.22, 0.48, 0.29]);
  const darkGrass = makeMaterial([0.12, 0.31, 0.22]);
  const stone = makeMaterial([0.36, 0.4, 0.39]);
  const wood = makeMaterial([0.34, 0.2, 0.12]);
  const leaf = makeMaterial([0.12, 0.38, 0.23]);
  const water = makeMaterial([0.035, 0.31, 0.43], { roughness: 0.25 });
  const gold = makeMaterial([0.9, 0.62, 0.22], { emissive: [0.12, 0.055, 0.008] });

  makePrimitive(app, 'Ocean', 'plane', [0, -1.3, 0], [180, 1, 180], water);
  makePrimitive(app, 'Island Sand Base', 'cylinder', [0, -0.15, 0], [38, 2.3, 38], sand);
  makePrimitive(app, 'Island Grass', 'cylinder', [0, 0.72, 0], [34, 1.1, 34], grass);
  makePrimitive(app, 'Central Meadow', 'sphere', [0, 0.5, 0], [23, 1.2, 23], darkGrass);

  // A small coastal settlement.
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const x = Math.cos(angle) * 10;
    const z = Math.sin(angle) * 10;
    makePrimitive(app, `Cabin ${i + 1}`, 'box', [x, 2.05, z], [3.2, 3.1, 2.8], wood);
    makePrimitive(app, `Roof ${i + 1}`, 'cone', [x, 4.2, z], [2.35, 1.45, 2.15], stone);
  }

  // Stylized palms around the beach and meadow.
  for (let i = 0; i < 24; i++) {
    const angle = i * 2.399;
    const radius = 15 + (i % 3) * 1.8;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    makePrimitive(app, `Palm Trunk ${i}`, 'cylinder', [x, 2.1, z], [0.28, 4.2, 0.28], wood);
    for (let j = 0; j < 5; j++) {
      const a = (j / 5) * Math.PI * 2;
      const leafEntity = makePrimitive(app, `Palm Leaf ${i}-${j}`, 'box',
        [x + Math.cos(a) * 1.35, 4.1, z + Math.sin(a) * 1.35],
        [2.9, 0.12, 0.48], leaf);
      leafEntity.setEulerAngles(0, -a * 180 / Math.PI, -18);
    }
  }

  // Rocks and a simple landmark.
  for (let i = 0; i < 18; i++) {
    const angle = i * 2.1;
    const radius = 6 + (i % 4) * 1.2;
    makePrimitive(app, `Rock ${i}`, 'sphere',
      [Math.cos(angle) * radius, 1.05, Math.sin(angle) * radius],
      [0.65 + (i % 3) * 0.25, 0.8, 0.7], stone);
  }
  makePrimitive(app, 'Quest Beacon', 'cylinder', [0, 1.65, -5], [0.45, 2.1, 0.45], gold);
  makePrimitive(app, 'Beacon Cap', 'sphere', [0, 2.85, -5], [0.65, 0.65, 0.65], gold);

  const sun = new pc.Entity('Sun Light');
  sun.addComponent('light', { type: 'directional', color: new pc.Color(1, 0.88, 0.72), intensity: 1.8, castShadows: true, shadowResolution: 1024 });
  sun.setEulerAngles(45, 35, 0);
  app.root.addChild(sun);

  const fill = new pc.Entity('Sky Fill');
  fill.addComponent('light', { type: 'omni', color: new pc.Color(0.45, 0.65, 1), intensity: 0.35, range: 100 });
  fill.setPosition(0, 18, 0);
  app.root.addChild(fill);
}
