// Small wooden house — a compact, cosy pirate settlement home.
//
// Structure: buried stone foundation, plank walls with base/top bands,
// real corner posts, a proper hinged front door, glazed shuttered
// windows, a shingled gable roof with ridge cap and fascia, a front
// porch with posts and awning, steps, chimney and a lantern post.
//
// Reusable on any island via the `theme` option (tropical/jungle/desert/
// snow/volcanic palettes).
//
// Local space: origin at ground centre of the footprint, +Z = front.
import {
  plankWall, cornerPost, doorUnit, windowUnit, gableRoofDetailed,
  leanToRoofDetailed, stepsRun, railingRun, lanternPost, chimneyStack,
  foundationSlab
} from '../parts/architectureParts.js';
import { sampleFootprint } from '../../world/systems/assetPlacement.js';

export const meta = {
  id: 'house_wood_small',
  label: 'Small Wooden House'
};

const W = 6.0;   // along X
const D = 5.0;   // along Z
const WALL_H = 3.1;

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');

  // Sample footprint corners so the foundation buries into slopes.
  const corners = sampleFootprint(env, opts.position, W, D, opts.rotationY || 0);
  const minY = Math.min(...corners);
  const maxY = Math.max(...corners);
  const groundY = opts.position[1];
  const slabTop = maxY - groundY + 0.3;          // local Y of the floor level
  const slabBottom = minY - groundY - 0.5;       // buried below the lowest corner

  foundationSlab(kit, mats, {
    center: [0, 0, 0], width: W, depth: D,
    height: slabTop - slabBottom, baseY: slabBottom
  });

  kit.pushFrame([0, slabTop, 0]);
  buildElevated(kit, mats, env, opts, slabTop);
  kit.popFrame();
}

