// IslandManager — builds and owns every island in the archipelago.
//
// Responsibilities:
//   - Instantiate a terrain definition per island (render + collision share
//     the same height function).
//   - Build each island's static content into its own batched mesh group
//     (one PrimitiveBatch per island → few draw calls per island).
//   - Provide the GLOBAL ground/slope samplers the player and camera use
//     (max over island height functions; open sea falls back to the deep
//     sea floor, which the player cannot enter anyway).
//   - Expose HUD zones, spawn points, travel docks and LOD helpers.
import { PrimitiveBatch } from '../../core/primitiveBatch.js';
import { AssetKit } from '../../assets/kit.js';
import { createIslandTerrainDef } from './terrainBuilder.js';
import { ISLAND_DEFS } from './islandRegistry.js';
import { getMaterials } from '../../assets/materials.js';
import { CollisionSystem } from '../systems/collisionSystem.js';
import { placeAsset } from '../systems/assetFactory.js';
import { scatter, scatterGroup } from '../systems/assetPlacement.js';

// Per-island layout modules
import { layout as layoutStarter } from './pirateStarterIsland.js';
import { layout as layoutJungle } from './jungleIsland.js';
import { layout as layoutDesert } from './desertIsland.js';
import { layout as layoutSnow } from './snowIsland.js';
import { layout as layoutVolcanic } from './volcanicIsland.js';

const LAYOUTS = {
  pirate_starter: layoutStarter,
  jungle_isle: layoutJungle,
  desert_isle: layoutDesert,
  snow_isle: layoutSnow,
  volcanic_isle: layoutVolcanic
};

export class IslandManager {
  constructor(app, device, collision) {
    this.app = app;
    this.device = device;
    this.collision = collision || new CollisionSystem();
    this.mats = getMaterials();
    this.islands = [];

    for (const def of ISLAND_DEFS) {
      const terrain = createIslandTerrainDef({
        ...def.terrain,
        kind: def.terrain.kind === 'starter' ? 'starter' : 'param',
        name: def.name,
        cx: def.cx,
        cz: def.cz,
        rx: def.rx,
        rz: def.rz,
        palette: def.theme,
        meshSize: def.meshSize,
        meshSegments: def.meshSegments,
        snowLine: def.terrain.snowLine ?? null
      });
      this.islands.push({
        def,
        terrain,
        detailEntity: null,   // grass/flower micro-detail batch (LOD toggled)
        staticEntity: null,
        glbPlacements: []
      });
    }
  }

  // Build everything. layoutFns receive an island-scoped env.
  buildAll() {
    for (const island of this.islands) {
      const { def, terrain } = island;

      // Terrain mesh
      terrain.build(this.app, this.device, def.meshSegments);

      // Island-scoped environment for asset placement. Layouts author in
      // LOCAL island coordinates (origin = island centre); the env wrappers
      // convert to world space automatically.
      const batch = new PrimitiveBatch();
      const detailBatch = new PrimitiveBatch();
      const env = {
        app: this.app,
        device: this.device,
        batch,
        detailBatch,
        collision: this.collision,
        mats: this.mats,
        def,
        islandOffset: [def.cx, def.cz],
        travelPoints: [],
        groundAt: (x, z) => this.groundAt(x + def.cx, z + def.cz),
        slopeAt: (x, z) => this.slopeAt(x + def.cx, z + def.cz),
        placeAsset: (assetId, opts) => {
          // The captain's landmark is loaded as a standalone GLB Entity.
          // Keep its original procedural asset as an asynchronous fallback.
          if (def.id === 'pirate_starter' && assetId === 'pirate_captain_house') {
            island.glbPlacements.push({ assetId, opts: { ...opts } });
            return null;
          }
          return placeAsset(env, assetId, opts);
        },
        scatter: (opts) => scatter(env, opts),
        scatterGroup: (opts) => scatterGroup(env, opts),
        // Run a callback with a transient kit whose local geometry is
        // offset onto the island (for direct custom dressing).
        extraKit: (fn) => {
          const kit = new AssetKit().setSeed(4242);
          fn(kit);
          kit.build(env, { position: [def.cx, 0, def.cz], rotationY: 0, scale: 1, collide: false });
        }
      };
      island.env = env;

      // Run the island layout (assets + colliders into env.batch)
      const layoutFn = LAYOUTS[def.id];
      if (layoutFn) {
        layoutFn(env);
      } else {
        console.warn(`[islandManager] no layout for island "${def.id}"`);
      }

      // Merge batches into render entities
      island.staticEntity = batch.build(this.app, `${def.name} Static`);
      island.detailEntity = detailBatch.build(this.app, `${def.name} Detail`);
      island.detailEntity.render.castShadows = false;

      // Load standalone landmark models after the island batches exist.
      for (const placement of island.glbPlacements) {
        this._loadCaptainHouse(island, placement);
      }
    }
  }

