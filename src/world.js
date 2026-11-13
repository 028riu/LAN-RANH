export function buildWorld(app, pc) {
  const root = new pc.Entity('World');
  app.root.addChild(root);

  const material = (color, roughness = 0.92) => {
    const m = new pc.StandardMaterial();
    m.diffuse = new pc.Color(color[0], color[1], color[2]);
    m.roughness = roughness;
    m.metalness = 0;
    m.update();
    return m;
  };
  const grass = material([0.24, 0.31, 0.22]);
  const earth = material([0.35, 0.30, 0.22]);
  const stone = material([0.38, 0.40, 0.38]);
  const bark = material([0.24, 0.16, 0.10]);
  const pine = material([0.12, 0.22, 0.17]);
  const pineLight = material([0.19, 0.29, 0.21]);
  const concrete = material([0.43, 0.44, 0.39]);
  const roof = material([0.25, 0.20, 0.15]);
  const warm = material([0.65, 0.49, 0.28]);

  function primitive(name, type, pos, scale, mat, parent = root) {
    const e = new pc.Entity(name);
    e.addComponent('render', { type, material: mat, castShadows: true, receiveShadows: true });
    e.setLocalPosition(pos[0], pos[1], pos[2]);
    e.setLocalScale(scale[0], scale[1], scale[2]);
    parent.addChild(e);
    return e;
  }
  // Broad rolling-looking plateau base and a winding dirt trail.
  primitive('Highland Ground', 'box', [0, -1.2, 0], [420, 2, 420], grass);
  primitive('Main Trail A', 'box', [0, -0.13, 7], [9, 0.12, 110], earth);
  primitive('Main Trail B', 'box', [0, -0.12, -48], [9, 0.13, 58], earth);

  // Distant ridges frame the playable valley.
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2;
    const radius = 155 + (i % 3) * 12;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const h = 28 + (i % 4) * 9;
    primitive('Far Ridge', 'cone', [x, h * 0.42, z], [48 + (i%3)*10, h, 52 + (i%4)*8], stone);
  }

  // Pine grove clusters, deliberately kept clear of the starting path.
  let seed = 71237;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 175; i++) {
    const x = (random() - 0.5) * 260;
    const z = (random() - 0.5) * 260;
    if (Math.abs(x) < 13 && z > -92 && z < 75) continue;
    const height = 5 + random() * 5;
    const tree = new pc.Entity('Pine Tree');
    tree.setLocalPosition(x, 0, z);
    root.addChild(tree);
    const trunk = new pc.Entity('Trunk');
    trunk.addComponent('render', { type: 'cylinder', material: bark, castShadows: true });
    trunk.setLocalPosition(0, height * 0.24, 0);
    trunk.setLocalScale(0.55, height * 0.5, 0.55);
    tree.addChild(trunk);
    const crown = new pc.Entity('Pine Crown');
    crown.addComponent('render', { type: 'cone', material: random() > .5 ? pine : pineLight, castShadows: true });
    crown.setLocalPosition(0, height * 0.72, 0);
    crown.setLocalScale(3.3 + random()*1.4, height * 0.78, 3.3 + random()*1.4);
    tree.addChild(crown);
  }

  // Small Vietnamese highland field station.
  primitive('Station Floor', 'box', [0, 0.15, -55], [15, 0.5, 12], concrete);
  primitive('Station Main Building', 'box', [0, 3.1, -57], [10, 5.5, 8], warm);
  primitive('Station Roof', 'box', [0, 6.3, -57], [12, 0.65, 10], roof);
  primitive('Front Porch', 'box', [0, 1.1, -50], [12, 0.35, 3], bark);
  for (const x of [-4.2, 4.2]) primitive('Porch Post', 'cylinder', [x, 2.4, -49], [0.22, 2.7, 0.22], bark);
  primitive('Observation Platform', 'box', [35, 1.2, -82], [9, 2.4, 9], bark);
  primitive('Observation Deck', 'box', [35, 2.5, -82], [12, 0.35, 12], concrete);
  primitive('Beacon', 'cylinder', [35, 5, -82], [0.55, 5, 0.55], warm);

  // Scattered boulders along the outer trail.
  for (let i = 0; i < 38; i++) {
    const x = (random() - 0.5) * 230;
    const z = (random() - 0.5) * 230;
    if (Math.abs(x) < 18 && z > -95 && z < 80) continue;
    const s = 1.2 + random() * 3.8;
    const rock = primitive('Weathered Boulder', 'sphere', [x, s * .35, z], [s, s*.65, s*.85], stone);
    rock.setLocalEulerAngles(random()*18, random()*360, random()*15);
  }

  const sun = new pc.Entity('Late Afternoon Sun');
  sun.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1, 0.83, 0.65),
    intensity: 1.65,
    castShadows: true,
    shadowResolution: 2048,
    shadowDistance: 180,
    normalOffsetBias: 0.04,
    bias: 0. tumb
  });
  sun.setLocalEulerAngles(48, 32, 0);
  root.addChild(sun);

  const fill = new pc.Entity('Sky Fill');
  fill.addComponent('light', { type: 'directional', color: new pc.Color(0.55,0.67,0.82), intensity: 0.38 });
  fill.setLocalEulerAngles(145, -35, 0);
  root.addChild(fill);

  app.scene.fog = 'linear';
  app.scene.fogColor = new pc.Color(0.58, 0.66, 0.66);
  app.scene.fogStart = 100;
  app.scene.fogEnd = 360;
  app.scene.skyboxMip = 0;
}
