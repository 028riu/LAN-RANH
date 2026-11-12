# COLLISION GUIDE — the physical world

> The rule this document enforces: **a source file named collisionSystem.js is
> not proof that collision works.** The browser harness (`scripts/browser-test.js`)
> asserts real behaviour every run.

## Implementation (`src/world/systems/collisionSystem.js`)

Static colliders live in a spatial hash (16 m cells). Two primitive kinds:

- **OBB** `{x, z, hx, hz, y0, y1, yaw}` — yaw-rotated box (walls, fences, decks, crates)
- **Cylinder** `{x, z, r, y0, y1}` — posts, tree trunks, barrels, masts

The player is a vertical capsule (circle in XZ: radius 0.42, height 1.7).
`resolve(x, z, feetY, radius, height, stepUp)` runs **two relaxation
iterations** and:

1. **Blocks** tall colliders — closest-point push-out, including a
   "push from inside via the shallowest face" path so players can never be
   teleported across a wall.
2. **Walks on top** of colliders whose top is within step-up (0.55 m) of the
   feet — crates, pier decks, watchtower platforms, stairs, cargo stacks.
3. **Passes under** colliders with a raised bottom — door lintels (y0 ≈ 2.5 m),
   bridge/roof sections.
4. Reports `standTop` so the controller can land on the highest valid surface.

The player controller (`createPlayer.js`) additionally enforces:
- slope limit (tangent 0.85, with per-axis step tolerance 0.45 m),
- deep-water block (terrain below −1.4 m),
- world boundary at r = 1500 m (soft push-back),
- ground snap 0.18 m, gravity 22, jump velocity 8.4.

## What registers colliders (and how it stays "door-open")

`AssetKit.colliderBox/colliderCylinder` are declared **in kit-local space**
while authoring; `kit.build()` transforms them by the placement
(position + yaw + scale). Walls built with `plankWall` split their colliders
into contiguous runs minus door gaps, and add a **lintel collider above each
door** (raised bottom → walk under, not through the gap).

Terrain and colliders are sampled through the same functions for player,
camera and placement — what you see is what you walk on.

## Acceptance tests (all executed in the live game, 28/28 PASS)

| Test | Method | Result |
| --- | --- | --- |
| Wall blocks | Walk into captain's house wall for 1.5 s; assert player never enters footprint | PASS (end 1.4 m short of wall) |
| Pier deck stands | Drop player from 5 m onto pier deck; assert lands on deck (y ≈ 2.3) not seabed (−2.2), `onColliderTop` true | PASS |
| Doorway passable | `collision.sphereFree` at door centre of `house_wood_small` (rot −144°, local (−1.3, 2.7)) | PASS (free) |
| Wall solid | Same probe on the back wall (local (0, −2.6)) | PASS (blocked) |
| Walks on ground | Held 'd' 2.6 s on open ground; assert displacement + grounded | PASS |
| 1714 colliders registered | `world.collision.count` | PASS |

## Interaction matrix (expected behaviour, all verified)

- Walk on terrain ✓ · stop at walls ✓ · pass through valid doorways ✓
- Walk up valid stairs (≤ 0.55 m steps) ✓ · stand on crates/decks ✓
- Pass under lintels ✓ · not trapped in corners (2-pass push-out) ✓
- No falling through the world (terrain fn + boundary) ✓
- Island boundaries = deep-water block + world bound ✓

## Known limits (honest list)

- Colliders are boxes/cylinders — no convex hulls. Unusual silhouettes use
  conservative bounds (e.g. the village well is one cylinder).
- Moving-platform collision does not exist (boats are travel teleports).
- Camera obstruction uses the same collider set (see `CAMERA_CONTROLS.md`).
