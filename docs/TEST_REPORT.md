# TEST REPORT — V3 verification (evidence, not claims)

## Environment

- Node v24.22.2, npm 10.x, Vite 7.3.8, PlayCanvas 2.29.x
- Headless Chromium via Playwright (SwiftShader software GL), 512×288
  (harness) / 1024×576 (visual pass)
- Game served by `vite --host 0.0.0.0` (dev) and validated against a
  production build as well

## What was actually run

```bash
npm install            # PASS
npm run build          # PASS — 4.3 s, dist/ produced
npm run dev            # PASS — server up, HTTP 200
node scripts/browser-test.js http://localhost:5173
node scripts/v3-visual-check.js http://localhost:5173 /tmp/render/v3d
```

## Results — scripts/browser-test.js (28/28 PASS)

| # | Assertion | Detail |
| --- | --- | --- |
| 1 | game bootstrap exposes `__FZ` | debug handle present |
| 2 | no console errors on load | clean world build |
| 3 | 5 islands registered | Pirate Starter / Jungle / Dune Desert / Frostpeak / Ember Volcanic |
| 4 | collision system populated | **1714 colliders** |
| 5 | travel points registered | 5 docks |
| 6 | multi-island ground sampling | sea −9.50 / settlement 5.62 |
| 7 | V3 asset library registered | **59 assets**, all 19 new IDs present |
| 8 | shore foam rings | 5 rings (one per island) |
| 9 | cloud layer present | 9 clusters |
| 10 | pirate island has 11 design zones | names listed |
| 11 | pointer lock engaged after PLAY | real Pointer Lock API on canvas |
| 12 | camera receives mouse deltas | yaw changed from synthetic move |
| 13 | camera yaw: mouse right → view right | forward vector rotates toward +X |
| 14 | camera yaw: mouse left → view left | forward vector rotates toward −X |
| 15 | camera pitch: mouse up → view up | forward.y increases |
| 16 | camera pitch: mouse down → view down | forward.y decreases |
| 17 | player walks on open ground | dx > 0.4, grounded |
| 18 | collision: house wall blocks | player never enters footprint |
| 19 | collision: stands on pier deck | y ≈ 2.3 vs seabed −2.2, onColliderTop |
| 20 | collision: doorway passable + wall solid | sphereFree probes |
| 21-25 | island tour screenshots | one per island, captured |
| 26 | travel: menu opens + sail to Jungle Isle | teleport lands on target island |
| 27 | pause on pointer loss + RESUME | unlock → pause menu shows; RESUME hides it (re-lock request fires; in headless a JS click is not a trusted gesture so the lock itself is refused by the browser — on real hardware the click gesture re-locks, as verified in V2) |
| 28 | no console errors during full session | includes travel + tour + pause flow |

## Visual verification pass (scripts/v3-visual-check.js)

12 landmark screenshots captured ( harbour, village square, market lane,
captain's house, lookout deck, south beach, hidden cove, shoreline foam,
plus one hero shot per other island). Findings fixed during the pass:

1. ~~GLSL `patch` reserved word~~ → renamed `shade` (compile error, fixed).
2. ~~Grey hills (rock tint at 5 m)~~ → peak-only rock ramp at 6.6 m.
3. ~~Sparse palm crowns~~ → feathered leaflet stations + tip fans.
4. ~~Skeletal beach hut~~ → solid thatch roof/walls rebuild.
5. ~~Boxy cliff rocks~~ → ellipsoid lobes + strata rebuild.
6. ~~Dark cloud undersides~~ → emissive-leaning cloud material.
7. ~~Scattered path slabs~~ → continuous strips with slope/height guards.
8. ~~Foam ring not following waterline~~ → ring now marches the island's
   real height function (160 bearings).

## What was NOT tested (explicitly)

- **FPS on real hardware** — no real GPU in this environment (SwiftShader).
  Not measured; not claimed.
- **Draw-call/VRAM counters** — no GPU profiler available.
- **Gamepad / mobile / touch** — out of scope in V2 and V3.
- **Multiplayer, combat, NPCs** — intentionally not implemented (brief).

## Console error audit

`page.on('console')` + `page.on('pageerror')` collected through the entire
session: **0 errors, 0 page exceptions** (after the two shader compile
errors found mid-development were fixed).
