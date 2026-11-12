# ASSET LIBRARY — 59 registered modules

Every asset is a module under `src/assets/` with `export const meta` and
`export function build(kit, env, opts)`. All are placed through
`env.placeAsset(id, opts)`; variants are keyed by `opts.variant` (an integer
selecting an intentionally designed arrangement, never random transforms).

Total registered IDs: **59** (buildings 14, vegetation 20, props 17, rocks 5,
decorations 3). Verified by `listAssets()` in the browser test harness.

## Buildings (`src/assets/buildings/`)

| ID | Label | Variants | Notes |
| --- | --- | --- | --- |
| `house_wood_small` | Small Wooden House | 2 | Plank walls w/ door + 4 windows, porch, awning, chimney, attic window |
| `house_wood_large` | Large Wooden House | 2 | Bigger frame, more windows, porch, decorative gables |
| `house_stone` | Stone House | 2 | Stone-wall architectural language, wooden door/shutters |
| `pirate_captain_house` | Pirate Captain's House | 1 | Two-storey landmark: balcony, cupola, Jolly Roger mast, lanterns, sign |
| `market_stall` | Market Stall | 3 | Counter, striped canopy, goods, crates; awning colour varies |
| `weapon_shop` | Weapon Shop | 1 | Shop-front building with display window and sign |
| `storage_house` | Storage House | 1 | Warehouse-style shed with wide doors |
| `watchtower` | Watchtower | 2 (height) | Four braced legs, ladder stairs, railed platform, roof, flag |
| `coastal_house` | Coastal House | 1 | Shoreline cottage |
| `beach_hut` | Beach Hut *(V3)* | 2 | Solid thatch gable roof, raised deck, open front, railing |
| `fishing_hut` | Fishing Hut *(V3)* | 1 | Lean-to roof, net-drying frame, fish rack, barrels |
| `harbor_warehouse` | Harbour Warehouse *(V3)* | 1 | 13×8 m, sliding cargo door + hoist beam, ridge vents, loading dock |
| `dock_house` | Dock House *(V3)* | 1 | Harbourmaster cabin: broad window, notice board, teal trim |
| `dock_pier` | Dock Pier | parametric | Length/width options; deck level resolves from terrain |

Named exports `fishingBoat`, `cargoBoat` are composite structures injected via
`env.extraKit` by island layouts.

## Vegetation (`src/assets/vegetation/`)

| ID | Notes |
| --- | --- |
| `palm_tree_01` *(improved)* | Curved trunk; **V3 feathered crown** (segmented spines + paired leaflets + tip fans), 2 crown layers |
| `palm_tree_02` *(improved)* | Tall straight trunk, dead-frond skirt, two feathered crown layers |
| `palm_tree_03` *(V3)* | S-curved leaning trunk, root flare, two lush crown layers, coconuts |
| `coconut_tree` | Straight trunk + coconut clusters |
| `jungle_tree` | Giant canopy tree for the rainforest isle |
| `tropical_tree_01` *(V3)* | Broadleaf tree: buttressed trunk, two branch arms, 3-lobed canopy, fruit dots |
| `banana_plant` *(V3)* | Arcing broad leaves via `arcBlade`, hanging fruit bunch |
| `beach_grass` *(V3)* | Wind-combed dune grass clump (detail layer, no collider) |
| `flower_patch` *(V3)* | Blossom mound w/ magenta vine accents (no collider) |
| `pine_tree` | Snow isle conifer |
| `cactus` | Desert saguaro-style cactus |
| `dead_tree` | Burnt/dry tree for desert + volcanic biomes |
| `bush_tropical_01/02`, `bush_dry`, `bush_snow` | Understorey bushes per biome |
| `grass_tuft_01/02`, `flower_01`, `fern_01` | Micro-detail layer (LOD-hidden beyond ~380 m) |

The shared `frondKit.js` (V3) builds `palmFrond`, `palmCrown` and `arcBlade`
from `kit.beam()` segments — droop curves are exact polylines.

## Rocks (`src/assets/rocks/`)

| ID | Notes |
| --- | --- |
| `rock_01` | Small boulder cluster (wet variant for intertidal) |
| `rock_02` | Mid boulder |
| `rock_03` | Large monolith |
| `cliff_rock` *(rebuilt V3)* | Stacked ellipsoid lobes + strata band + scree — sea-cliff masses for cave mouths |
| `coastal_rocks` *(V3)* | Stacked sea-stack: 2 boulders + cap stone + barnacle band when `wet: true` |

## Props (`src/assets/props/`)

| ID | Notes |
| --- | --- |
| `wooden_barrel` | Standing / lying variants, iron bands |
| `wooden_crate` | 3 plank tones |
| `wooden_bench` *(V3)* | Slatted seat + backrest; `length` option |
| `wooden_table` *(V3)* | Vendor table with lower shelf; `length` option |
| `wooden_chair` *(V3)* | Splayed legs, backrest |
| `flower_pot` *(V3)* | Terracotta pot; 3 bloom colours via variant |
| `wicker_basket` *(V3)* | Produce basket; variant 1 tipped over with spill |
| `bunting` *(V3)* | Sagging pennant line between posts; `length`/`height` options |
| `cargo_stack` *(V3)* | 3 designed arrangements (pyramid / dock row / sack pile) |
| `dock_bollard` *(V3)* | Stone base + iron post + rope coil; variant with rope run |
| `village_well` *(V3)* | Stone wellhead, windlass, bucket, shingle canopy, flower box |
| `wooden_fence` | Post-and-rail runs with continuous collider |
| `treasure_chest` | Chest, variants |
| `signpost` | Direction sign with configurable arms (`signs: [{text, yaw}]`) |
| `campfire` | Stone ring + logs + ember glow |
| `training_dummy` | Practice post |
| `fishing_boat` | Moored rowboat (prop-scale) |

## Decorations (`src/assets/decorations/`)

`rope_decor`, `flag_decor` (height/variant options), `hanging_lantern`.

## Materials (`src/assets/materials.js`)

Theme-independent shared set + per-theme role palettes. V3 additions:
- **Wood family:** `woodLight`, `woodPaintedTeal`, `woodPaintedRed`,
  `woodWeathered`, `woodDark`, `thatch` — distinct wood types instead of one brown.
- **Stone family:** `stoneSmooth`, `stoneVolcanic`, `stoneSnow`.
- **Foliage:** `leafBroadleaf`, `leafBanana`, `grassBeach`, `flowerVine`, `fruitOrange`.
- **Props:** `potTerracotta`, `wicker`, `canvasStripeWhite`, `cloud`.
- Many materials ship in 2-4 tone variants; `AssetKit` picks deterministically
  per part so large surfaces read as varied construction.

## API (unchanged contract, one example)

```js
env.placeAsset('house_wood_small', {
  position: [10, 64],      // local island coords; y auto-snaps to terrain
  rotationY: 45,
  theme: 'tropical',
  variant: 1,
  scale: 1,
  collide: true,           // default true
  detail: false            // true → island LOD detail batch
});
```

Unknown IDs warn (`[assetFactory] unknown asset "..."`) and return `null` —
layouts never crash on a typo.
