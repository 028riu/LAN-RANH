# VEGETATION GUIDE — the plant library and how it is distributed

## FrondKit — the V3 foliage engine (`src/assets/vegetation/frondKit.js`)

V2 palms used one flat box per frond; at close range they read as sticks.
V3 replaces that with `kit.beam()`-based builders:

- **`palmFrond(kit, opts)`** — a drooping segmented spine (exact polyline of
  the droop angle) carrying paired leaflet stations (long outer blade +
  shorter inner filler per side, per station) plus a three-blade tip fan.
- **`palmCrown(kit, opts)`** — a radial crown: `count` fronds distributed
  around the attachment point, with per-frond length/droop/width/material
  resolvers (functions or values) and yaw jitter.
- **`arcBlade(kit, opts)`** — a rising-then-bending arc used by banana leaves
  and beach grass blades.

A full crown is ~13 fronds × ~19 beams ≈ 250 primitives, all merged into the
island batch — zero extra draw calls.

## Species roster (20 modules)

**Palms** — `palm_tree_01` (curved trunk), `palm_tree_02` (tall straight +
dead-frond skirt), `palm_tree_03` (S-curved lean + root flare), `coconut_tree`.
All have thin trunk colliders (0.34-0.5 m radius) so players brush past but
cannot phase through.

**Trees** — `jungle_tree` (giant rainforest canopy), `tropical_tree_01`
(broadleaf: buttressed trunk, two branch arms, three-lobed ellipsoid canopy,
fruit dots).

**Understorey** — `banana_plant` (arching leaves + fruit bunch), ferns
(`fern_01`), bushes (`bush_tropical_01/02`, `bush_dry`, `bush_snow`),
`beach_grass` (wind-combed dune tufts), `flower_patch` (blossom mound),
`grass_tuft_01/02`, `flower_01`.

**Biome specialists** — `pine_tree` (Frostpeak), `cactus` (Dune Desert),
`dead_tree` (desert/volcanic).

## Distribution rules (design intent, not random scatter)

All placement goes through `env.scatter` / `env.scatterGroup`, which enforce:

- **Height band** — `minHeight`/`maxHeight` sample the terrain fn (e.g. palms
  ≥ 1.6 m; beach grass only 0.6-2.4 m, i.e. the dune ring).
- **Slope limits** — `maxSlope` (trees ≤ 0.6-0.68; detail ≤ 0.75).
- **Exclusion zones** — every layout passes a list of building squares,
  harbour, market, lookout… so plants never grow through buildings or block
  doors (e.g. `{x: 0, z: 120, r: 26}` keeps the harbour landing clear).
- **Path proximity damp** — e.g. the starter island multiplies acceptance
  probability to 0.04 inside the main street corridor.
- **Deterministic seeds** — same world on every load.
- **Detail layer** — `detail: true` routes grass/flowers into the island's
  detail batch, hidden beyond ~380 m (LOD).

## Per-island vegetation plan (V3)

| Island | Signature mix |
| --- | --- |
| Pirate Starter | 3 palm species (grove-centred) + coconut palms, broadleaf groves E/W, banana understorey in the grove, 240-piece detail undergrowth, 90-piece beach-grass dune ring, flower patches near settlement |
| Jungle Isle | 64 giant canopy trees + 17 broadleaf groves, 26 banana plants, fern-dominant 260-piece understorey, pond ferns |
| Dune Desert | 46 cacti + 3 dense designed groves, 52 dry bushes, 10 dead trees, broadleaf shade only around the oasis, dune grass ring |
| Frostpeak | 114 pines (incl. summit approach), snow bushes, frost-coated shore rocks, windswept grass ring |
| Ember Volcanic | 24 burnt trees, dry bushes, basalt fields, hardy shore grass ring |

## Anti-cheat rules (what vegetation must never do)

- Float above terrain — every placement samples `groundAt`.
- Intersect buildings — exclusion zones cover every footprint.
- Block doors/walking routes — path-corridor damp + door clearances.
- Overdense repetition — species are mixed with weighted `scatterGroup` and
  per-instance scale/yaw jitter (designed ranges, not raw randomness).
