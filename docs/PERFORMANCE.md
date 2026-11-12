# PERFORMANCE — budgets, techniques and honest numbers

## Techniques in use (unchanged architecture, verified)

1. **One draw per material per island.** All island statics merge through
   `PrimitiveBatch` into a handful of meshes (per island: terrain mesh,
   static batch ≈ N materials, detail batch). Draw-call count is bounded by
   the material catalogue, not the object count (thousands of parts → dozens
   of draws).
2. **Material reuse.** `getMaterials()` is a singleton; every island shares
   the same material objects (GPU programs are compiled once per material).
3. **Mesh reuse within parts.** Box/cylinder/sphere geometry is generated per
   part but merged immediately; runtime never rebuilds anything per frame.
4. **LOD detail layer.** Grass/flowers/patches render from a separate batch
   per island, `enabled = false` beyond 380 m from the camera
   (`updateDetailVisibility`, called once per frame with the camera position).
5. **Frustum culling.** PlayCanvas culls per mesh instance (the batched
   island meshes have large bounds; the camera-facing island set is ≤ 2-3).
6. **Shadow discipline.** One shadow-casting directional light; shadow
   distance 320 m / 2048² map (140 m / 1024² in `?fx=low`). Terrain does not
   cast; detail layers and clouds do not cast; the ocean does not receive.
7. **GPU ocean.** Waves displace in the vertex shader; CPU cost per frame is
   one `uTime` uniform update. Foam rings are one transparent draw per island.
8. **Lazy nothing.** The world builds once at startup; there are no
   per-frame allocations in the update loop (scratch vectors are reused;
   `resolve()` writes into a preallocated out object).
9. **Spatial hash collision.** Queries touch only the 16 m cells around the
   player/camera sample — independent of total collider count (1714 in V3).
10. **Asset disposal.** The world is static for the session; the one
    reallocation path (detail-layer toggling) only flips `entity.enabled`.

## V3 cost deltas (measured, headless Chromium + SwiftShader)

| Metric | V2 | V3 | Note |
| --- | --- | --- | --- |
| Registered assets | 40 | 59 | modules, not instances |
| Registered colliders | ~1200 | **1714** | spatial hash keeps query cost flat |
| Bundle (minified JS) | 2.25 MB | 2.29 MB | +40 kB for all new content |
| Build time | ~4.4 s | ~4.3 s | vite build |
| Page → playable (test env) | ~7 s | ~7 s | world build cost unchanged in practice |
| Zero-console-error session | yes | yes | 28/28 harness assertions |

## Honest limitations (NOT TESTED / not applicable)

- **Real-GPU FPS** — NOT TESTED. This environment renders via SwiftShader
  (CPU); any FPS number would be meaningless for real hardware. On the
  software renderer the game still runs interactively in the test viewport.
- **Draw-call / VRAM counters** — NOT TESTED (no GPU profiler available).
- The 2.29 MB single JS chunk triggers Vite's chunk-size warning. This is
  deliberate: the app is one canvas with no route changes, so code-splitting
  would add latency without benefit. If a future version downloads real
  GLB/texture assets, revisit with `manualChunks`.
- Vertex colouring is used instead of texture atlases by design (stylized
  look, zero download). Adding a texture atlas would trade bundle size for
  texel detail — out of scope for V3.

## Tuning knobs (`src/world/worldConfig.js`)

- `camera.distance / minPitch / maxPitch / sensitivity`
- `ocean.size / segments` (4200 m / 150² grid)
- `fog.start / end` (320 / 2600 m)
- `player.walkSpeed / runSpeed / jumpVelocity / deepWaterLimit`
- `detailHideDistance` (islandManager uses 380 m)
- `?fx=low` URL flag — small shadow map for weak machines / CI.
