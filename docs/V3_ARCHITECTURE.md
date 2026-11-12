# V3 ARCHITECTURE — FRUIT GAME ZRT "Ultimate Stylized"

V3 preserves the V2 architecture (audited in `V2_AUDIT.md`) and extends it.
Nothing was renamed for renaming's sake; every new module plugs into the
existing `AssetKit → AssetFactory → PrimitiveBatch + CollisionSystem` pipeline.

## Engine and tooling (unchanged from V2)

- **PlayCanvas 2.x** (`^2.12`, tested against 2.29.x) — WebGL/WebGPU rendering.
- **Vite 7** — dev server + bundler (`base: './'`, ES2022 target).
- Vanilla ES modules, no framework, no downloaded assets — all geometry is
  authored procedurally in local space at build/run time.

## Data flow (how one asset becomes pixels + collision)

```
island layout  ──placeAsset(env, id, opts)──▶ AssetFactory
                                                │ resolves id in REGISTRY (59 modules)
                                                │ resolves ground y (terrain fn)
                                                │ new AssetKit().setSeed(deterministic)
                                                ▼
                                          asset.build(kit, env, opts)
                                                │ authors geometry in LOCAL space
                                                │ + registers kit-local colliders
                                                ▼
                                     kit.build(env, placement)
                                    ┌──────────┴───────────┐
                                    ▼                      ▼
                          PrimitiveBatch._pushRaw   CollisionSystem.addBox/addCylinder
                          (merged → 1 mesh per        (spatial hash, capsule resolve)
                           material per island)
```

## Directory layout (V3 changes marked)

```
src/
├── main.js                  # bootstrap, game states, camera input, travel wiring
├── core/
│   ├── mathUtils.js         # noise, PRNG, easing
│   ├── meshBuilder.js       # buildMesh, meshEntity, pbrMaterial
│   └── primitiveBatch.js    # batched primitives → 1 mesh per material
├── assets/
│   ├── kit.js               # AssetKit + NEW kit.beam() oriented-beam primitive
│   ├── materials.js         # shared + per-theme palettes  [+14 new materials]
│   ├── parts/architectureParts.js   # walls, doors, windows, roofs, steps, rails
│   ├── buildings/           # 14 modules  [+beach hut, +fishing hut,
│   │                        #   +harbour warehouse, +dock house]
│   ├── vegetation/          # 20 modules  [+frondKit, +palm 03, +broadleaf tree,
│   │                        #   +banana plant, +beach grass, +flower patch]
│   ├── rocks/               # 5 modules   [+coastal rock stack; cliffRock rebuilt]
│   ├── props/               # 17 modules  [+bench, +table, +chair, +flower pot,
│   │                        #   +basket, +bunting, +cargo stack, +bollard, +well]
│   └── decorations/         # rope, flag, hanging lantern (unchanged)
├── world/
│   ├── worldConfig.js       # global tuning (player, camera, fog, LOD)
│   ├── createWorld.js       # + builds shore foam after islands
│   ├── islands/
│   │   ├── islandRegistry.js    # data: position, size, theme, zones, docks
│   │   │                        #   [+beach/+watchtower/+coastal row zones]
│   │   ├── islandManager.js     # builds islands, global ground/slope, LOD
│   │   ├── terrainBuilder.js    # parametric terrain  [+wet-sand band,
│   │   │                        #   peak-only rock tint, stronger variation]
│   │   ├── pirateStarterIsland.js  # V3 flagship layout (11 zones, path network,
│   │   │                        #   summit viewing deck, beach zone)
│   │   ├── jungleIsland.js      # + broadleaf groves, banana understorey
│   │   ├── desertIsland.js      # + cactus groves, oasis trees, shore ring
│   │   ├── snowIsland.js        # + summit pine approach, shore ring
│   │   ├── volcanicIsland.js    # + shore ring, landing cargo
│   │   ├── ocean.js             # + current patching, dual-lobe sun glint
│   │   ├── sky.js               # + buildClouds() stylized cloud layer
│   │   └── shoreFoam.js         # NEW — waterline-following animated foam rings
│   └── systems/
│       ├── assetFactory.js      # placeAsset(env, id, opts) — the only API
│       ├── assetPlacement.js    # scatter / scatterGroup / sampleFootprint
│       ├── collisionSystem.js   # spatial hash, capsule resolve, stand-on-top
│       ├── environmentSystem.js # sky, sun, fog, ocean + clouds
│       └── islandConnectionSystem.js  # boat travel + destination menu
├── player/                  # character mesh, animation, controller (preserved)
├── camera/createCamera.js   # fixed mouse axes + obstruction pull-in (preserved)
├── input/pointerLock.js     # pointer lock manager (preserved)
└── ui/                      # menu, pause, HUD (preserved)
```

## Key invariants (must hold for any V4 work)

1. **One asset, many islands.** Assets author in local space; the `theme`
   palette re-skins them (`tropical | jungle | desert | snow | volcanic`).
2. **One placement API.** Islands only call `env.placeAsset` / `env.scatter` /
   `env.scatterGroup` / `env.extraKit` — no geometry is authored in layouts.
3. **Render + collision share one terrain function** per island.
4. **Determinism.** Every kit gets a seed derived from asset id + index, so
   the world is identical between reloads.
5. **Batching.** All island statics merge into one mesh per material; grass/
   flowers go to a separate detail batch hidden beyond ~380 m.
6. **`kit.beam()` is the only way to build non-yaw-oriented geometry**
   (fronds, branches, braces, sagging ropes). It composes with pushFrame.

## New subsystem details

### kit.beam(mat, p0, p1, width, thickness, up)
Builds a box whose long axis runs exactly from `p0` to `p1` (frame-space),
with an orthonormal basis derived from `up`. Used by fronds, banana leaves,
grass blades, branches, roof bracing, bunting ropes and the hut ridge beams.

### shoreFoam.js
For each of the 5 islands, 160 bearings march that island's height function
(between 0.78× and 1.55× of the base ellipse) to find the sea-level crossing;
a 160×5 ring mesh follows the real waterline (harbour channel included). The
shader animates wash bands + patches. Cost: one transparent draw per island.

### sky.buildClouds
9 cloud clusters (4-7 flattened spheres each, merged into one mesh) orbit the
world centre at 700-1600 m radius, 120-220 m height, drifting ~0.004-0.01 rad/s.
One emissive-leaning material keeps undersides pale; no shadow casting.

### Ocean upgrades
Dual-lobe sun specular (tight glint + broad sheen), large-scale current
patching on UVs, slightly deeper shallow/deep colours, reduced sky-fresnel
weight. Foam crests on wave peaks kept from V2.