// Everything from the floor level up (y=0 = top of foundation).
function buildElevated(kit, mats, env, opts, slabTop) {
  const hw = W / 2;
  const hd = D / 2;

  // Floor deck (visible through the open door)
  for (let i = 0; i < 9; i += 1) {
    kit.box(mats.wall, [-hw + 0.35 + i * (W - 0.7) / 8, 0.06, 0], [(W - 0.7) / 8 - 0.04, 0.12, D - 0.5]);
  }

  // Walls — front (+Z), back (-Z), sides (±X) with real openings
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.3, base: 0, center: [0, 0, hd],
    openings: [
      { x: -1.3, width: 1.55, y0: 0, y1: 2.55, type: 'door' },
      { x: 1.7, width: 1.35, y0: 0.95, y1: 2.2, type: 'window' }
    ]
  });
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.3, base: 0, center: [0, 0, -hd],
    openings: [{ x: 1.2, width: 1.35, y0: 0.95, y1: 2.2, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.3, base: 0, center: [hw, 0, 0],
    openings: [{ x: 0.6, width: 1.3, y0: 0.95, y1: 2.2, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.3, base: 0, center: [-hw, 0, 0],
    openings: [{ x: -0.5, width: 1.3, y0: 0.95, y1: 2.2, type: 'window' }]
  });

  // Corner posts
  cornerPost(kit, mats, hw, hd, WALL_H);
  cornerPost(kit, mats, -hw, hd, WALL_H);
  cornerPost(kit, mats, hw, -hd, WALL_H);
  cornerPost(kit, mats, -hw, -hd, WALL_H);

  // Door + windows mounted into the openings
  doorUnit(kit, mats, { x: -1.3, z: hd, base: 0, along: 'x', width: 1.5, height: 2.55, open: true, openAngle: 64 });
  windowUnit(kit, mats, { x: 1.7, z: hd + 0.02, base: 0, along: 'x', width: 1.3, height: 1.2 });
  windowUnit(kit, mats, { x: 1.2, z: -hd - 0.02, base: 0, along: 'x', width: 1.3, height: 1.2 });
  windowUnit(kit, mats, { x: hw + 0.02, z: 0.6, base: 0, along: 'z', width: 1.25, height: 1.2 });
  windowUnit(kit, mats, { x: -hw - 0.02, z: -0.5, base: 0, along: 'z', width: 1.25, height: 1.2 });

  // Roof
  const roofBase = WALL_H;
  gableRoofDetailed(kit, mats, {
    center: [0, roofBase, 0], width: W, depth: D, height: 2.0, along: 'x', overhang: 0.75
  });
  // Attic window on the front gable
  kit.box(mats.trim, [0, roofBase + 0.95, hd + 0.18], [0.95, 0.8, 0.14]);
  kit.box(mats.glass, [0, roofBase + 0.95, hd + 0.28], [0.6, 0.5, 0.05]);
  kit.box(mats.trim, [0, roofBase + 0.95, hd + 0.3], [0.09, 0.5, 0.05]);

  // Interior — warm lantern glow through the windows + furniture hint
  kit.box(mats.wall, [0, 1.5, -hd + 0.5], [2.4, 0.1, 0.5]);
  kit.box(mats.woodCrate, [1.2, 0.35, -hd + 0.7], [0.7, 0.7, 0.7]);
  kit.box(mats.lanternGlow, [-1.2, 2.45, -0.6], [0.22, 0.3, 0.22]);
  kit.box(mats.ironDark, [-1.2, 2.72, -0.6], [0.06, 0.12, 0.06]);

  // Chimney on the back-right corner
  chimneyStack(kit, mats, {
    center: [hw - 1.0, WALL_H - 1.6, -hd + 1.0],
    baseY: WALL_H - 1.6, height: 3.4, size: 1.0
  });

  // --- Porch (front) ---
  const porchDepth = 1.9;
  const porchZ0 = hd + 0.15;
  for (let i = 0; i < 11; i += 1) {
    kit.box(mats.wall, [-W / 2 - 0.3 + i * (W + 0.6) / 10, 0.1, porchZ0 + porchDepth / 2], [(W + 0.6) / 10 - 0.06, 0.2, porchDepth]);
  }
  kit.colliderBox([0, 0.05, porchZ0 + porchDepth / 2], [W + 0.6, 0.35, porchDepth], { y0: -1.4, y1: 0.2 });

  // Porch posts + awning
  const porchPostX = W / 2 + 0.15;
  const porchPostZ = porchZ0 + porchDepth - 0.15;
  kit.box(mats.trim, [porchPostX, 1.35, porchPostZ], [0.18, 2.7, 0.18]);
  kit.box(mats.trim, [-porchPostX, 1.35, porchPostZ], [0.18, 2.7, 0.18]);
  kit.colliderCylinder([porchPostX, 1.35, porchPostZ], 0.2, 2.7);
  kit.colliderCylinder([-porchPostX, 1.35, porchPostZ], 0.2, 2.7);
  leanToRoofDetailed(kit, mats, {
    center: [0, 2.62, porchZ0 + porchDepth / 2 - 0.1],
    width: W + 0.7, depth: porchDepth + 0.35, height: 0.75, along: 'x'
  });

  // Porch railings (front left open for the steps)
  railingRun(kit, mats, { from: [porchPostX, porchZ0 + 0.1], to: [porchPostX, porchPostZ], y: 0.2 });
  railingRun(kit, mats, { from: [-porchPostX, porchZ0 + 0.1], to: [-porchPostX, porchPostZ], y: 0.2 });

  // Steps down to the ground in front of the door
  const groundHere = env.groundAt(opts.position[0], opts.position[2] + hd + porchDepth + 0.8);
  const dropHere = slabTop - (groundHere - opts.position[1]);
  const stepCount = Math.max(1, Math.round(dropHere / 0.28) + 1);
  stepsRun(kit, mats, {
    center: [0, -dropHere, porchZ0 + porchDepth + 0.15],
    baseY: -dropHere - 0.02, width: 2.0, count: stepCount, stepH: 0.28, stepD: 0.55, yaw: 180
  });

  // Lantern post beside the porch
  lanternPost(kit, mats, { center: [W / 2 + 1.15, 0, porchZ0 + 0.4], height: 3.1, armDir: 180 });
}