  // Load the captain's house as a separate PlayCanvas container Entity.
  // If loading fails, rebuild only that asset into its own batch as fallback.
  _loadCaptainHouse(island, placement) {
    const { assetId, opts } = placement;
    const pos = opts.position || [48, 42];
    const lx = pos[0];
    const lz = pos.length >= 3 ? pos[2] : pos[1];
    const x = lx + island.def.cx;
    const z = lz + island.def.cz;
    const y = pos.length >= 3 ? pos[1] : island.env.groundAt(lx, lz);
    const yawDeg = opts.rotationY || 0;
    const scale = opts.scale || 1;
    const url = '/assets/models/buildings/pirate-captain-house.glb';

    this.app.assets.loadFromUrl(url, 'container', (err, asset) => {
      if (err || !asset || !asset.resource) {
        console.error('[islandManager] Captain house GLB failed; using procedural fallback.', err);
        this._buildCaptainHouseFallback(island, assetId, opts);
        return;
      }

      try {
        const entity = asset.resource.instantiateRenderEntity();
        entity.name = 'Pirate Captain House GLB';
        entity.setLocalPosition(x, y, z);
        entity.setLocalEulerAngles(0, yawDeg, 0);
        entity.setLocalScale(scale, scale, scale);
        this.app.root.addChild(entity);

        // Preserve the model's normal lighting/shadow behaviour.
        const setShadows = (node) => {
          if (node.render) {
            node.render.castShadows = true;
            node.render.receiveShadows = true;
          }
          for (const child of node.children) setShadows(child);
        };
        setShadows(entity);

        this._addCaptainHouseCollision(x, y, z, yawDeg, scale);
        island.captainHouseEntity = entity;
        console.info('[islandManager] Captain house GLB loaded.', { x, y, z, yawDeg, scale });
      } catch (loadError) {
        console.error('[islandManager] Could not instantiate Captain house GLB; using fallback.', loadError);
        this._buildCaptainHouseFallback(island, assetId, opts);
      }
    });
  }

  _buildCaptainHouseFallback(island, assetId, opts) {
    const fallbackBatch = new PrimitiveBatch();
    const fallbackEnv = {
      ...island.env,
      batch: fallbackBatch,
      detailBatch: new PrimitiveBatch()
    };
    placeAsset(fallbackEnv, assetId, opts);
    const entity = fallbackBatch.build(this.app, 'Pirate Captain House Procedural Fallback');
    if (entity && entity.render) entity.render.castShadows = true;
    island.captainHouseFallback = entity;
  }

  // Four wall colliders leave a doorway open. Dimensions follow the GLB's
  // approximately 10.9 x 8.56 m footprint; the original procedural asset
  // remains untouched and supplies collision automatically on fallback.
  _addCaptainHouseCollision(x, y, z, yawDeg, scale) {
    const yaw = yawDeg * Math.PI / 180;
    const c = Math.cos(yaw);
    const s = Math.sin(yaw);
    const addLocalBox = (lx, lz, hx, hz) => {
      this.collision.addBox({
        x: x + lx * c - lz * s,
        z: z + lx * s + lz * c,
        hx: hx * scale,
        hz: hz * scale,
        y0: y,
        y1: y + 6.4 * scale,
        yaw
      });
    };

    // Side and rear walls.
    addLocalBox(-5.25, 0, 0.18, 4.10);
    addLocalBox(5.25, 0, 0.18, 4.10);
    addLocalBox(0, -4.10, 5.25, 0.18);
    // Front wall split around the entrance.
    addLocalBox(-4.375, 4.10, 0.875, 0.18);
    addLocalBox(1.775, 4.10, 3.475, 0.18);
  }

  // Global ground height: the highest island surface at (x, z). Far from
  // every island every function returns the clamped sea floor (-9.5).
  groundAt(x, z) {
    let h = -9.5;
    for (const island of this.islands) {
      const { def } = island;
      const dx = (x - def.cx) / (def.rx * 1.35);
      const dz = (z - def.cz) / (def.rz * 1.35);
      if (dx * dx + dz * dz > 1.2) continue; // far outside — skip the noise cost
      const hh = island.terrain.height(x, z);
      if (hh > h) h = hh;
    }
    return h;
  }

  slopeAt(x, z) {
    // Slope of whichever island owns this point (skip in open sea).
    for (const island of this.islands) {
      const { def } = island;
      const dx = (x - def.cx) / (def.rx * 1.35);
      const dz = (z - def.cz) / (def.rz * 1.35);
      if (dx * dx + dz * dz > 1.2) continue;
      return island.terrain.slope(x, z);
    }
    return 0;
  }

  // Which island (if any) is at this world position?
  islandAt(x, z) {
    for (const island of this.islands) {
      if (island.terrain.contains(x, z)) return island;
    }
    return null;
  }

  islandById(id) {
    return this.islands.find((i) => i.def.id === id) || null;
  }

  // HUD zones across all islands (converted to world-space coordinates).
  allZones() {
    const zones = [];
    for (const island of this.islands) {
      for (const z of island.def.zones) {
        zones.push({ ...z, x: z.x + island.def.cx, z: z.z + island.def.cz, islandId: island.def.id });
      }
    }
    return zones;
  }

  // All registered travel points (docked boats), converted to world space.
  allTravelPoints() {
    const pts = [];
    for (const island of this.islands) {
      if (island.env && island.env.travelPoints) {
        for (const p of island.env.travelPoints) {
          pts.push({ ...p, x: p.x + island.def.cx, z: p.z + island.def.cz });
        }
      }
    }
    return pts;
  }

  defaultZoneName(x, z) {
    const island = this.islandAt(x, z);
    return island ? island.def.name : 'Open Sea';
  }

  spawn() {
    const first = this.islands[0];
    const s = first.def.spawn;
    return {
      x: s.x + first.def.cx,
      z: s.z + first.def.cz,
      y: this.groundAt(s.x + first.def.cx, s.z + first.def.cz) + 0.1,
      yaw: s.yaw || 0,
      islandId: first.def.id
    };
  }

  // LOD: hide micro-detail batches far from the camera.
  updateDetailVisibility(cameraPos) {
    for (const island of this.islands) {
      if (!island.detailEntity) continue;
      const d = Math.hypot(
        cameraPos.x - island.def.cx,
        cameraPos.z - island.def.cz
      ) - Math.max(island.def.rx, island.def.rz);
      island.detailEntity.enabled = d < 380;
    }
  }
}
