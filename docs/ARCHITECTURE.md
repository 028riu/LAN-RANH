# Module architecture — FRUIT GAME ZRT V3

This document explains how the modular world architecture fits together, how to add
a new asset, and how to add a new island. (For the complete V3 system map see
`V3_ARCHITECTURE.md`; for what was preserved from V2 see `V2_AUDIT.md`.)

## 1. Layer overview

```
worldConfig ──► createWorld ──► environmentSystem (sky/ocean/lights)
                        │
                        ├─► IslandManager ──► terrainBuilder (per island)
                        │         │
                        │         ├─► island layouts (data-driven composition)
                        │         └─► env.placeAsset / env.scatter
                        │                   │
                        │                   ▼
                        │             assetFactory ──► asset modules (assets/*)
                        │                   │
                        │                   ├─► PrimitiveBatch (island mesh)
                        │                   └─► CollisionSystem (colliders)
                        │
                        └─► CollisionSystem ──► player + camera queries
```

## 2. AssetKit (`src/assets/kit.js`)

Every asset module receives an `AssetKit` and authors geometry in **local space**
(origin = ground centre of the asset, +Z = front):

- `kit.box / cyl / sphere / ellipsoid / gable / pyramid / leanTo(mat, center, size…)`
- `kit.beam(mat, p0, p1, width, thickness, up)` — **V3**: an oriented box between
  two exact points (drooping fronds, arched branches, braces, sagging ropes).
- `kit.pushFrame([x,y,z], yawDeg, scale)` / `kit.popFrame()` — author sub-assemblies
  (a door on a side wall) in their own coordinates.
- `kit.colliderBox / colliderCylinder(center, size)` — register local-space colliders.
- Tone variation: pass an ARRAY of materials for a role and the kit picks one per
  part deterministically (`setSeed`).

When placed, `kit.build(env, placement)` transforms all parts by
(position, rotationY, uniform scale), merges geometry into the island's
`PrimitiveBatch` and registers world-space colliders into the `CollisionSystem`.

## 3. Asset module contract

```js
// src/assets/buildings/my_tower.js
export const meta = { id: 'my_tower', label: 'My Tower' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  // ... author with kit.* using opts.position (local), opts.variant, opts.seed ...
}
```

Register it in the folder's `index.js`. The factory resolves ground height,
creates a seeded kit, calls `build`, then merges. Options understood by the
factory: `position ([x,z] or [x,y,z]), rotationY, scale, theme, variant,
colorVariant, seed, collide, detail`.

## 4. Theme system (`src/assets/materials.js`)

Materials are singletons. Each theme (tropical/jungle/desert/snow/volcanic) exposes
the same ROLE names — `wall, trim, foundation, roof, roofTrim, door, shutter,
accent…` — so a building module never hard-codes colours:

```js
const mats = env.mats.forTheme('snow');   // same house → snow palace
```

## 5. Shared architecture vocabulary (`src/assets/parts/architectureParts.js`)

- `plankWall` — vertical plank strips with base/top bands and **real openings**;
  door openings split the wall colliders, lintels are walk-under colliders.
- `doorUnit` — jamb + lintel + hinged leaf (open angle configurable) + handle.
- `windowUnit` — frame, mullions, glass, shutters, sill.
- `gableRoofDetailed` — inset prism + proud shingle rows + ridge cap + fascia.
- `pyramidRoofDetailed`, `leanToRoofDetailed`.
- `stepsRun` (walkable colliders), `railingRun` (blocking collider), `ladderRun`,
  `lanternPost` (emissive), `chimneyStack`, `foundationSlab` (buries into slopes),
  `signBoard`.

Buildings compose these helpers — no raw box-spam.

## 6. Islands (`src/world/islands/`)

- `islandRegistry.js` — pure data: centre, radii, terrain profile (seeded),
  theme, mesh resolution, spawn, travel dock, HUD zones, detail level.
- `terrainBuilder.js` — `createIslandTerrainDef(cfg)` returns
  `height(x,z) / slope(x,z) / contains(x,z) / build(app, device, segments)`.
  The starter island keeps its hand-tuned profile (plus a harbour trench);
  the other four use the seeded parametric profile (bumps, valleys, crater).
- Island layout modules (`pirateStarterIsland.js`, …) receive an `env` where ALL
  coordinates are LOCAL to the island:
  - `env.placeAsset(id, opts)`
  - `env.scatter({...})`, `env.scatterGroup({ weighted: [...] })`
  - `env.groundAt(x,z)`, `env.slopeAt(x,z)` (local wrappers over the global sampler)
  - `env.extraKit(fn)` — direct batch dressing with a transient kit
  - `env.travelPoints.push({ x, z, r, label, islandId })`
- `islandManager.js` — builds terrain + layouts, owns the per-island batches,
  converts zones/travel points to world space, exposes `groundAt/slopeAt/islandAt`,
  and toggles the detail LOD by camera distance.

### Adding an island

1. Add a definition to `islandRegistry.js` (centre, radii, terrain cfg, zones, dock).
2. Create `myIsland.js` exporting `layout(env)` that composes shared assets.
3. Register the layout in `islandManager.js` `LAYOUTS`.

No new geometry code is required — reuse the shared library.

## 7. Collision (`src/world/systems/collisionSystem.js`)

- Static colliders: yaw-rotated boxes + cylinders in a 16 m spatial hash.
- `resolve(x, z, feetY, radius, height, stepUp)`:
  - collider top within `stepUp` of the feet → standable (returns `standTop`);
  - capsule overlaps the body → circle-vs-OBB push-out (2 relaxation iterations,
    shallowest-face exit when deep inside);
  - capsule fully below the bottom → pass under (door lintels, bridge decks).
- `sphereFree(x, y, z, r)` — used by the camera obstruction pull-in.

The player (`createPlayer.js`) applies: per-axis slope/water check → collision
resolve → ground = max(terrain, standTop) → gravity/jump/land as before.

## 8. Island travel (`islandConnectionSystem.js`)

Travel points are registered beside each moored boat. Proximity shows the
“Press [E]” prompt; E opens the destination menu (frees the pointer via the
`travel` game state); choosing an island fades the screen and teleports the
player to that island's dock-foot spawn (local spawn + island centre).

## 9. Performance

- One `PrimitiveBatch` per island → one mesh per material (≈70 draw calls for the
  whole static world, ~630 total with character, shadow pass and ocean at 60 fps
  on common GPUs).
- Micro-detail (grass, flowers, ferns) goes to `detailBatch` per island and is
  hidden beyond ~380 m (`WORLD_CONFIG.detailHideDistance`).
- `?fx=low` halves the shadow map and shadow distance.
- Terrain 176–200² verts per island; share the height function for collision so
  no separate physics mesh exists.
