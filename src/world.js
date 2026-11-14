const MODEL_BASE = `${import.meta.env.BASE_URL}assets/models/`;
const MANIFEST_URL = MODEL_BASE + 'manifest.json';

const MODEL_FILES = {
  pine: 'vegetation/pine_tree.glb',
  station: 'structures/field_station.glb',
  outpost: 'structures/observation_outpost.glb'
};

const WORLD_SIZE = 400;
const HALF_WORLD = WORLD_SIZE / 2;

export function terrainHeight(x, z) {
  const broad =
    5.8 * Math.sin(x * 0.018 + 0.7) * Math.cos(z * 0.015) +
    4.2 * Math.sin(z * 0.026 + x * 0.009) +
    2.4 * Math.cos(x * 0.039 - z * 0.022);
  const ridgeA = 16 * Math.exp(-(((x - 112) ** 2) / 2500 + ((z + 35) ** 2) / 5200));
  const ridgeB = 12 * Math.exp(-(((x + 128) ** 2) / 4200 + ((z - 88) ** 2) / 3300));
  const ridgeC = 9 * Math.exp(-(((x - 12) ** 2) / 7000 + ((z - 155) ** 2) / 2200));
  const baseFlatten = Math.max(0, 1 - Math.hypot(x, z + 58) / 42);
  return (broad + ridgeA + ridgeB + ridgeC) * (1 - baseFlatten * 0.88);
}

async function readModelManifest() {
  try {
    const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn('[LẰN RANH] Không đọc được manifest model.', error);
    return {};
  }
}

function loadContainer(app, relativePath) {
  const url = MODEL_BASE + relativePath;
  const filename = relativePath.split('/').pop();
  return new Promise((resolve, reject) => {
    app.assets.loadFromUrlAndFilename(url, filename, 'container', (error, asset) => {
      if (error || !asset?.resource) {
        reject(error || new Error(`Không có tài nguyên GLB: ${url}`));
        return;
      }
      resolve(asset);
    });
  });
}

function addModel(asset, parent, name, position, rotation = 0, scale = 1) {
  const entity = asset.resource.instantiateRenderEntity();
  entity.name = name;
  entity.setLocalPosition(position[0], position[1], position[2]);
  entity.setLocalEulerAngles(0, rotation, 0);
  entity.setLocalScale(scale, scale, scale);
  parent.addChild(entity);
  return entity;
}

function addPrimitive(parent, pc, name, type, position, scale, color, rotation = 0) {
  const entity = new pc.Entity(name);
  entity.addComponent('render', { type });
  entity.setLocalPosition(position[0], position[1], position[2]);
  entity.setLocalEulerAngles(0, rotation, 0);
  entity.setLocalScale(scale[0], scale[1], scale[2]);
  const material = new pc.StandardMaterial();
  material.diffuse = new pc.Color(color[0], color[1], color[2]);
  material.roughness = 1;
  material.update();
  for (const meshInstance of entity.render.meshInstances) {
    meshInstance.material = material;
    meshInstance.castShadow = true;
    meshInstance.receiveShadow = true;
  }
  parent.addChild(entity);
  return entity;
}

function createTerrain(parent, app, pc) {
  const divisions = 100;
  const step = WORLD_SIZE / divisions;
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let z = 0; z <= divisions; z++) {
    for (let x = 0; x <= divisions; x++) {
      const wx = -HALF_WORLD + x * step;
      const wz = -HALF_WORLD + z * step;
      positions.push(wx, terrainHeight(wx, wz), wz);
      const dx = terrainHeight(wx + 0.5, wz) - terrainHeight(wx - 0.5, wz);
      const dz = terrainHeight(wx, wz + 0.5) - terrainHeight(wx, wz - 0.5);
      const normal = new pc.Vec3(-dx, 1, -dz).normalize();
      normals.push(normal.x, normal.y, normal.z);
      uvs.push(x / 8, z / 8);
    }
  }

  for (let z = 0; z < divisions; z++) {
    for (let x = 0; x < divisions; x++) {
      const a = z * (divisions + 1) + x;
      const b = a + 1;
      const c = a + divisions + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const mesh = pc.createMesh(app.graphicsDevice, positions, { normals, uvs, indices });
  const material = new pc.StandardMaterial();
  material.diffuse = new pc.Color(0.29, 0.34, 0.27);
  material.specular = new pc.Color(0.06, 0.06, 0.05);
  material.shininess = 5;
  material.useMetalness = false;
  material.update();

  const ground = new pc.Entity('Procedural Highland Terrain');
  ground.addComponent('render', { meshInstances: [new pc.MeshInstance(mesh, material)] });
  ground.render.meshInstances[0].receiveShadow = true;
  parent.addChild(ground);
}

function createRoad(parent, pc, points, width = 5) {
  const roadMaterial = [0.25, 0.24, 0.20];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, z1] = points[i];
    const [x2, z2] = points[i + 1];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const length = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz) * 180 / Math.PI;
    const x = (x1 + x2) / 2;
    const z = (z1 + z2) / 2;
    const y = terrainHeight(x, z) + 0.08;
    addPrimitive(parent, pc, `Dirt Track ${i + 1}`, 'box', [x, y, z], [width, 0.16, length + 1], roadMaterial, angle);
  }
}

