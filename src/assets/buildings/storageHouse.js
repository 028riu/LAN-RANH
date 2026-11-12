// Storage house — a tall goods warehouse with big double doors left
// open, crates and barrels visible inside, a loading porch and a
// hoist beam over the entrance.
// Local space: origin at ground centre, +Z = front.
import {
  plankWall, cornerPost, doorUnit, gableRoofDetailed,
  stepsRun, lanternPost, foundationSlab
} from '../parts/architectureParts.js';
import { sampleFootprint } from '../../world/systems/assetPlacement.js';

export const meta = {
  id: 'storage_house',
  label: 'Storage House'
};

const W = 8.0;
const D = 6.5;
const WALL_H = 4.0;

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const corners = sampleFootprint(env, opts.position, W, D, opts.rotationY || 0);
  const minY = Math.min(...corners);
  const maxY = Math.max(...corners);
  const groundY = opts.position[1];
  const slabTop = maxY - groundY + 0.3;
  const slabBottom = minY - groundY - 0.55;

  foundationSlab(kit, mats, {
    center: [0, 0, 0], width: W, depth: D,
    height: slabTop - slabBottom, baseY: slabBottom
  });

  kit.pushFrame([0, slabTop, 0]);
  buildElevated(kit, mats, env, opts, slabTop);
  kit.popFrame();
}

function buildElevated(kit, mats, env, opts, slabTop) {
  const hw = W / 2;
  const hd = D / 2;

  // Front wall with a wide double-door opening
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.34, base: 0, center: [0, 0, hd],
    openings: [{ x: 0, width: 3.0, y0: 0, y1: 3.1, type: 'door' }]
  });
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.34, base: 0, center: [0, 0, -hd],
    openings: [{ x: -2.0, width: 1.3, y0: 1.1, y1: 2.5, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.34, base: 0, center: [hw, 0, 0],
    openings: [{ x: -1.0, width: 1.3, y0: 1.1, y1: 2.5, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.34, base: 0, center: [-hw, 0, 0],
    openings: []
  });

  cornerPost(kit, mats, hw, hd, WALL_H, 0.19);
  cornerPost(kit, mats, -hw, hd, WALL_H, 0.19);
  cornerPost(kit, mats, hw, -hd, WALL_H, 0.19);
  cornerPost(kit, mats, -hw, -hd, WALL_H, 0.19);

  // Double doors pinned open against the facade
  doorUnit(kit, mats, { x: -0.72, z: hd, base: 0, along: 'x', width: 1.42, height: 3.05, open: true, openAngle: 100 });
  doorUnit(kit, mats, { x: 0.72, z: hd, base: 0, along: 'x', width: 1.42, height: 3.05, open: false });
  // Door frame header with the shop plate
  kit.box(mats.trim, [0, 3.35, hd + 0.05], [3.4, 0.5, 0.2]);
  kit.box(mats.accent, [0, 3.35, hd + 0.16], [1.6, 0.26, 0.04]);

  // Hoist beam over the entrance + hanging rope + hook
  kit.box(mats.trim, [0, WALL_H + 0.5, hd + 0.7], [0.22, 0.22, 2.2]);
  kit.box(mats.trim, [0, WALL_H + 0.2, hd + 1.6], [0.16, 0.7, 0.16]);
  kit.box(mats.rope, [0, WALL_H - 0.6, hd + 1.6], [0.05, 1.2, 0.05]);
  kit.box(mats.ironDark, [0, WALL_H - 1.25, hd + 1.6], [0.16, 0.2, 0.16]);

  // Roof — steep warehouse gable with ventilator
  gableRoofDetailed(kit, mats, {
    center: [0, WALL_H, 0], width: W, depth: D, height: 2.6, along: 'x', overhang: 0.8, rows: 5
  });
  kit.box(mats.wall, [0, WALL_H + 2.8, 0], [0.7, 0.6, 0.7]);
  kit.pyramid(mats.roofTrim, [0, WALL_H + 3.1, 0], 0.95, 0.95, 0.5);

  // Interior goods
  for (const [cx, cz, s] of [[-2.2, -1.6, 1.0], [-1.1, -1.9, 0.9], [-2.2, -0.5, 0.9], [2.3, -1.7, 1.0], [1.2, -2.0, 0.85]]) {
    kit.box(mats.woodCrate, [cx, (0.85 * s) / 2, cz], [0.85 * s, 0.85 * s, 0.85 * s], [0, cx * 13 % 20, 0]);
  }
  kit.box(mats.woodCrate, [-2.2, 1.28, -1.6], [0.8, 0.8, 0.8], [0, 8, 0]);
  for (const [bx, bz] of [[2.4, -0.6], [1.4, -0.4]]) {
    kit.cyl(mats.woodBarrel, [bx, 0.55, bz], 0.5, 1.1, 12);
    kit.cyl(mats.barrelBand, [bx, 0.85, bz], 0.53, 0.09, 12);
  }
  // Sack row
  for (let i = 0; i < 3; i += 1) {
    kit.ellipsoid(mats.canvasCream, [-0.4 + i * 0.75, 0.42, 1.4], [0.4, 0.42, 0.35], 7, 5);
  }

  // Loading porch slab in front
  for (let i = 0; i < 9; i += 1) {
    kit.box(mats.wall, [-W / 2 + 0.4 + i * (W - 0.8) / 8, 0.1, hd + 1.0], [(W - 0.8) / 8 - 0.05, 0.2, 1.7]);
  }
  kit.colliderBox([0, 0.05, hd + 1.0], [W, 0.35, 1.7], { y0: -1.5, y1: 0.2 });
  // Porch posts
  for (const px of [-W / 2 + 0.25, W / 2 - 0.25]) {
    kit.box(mats.trim, [px, 1.6, hd + 1.7], [0.17, 3.2, 0.17]);
    kit.colliderCylinder([px, 1.6, hd + 1.7], 0.19, 3.2);
  }
  kit.box(mats.trim, [0, 3.2, hd + 1.7], [W - 0.3, 0.16, 0.14]);

  // Barrels outside
  kit.cyl(mats.woodBarrel, [hw + 0.9, 0.55, hd + 0.4], 0.52, 1.1, 12);
  kit.cyl(mats.barrelBand, [hw + 0.9, 0.85, hd + 0.4], 0.55, 0.09, 12);
  kit.colliderCylinder([hw + 0.9, 0.55, hd + 0.4], 0.56, 1.1);

  // Steps
  const groundHere = env.groundAt(opts.position[0], opts.position[2] + hd + 2.2);
  const dropHere = slabTop - (groundHere - opts.position[1]);
  stepsRun(kit, mats, {
    center: [0, -dropHere, hd + 2.0],
    baseY: -dropHere - 0.02,
    width: 2.6, count: Math.max(1, Math.round(dropHere / 0.28) + 1), stepH: 0.28, stepD: 0.55, yaw: 180
  });

  lanternPost(kit, mats, { center: [-W / 2 - 0.9, -dropHere, hd + 1.2], height: 3.3, armDir: 90 });
}
