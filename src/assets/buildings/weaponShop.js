// Weapon shop — fortified wooden shopfront with an open serving hatch,
// sword racks, shields on the wall and an iron-banded door.
// Local space: origin at ground centre, +Z = front.
import {
  plankWall, cornerPost, doorUnit, windowUnit, gableRoofDetailed,
  stepsRun, lanternPost, foundationSlab, signBoard
} from '../parts/architectureParts.js';
import { sampleFootprint } from '../../world/systems/assetPlacement.js';

export const meta = {
  id: 'weapon_shop',
  label: 'Weapon Shop'
};

const W = 7.0;
const D = 5.6;
const WALL_H = 3.4;

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

  // Walls: broad serving window on the front-left, door on the right.
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.32, base: 0, center: [0, 0, hd],
    openings: [
      { x: -1.9, width: 2.3, y0: 0.95, y1: 2.55, type: 'window' },
      { x: 1.9, width: 1.55, y0: 0, y1: 2.6, type: 'door' }
    ]
  });
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.32, base: 0, center: [0, 0, -hd],
    openings: [{ x: -1.2, width: 1.3, y0: 1.0, y1: 2.4, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.32, base: 0, center: [hw, 0, 0],
    openings: []
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.32, base: 0, center: [-hw, 0, 0],
    openings: [{ x: 0.6, width: 1.3, y0: 1.0, y1: 2.4, type: 'window' }]
  });

  cornerPost(kit, mats, hw, hd, WALL_H, 0.18);
  cornerPost(kit, mats, -hw, hd, WALL_H, 0.18);
  cornerPost(kit, mats, hw, -hd, WALL_H, 0.18);
  cornerPost(kit, mats, -hw, -hd, WALL_H, 0.18);

  // Iron-banded door
  doorUnit(kit, mats, { x: 1.9, z: hd, base: 0, along: 'x', width: 1.5, height: 2.6, open: true, openAngle: 68 });
  kit.box(mats.ironDark, [1.9 - 0.4, 2.62, hd + 0.02], [0.3, 0.1, 0.05]);

  // Serving hatch: hinged counter flap + dark interior backing
  kit.box(mats.trim, [-1.9, 0.95, hd + 0.16], [2.6, 0.12, 0.4]);
  kit.box(mats.wall, [-1.9, 1.75, hd + 0.05], [2.2, 1.45, 0.1]);
  kit.box(mats.lanternGlow, [-1.9, 1.75, hd + 0.02], [1.7, 1.0, 0.06]);
  kit.pushFrame([-1.9, 0.98, hd + 0.42], 0);
  kit.box(mats.wall, [0, 0, 0], [2.5, 0.1, 0.5], [55, 0, 0]);
  kit.popFrame();

  // Weapon racks beside the hatch (swords + shields)
  swordRack(kit, mats, [-3.05, hd + 0.18], 0);
  swordRack(kit, mats, [-0.75, hd + 0.18], 1);
  // Shield row under the eaves
  for (let i = 0; i < 3; i += 1) {
    kit.cyl(mats.trim, [-2.4 + i * 1.0, 3.75, hd + 0.12], 0.42, 0.08, 12, [90, 0, 0]);
    kit.cyl(mats.ironDark, [-2.4 + i * 1.0, 3.75, hd + 0.16], 0.14, 0.06, 8, [90, 0, 0]);
  }

  // Windows
  windowUnit(kit, mats, { x: -1.2, z: -hd - 0.02, base: 0, along: 'x', width: 1.25, height: 1.35, shutters: false });
  windowUnit(kit, mats, { x: -hw - 0.02, z: 0.6, base: 0, along: 'z', width: 1.25, height: 1.35, shutters: false });

  // Roof
  gableRoofDetailed(kit, mats, {
    center: [0, WALL_H, 0], width: W, depth: D, height: 2.1, along: 'x', overhang: 0.8
  });

  // Interior: forge glow + weapon wall
  kit.box(mats.ironDark, [hw - 0.8, 0.8, -hd + 1.2], [1.1, 1.5, 1.1]);
  kit.box(mats.lanternGlow, [hw - 0.8, 0.9, -hd + 1.2], [0.7, 0.6, 0.7]);
  kit.box(mats.wall, [-1.2, 1.6, -hd + 0.4], [3.4, 0.12, 0.4]);
  for (let i = 0; i < 4; i += 1) {
    kit.box(mats.ironDark, [-2.4 + i * 0.8, 1.85, -hd + 0.4], [0.07, 0.9, 0.07]);
    kit.box(mats.trim, [-2.4 + i * 0.8, 1.45, -hd + 0.4], [0.16, 0.28, 0.1]);
  }

  // Anvil + barrel out front
  kit.box(mats.ironDark, [hw + 0.9, 0.42, hd - 0.4], [0.75, 0.35, 0.4]);
  kit.box(mats.ironDark, [hw + 0.9, 0.2, hd - 0.4], [0.55, 0.4, 0.3]);
  kit.colliderBox([hw + 0.9, 0.42, hd - 0.4], [0.8, 0.85, 0.45]);
  kit.cyl(mats.woodBarrel, [-hw - 0.9, 0.55, hd - 0.6], 0.5, 1.1, 12);
  kit.cyl(mats.barrelBand, [-hw - 0.9, 0.85, hd - 0.6], 0.53, 0.09, 12);
  kit.colliderCylinder([-hw - 0.9, 0.55, hd - 0.6], 0.55, 1.1);

  // Steps
  const groundHere = env.groundAt(opts.position[0] + 1.9, opts.position[2] + hd + 0.8);
  const dropHere = slabTop - (groundHere - opts.position[1]);
  stepsRun(kit, mats, {
    center: [1.9, -dropHere, hd + 0.28],
    baseY: -dropHere - 0.02,
    width: 1.9, count: Math.max(1, Math.round(dropHere / 0.28) + 1), stepH: 0.28, stepD: 0.5, yaw: 180
  });

  // Sign + lantern
  signBoard(kit, mats, { center: [-1.9, 3.35, hd + 0.6], yaw: 0, width: 1.6, emblem: true });
  lanternPost(kit, mats, { center: [hw + 1.6, -dropHere, hd - 0.2], height: 3.2, armDir: 225 });
}

// A standing sword rack: 3 blades in a barrel-rack.
function swordRack(kit, mats, [x, z], seedShift) {
  kit.box(mats.trim, [x, 0.4, z], [0.8, 0.8, 0.5]);
  for (let i = 0; i < 3; i += 1) {
    const sx = x - 0.24 + i * 0.24;
    kit.box(mats.ironDark, [sx, 1.35, z], [0.07, 1.2, 0.07], [0, 0, 6 + i * 4]);
    kit.box(mats.gold, [sx, 0.85, z], [0.2, 0.07, 0.12]);
    kit.box(mats.trim, [sx, 0.76, z], [0.1, 0.16, 0.1]);
  }
}