function createLighting(root, app, pc) {
  const sun = new pc.Entity('Late Afternoon Sun');
  sun.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1, 0.86, 0.72),
    intensity: 1.65,
    castShadows: true,
    shadowResolution: 2048,
    shadowDistance: 220,
    normalOffsetBias: 0.04,
    bias: 0.0001
  });
  sun.setLocalEulerAngles(48, 32, 0);
  root.addChild(sun);

  const skyFill = new pc.Entity('Sky Fill');
  skyFill.addComponent('light', {
    type: 'directional',
    color: new pc.Color(0.58, 0.69, 0.84),
    intensity: 0.42
  });
  skyFill.setLocalEulerAngles(145, -35, 0);
  root.addChild(skyFill);

  app.scene.fog.type = 'linear';
  app.scene.fog.color = new pc.Color(0.58, 0.66, 0.66);
  app.scene.fog.start = 145;
  app.scene.fog.end = 430;
}

function makeForestPlacements() {
  const placements = [];
  let seed = 71237;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 155; i++) {
    const x = (random() - 0.5) * 350;
    const z = (random() - 0.5) * 350;
    if (Math.abs(x) < 20 && z > -112 && z < 82) continue;
    if (Math.hypot(x - 35, z + 82) < 18) continue;
    placements.push({
      position: [x, terrainHeight(x, z), z],
      rotation: random() * 360,
      scale: 0.78 + random() * 0.58
    });
  }
  return placements;
}

export async function buildWorld(app, pc, onProgress = () => {}) {
  const root = new pc.Entity('World');
  app.root.addChild(root);
  createLighting(root, app, pc);
  createTerrain(root, app, pc);

  const manifest = await readModelManifest();
  const required = ['pine', 'station', 'outpost'];
  const loaded = new Map();
  const missing = required.filter((key) => manifest[key] !== true);

  onProgress('ĐANG TẠO ĐỊA HÌNH CAO NGUYÊN...');
  let completed = 0;
  const available = required.filter((key) => manifest[key] === true);
  await Promise.all(available.map(async (key) => {
    try {
      loaded.set(key, await loadContainer(app, MODEL_FILES[key]));
    } catch (error) {
      missing.push(key);
      console.warn(`[LẰN RANH] Không tải được model "${key}":`, error);
    } finally {
      completed++;
      onProgress(`ĐANG TẢI MODEL 3D... ${completed}/${available.length}`);
    }
  }));

  createRoad(root, pc, [[0, 145], [0, 105], [-4, 72], [0, 28], [0, -8], [16, -38], [35, -82]], 5.5);
  createRoad(root, pc, [[0, 28], [-28, 18], [-58, 8], [-88, -8], [-118, -28]], 4.2);
  createRoad(root, pc, [[0, 28], [24, 38], [52, 46], [82, 52], [112, 65]], 4.2);

  if (loaded.has('pine')) {
    const pine = loaded.get('pine');
    for (const [index, item] of makeForestPlacements().entries()) {
      addModel(pine, root, `Pine Tree ${index + 1}`, item.position, item.rotation, item.scale);
    }
  }

  if (loaded.has('station')) {
    const x = 0, z = -57;
    addModel(loaded.get('station'), root, 'Field Station', [x, terrainHeight(x, z), z], 0, 1);
  }
  if (loaded.has('outpost')) {
    const x = 35, z = -82;
    addModel(loaded.get('outpost'), root, 'Observation Outpost', [x, terrainHeight(x, z), z], 0, 1);
  }

  const missingRequired = required.filter((key) => missing.includes(key) || !loaded.has(key));
  onProgress(missingRequired.length
    ? `ĐANG CHỜ MODEL 3D: ${missingRequired.join(', ')}`
    : 'ĐÃ TẢI XONG THẾ GIỚI CAO NGUYÊN');

  return {
    root,
    loaded: [...loaded.keys()],
    missingRequired,
    optionalFailures: []
  };
}
