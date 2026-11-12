// Coastal house — a small stilt home for the shoreline. The whole
// cabin stands on poles above the sand, with a wrap-around deck,
// ladder-steps, Fishing net on the porch and a tiny chimney.
// Local space: origin at ground centre, +Z = front.
import {
  plankWall, cornerPost, doorUnit, windowUnit, gableRoofDetailed,
  stepsRun, railingRun, lanternPost
} from '../parts/architectureParts.js';

export const meta = {
  id: 'coastal_house',
  label: 'Coastal Stilt House'
};

const W = 5.4;
const D = 4.6;
const WALL_H = 2.8;
const STILT_H = 1.5;

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const groundY = opts.position[1];

  // Stilts at the corners + mid posts (buried into the ground)
  const hw = W / 2;
  const hd = D / 2;
  const stiltDrop = STILT_H + 0.4;
  for (const [sx, sz] of [[-hw + 0.2, -hd + 0.2], [hw - 0.2, -hd + 0.2], [-hw + 0.2, hd - 0.2], [hw - 0.2, hd - 0.2], [0, -hd + 0.2], [0, hd - 0.2]]) {
    kit.box(mats.trim, [sx, -stiltDrop / 2, sz], [0.3, stiltDrop, 0.3], [0, 0, (sx * 7 % 3 - 1) * 2]);
    kit.colliderBox([sx, -stiltDrop / 2, sz], [0.34, stiltDrop, 0.34]);
  }
  // Cross braces under the deck
  for (const sz of [-1, 1]) {
    kit.box(mats.wall, [0, -0.55, sz * (hd - 0.2)], [W - 0.6, 0.12, 0.14], [0, 0, 8 * sz]);
  }

  // Deck at STILT_H
  kit.pushFrame([0, STILT_H, 0]);
  for (let i = 0; i < 10; i += 1) {
    kit.box(mats.wall, [-hw - 0.4 + i * (W + 0.8) / 9, 0.07, 0], [(W + 0.8) / 9 - 0.05, 0.14, D + 0.6]);
  }
  kit.colliderBox([0, 0, 0], [W + 0.8, 0.4, D + 0.6], { y0: -1.6, y1: STILT_H + 0.15 });

  buildCabin(kit, mats);
  kit.popFrame();

  // Steps from the sand up to the deck (front)
  stepsRun(kit, mats, {
    center: [0.9, 0, hd + 1.35],
    baseY: -0.05, width: 1.6, count: 6, stepH: 0.28, stepD: 0.5, yaw: 0
  });

  // Rowboat keel + net on the porch
  kit.ellipsoid(mats.woodBarrel, [hw + 1.1, 0.35, hd + 0.9], [0.9, 0.35, 0.4], 8, 5);
  kit.box(mats.rope, [-hw - 0.6, STILT_H + 1.6, hd + 0.5], [0.9, 0.7, 0.08], [0, 0, 14]);
  lanternPost(kit, mats, { center: [-hw - 0.9, 0, hd + 0.6], height: 3.6, armDir: 0 });

  void groundY;
}

function buildCabin(kit, mats) {
  const hw = W / 2;
  const hd = D / 2;

  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.28, base: 0, center: [0, 0, hd],
    openings: [
      { x: -0.9, width: 1.45, y0: 0, y1: 2.3, type: 'door' },
      { x: 1.5, width: 1.2, y0: 0.95, y1: 2.1, type: 'window' }
    ]
  });
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.28, base: 0, center: [0, 0, -hd],
    openings: [{ x: 0.8, width: 1.2, y0: 0.95, y1: 2.1, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.28, base: 0, center: [hw, 0, 0],
    openings: [{ x: 0, width: 1.2, y0: 0.95, y1: 2.1, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.28, base: 0, center: [-hw, 0, 0],
    openings: []
  });

  cornerPost(kit, mats, hw, hd, WALL_H, 0.15);
  cornerPost(kit, mats, -hw, hd, WALL_H, 0.15);
  cornerPost(kit, mats, hw, -hd, WALL_H, 0.15);
  cornerPost(kit, mats, -hw, -hd, WALL_H, 0.15);

  doorUnit(kit, mats, { x: -0.9, z: hd, base: 0, along: 'x', width: 1.4, height: 2.3, open: true, openAngle: 70 });
  windowUnit(kit, mats, { x: 1.5, z: hd + 0.02, base: 0, along: 'x', width: 1.15, height: 1.1 });
  windowUnit(kit, mats, { x: 0.8, z: -hd - 0.02, base: 0, along: 'x', width: 1.15, height: 1.1 });
  windowUnit(kit, mats, { x: hw + 0.02, z: 0, base: 0, along: 'z', width: 1.15, height: 1.1 });

  // Weathered gable roof
  gableRoofDetailed(kit, mats, {
    center: [0, WALL_H, 0], width: W, depth: D, height: 1.7, along: 'x', overhang: 0.7, rows: 4
  });

  // Interior
  kit.box(mats.wall, [hw - 0.8, 0.45, -hd + 0.9], [1.1, 0.08, 0.6]);
  kit.box(mats.canvasCream, [hw - 0.8, 0.9, -hd + 0.9], [0.8, 0.7, 0.1]);
  kit.box(mats.lanternGlow, [0, 2.35, 0], [0.2, 0.28, 0.2]);

  // Tiny chimney
  kit.box(mats.foundation, [-hw + 0.8, WALL_H + 0.9, -hd + 0.8], [0.75, 1.8, 0.75]);
  kit.box(mats.foundation, [-hw + 0.8, WALL_H + 1.85, -hd + 0.8], [0.95, 0.16, 0.95]);

  // Deck railing around (gap at the door/steps)
  const drY = 0.14;
  railingRun(kit, mats, { from: [hw + 0.3, -hd - 0.2], to: [hw + 0.3, hd + 0.2], y: drY });
  railingRun(kit, mats, { from: [-hw - 0.3, -hd - 0.2], to: [-hw - 0.3, hd - 0.6], y: drY });
  railingRun(kit, mats, { from: [-hw - 0.3, hd - 0.6], to: [-1.7, hd + 0.2], y: drY });
  railingRun(kit, mats, { from: [1.7, hd + 0.2], to: [hw + 0.3, hd + 0.2], y: drY });
  railingRun(kit, mats, { from: [-hw - 0.3, -hd - 0.2], to: [hw + 0.3, -hd - 0.2], y: drY });
}
