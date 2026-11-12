// Pirate Captain's House — the landmark two-storey residence.
//
// Ground floor: plank walls, broad door, shop-style front window.
// Upper floor: slightly inset with a balcony on jutting joists, glazed
// double doors and a carved balustrade. Bell-cast hip roof with a
// crow's-nest cupola, signal mast with the Jolly Roger, stone chimney.
// Local space: origin at ground centre, +Z = front.
import {
  plankWall, cornerPost, doorUnit, windowUnit, gableRoofDetailed,
  pyramidRoofDetailed, stepsRun, railingRun, lanternPost, chimneyStack,
  foundationSlab, signBoard
} from '../parts/architectureParts.js';
import { sampleFootprint } from '../../world/systems/assetPlacement.js';

export const meta = {
  id: 'pirate_captain_house',
  label: "Pirate Captain's House"
};

const W = 11.0;
const D = 8.0;
const WALL_H = 3.5;      // ground floor height
const UPPER_H = 3.0;     // upper floor height

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const corners = sampleFootprint(env, opts.position, W, D, opts.rotationY || 0);
  const minY = Math.min(...corners);
  const maxY = Math.max(...corners);
  const groundY = opts.position[1];
  const slabTop = maxY - groundY + 0.35;
  const slabBottom = minY - groundY - 0.6;

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

  // --- Ground floor ---------------------------------------------------------
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.34, base: 0, center: [0, 0, hd],
    openings: [
      { x: -2.6, width: 1.7, y0: 0, y1: 2.6, type: 'door' },
      { x: 1.2, width: 2.4, y0: 0.95, y1: 2.6, type: 'window' },
      { x: 4.2, width: 1.3, y0: 1.05, y1: 2.5, type: 'window' }
    ]
  });
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.34, base: 0, center: [0, 0, -hd],
    openings: [{ x: 2.0, width: 1.4, y0: 1.05, y1: 2.5, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.34, base: 0, center: [hw, 0, 0],
    openings: [{ x: 1.0, width: 1.35, y0: 1.05, y1: 2.5, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.34, base: 0, center: [-hw, 0, 0],
    openings: [{ x: -1.0, width: 1.35, y0: 1.05, y1: 2.5, type: 'window' }]
  });

  cornerPost(kit, mats, hw, hd, WALL_H, 0.2);
  cornerPost(kit, mats, -hw, hd, WALL_H, 0.2);
  cornerPost(kit, mats, hw, -hd, WALL_H, 0.2);
  cornerPost(kit, mats, -hw, -hd, WALL_H, 0.2);
  cornerPost(kit, mats, 2.9, hd, WALL_H, 0.13);

  doorUnit(kit, mats, { x: -2.6, z: hd, base: 0, along: 'x', width: 1.65, height: 2.6, open: true, openAngle: 75 });
  windowUnit(kit, mats, { x: 1.2, z: hd + 0.02, base: 0, along: 'x', width: 2.35, height: 1.6 });
  windowUnit(kit, mats, { x: 4.2, z: hd + 0.02, base: 0, along: 'x', width: 1.25, height: 1.4 });
  windowUnit(kit, mats, { x: 2.0, z: -hd - 0.02, base: 0, along: 'x', width: 1.35, height: 1.4 });
  windowUnit(kit, mats, { x: hw + 0.02, z: 1.0, base: 0, along: 'z', width: 1.3, height: 1.4 });
  windowUnit(kit, mats, { x: -hw - 0.02, z: -1.0, base: 0, along: 'z', width: 1.3, height: 1.4 });

  // Ground-floor interior: captain's table, charts, treasure chest
  kit.box(mats.wall, [1.4, 0.5, -hd + 1.6], [2.6, 0.12, 1.4]);
  kit.box(mats.trim, [0.4, 0.25, -hd + 1.6], [0.14, 0.5, 0.14]);
  kit.box(mats.trim, [2.4, 0.25, -hd + 1.6], [0.14, 0.5, 0.14]);
  kit.box(mats.canvasCream, [1.4, 0.57, -hd + 1.6], [1.1, 0.03, 0.8]);
  kit.box(mats.woodCrate, [-hw + 1.1, 0.4, -hd + 1.2], [0.85, 0.8, 0.85]);
  kit.box(mats.gold, [-hw + 1.1, 0.85, -hd + 1.2], [0.5, 0.12, 0.5]);
  kit.box(mats.lanternGlow, [-1.0, 2.9, 0], [0.26, 0.34, 0.26]);

  // --- Upper floor (inset) ---------------------------------------------------
  const uBase = WALL_H;
  const uw = W - 1.2;   // upper walls inset 0.6 each side
  const ud = D - 1.2;
  const uhw = uw / 2;
  const uhd = ud / 2;

  // Floor slab between storeys
  kit.box(mats.trim, [0, uBase + 0.12, 0], [uw + 0.5, 0.26, ud + 0.5]);

  plankWall(kit, mats, {
    along: 'x', width: uw, height: UPPER_H, thickness: 0.3, base: uBase + 0.25, center: [0, 0, uhd],
    openings: [
      { x: -1.7, width: 1.5, y0: uBase + 0.25, y1: uBase + 2.6, type: 'door' },
      { x: 1.5, width: 1.6, y0: uBase + 1.15, y1: uBase + 2.55, type: 'window' }
    ]
  });
  plankWall(kit, mats, {
    along: 'x', width: uw, height: UPPER_H, thickness: 0.3, base: uBase + 0.25, center: [0, 0, -uhd],
    openings: [{ x: 0, width: 1.5, y0: uBase + 1.15, y1: uBase + 2.55, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: ud, height: UPPER_H, thickness: 0.3, base: uBase + 0.25, center: [uhw, 0, 0],
    openings: [{ x: 0, width: 1.4, y0: uBase + 1.15, y1: uBase + 2.55, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: ud, height: UPPER_H, thickness: 0.3, base: uBase + 0.25, center: [-uhw, 0, 0],
    openings: [{ x: 0, width: 1.4, y0: uBase + 1.15, y1: uBase + 2.55, type: 'window' }]
  });

  cornerPost(kit, mats, uhw, uhd, uBase + UPPER_H, 0.17);
  cornerPost(kit, mats, -uhw, uhd, uBase + UPPER_H, 0.17);
  cornerPost(kit, mats, uhw, -uhd, uBase + UPPER_H, 0.17);
  cornerPost(kit, mats, -uhw, -uhd, uBase + UPPER_H, 0.17);

  // Upper door (opens onto the balcony) + upper windows
  doorUnit(kit, mats, { x: -1.7, z: uhd, base: uBase + 0.25, along: 'x', width: 1.45, height: 2.3, open: true, openAngle: 58 });
  windowUnit(kit, mats, { x: 1.5, z: uhd + 0.02, base: uBase + 0.25, along: 'x', width: 1.55, height: 1.35 });
  windowUnit(kit, mats, { x: 0, z: -uhd - 0.02, base: uBase + 0.25, along: 'x', width: 1.45, height: 1.35 });
  windowUnit(kit, mats, { x: uhw + 0.02, z: 0, base: uBase + 0.25, along: 'z', width: 1.35, height: 1.35 });
  windowUnit(kit, mats, { x: -uhw - 0.02, z: 0, base: uBase + 0.25, along: 'z', width: 1.35, height: 1.35 });

  // --- Balcony (front, on jutting joists) ------------------------------------
  const balY = uBase + 0.25;
  const balDepth = 1.8;
  const balZ0 = uhd + 0.1;
  // Joists
  for (let i = 0; i < 7; i += 1) {
    kit.box(mats.trim, [-uw / 2 + 0.3 + i * (uw - 0.6) / 6, balY - 0.18, balZ0 + balDepth / 2], [0.16, 0.22, balDepth + 0.2]);
  }
  // Deck
  for (let i = 0; i < 9; i += 1) {
    kit.box(mats.wall, [-uw / 2 + i * uw / 8, balY, balZ0 + balDepth / 2], [uw / 8 - 0.05, 0.14, balDepth]);
  }
  kit.colliderBox([0, balY, balZ0 + balDepth / 2], [uw, 0.4, balDepth], { y0: -2.0, y1: balY + 0.07 });
  // Balustrade
  railingRun(kit, mats, { from: [-uw / 2 + 0.05, balZ0 + 0.15], to: [-uw / 2 + 0.05, balZ0 + balDepth - 0.05], y: balY });
  railingRun(kit, mats, { from: [uw / 2 - 0.05, balZ0 + 0.15], to: [uw / 2 - 0.05, balZ0 + balDepth - 0.05], y: balY });
  railingRun(kit, mats, { from: [-uw / 2 + 0.05, balZ0 + balDepth - 0.08], to: [-0.9, balZ0 + balDepth - 0.08], y: balY });
  railingRun(kit, mats, { from: [0.9, balZ0 + balDepth - 0.08], to: [uw / 2 - 0.05, balZ0 + balDepth - 0.08], y: balY });
  // Balcony support braces
  kit.box(mats.trim, [-uw / 2 + 0.4, balY - 0.75, balZ0 + balDepth - 0.1], [0.14, 1.4, 0.14], [-25, 0, 0]);
  kit.box(mats.trim, [uw / 2 - 0.4, balY - 0.75, balZ0 + balDepth - 0.1], [0.14, 1.4, 0.14], [-25, 0, 0]);

  // --- Roof -------------------------------------------------------------------
  const roofBase = uBase + 0.25 + UPPER_H;
  gableRoofDetailed(kit, mats, {
    center: [0, roofBase, 0], width: uw + 0.4, depth: ud + 0.4, height: 2.6, along: 'x', overhang: 0.8, rows: 5
  });

  // Cupola with pyramid roof on the ridge
  kit.box(mats.wall, [0, roofBase + 2.7, 0], [1.7, 1.1, 1.7]);
  for (const s of [1, -1]) {
    kit.box(mats.glass, [s * 0.87, roofBase + 3.05, 0], [0.06, 0.5, 0.9]);
  }
  pyramidRoofDetailed(kit, mats, { center: [0, roofBase + 3.25, 0], width: 2.1, depth: 2.1, height: 1.1 });
  kit.cyl(mats.brass, [0, roofBase + 4.55, 0], 0.05, 0.5, 6);
  kit.sphere(mats.gold, [0, roofBase + 4.85, 0], 0.12, 6, 5);

  // Chimney
  chimneyStack(kit, mats, {
    center: [hw - 1.4, roofBase - 1.2, -hd + 1.4],
    baseY: roofBase - 1.2, height: 4.6, size: 1.25
  });

  // Signal mast with the Jolly Roger at the back
  const mastX = -hw + 1.2;
  const mastZ = -hd - 0.9;
  kit.cyl(mats.trim, [mastX, 4.6, mastZ], 0.14, 9.2, 8);
  kit.cyl(mats.ironDark, [mastX, 0.35, mastZ], 0.3, 0.7, 8);
  kit.colliderCylinder([mastX, 4.6, mastZ], 0.22, 9.2);
  kit.pushFrame([mastX, 8.4, mastZ], 90);
  kit.box(mats.trim, [1.0, 0, 0], [2.0, 0.09, 0.09]);
  kit.popFrame();
  kit.box(mats.flagJolly, [mastX + 1.05, 7.9, mastZ], [1.9, 1.1, 0.05], [0, 90, 0]);
  kit.box(mats.flagJolly, [mastX + 1.05, 8.1, mastZ + 0.02], [0.5, 0.28, 0.07], [0, 90, 0]);

  // --- Front steps + entry path ----------------------------------------------
  const groundHere = env.groundAt(opts.position[0] - 2.6, opts.position[2] + hd + 1.1);
  const dropHere = slabTop - (groundHere - opts.position[1]);
  stepsRun(kit, mats, {
    center: [-2.6, -dropHere, hd + 0.3],
    baseY: -dropHere - 0.02,
    width: 2.4, count: Math.max(1, Math.round(dropHere / 0.3) + 1), stepH: 0.3, stepD: 0.55, yaw: 180
  });

  // Lanterns + shop sign
  lanternPost(kit, mats, { center: [-4.6, -dropHere, hd + 0.6], height: 3.4, armDir: 60 });
  lanternPost(kit, mats, { center: [4.9, -dropHere, hd + 0.6], height: 3.4, armDir: -60 });
  signBoard(kit, mats, { center: [-hw + 0.6, 2.9, hd + 0.55], yaw: 0, width: 1.5, emblem: true });
}
