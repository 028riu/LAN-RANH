const MODEL_BASE = `${import.meta.env.BASE_URL}assets/models/`;

const MODEL_FILES = {
  terrain: 'terrain/highland_terrain.glb',
  pine: 'vegetation/pine_tree.glb',
  station: 'structures/field_station.glb',
  outpost: 'structures/observation_outpost.glb',
  boulder: 'nature/boulder.glb'
};

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

function createLighting(root, app, pc) {
  const sun = new pc.Entity('Late Afternoon Sun');
  sun.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1, 0.86, 0.72),
    intensity: 1.8,
    castShadows: true,
    shadowResolution: 2048,
    shadowDistance: 190,
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
  app.scene.fog.start = 115;
  app.scene.fog.end = 390;
  app.scene.skyboxMip = 0;
}

function makeForestPlacements() {
  const placements = [];
  let seed = 71237;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < 105; i++) {
    const x = (random() - 0.5) * 270;
    const z = (random() - 0.5) * 270;
    if (Math.abs(x) < 15 && z > -100 && z < 78) continue;
    placements.push({
      position: [x, 0, z],
      rotation: random() * 360,
      scale: 0.82 + random() * 0.48
    });
  }
  return placements;
}

function makeRockPlacements() {
  const placements = [];
  let seed = 92831;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let i = 0; i < 32; i++) {
    const x = (random() - 0.5) * 230;
    const z = (random() - 0.5) * 230;
    if (Math.abs(x) < 18 && z > -95 && z < 80) continue;
    placements.push({
      position: [x, 0, z],
      rotation: random() * 360,
      scale: 0.72 + random() * 1.1
    });
  }
  return placements;
}

export async function buildWorld(app, pc, onProgress = () => {}) {
  const root = new pc.Entity('World');
  app.root.addChild(root);
  createLighting(root, app, pc);

  const required = ['terrain', 'pine', 'station', 'outpost'];
  const optional = ['boulder'];
  const allKeys = [...required, ...optional];
  const loaded = new Map();
  const failures = [];

  let completed = 0;
  onProgress('ĐANG TẢI ĐỊA HÌNH 3D...');

  await Promise.all(allKeys.map(async (key) => {
    try {
      loaded.set(key, await loadContainer(app, MODEL_FILES[key]));
    } catch (error) {
      failures.push({ key, error });
      console.warn(`[LẰN RANH] Không tải được model "${key}":`, error);
    } finally {
      completed++;
      onProgress(`ĐANG TẢI MODEL 3D... ${completed}/${allKeys.length}`);
    }
  }));

  if (loaded.has('terrain')) {
    addModel(loaded.get('terrain'), root, 'Highland Terrain', [0, 0, 0]);
  }

  if (loaded.has('pine')) {
    const pine = loaded.get('pine');
    for (const [index, item] of makeForestPlacements().entries()) {
      addModel(pine, root, `Pine Tree ${index + 1}`, item.position, item.rotation, item.scale);
    }
  }

  if (loaded.has('station')) {
    addModel(loaded.get('station'), root, 'Field Station', [0, 0, -57]);
  }

  if (loaded.has('outpost')) {
    addModel(loaded.get('outpost'), root, 'Observation Outpost', [35, 0, -82]);
  }

  if (loaded.has('boulder')) {
    const boulder = loaded.get('boulder');
    for (const [index, item] of makeRockPlacements().entries()) {
      addModel(boulder, root, `Boulder ${index + 1}`, item.position, item.rotation, item.scale);
    }
  }

  const missingRequired = required.filter((key) => !loaded.has(key));
  if (missingRequired.length) {
    onProgress(`THIẾU MODEL: ${missingRequired.join(', ')}`);
  } else {
    onProgress('ĐÃ TẢI XONG CÁC MODEL 3D');
  }

  return {
    root,
    loaded: [...loaded.keys()],
    missingRequired,
    optionalFailures: failures.filter(({ key }) => optional.includes(key)).map(({ key }) => key)
  };
}
