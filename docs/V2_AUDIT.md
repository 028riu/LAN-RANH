# V2 AUDIT — FRUIT GAME ZRT "Modular Archipelago"

Full source inspection performed before any V3 change. Every system below was
verified against the **actual implementation** (files read line-by-line) and, where
possible, executed (`npm install`, `npm run build`, headless-browser harness).

Audit environment: Node v24, Vite 7, PlayCanvas ^2.12 (resolved 2.29.x), headless
Chromium available via global Playwright install.

## Build baseline (actually executed)

| Command | Result |
| --- | --- |
| `npm install` | PASS — installs cleanly (playcanvas 2.29.x, vite 7.x) |
| `npm run build` | PASS — 1468 modules, `dist/` produced in ~4.4 s |
| Bundle size warning | JS chunk 2.25 MB > 1.5 MB limit — non-blocking (single-file game, acceptable) |
| `scripts/browser-test.js` | Harness exists and uses global Playwright; re-used and extended for V3 |

## System-by-system audit

| System | Existing state (inspected) | Action for V3 |
| --- | --- | --- |
| Asset library | `AssetKit` (kit.js) authors local-space geometry with a frame stack; `assetFactory.placeAsset()` is the single placement API; deterministic seeding per asset+index. 32 registered assets across 5 categories. Solid design. | **Preserve + extend** (new modules register through the same factory) |
| Buildings | 10 modules (wood small/large, stone, captain, market stall, weapon shop, storage, watchtower, coastal house, dock pier/boats). Real plank walls with door openings, glazed windows, shingled roofs with overhangs, porches, balconies, chimneys. Quality already high. | **Preserve + add** beach hut, fishing hut, harbour warehouse, dock house |
| Vegetation | 15 modules. Palms use single-box fronds (weak silhouette at close range). No broadleaf tropical tree, no beach grass, no large flower patches. | **Improve** palm fronds (segmented spine + leaflets), **add** palm_03, broadleaf tree, banana plant, beach grass, flower patch |
| Rocks | 4 modules (rock01/02/03, cliffRock) — deformed spheres/prisms, adequate. | **Preserve + add** coastal boulder cluster |
| Props | 8 modules (barrel, crate, fence, chest, signpost, campfire, dummy, fishing boat). No tables/benches/pots/baskets/bunting → market & village feel under-dressed. | **Preserve + add** bench, table, chair, flower pot, basket, bunting, cargo stack, dock bollard, village well |
| Islands | All 5 registered in `islandRegistry.js` with layouts in `islandManager.LAYOUTS`. Verified by name list. | **Preserve + enrich layouts** |
| Terrain | Parametric height functions shared by render + collision. Vertex-colour palettes per theme. Transition grass→sand is a hard linear lerp; no wet-sand band. | **Improve** shoreline colouring (wet band, softer transitions) |
| Collision | Spatial-hash, capsule resolve, step-up, lintel pass-under, door gaps split wall colliders. Implementation matches README claims. | **Preserve**, verify live in browser harness |
| Camera | `createCamera.js` + `main.js`: mouse right → yaw decreases → view turns right; mouse up (movementY<0) → pitch decreases → looks up. Axes correct in source; obstruction pull-in samples 8 steps. | **Preserve**, verify live (all four axes asserted) |
| Character | 26-joint skeletal primitive character, fingers, face details, bandana, sash, sword. 6 animation states. | **Preserve** (no clear reason to rebuild) |
| UI | Menu / HUD (zone names) / pause / travel menu / toast / pointer-prompt. All wired in main.js. | **Preserve**, thematic polish only |
| Build | Verified above. | **Preserve** (Vite config unchanged) |
| Ocean | Custom GPU wave shader, fresnel, sun spec, crest foam, fog. No shoreline foam; colour bands ride on wave height only. | **Improve** — per-island shoreline foam rings + colour tuning |
| Sky / lighting | Gradient dome + sun disk/halo, 1 sun + 1 fill light, ACES. No clouds. | **Improve** — stylized drifting clouds |
| Performance | One batched mesh per material per island; micro-detail LOD batch hidden beyond 380 m. | **Preserve**, keep new content batched |
| Docs | ARCHITECTURE / CONTROLS / STATUS exist and are accurate for V2. | **Update + add** the V3 doc set |

## Known limitations found (fixed or addressed in V3)

1. Palm fronds read as bare sticks at close range → segmented fronds with leaflets.
2. No clouds → empty sky at high pitch angles.
3. No shoreline transition band → terrain meets water with a hard colour edge.
4. Market/village dressing is sparse (few prop types) → storytelling props added.
5. `docs/STATUS.md` references remain from V1 → refreshed.
6. Bundle-size warning → documented (not code-split on purpose; single canvas app).

## Systems explicitly NOT touched in V3 (regression protection)

- `collisionSystem.js` — resolve() semantics preserved exactly (step-up 0.55, two relaxation passes).
- `createPlayer.js` — movement/gravity/slope code paths preserved.
- `createCamera.js` — yaw/pitch sign conventions preserved (verified, not re-invented).
- `pointerLock.js` — state machine preserved.
- `islandConnectionSystem.js` — boat travel flow preserved.
- Save file / persistence — does not exist in V2, not added in V3 (out of scope per brief).

## Unverified items (labelled honestly)

- **Performance numbers** (FPS) — not measured here; the test harness runs on SwiftShader
  software rendering, so timings would not represent real hardware. Listed as NOT TESTED.
- **VRAM / draw-call counts on real GPUs** — NOT TESTED (no real GPU in this environment).
