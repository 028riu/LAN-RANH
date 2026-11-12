// Harbour warehouse — the big cargo building by the dock: tall weathered
// plank walls, a broad sliding double door with a hoist beam, loading
// bay, corrugated-look roof with ridge vents, cargo piles and a crane arm.
// Landmark silhouette for the harbour side of any settlement.
// Local space: origin at ground centre, +Z = loading side.
import {
  plankWall, doorUnit, gableRoofDetailed, foundationSlab, lanternPost, signBoard
} from '../parts/architectureParts.js';
import { sampleFootprint } from '../../world/systems/assetPlacement.js';

export const meta = {
  id: 'harbor_warehouse',
  label: 'Harbour Warehouse'
};

const W = 13.0;
const D = 8.0;
const WALL_H = 4.6;

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
  const hw = W / 2;
  const hd = D / 2;

  // --- Walls: front has the big loading door + hatch windows ---------------
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.34, base: 0, center: [0, 0, hd],
    openings: [
      { x: -2.8, width: 3.4, y0: 0, y1: 3.6, type: 'door' },   // main sliding door
      { x: 1.6, width: 1.5, y0: 0, y1: 2.5, type: 'door' },    // side personnel door
      { x: 4.6, width: 1.3, y0: 1.6, y1: 3.2, type: 'window' } // hatch
    ]
  });
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.34, base: 0, center: [0, 0, -hd],
    openings: [
      { x: 2.6, width: 1.3, y0: 1.6, y1: 3.2, type: 'window' },
      { x: -2.6, width: 1.3, y0: 1.6, y1: 3.2, type: 'window' }
    ]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.34, base: 0, center: [hw, 0, 0],
    openings: [{ x: 0, width: 1.3, y0: 1.6, y1: 3.2, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.34, base: 0, center: [-hw, 0, 0],
    openings: [{ x: 0, width: 1.3, y0: 1.6, y1: 3.2, type: 'window' }]
  });

  // Sliding door leaf (offset open) + rail.
  kit.beam(mats.ironDark, [-4.9, 3.8, hd + 0.18], [4.9, 3.8, hd + 0.18], 0.1, 0.14);
  kit.pushFrame([-2.8, 0, hd + 0.16], 0);
  const doorW = 3.3;
  for (let i = 0; i < 5; i += 1) {
    kit.box(mats.door, [-doorW / 2 - 0.55 + i * (doorW / 5), 1.85, 0], [doorW / 5 - 0.03, 3.5, 0.09]);
  }
  kit.box(mats.ironDark, [-doorW - 0.2, 3.4, 0], [0.12, 0.5, 0.08]);
  kit.popFrame();
  // Personnel door.
  doorUnit(kit, mats, { x: 1.6, z: hd, base: 0, along: 'x', width: 1.45, height: 2.5, open: true, openAngle: 55 });

  // Gable roof with overhang + ridge vents.
  const roofBase = WALL_H;
  gableRoofDetailed(kit, mats, {
    center: [0, roofBase, 0], width: W, depth: D, height: 3.0, along: 'x', overhang: 0.9, rows: 6
  });
  for (const vx of [-3.5, 0, 3.5]) {
    kit.box(mats.ironDark, [vx, roofBase + 3.08, 0], [1.1, 0.22, D * 0.45]);
  }
  // Gable trims.
  for (const sgn of [1, -1]) {
    kit.beam(mats.trim, [sgn * (hw + 0.4), roofBase, 0], [0, roofBase + 3.0, 0], 0.16, 0.14);
  }

  // Interior hint: stacked crates + barrel rows visible through the doors.
  for (let i = 0; i < 3; i += 1) {
    kit.box(mats.woodCrate, [-3.6 + i * 1.5, 0.45, -hd + 1.2], [0.85, 0.85, 0.85], [0, i * 9, 0]);
    kit.box(mats.woodCrate, [-3.0 + i * 1.6, 1.3, -hd + 1.4], [0.8, 0.8, 0.8], [0, -i * 7, 0]);
  }
  kit.cyl(mats.woodBarrel, [2.8, 0.55, -hd + 1.4], 0.5, 1.1, 10);
  kit.box(mats.lanternGlow, [-4.4, 3.4, 0], [0.24, 0.3, 0.24]);

  // Loading platform along the front (walkable, low).
  const platD = 1.7;
  for (let i = 0; i < 8; i += 1) {
    kit.box(mats.woodWeathered, [-hw + 0.4 + i * (W - 0.8) / 7, 0.12, hd + 0.9], [(W - 0.8) / 7 - 0.06, 0.2, platD]);
  }
  kit.colliderBox([0, 0.1, hd + 0.9], [W, 0.45, platD], { y0: -0.5, y1: 0.24 });
  // Cargo pile on the platform.
  kit.box(mats.woodCrate, [hw - 1.4, 0.5, hd + 1.0], [0.85, 0.85, 0.85], [0, 14, 0]);
  kit.box(mats.woodCrate, [hw - 2.3, 0.5, hd + 1.1], [0.8, 0.8, 0.8], [0, -8, 0]);
  kit.box(mats.woodCrate, [hw - 1.85, 1.3, hd + 1.05], [0.75, 0.75, 0.75], [0, 4, 0]);
  kit.colliderBox([hw - 1.9, 0.6, hd + 1.05], [1.7, 1.3, 0.9]);

  // Hoist beam sticking out of the gable above the main door.
  kit.beam(mats.trim, [-2.8, roofBase + 1.2, hd - 0.1], [-2.8, roofBase + 1.2, hd + 1.5], 0.18, 0.16);
  kit.beam(mats.rope, [-2.8, roofBase + 1.2, hd + 1.4], [-2.8, roofBase + 0.3, hd + 1.4], 0.04, 0.04);
  kit.box(mats.ironDark, [-2.8, roofBase + 0.2, hd + 1.4], [0.35, 0.18, 0.35]);

  // Corner lanterns + warehouse sign.
  lanternPost(kit, mats, { center: [-hw - 1.1, -slabTop, hd + 1.6], height: 3.3, armDir: 90 });
  lanternPost(kit, mats, { center: [hw + 1.1, -slabTop, hd + 1.6], height: 3.3, armDir: -90 });
  signBoard(kit, mats, { center: [3.9, 3.9, hd + 0.35], yaw: 0, width: 2.0, emblem: true });

  kit.popFrame();
}
