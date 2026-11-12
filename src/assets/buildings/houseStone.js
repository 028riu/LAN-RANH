// Stone house — solid rock-bottom walls with timber upper band, deep
// window reveals and a heavy timber door. Suits harbours, cold islands
// and fortified corners.
// Local space: origin at ground centre, +Z = front.
import {
  plankWall, cornerPost, doorUnit, windowUnit, gableRoofDetailed,
  stepsRun, lanternPost, chimneyStack
} from '../parts/architectureParts.js';
import { sampleFootprint } from '../../world/systems/assetPlacement.js';

export const meta = {
  id: 'house_stone',
  label: 'Stone House'
};

const W = 7.5;
const D = 6.0;
const WALL_H = 3.4;

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const corners = sampleFootprint(env, opts.position, W, D, opts.rotationY || 0);
  const minY = Math.min(...corners);
  const maxY = Math.max(...corners);
  const groundY = opts.position[1];
  const slabTop = maxY - groundY + 0.25;
  const slabBottom = minY - groundY - 0.6;

  // Heavier foundation for the stone build.
  kit.box(mats.foundation, [0, (slabTop + slabBottom) / 2, 0], [W + 0.7, slabTop - slabBottom, D + 0.7]);
  kit.box(mats.foundation, [0, slabTop + 0.07, 0], [W + 0.95, 0.16, D + 0.95]);
  kit.colliderBox([0, (slabTop + slabBottom) / 2, 0], [W + 0.7, slabTop - slabBottom + 0.4, D + 0.7], {
    y0: slabBottom - 1.0, y1: slabTop + 0.12
  });

  kit.pushFrame([0, slabTop, 0]);
  buildElevated(kit, mats, env, opts, slabTop);
  kit.popFrame();
}

function buildElevated(kit, mats, env, opts, slabTop) {
  const hw = W / 2;
  const hd = D / 2;

  // Stone walls: stone bands + stone blocks pattern (staggered boxes).
  stoneWall(kit, mats, 'x', W, WALL_H, hd, [
    { x: -1.55, width: 1.6, y0: 0, y1: 2.6, type: 'door' },
    { x: 1.9, width: 1.4, y0: 1.0, y1: 2.4, type: 'window' }
  ]);
  stoneWall(kit, mats, 'x', W, WALL_H, -hd, [
    { x: 1.4, width: 1.4, y0: 1.0, y1: 2.4, type: 'window' }
  ]);
  stoneWall(kit, mats, 'z', D, WALL_H, hw, [
    { x: 0.7, width: 1.35, y0: 1.0, y1: 2.4, type: 'window' }
  ]);
  stoneWall(kit, mats, 'z', D, WALL_H, -hw, [
    { x: -0.7, width: 1.35, y0: 1.0, y1: 2.4, type: 'window' }
  ]);

  // Timber top band + corner posts
  kit.box(mats.trim, [0, WALL_H - 0.18, hd], [W + 0.16, 0.36, 0.4]);
  kit.box(mats.trim, [0, WALL_H - 0.18, -hd], [W + 0.16, 0.36, 0.4]);
  kit.box(mats.trim, [hw, WALL_H - 0.18, 0], [0.4, 0.36, D + 0.16]);
  kit.box(mats.trim, [-hw, WALL_H - 0.18, 0], [0.4, 0.36, D + 0.16]);
  cornerPost(kit, mats, hw, hd, WALL_H, 0.19);
  cornerPost(kit, mats, -hw, hd, WALL_H, 0.19);
  cornerPost(kit, mats, hw, -hd, WALL_H, 0.19);
  cornerPost(kit, mats, -hw, -hd, WALL_H, 0.19);

  doorUnit(kit, mats, { x: -1.55, z: hd, base: 0, along: 'x', width: 1.55, height: 2.6, open: true, openAngle: 55 });
  windowUnit(kit, mats, { x: 1.9, z: hd + 0.02, base: 0, along: 'x', width: 1.35, height: 1.35, shutters: false });
  windowUnit(kit, mats, { x: 1.4, z: -hd - 0.02, base: 0, along: 'x', width: 1.35, height: 1.35, shutters: false });
  windowUnit(kit, mats, { x: hw + 0.02, z: 0.7, base: 0, along: 'z', width: 1.3, height: 1.35, shutters: false });
  windowUnit(kit, mats, { x: -hw - 0.02, z: -0.7, base: 0, along: 'z', width: 1.3, height: 1.35, shutters: false });

  // Heavy gable roof
  gableRoofDetailed(kit, mats, {
    center: [0, WALL_H, 0], width: W, depth: D, height: 2.2, along: 'x', overhang: 0.85, rows: 5
  });

  // Interior: stone floor + fireplace
  for (let i = 0; i < 6; i += 1) {
    kit.box(mats.foundation, [-hw + 0.7 + i * (W - 1.4) / 5, 0.05, 0], [(W - 1.4) / 5 - 0.06, 0.1, D - 0.6]);
  }
  kit.box(mats.ironDark, [hw - 0.7, 0.9, -1.4], [0.5, 1.4, 1.6]);
  kit.box(mats.lanternGlow, [hw - 0.55, 0.7, -1.4], [0.3, 0.5, 0.7]);
  kit.box(mats.wall, [0, 1.5, hd - 0.6], [2.0, 0.1, 0.5]);

  chimneyStack(kit, mats, {
    center: [hw - 0.7, WALL_H - 1.6, -1.4],
    baseY: WALL_H - 1.6, height: 3.6, size: 1.2
  });

  // Front steps (stone threshold) — descend from floor level to the ground
  const groundHere = env.groundAt(opts.position[0] - 1.55, opts.position[2] + hd + 0.9);
  const drop = (opts.position[1] + slabTop) - groundHere;
  stepsRun(kit, mats, {
    center: [-1.55, -drop, hd + 0.25],
    baseY: -drop - 0.02,
    width: 2.2, count: Math.max(1, Math.round(drop / 0.3) + 1), stepH: 0.3, stepD: 0.5, yaw: 180
  });

  lanternPost(kit, mats, { center: [-hw - 0.9, -drop, hd + 0.35], height: 3.0, armDir: 45 });
}

