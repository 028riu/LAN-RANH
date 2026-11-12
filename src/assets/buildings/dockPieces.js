// Dock pieces — the port infrastructure set:
//
//   createPier(env, opts)        — wooden pier deck with pilings, posts,
//                                  rope rails, bollards and ramp steps
//   createFishingBoat(env, opts) — moored fishing boat with mast & sail
//   createCargoBoat(env, opts)   — bigger travel boat for island hops
//
// All pieces are placed at a given shoreline point and adapt to the
// water depth under them.
import { railingRun, lanternPost } from '../parts/architectureParts.js';

export const meta = {
  id: 'dock_pier',
  label: 'Dock Pier'
};

// ---------------------------------------------------------------------------
// Pier — deck top is level at `deckY` regardless of the terrain slope.
// opts: { length, width, deckY }
// ---------------------------------------------------------------------------
export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const length = opts.length || 26;
  const width = opts.width || 7;
  const rotRad = (opts.rotationY || 0) * Math.PI / 180;
  const dirX = Math.sin(rotRad);   // local +Z in world space
  const dirZ = Math.cos(rotRad);
  const hl = length / 2;
  const hw = width / 2;

  // Resolve deck height: anchor just above the terrain at the ramp end
  // (local +Z = land end) unless the caller pins it.
  const probe = 3.2;
  const rampGroundX = opts.position[0] + dirX * (hl + probe);
  const rampGroundZ = opts.position[2] + dirZ * (hl + probe);
  const rampGroundY = env.groundAt(rampGroundX, rampGroundZ);
  const deckY = opts.deckY !== undefined ? opts.deckY : Math.max(rampGroundY + 0.42, 2.0);

  // Support frame under the deck
  kit.box(mats.woodBarrel, [0, deckY - 0.55, 0], [width, 0.9, length]);

  // Deck planks (across the walk direction)
  const planks = Math.round(length / 0.9);
  for (let i = 0; i < planks; i += 1) {
    const z = -hl + (i + 0.5) * (length / planks);
    kit.box(mats.wall, [0, deckY, z], [width - 0.3, 0.16, length / planks - 0.14]);
  }
  kit.colliderBox([0, deckY - 0.4, 0], [width, 1.0, length], { y0: deckY - 1.6, y1: deckY + 0.08 });

  // Pilings every ~5 m on both sides, driven to the seabed
  const pilingCount = Math.max(3, Math.round(length / 5) + 1);
  for (let i = 0; i < pilingCount; i += 1) {
    const z = -hl + 0.8 + i * ((length - 1.6) / (pilingCount - 1));
    for (const sx of [-1, 1]) {
      kit.cyl(mats.woodBarrel, [sx * (hw - 0.35), deckY - 2.6, z], 0.34, 6.4, 8);
      // Collider top ends at the deck so the player never "steps up" onto piles.
      kit.colliderCylinder([sx * (hw - 0.35), deckY - 2.7, z], 0.4, 5.2, { y0: deckY - 5.4, y1: deckY - 0.05 });
    }
  }

  // Mooring posts with brass bollards + rope rails between them
  const postZs = [-hl + 1.2, 0, hl - 1.2];
  for (const z of postZs) {
    for (const sx of [-1, 1]) {
      kit.cyl(mats.trim, [sx * (hw - 0.35), deckY + 0.6, z], 0.24, 1.3, 8);
      kit.cyl(mats.brass, [sx * (hw - 0.35), deckY + 1.32, z], 0.16, 0.3, 8);
      kit.colliderCylinder([sx * (hw - 0.35), deckY + 0.6, z], 0.3, 1.3);
    }
  }
  for (let i = 0; i < postZs.length - 1; i += 1) {
    const z0 = postZs[i];
    const z1 = postZs[i + 1];
    for (const sx of [-1, 1]) {
      kit.box(mats.rope, [sx * (hw - 0.35), deckY + 1.15, (z0 + z1) / 2], [0.07, 0.07, Math.abs(z1 - z0)]);
    }
  }

  // Cross rope ties across the deck (low, walk over)
  for (let i = 0; i < 3; i += 1) {
    const z = -hl + 3 + i * (length / 3.4);
    kit.box(mats.rope, [0, deckY + 1.12, z], [width - 0.7, 0.07, 0.07]);
  }

  // Ramp steps beyond the +Z (land) end, reaching down to the terrain.
  stepsForRamp(kit, mats, env, opts, deckY, width, hl, dirX, dirZ);

  // Lanterns
  lanternPost(kit, mats, { center: [-hw + 0.5, deckY, -hl + 1.0], height: 3.2, armDir: 90 });
  lanternPost(kit, mats, { center: [hw - 0.5, deckY, hl - 1.0], height: 3.2, armDir: 270 });

  return { deckY };
}

