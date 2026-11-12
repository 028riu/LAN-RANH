# Status — V3 "Ultimate Stylized"

## Done in V3 (on top of the preserved V2 systems)

### Asset library 40 → 59 modules
- **Buildings (14):** + beach hut, fishing hut, harbour warehouse, dock house
- **Vegetation (20):** + palm 03 (S-curve lean, root flare), tropical broadleaf
  tree, banana plant, beach grass, flower patch; palms 01/02 rebuilt with
  **feathered fronds** (segmented spine + paired leaflets + tip fans) via the
  new `frondKit.js` and `kit.beam()`
- **Rocks (5):** + coastal rock stack; cliff rock rebuilt from ellipsoid lobes
  + strata (no more box cliffs)
- **Props (17):** + bench, table, chair, flower pot, wicker basket, bunting,
  cargo stack, dock bollard, village well
- **Materials:** +6 wood types, +3 stone types, +5 foliage/prop families

### World presentation
- Shoreline foam: per-island animated rings that follow each island's actual
  waterline (160-bearing march over the terrain height function)
- Stylized drifting cloud layer (9 clusters, one emissive-leaning material)
- Ocean: current patching, dual-lobe sun glint, deepened palette
- Terrain colour: wet-sand shoreline band, peak-only rock tint, stronger
  grass patchiness (V2's grey 5 m hills are gone)

### Pirate Starter Island (flagship)
- 11 named zones: Harbour & Arrival, Village Square, Market Lane, Captain's
  House, Training Clearing, Palm Grove, Scenic Lookout, Watchtower Hill,
  Coastal Row, Hidden Cove, South Beach
- Village well + bunting lines + benches + flower pots in the square
- Market vendor tables/chairs/baskets; harbour bollards/cargo stacks/dock
  house/warehouse; summit viewing deck with bench + lantern; south-beach
  thatch huts
- Six continuous paved path routes (slope- and beach-aware)

### Other islands
- Jungle: broadleaf groves + banana understorey; Desert: designed cactus
  groves + oasis trees; Snow: summit pine approach; Volcanic: shore ring +
  landing cargo. All: coastal sea-stack rings + beach-grass dune lines.

## Verified (evidence in docs/TEST_REPORT.md)
- npm install / npm run build / npm run dev all pass
- **28/28** automated headless-browser assertions pass
  (`scripts/browser-test.js`), including the V3 checks: 59 assets registered,
  5 foam rings, 9 cloud clusters, 11 starter zones
- Camera axes: all four directions asserted live (right→right, left→left,
  up→up, down→down)
- Collision: wall block, pier-deck stand, doorway pass, 1714 colliders
- Travel: menu opens, sail teleports to the target island
- Zero console errors across a full play session
- 12-landmark screenshot visual pass; 8 visual defects found and fixed
  (documented in TEST_REPORT.md)

## Deferred (out of scope, per the V3 brief)
- Combat / quests / NPCs / inventory / economy / devil fruits
- Drivable boats (travel is menu-based teleport)
- Swimming (deep water blocks movement)
- Texture atlases / GLB pipeline (procedural vertex-colour look is the
  current art direction)
