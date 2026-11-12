// Dock house — the harbourmaster's tiny office at the pier foot: a compact
// weathered cabin with a broad window facing the water, a posted notice
// board and a signal lantern. The small dock building from the V3 brief.
// Local space: origin at ground centre, +Z = front (toward the pier).
import {
  plankWall, doorUnit, windowUnit, leanToRoofDetailed, foundationSlab, signBoard
} from '../parts/architectureParts.js';
import { sampleFootprint } from '../../world/systems/assetPlacement.js';

export const meta = {
  id: 'dock_house',
  label: 'Dock House'
};

const W = 4.4;
const D = 3.6;
const WALL_H = 2.8;

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const corners = sampleFootprint(env, opts.position, W, D, opts.rotationY || 0);
  const minY = Math.min(...corners);
  const maxY = Math.max(...corners);
  const groundY = opts.position[1];
  const slabTop = maxY - groundY + 0.28;
  const slabBottom = minY - groundY - 0.5;

  foundationSlab(kit, mats, {
    center: [0, 0, 0], width: W, depth: D,
    height: slabTop - slabBottom, baseY: slabBottom
  });

  kit.pushFrame([0, slabTop, 0]);
  const hw = W / 2;
  const hd = D / 2;

  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.28, base: 0, center: [0, 0, hd],
    openings: [
      { x: 0.9, width: 1.9, y0: 0.9, y1: 2.35, type: 'window' },
      { x: -1.5, width: 1.4, y0: 0, y1: 2.35, type: 'door' }
    ]
  });
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.28, base: 0, center: [0, 0, -hd],
    openings: [{ x: 0.6, width: 1.4, y0: 0.95, y1: 2.25, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.28, base: 0, center: [hw, 0, 0],
    openings: []
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.28, base: 0, center: [-hw, 0, 0],
    openings: []
  });

  doorUnit(kit, mats, { x: -1.5, z: hd, base: 0, along: 'x', width: 1.35, height: 2.35, open: true, openAngle: 68 });
  // Broad harbour-facing window with open shutters.
  windowUnit(kit, mats, { x: 0.9, z: hd + 0.02, base: 0, along: 'x', width: 1.85, height: 1.4 });
  windowUnit(kit, mats, { x: 0.6, z: -hd - 0.02, base: 0, along: 'x', width: 1.35, height: 1.25 });

  // Painted teal trim band so the dock house reads as official.
  kit.box(mats.woodPaintedTeal, [0, WALL_H - 0.14, hd], [W + 0.15, 0.22, 0.1]);
  kit.box(mats.woodPaintedTeal, [0, WALL_H - 0.14, -hd], [W + 0.15, 0.22, 0.1]);

  leanToRoofDetailed(kit, mats, {
    center: [0, WALL_H, 0], width: W + 0.8, depth: D + 0.6, height: 1.4, along: 'x'
  });

  // Interior: ledger desk + wall chart + lantern glow.
  kit.box(mats.woodDark, [1.0, 1.0, -hd + 0.7], [1.6, 0.08, 0.7]);
  kit.box(mats.trim, [0.4, 0.6, -hd + 0.7], [0.1, 0.6, 0.1]);
  kit.box(mats.trim, [1.7, 0.6, -hd + 0.7], [0.1, 0.6, 0.1]);
  kit.box(mats.canvasCream, [0.4, 1.8, -hd + 0.25], [0.7, 0.5, 0.04]);
  kit.box(mats.lanternGlow, [-0.9, 2.4, 0], [0.2, 0.26, 0.2]);

  // Notice board beside the door: posts + boards + pinned notes.
  const bx = -hw - 0.7;
  for (const pz of [hd - 0.3, hd - 1.3]) {
    kit.box(mats.trim, [bx, 0.85, pz], [0.1, 1.7, 0.1]);
    kit.colliderCylinder([bx, 0.85, pz], 0.12, 1.7);
  }
  kit.box(mats.wall, [bx, 1.35, hd - 0.8], [0.08, 0.7, 1.1]);
  for (let i = 0; i < 3; i += 1) {
    kit.box(mats.canvasCream, [bx + 0.05, 1.2 + i * 0.16, hd - 0.6 - i * 0.28], [0.03, 0.13, 0.16], [0, 0, (i - 1) * 4]);
  }

  // Steps up to the door.
  const groundHere = env.groundAt(opts.position[0] - 1.5, opts.position[2] + hd + 0.9);
  const dropHere = slabTop - (groundHere - opts.position[1]);
  const stepCount = Math.max(1, Math.round(dropHere / 0.28));
  for (let i = 0; i < stepCount; i += 1) {
    const top = dropHere - i * 0.28;
    kit.box(mats.wall, [-1.5, top - 0.14, hd + 0.45 + i * 0.3], [1.6, 0.28, 0.3]);
    kit.colliderBox([-1.5, top - 0.14, hd + 0.45 + i * 0.3], [1.6, 0.28, 0.3], { y0: -1, y1: top });
  }

  signBoard(kit, mats, { center: [0.9, 2.75, hd + 0.2], yaw: 0, width: 1.3, emblem: true });

  kit.popFrame();
}