// Steps from the deck down to the terrain past the +Z (land) end.
function stepsForRamp(kit, mats, env, opts, deckY, width, hl, dirX, dirZ) {
  const stepH = 0.3;
  const stepD = 0.62;
  // Probe the ground past the ramp to size the staircase.
  const tipX = opts.position[0] + dirX * (hl + 2.4);
  const tipZ = opts.position[2] + dirZ * (hl + 2.4);
  const tipGround = env.groundAt(tipX, tipZ);
  const count = Math.max(1, Math.min(8, Math.round((deckY - tipGround) / stepH) + 1));
  for (let i = 0; i < count; i += 1) {
    const top = deckY - i * stepH;
    const z = hl + (count - 0.5 - i) * stepD;
    kit.box(mats.wall, [0, top - stepH / 2, z], [width - 1.6, stepH, stepD]);
    kit.colliderBox([0, top - stepH / 2, z], [width - 1.6, stepH, stepD], { y0: top - stepH - 2.2, y1: top });
  }
}

// ---------------------------------------------------------------------------
// Fishing boat
// ---------------------------------------------------------------------------
export function fishingBoat(kit, mats, opts = {}) {
  const length = opts.length || 5.2;
  const width = opts.width || 1.9;
  const hlx = length / 2;
  const hwy = width / 2;
  const hullY = opts.hullY !== undefined ? opts.hullY : 0.35;

  // Hull: tapered boxes — bow point, stern slab
  kit.box(mats.woodBarrel, [0, hullY, 0], [width, 0.75, length - 1.2]);
  kit.box(mats.woodBarrel, [0, hullY + 0.18, -hlx + 0.5], [width - 0.5, 0.5, 1.0], [0, 0, 0]);
  kit.box(mats.woodBarrel, [0, hullY + 0.18, hlx - 0.4], [width - 0.7, 0.4, 0.9], [0, 0, 0]);
  // Gunwale rim
  for (const sx of [-1, 1]) {
    kit.box(mats.trim, [sx * (hwy - 0.05), hullY + 0.48, 0], [0.12, 0.28, length - 1.0]);
  }
  kit.box(mats.trim, [0, hullY + 0.48, -hlx + 0.6], [width - 0.2, 0.28, 0.12]);
  kit.box(mats.trim, [0, hullY + 0.48, hlx - 0.5], [width - 0.3, 0.28, 0.12]);
  // Bench seats
  kit.box(mats.wall, [0, hullY + 0.35, -0.7], [width - 0.3, 0.1, 0.45]);
  kit.box(mats.wall, [0, hullY + 0.35, 0.8], [width - 0.3, 0.1, 0.45]);
  // Mast + boom + furled sail
  kit.cyl(mats.trim, [0, hullY + 1.8, 0.3], 0.09, 3.0, 8);
  kit.box(mats.trim, [0, hullY + 0.9, 0.3], [0.06, 1.0, 0.06]);
  kit.box(mats.canvasCream, [0, hullY + 2.1, 0.3], [0.06, 1.3, 0.9], [0, 0, 8]);
  // Lantern at the bow
  kit.box(mats.ironDark, [0, hullY + 0.75, hlx - 0.55], [0.14, 0.3, 0.14]);
  kit.box(mats.lanternGlow, [0, hullY + 0.75, hlx - 0.55], [0.1, 0.18, 0.1]);
}

// ---------------------------------------------------------------------------
// Cargo / travel boat — larger hull with a cabin box and flag
// ---------------------------------------------------------------------------
export function cargoBoat(kit, mats, opts = {}) {
  const length = opts.length || 7.5;
  const width = opts.width || 2.8;
  const hlx = length / 2;
  const hwy = width / 2;
  const hullY = opts.hullY !== undefined ? opts.hullY : 0.4;

  kit.box(mats.woodBarrel, [0, hullY, 0], [width, 1.0, length - 1.6]);
  kit.box(mats.woodBarrel, [0, hullY + 0.15, -hlx + 0.7], [width - 0.6, 0.7, 1.3]);
  kit.box(mats.woodBarrel, [0, hullY + 0.1, hlx - 0.6], [width - 0.9, 0.5, 1.1]);
  for (const sx of [-1, 1]) {
    kit.box(mats.trim, [sx * (hwy - 0.06), hullY + 0.62, 0], [0.14, 0.34, length - 1.3]);
  }
  // Cabin
  kit.box(mats.wall, [-0.2, hullY + 1.05, -hlx + 2.1], [width - 1.0, 1.0, 1.9]);
  kit.box(mats.trim, [-0.2, hullY + 1.6, -hlx + 2.1], [width - 0.8, 0.12, 2.1]);
  kit.box(mats.glass, [-0.2, hullY + 1.2, -hlx + 1.12], [0.9, 0.4, 0.05]);
  // Cargo crates amidships
  kit.box(mats.woodCrate, [0.4, hullY + 0.85, 0.6], [0.75, 0.75, 0.75], [0, 12, 0]);
  kit.box(mats.woodCrate, [-0.5, hullY + 0.8, 1.2], [0.65, 0.65, 0.65], [0, -8, 0]);
  // Mast + sail + pennant
  kit.cyl(mats.trim, [0, hullY + 2.4, 0.15], 0.1, 3.6, 8);
  kit.box(mats.canvasCream, [0, hullY + 2.7, 0.2], [0.07, 2.1, 1.4], [0, 0, 6]);
  kit.box(mats.flagRed, [0.35, hullY + 4.0, 0.15], [0.7, 0.24, 0.04]);
}
