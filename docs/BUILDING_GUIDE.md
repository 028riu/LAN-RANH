# BUILDING GUIDE — how the architecture library works

Buildings are the primary visual focus of V3. Every structure is one module
in `src/assets/buildings/`, authored in **local space**: origin at the ground
centre of the footprint, **+Z = front facade**, heights measured from y=0.

## Composition vocabulary (`src/assets/parts/architectureParts.js`)

Buildings never place raw boxes for walls; they compose real structural parts:

| Part | Purpose |
| --- | --- |
| `plankWall` | Vertical plank wall with **real openings** (door/window). Colliders split per contiguous run, so doorways stay open and lintels above doors are walked under |
| `cornerPost` | Corner timber with plinth + cylinder collider |
| `doorUnit` | Frame + **hinged leaf** (opens into the room) + brass handle |
| `windowUnit` | Frame, glass, cross mullions, sill, optional shutters |
| `gableRoofDetailed` | Prism + proud shingle rows + ridge cap + fascia, with overhang |
| `pyramidRoofDetailed` | Hip roof with shingle bands + finial |
| `leanToRoofDetailed` | Sloped porch/shed roof with slat rows |
| `stepsRun` | Stairs with per-step **walkable colliders** (step-up ≤ 0.55 m) |
| `railingRun` | Two-point railing with posts + blocking collider |
| `ladderRun` | Visual ladder |
| `lanternPost` | Post + arm + emissive lantern |
| `chimneyStack` | Stone chimney + cap + blocking collider |
| `foundationSlab` | Slab that buries itself into sloped ground (samples footprint) |
| `signBoard` | Hanging shop sign with optional emblem |

## The sloped-ground pattern (used by every building)

```js
const corners = sampleFootprint(env, opts.position, W, D, opts.rotationY);
const slabTop = Math.max(...corners) - groundY + 0.3;   // floor level
const slabBottom = Math.min(...corners) - groundY - 0.5; // buried depth
foundationSlab(kit, mats, { width: W, depth: D, height: ..., baseY: slabBottom });
kit.pushFrame([0, slabTop, 0]);   // everything above builds at floor level
buildElevated(kit, mats, env, opts, slabTop);
kit.popFrame();
```

This is why buildings sit properly on slopes instead of floating or sinking.

## V3 additions at a glance

- **`beach_hut`** — solid thatch gable roof (two slanted slabs + ridge cap +
  gable fill), plank back wall, half-height side panels, raised deck with
  railings. Variant changes prop arrangement.
- **`fishing_hut`** — lean-to roof, net-drying frame with sagging net panels,
  fish rack with hanging catch, barrel/crate cluster. Uses
  `sampleFootprint` + `foundationSlab` like the houses.
- **`harbor_warehouse`** — the largest building: sliding cargo door on an
  iron rail, personnel door, hatch windows, gable roof with ridge vents,
  hoist beam with hook, loading dock platform (walkable), cargo piles,
  corner lanterns, sign. Interior hint props visible through the doors.
- **`dock_house`** — compact harbourmaster cabin with broad harbour-facing
  window, teal painted trim bands, notice board with pinned notes, steps.

## Scaling/variants rules

- Variants are **designed**, not random: `variant` selects a different
  awning colour, prop arrangement or height (watchtower `variant: 1` is 25%
  taller). Deterministic per-seed randomness only varies tone selection and
  small angles (≤ ±8°), never proportions.
- Buildings scale with the standard `scale` option; colliders scale with them
  (see `kit.build`).

## Checklist when authoring a new building

1. Origin at ground centre, +Z front, `meta` exported.
2. Foundation buries via `sampleFootprint`.
3. Walls via `plankWall` — at least one real `door` opening.
4. Per-part colliders registered (`kit.colliderBox` / `colliderCylinder`).
5. Roof has overhang + fascia/ridge detail — never a bare prism.
6. Register in `buildings/index.js`.
7. Verify: doorway passable, wall solid, steps walkable (browser-test has
   assertions you can point at the new building).
