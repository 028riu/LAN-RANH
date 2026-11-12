// Large wooden house — a two-room family home with a wrap-around porch,
// six windows, double gable roof line and a stone chimney.
// Local space: origin at ground centre, +Z = front.
import {
  plankWall, cornerPost, doorUnit, windowUnit, gableRoofDetailed,
  stepsRun, railingRun, lanternPost, chimneyStack, foundationSlab,
  leanToRoofDetailed
} from '../parts/architectureParts.js';
import { sampleFootprint } from '../../world/systems/assetPlacement.js';

export const meta = {
  id: 'house_wood_large',
  label: 'Large Wooden House'
};

const W = 9.0;
const D = 6.5;
const WALL_H = 3.6;

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const corners = sampleFootprint(env, opts.position, W, D, opts.rotationY || 0);
  const minY = Math.min(...corners);
  const maxY = Math.max(...corners);
  const groundY = opts.position[1];
  const slabTop = maxY - groundY + 0.3;
  const slabBottom = minY - groundY - 0.5;

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

  // Floor
  for (let i = 0; i < 14; i += 1) {
    kit.box(mats.wall, [-hw + 0.4 + i * (W - 0.8) / 13, 0.06, 0], [(W - 0.8) / 13 - 0.05, 0.12, D - 0.5]);
  }

  // Front wall: door + wide window, and a second window
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.32, base: 0, center: [0, 0, hd],
    openings: [
      { x: -2.4, width: 1.6, y0: 0, y1: 2.6, type: 'door' },
      { x: 0.2, width: 1.7, y0: 1.0, y1: 2.5, type: 'window' },
      { x: 3.1, width: 1.4, y0: 1.0, y1: 2.5, type: 'window' }
    ]
  });
  // Back wall with two windows
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.32, base: 0, center: [0, 0, -hd],
    openings: [
      { x: -1.8, width: 1.4, y0: 1.0, y1: 2.5, type: 'window' },
      { x: 1.9, width: 1.4, y0: 1.0, y1: 2.5, type: 'window' }
    ]
  });
  // Side walls
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.32, base: 0, center: [hw, 0, 0],
    openings: [{ x: 0.8, width: 1.35, y0: 1.0, y1: 2.5, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.32, base: 0, center: [-hw, 0, 0],
    openings: [{ x: -0.9, width: 1.35, y0: 1.0, y1: 2.5, type: 'window' }]
  });

  cornerPost(kit, mats, hw, hd, WALL_H, 0.18);
  cornerPost(kit, mats, -hw, hd, WALL_H, 0.18);
  cornerPost(kit, mats, hw, -hd, WALL_H, 0.18);
  cornerPost(kit, mats, -hw, -hd, WALL_H, 0.18);
  // Mid-wall posts for the longer walls
  cornerPost(kit, mats, 0, hd, WALL_H, 0.14);
  cornerPost(kit, mats, 0, -hd, WALL_H, 0.14);

  doorUnit(kit, mats, { x: -2.4, z: hd, base: 0, along: 'x', width: 1.55, height: 2.6, open: true, openAngle: 70 });
  windowUnit(kit, mats, { x: 0.2, z: hd + 0.02, base: 0, along: 'x', width: 1.65, height: 1.45 });
  windowUnit(kit, mats, { x: 3.1, z: hd + 0.02, base: 0, along: 'x', width: 1.35, height: 1.45 });
  windowUnit(kit, mats, { x: -1.8, z: -hd - 0.02, base: 0, along: 'x', width: 1.35, height: 1.45 });
  windowUnit(kit, mats, { x: 1.9, z: -hd - 0.02, base: 0, along: 'x', width: 1.35, height: 1.45 });
  windowUnit(kit, mats, { x: hw + 0.02, z: 0.8, base: 0, along: 'z', width: 1.3, height: 1.45 });
  windowUnit(kit, mats, { x: -hw - 0.02, z: -0.9, base: 0, along: 'z', width: 1.3, height: 1.45 });

  // Roof — main gable + small side dormer look
  gableRoofDetailed(kit, mats, {
    center: [0, WALL_H, 0], width: W, depth: D, height: 2.3, along: 'x', overhang: 0.8, rows: 5
  });
  // Attic windows both gables
  for (const sz of [1, -1]) {
    kit.box(mats.trim, [0, WALL_H + 1.05, sz * (hd + 0.19)], [1.1, 0.9, 0.15]);
    kit.box(mats.glass, [0, WALL_H + 1.05, sz * (hd + 0.3)], [0.7, 0.55, 0.05]);
  }

  // Interior divider + furniture
  kit.box(mats.wall, [0.8, 1.5, 0], [0.3, 3.0, D - 1.4]);
  kit.box(mats.wall, [-hw + 0.9, 0.45, -hd + 1.1], [1.7, 0.9, 0.9]);   // bed hint
  kit.box(mats.canvasCream, [-hw + 0.9, 1.0, -hd + 1.1], [1.8, 0.25, 1.0]);
  kit.box(mats.wall, [hw - 1.1, 0.5, hd - 1.2], [1.3, 0.1, 1.3]);      // table top
  kit.box(mats.trim, [hw - 1.6, 0.25, hd - 1.2], [0.12, 0.5, 0.12]);
  kit.box(mats.trim, [hw - 0.6, 0.25, hd - 1.2], [0.12, 0.5, 0.12]);
  kit.box(mats.lanternGlow, [0.8, 2.8, 0.5], [0.24, 0.32, 0.24]);

  // Stone chimney
  chimneyStack(kit, mats, {
    center: [-hw + 1.2, WALL_H - 1.8, -hd + 1.2],
    baseY: WALL_H - 1.8, height: 3.8, size: 1.15
  });

  // --- Wrap-around porch on the front + right side ---
  const porchDepth = 2.0;
  const porchZ0 = hd + 0.15;
  // Front deck
  deckRun(kit, mats, [0, porchZ0], W + 1.2, porchDepth, 'x');
  // Right deck
  deckRun(kit, mats, [hw + 0.15 + porchDepth / 2 - 0.15, 0], D + 0.6, porchDepth, 'z', hw + porchDepth + 0.1);

  // Posts along the front edge + right edge
  const postZ = porchZ0 + porchDepth - 0.15;
  for (const pxx of [-W / 2 - 0.45, -1.6, 1.6, W / 2 + 0.45]) {
    kit.box(mats.trim, [pxx, 1.4, postZ], [0.19, 2.8, 0.19]);
    kit.colliderCylinder([pxx, 1.4, postZ], 0.21, 2.8);
  }
  const postX = hw + porchDepth - 0.3;
  for (const pzz of [-2.2, 0, 2.2]) {
    kit.box(mats.trim, [postX, 1.4, pzz], [0.19, 2.8, 0.19]);
    kit.colliderCylinder([postX, 1.4, pzz], 0.21, 2.8);
  }

  // Awnings: front + right
  leanToRoofDetailed(kit, mats, {
    center: [0, 2.9, porchZ0 + porchDepth / 2 - 0.1],
    width: W + 1.2, depth: porchDepth + 0.3, height: 0.8, along: 'x'
  });
  kit.pushFrame([hw + porchDepth / 2 + 0.05, 2.9, 0], 90);
  leanToRoofDetailed(kit, mats, {
    center: [0, 0, 0], width: D + 0.8, depth: porchDepth + 0.3, height: 0.8, along: 'x'
  });
  kit.popFrame();

  // Railings
  railingRun(kit, mats, { from: [W / 2 + 0.45, porchZ0 + 0.1], to: [W / 2 + 0.45, postZ - 0.1], y: 0.2 });
  railingRun(kit, mats, { from: [-W / 2 - 0.45, porchZ0 + 0.1], to: [-W / 2 - 0.45, postZ - 0.1], y: 0.2 });
  railingRun(kit, mats, { from: [postX, -hd + 0.2], to: [postX, -2.9], y: 0.2 });
  railingRun(kit, mats, { from: [postX, 2.9], to: [postX, hd - 0.2], y: 0.2 });

  // Steps at the front door — descend from floor level to the ground
  const groundHere = env.groundAt(opts.position[0] - 2.4, opts.position[2] + hd + porchDepth + 0.8);
  const dropHere = slabTop - (groundHere - opts.position[1]);
  const stepCount = Math.max(1, Math.round(dropHere / 0.28) + 1);
  stepsRun(kit, mats, {
    center: [-2.4, -dropHere, porchZ0 + porchDepth + 0.15],
    baseY: -dropHere - 0.02, width: 2.1, count: stepCount, stepH: 0.28, stepD: 0.55, yaw: 180
  });

  // Lanterns
  lanternPost(kit, mats, { center: [-W / 2 - 1.3, 0, porchZ0 + 0.5], height: 3.2, armDir: 90 });
  lanternPost(kit, mats, { center: [postX + 1.0, 0, -hd - 0.6], height: 3.2, armDir: 0 });
}

function deckRun(kit, mats, [cx, cz], length, depth, along, zShift = 0) {
  const planks = Math.round(length / 0.85);
  for (let i = 0; i < planks; i += 1) {
    const off = -length / 2 + (i + 0.5) * (length / planks);
    if (along === 'x') {
      kit.box(mats.wall, [cx + off, 0.1, cz + depth / 2 - 0.1], [length / planks - 0.06, 0.2, depth]);
    } else {
      kit.box(mats.wall, [cx, 0.1, cz + off], [depth, 0.2, length / planks - 0.06]);
    }
  }
  if (along === 'x') {
    kit.colliderBox([cx, 0.05, cz + depth / 2 - 0.1], [length, 0.35, depth], { y0: -1.4, y1: 0.2 });
  } else {
    kit.colliderBox([cx, 0.05, cz], [depth, 0.35, length], { y0: -1.4, y1: 0.2, zShift });
  }
}

