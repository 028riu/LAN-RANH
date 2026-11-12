# ISLAND DESIGN — the five-island archipelago

All island data lives in `src/world/islands/islandRegistry.js`; all layout
code lives in the per-island modules under `src/world/islands/`. Terrain,
collision, and placement share one height function per island.

## World map (world coordinates)

| Island | Centre | Radii | Theme |
| --- | --- | --- | --- |
| Pirate Starter Island | (0, 0) | 170 × 150 | tropical |
| Jungle Isle | (−680, −240) | 150 × 125 | jungle |
| Dune Desert Isle | (640, −380) | 165 × 135 | desert |
| Frostpeak Isle | (−520, 640) | 150 × 140 | snow |
| Ember Volcanic Isle | (560, 600) | 140 × 125 | volcanic |

Every island has a registered travel dock with a moored boat; pressing **E**
beside a boat opens the destination menu (island connection system).

## Island 01 — Pirate Starter Island (flagship, 11 zones)

The hand-tuned terrain keeps the V2 profile (lookout hill, captain terrace,
hidden cove depression, carved harbour channel) — the settlement layout built
on top is V3-enriched:

| Zone | Centre | Contents |
| --- | --- | --- |
| Harbour & Arrival | (0, 122) | Pier, cargo + fishing boats, dock bollards w/ rope runs, cargo stacks, crates, hanging lantern, **dock house**, signpost |
| Village Square | (0, 48) | **Village well** (landmark), campfire, benches, flower pots/patches, **two bunting lines**, 5 houses around the square |
| Market Lane | (−58, 30) | 3 stalls (red/teal/cream awnings), **vendor tables + chairs**, **wicker baskets** (one tipped), bunting, weapon shop, crates/barrels, treasure chest, flower patches, signpost |
| Captain's House | (48, 42) | Two-storey landmark with balcony, cupola, Jolly Roger, lanterns, sign |
| Training Clearing | (48, −48) | Dummies, crates, bench, fenced square with entry gaps |
| Palm Grove | (−8, −78) | Dense mixed palms (01/02/03), banana plants, undergrowth |
| Scenic Lookout | (80, 0) | Summit hill + **planked viewing deck** (railing, bench, lantern, steps), campfire, flag, rocks |
| Watchtower Hill | (36, 72) | Watchtower with walkable platform |
| Coastal Row | (−20, 98) | **Harbour warehouse** (sliding door, loading dock), coastal house, storage house, **fishing hut**, boats, bollard |
| Hidden Cove | (−112, −88) | Sea-cave mouth formed by 5 cliff masses, treasure inside, lantern |
| South Beach | (−4, −126) | **Two beach huts**, campfire, bench, baskets, beach-grass dunes |

**Path network** — six continuous slab routes (harbour→square, square→market,
square→captain, square→lookout switchback, square→coastal row, square→palm
grove). Slabs follow the route yaw, skip beach (h < 0.7 m) and steep slopes
(slope > 0.42), and sit 3 cm above ground with 17 cm thickness so they never
float.

**No arbitrary dead ends:** every zone connects through the square hub, the
coastal ring is walkable, and the beach connects the grove to the cove side.

## Islands 02-05 (biome identity)

| Island | Terrain signature | Landmarks | Vegetation identity |
| --- | --- | --- | --- |
| Jungle Isle | Seed 2; twin bumps, central valley | Vine landing camp (table/bench), ruined settler shack, Fern Pond (water discs + ring of ferns) | Giant canopy + broadleaf groves + banana understorey |
| Dune Desert Isle | Seed 3; broad dune bump, wide beach | Ruined outpost with colonnade, Dry Oasis waterhole, caravan landing | Cacti fields + designed groves, dead trees, oasis trees |
| Frostpeak Isle | Seed 4; 10 m bump + snow line at 6.5 m | Trapper cabins, summit flag, frost sea stacks | Pine forests incl. summit approach |
| Ember Volcanic Isle | Seed 5; caldera plateau + lava lake | Glowing caldera w/ crust islands, 3 lava pools, DANGER sign, iron-clad landing | Burnt trees, dry bushes, basalt boulder fields |

## Island management (islandManager.js)

- Register (data) → build terrain + layout → own per-island `PrimitiveBatch`
  (static) + detail batch (LOD).
- Global `groundAt`/`slopeAt` = max over island height functions (open sea
  falls to the −9.5 m sea floor, unreachable by the player).
- `islandAt(x,z)` containment for HUD zones; `spawn()` at the starter pier.
- Travel points collected from every island env; `allTravelPoints()` feeds
  the boat menu.
- LOD: detail batches hide beyond 380 m from the camera.

## Zone → HUD

`def.zones` are world-local circles; `hud.js` shows the current zone name
(e.g. "Village Square", "Hidden Cove"). V3 renamed/added zones to match the
design areas (11 on the starter island; verified by the test harness).