// Stone wall builder: staggered blocks + base plinth + colliders.
function stoneWall(kit, mats, along, len, h, fixedAt, openings = []) {
  const t = 0.4;
  const cx = along === 'x' ? 0 : fixedAt;
  const cz = along === 'x' ? fixedAt : 0;
  const sizeFor = (l, hh) => (along === 'x' ? [l, hh, t] : [t, hh, l]);
  const posFor = (off, y) => (along === 'x' ? [cx + off, y, cz] : [cx, y, cz + off]);

  // Base plinth (wider, darker)
  kit.box(mats.foundation, posFor(0, 0.3), sizeFor(len + 0.2, 0.6));

  // Blocks: two rows of staggered blocks per metre band.
  const bands = Math.round((h - 0.6) / 0.62);
  const cols = Math.round(len / 1.05);
  for (let b = 0; b < bands; b += 1) {
    const y = 0.6 + b * 0.62 + 0.31;
    const stagger = (b % 2) * 0.5;
    for (let c2 = -1; c2 < cols; c2 += 1) {
      const off = -len / 2 + ((c2 + stagger + 0.5) / cols) * len;
      const bw = len / cols - 0.05;
      let covered = false;
      for (const o of openings) {
        if (Math.abs(off - o.x) < o.width / 2 + 0.1 && y - 0.31 < o.y1 && y + 0.31 > o.y0) covered = true;
      }
      if (covered) continue;
      kit.box(mats.wall, posFor(off, y), sizeFor(bw, 0.58));
    }
  }
  // Top band
  kit.box(mats.wall, posFor(0, h - 0.1), sizeFor(len + 0.16, 0.28));

  // Fill above openings
  for (const o of openings) {
    kit.box(mats.foundation, posFor(o.x, o.y1 + 0.17), sizeFor(o.width + 0.3, 0.34));
  }

  // Colliders: runs minus door gaps
  if (openings.length) {
    const doors = openings.filter((o) => o.type === 'door').sort((a, b) => a.x - b.x);
    let cursor = -len / 2;
    const runs = [];
    for (const d of doors) {
      const d0 = d.x - d.width / 2;
      if (d0 > cursor) runs.push([cursor, d0]);
      cursor = Math.max(cursor, d.x + d.width / 2);
    }
    if (cursor < len / 2) runs.push([cursor, len / 2]);
    for (const [r0, r1] of runs) {
      kit.colliderBox(posFor((r0 + r1) / 2, h / 2), sizeFor(r1 - r0, h));
    }
    for (const d of doors) {
      kit.colliderBox(posFor(d.x, (d.y1 + h) / 2), sizeFor(d.width + 0.1, h - d.y1));
    }
  } else {
    kit.colliderBox(posFor(0, h / 2), sizeFor(len, h));
  }
}

