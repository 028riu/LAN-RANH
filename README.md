# FRUIT GAME ZRT — V3 "Ultimate Stylized"

A 3D open-world pirate archipelago adventure built with **PlayCanvas 2.x** and
**Vite**. V3 evolves the V2 "Modular Archipelago" build into a polished,
stylized world: a fully dressed pirate starter island with 11 designed zones,
an expanded 59-module asset library with feathered palms and themed buildings,
a waterline-following animated shoreline foam, drifting clouds, and a complete
 documentation set.

## Quick start

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (default `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

Low-end machines / software renderers can append `?fx=low` to the URL for a
smaller, nearer shadow map.

## Controls

| Action  | Keyboard | Notes |
| ------- | -------- | ----- |
| Move    | W A S D  | Camera-relative |
| Sprint  | Shift    | Hold |
| Jump    | Space    | Only when grounded |
| Look    | Mouse    | Pointer Lock — mouse up looks **up**, mouse right turns **right** |
| Sail    | E        | Stand on a dock's travel boat, press E, pick an island |
| Pause   | Esc      | Releases the mouse, opens the Pause menu |
| Resume  | Click RESUME | Re-locks the mouse |

## The archipelago

| Island | Theme | Highlights |
| ------ | ----- | ---------- |
| Pirate Starter Island | Tropical | Harbour with bollards/cargo/warehouse/dock house, village square around a stone well with bunting, market lane with vendor tables and baskets, captain's two-storey house, weapon shop, storage, watchtower, summit viewing deck, palm grove with three palm species + banana plants, hidden cove sea cave, south beach with thatch huts, slab-paved path network |
| Jungle Isle | Rainforest | Giant canopy trees + broadleaf groves, banana understorey, fern thickets, ruined shack, Fern Pond |
| Dune Desert Isle | Desert | Cactus fields + designed groves, sandstone ruins, dry oasis with shade trees |
| Frostpeak Isle | Snow | Snow-dusted pine forests with summit approach, trapper cabins, frost sea stacks, summit flag |
| Ember Volcanic Isle | Volcanic | Dark basalt fields, glowing caldera lava lake, lava pools, burnt trees |

Sail from the boat at any island's pier (press **E**) to travel to any other island.

## What V3 changed (summary)

- **Asset library 40 → 59 modules.** New: beach hut, fishing hut, harbour
  warehouse, dock house, palm 03, tropical broadleaf tree, banana plant,
  beach grass, flower patch, coastal rock stack, bench, table, chair, flower
  pot, wicker basket, bunting, cargo stack, dock bollard, village well.
- **Feathered palms.** `kit.beam()` (new oriented-beam primitive) powers
  segmented fronds with paired leaflets — crowns read lush at close range.
- **Shoreline foam** that follows each island's actual waterline (marches the
  terrain height function at 160 bearings), animated in a custom shader.
- **Cloud layer** — 9 drifting stylized cloud clusters.
- **Ocean** — current patching, dual-lobe sun glint, deepened palette.
- **Terrain colour** — wet-sand band at the shoreline, peak-only rock tint
  (no more grey hills), stronger grass patchiness.
- **Pirate Starter Island** — 11 named zones, bunting, village well, harbour
  dressing, summit viewing deck, six paved path routes, south beach zone.
- **Materials** — distinct wood/stone/foliage families (light, painted,
  weathered, thatch; smooth, volcanic, snow-capped; broadleaf, banana, beach…).
- **Docs** — 10-topic documentation set under `docs/` including a full V2 audit
  and an evidence-based test report.

## Architecture (V3)

See `docs/V3_ARCHITECTURE.md` for the full map and `docs/V2_AUDIT.md` for what
was preserved vs improved. In one line: **every house, tree, rock and prop is
an independent module; five distinct islands share one library through a
single placement API; render and collision share one terrain function.**

```
src/
├── main.js                  # bootstrap, game states, camera input, travel
├── core/                    # math, mesh builder, primitive batcher
├── assets/                  # 59 modules: buildings / vegetation / rocks /
│   │                        #   props / decorations + kit + materials + parts
│   ├── kit.js               # AssetKit (local-space authoring + kit.beam)
│   └── materials.js         # shared + per-theme role palettes
├── world/
│   ├── islands/             # registry, manager, terrain builder, 5 layouts,
│   │                        #   ocean, sky+clouds, shore foam
│   └── systems/             # asset factory, placement, collision,
│                            #   environment, island connections
├── player/ camera/ input/ ui/
```

### Placing assets

```js
env.placeAsset('house_wood_small', {
  position: [10, 64],        // local island coords, y auto-snaps to terrain
  rotationY: 45,
  theme: 'tropical',
  variant: 1,
  scale: 1
});

env.scatter({
  asset: 'palm_tree_03', count: 14, seed: 108,
  center: [-8, -78], radius: 48,
  minHeight: 1.6, maxSlope: 0.62,
  scale: [0.85, 1.2], rotation: 'random',
  exclude: [{ x: 0, z: 48, r: 22 }]
});
```

## Collision model

- Walls are per-segment box colliders — **doorways stay open**, lintels above
  doors are walked under.
- Crates, decks, platforms and stairs register walkable tops (step-up ≤ 0.55 m).
- Posts, trees, rocks and fences block with tight colliders.
- Terrain and colliders are sampled through the same functions for player,
  camera and placement — what you see is what you walk on.
- Verified live: see `docs/TEST_REPORT.md` (28/28 assertions).

## Verified (automated headless-browser suite — `scripts/browser-test.js`)

- `npm run build` passes; page loads with zero console errors.
- 5 islands registered, 1714 colliders, 5 travel points, 59 assets,
  5 shore-foam rings, 9 cloud clusters, 11 starter-island zones.
- Camera: all four mouse directions asserted via rendered forward vectors.
- Pointer Lock engages on PLAY, re-locks after RESUME and after sea travel.
- Player walks, is blocked by walls, stands on the pier deck, passes through
  a real doorway.
- Boat travel: E opens the destination menu; sailing teleports to the target.
- Screenshots captured of every island; landmark visual pass documented.

## Tech stack

- PlayCanvas `^2.12` (tested against 2.29.x) — WebGL/WebGPU engine
- Vite `^7.1` — dev server + bundler
- Vanilla JavaScript ES2022 modules, no framework, no downloads

## What is intentionally NOT in this build

Combat, quests, NPCs, inventory, economy, boat *driving* (travel is a menu
teleport) — the visual and technical foundation comes first.

## Documentation

```text
docs/
├── V2_AUDIT.md          # what existed, what was preserved/improved
├── V3_ARCHITECTURE.md   # full system map + invariants
├── ASSET_LIBRARY.md     # all 59 modules + API
├── BUILDING_GUIDE.md    # how buildings are composed
├── VEGETATION_GUIDE.md  # species + distribution rules
├── ISLAND_DESIGN.md     # five islands, zones, layout intent
├── COLLISION_GUIDE.md   # physical world + tests
├── CAMERA_CONTROLS.md   # axes, pointer lock, smoothing
├── PERFORMANCE.md       # budgets, techniques, honest limits
└── TEST_REPORT.md       # evidence from the live harness
```
