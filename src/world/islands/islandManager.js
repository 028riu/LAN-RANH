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



// External GLB replacements for procedural house assets. Paths retain the
// original uploaded filenames; encodeURI safely handles their spaces.
const GLB_BUILDINGS = {
  dock_house: { file: 'pirate-stilt-tavern.glb', width: 10, depth: 8, height: 6 },
  harbor_warehouse: { file: 'Storage House by Quaternius - d2ZQWcuhwR.glb', width: 11, depth: 9, height: 6 },
  pirate_captain_house: { file: 'Fantasy Inn by Quaternius - x3ZcGn3jr4.glb', width: 12, depth: 10, height: 6.2 },
  house_wood_large: { file: 'Cottage by CreativeTrio - YDGLLT0emC.glb', width: 8, depth: 7, height: 5.5 },
  house_wood_small: { files: ['House by Quaternius - L7h0SjZX2K.glb', 'House by Quaternius - RSwoYSLblu.glb'], width: 6.5, depth: 6, height: 4.8 },
  house_stone: { file: 'Fantasy House by Quaternius - BH2XHWUNmF.glb', width: 8, depth: 7, height: 8.2 },
  coastal_house: { file: 'House by Quaternius - k6tP5nFUd2.glb', width: 7.5, depth: 7, height: 5 },
  storage_house: { file: 'Storage House by Quaternius - d2ZQWcuhwR.glb', width: 9, depth: 8, height: 5.5 },
  fishing_hut: { file: 'House by Quaternius - nihGGju7DW.glb', width: 8, depth: 7, height: 5.5 },
  beach_hut: { files: ['House by Quaternius - YlADpCJU8U.glb', 'House by Quaternius - vZ1CLbWmSx.glb'], width: 7, depth: 6, height: 5 }
};

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
          // House modules are replaced by uploaded GLB models. Other modular
          // structures (stalls, shops, watchtowers, docks, props) stay batched.
          if (GLB_BUILDINGS[assetId]) {
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
        this._loadGlbBuilding(island, placement);
      }
    }
  }

  // Load a standalone building GLB and normalize its native dimensions to the island scale.
  _loadGlbBuilding(island, placement) {
    const { assetId, opts } = placement;
    const pos = opts.position || [48, 42];
    const lx = pos[0];
    const lz = pos.length >= 3 ? pos[2] : pos[1];
    const x = lx + island.def.cx;
    const z = lz + island.def.cz;
    const y = pos.length >= 3 ? pos[1] : island.env.groundAt(lx, lz);
    const yawDeg = opts.rotationY || 0;
    const placementScale = opts.scale || 1;
    const modelConfig = GLB_BUILDINGS[assetId];
    if (!modelConfig) return;
    const variantFiles = modelConfig.files;
    const variantIndex = Math.abs(opts.variant || 0) % (variantFiles ? variantFiles.length : 1);
    const model = { ...modelConfig, file: variantFiles ? variantFiles[variantIndex] : modelConfig.file };
    const url = `/assets/models/buildings/${encodeURI(model.file)}`;

    this.app.assets.loadFromUrl(url, 'container', (err, asset) => {
      if (err || !asset || !asset.resource) {
        console.error(`[islandManager] ${assetId} GLB failed to load.`, err);
        return;
      }

      let entity = null;
      try {
        entity = asset.resource.instantiateRenderEntity();
        entity.name = `${assetId} GLB`;
        entity.setLocalPosition(0, 0, 0);
        entity.setLocalEulerAngles(0, 0, 0);
        entity.setLocalScale(1, 1, 1);
        this.app.root.addChild(entity);
        entity.syncHierarchy();

        // Read actual render bounds. Use the same measured footprint for
        // both visual normalization and collision, never guessed hitboxes.
        const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };
        for (const render of entity.findComponents('render')) {
          for (const mi of render.meshInstances) {
            const aabb = mi.aabb;
            if (!aabb) continue;
            bounds.minX = Math.min(bounds.minX, aabb.center.x - aabb.halfExtents.x);
            bounds.maxX = Math.max(bounds.maxX, aabb.center.x + aabb.halfExtents.x);
            bounds.minY = Math.min(bounds.minY, aabb.center.y - aabb.halfExtents.y);
            bounds.maxY = Math.max(bounds.maxY, aabb.center.y + aabb.halfExtents.y);
            bounds.minZ = Math.min(bounds.minZ, aabb.center.z - aabb.halfExtents.z);
            bounds.maxZ = Math.max(bounds.maxZ, aabb.center.z + aabb.halfExtents.z);
          }
        }
        const nativeHeight = bounds.maxY - bounds.minY;
        const nativeWidth = bounds.maxX - bounds.minX;
        const nativeDepth = bounds.maxZ - bounds.minZ;
        if (![nativeHeight, nativeWidth, nativeDepth].every(Number.isFinite) || nativeHeight < 0.001 || nativeWidth < 0.001 || nativeDepth < 0.001) {
          throw new Error('GLB has invalid render bounds');
        }

        const normalizedScale = (model.height / nativeHeight) * placementScale;
        entity.setLocalScale(normalizedScale, normalizedScale, normalizedScale);
        entity.setLocalEulerAngles(0, yawDeg, 0);
        const centerX = (bounds.minX + bounds.maxX) * 0.5;
        const centerZ = (bounds.minZ + bounds.maxZ) * 0.5;
        const yaw = yawDeg * Math.PI / 180;
        const offsetX = centerX * normalizedScale;
        const offsetZ = centerZ * normalizedScale;
        const worldOffsetX = offsetX * Math.cos(yaw) - offsetZ * Math.sin(yaw);
        const worldOffsetZ = offsetX * Math.sin(yaw) + offsetZ * Math.cos(yaw);
        entity.setLocalPosition(x - worldOffsetX, y - bounds.minY * normalizedScale, z - worldOffsetZ);

        const setShadows = (node) => {
          if (node.render) {
            node.render.castShadows = true;
            node.render.receiveShadows = true;
          }
          for (const child of node.children) setShadows(child);
        };
        setShadows(entity);

        this._addBuildingCollision(
          x, y, z, yawDeg,
          nativeWidth * normalizedScale,
          nativeDepth * normalizedScale,
          nativeHeight * normalizedScale
        );
        island.glbEntities = island.glbEntities || [];
        island.glbEntities.push(entity);
        console.info(`[islandManager] ${assetId} GLB loaded.`, {
          x, y, z, yawDeg, normalizedScale,
          footprint: [nativeWidth * normalizedScale, nativeDepth * normalizedScale],
          targetHeight: model.height, url
        });
      } catch (loadError) {
        console.error(`[islandManager] Could not instantiate ${assetId} GLB.`, loadError);
        if (entity && entity.parent) entity.destroy();
      }
    });
  }

  // Solid oriented footprint collider uses the imported model's measured bounds.
  // This prevents the player from walking through any side of a house.
  _addBuildingCollision(x, y, z, yawDeg, width, depth, height) {
    const yaw = yawDeg * Math.PI / 180;
    const margin = 0.18;
    this.collision.addBox({
      x, z,
      hx: Math.max(0.35, width * 0.5 - margin),
      hz: Math.max(0.35, depth * 0.5 - margin),
      y0: y,
      y1: y + height * 0.9,
      yaw
    });
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
