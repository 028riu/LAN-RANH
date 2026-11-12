// Fishing hut — a weathered shoreline shack with a net-drying frame,
// barrels, fish-hanging rack and a slanted plank roof. Tells the story of
// the island's fishermen at a glance.
// Local space: origin at ground centre, +Z = front.
import { plankWall, doorUnit, windowUnit, leanToRoofDetailed, foundationSlab } from '../parts/architectureParts.js';
import { sampleFootprint } from '../../world/systems/assetPlacement.js';

export const meta = {
  id: 'fishing_hut',
  label: 'Fishing Hut'
};

const W = 5.2;
const D = 4.0;
const WALL_H = 2.7;

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const corners = sampleFootprint(env, opts.position, W, D, opts.rotationY || 0);
  const minY = Math.min(...corners);
  const maxY = Math.max(...corners);
  const groundY = opts.position[1];
  const slabTop = maxY - groundY + 0.25;
  const slabBottom = minY - groundY - 0.5;

  foundationSlab(kit, mats, {
    center: [0, 0, 0], width: W, depth: D,
    height: slabTop - slabBottom, baseY: slabBottom
  });

  kit.pushFrame([0, slabTop, 0]);

  const hw = W / 2;
  const hd = D / 2;

  // Weathered plank walls (front door + window, sides windowless).
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.26, base: 0, center: [0, 0, hd],
    openings: [{ x: 0.6, width: 1.5, y0: 0, y1: 2.2, type: 'door' }]
  });
  plankWall(kit, mats, {
    along: 'x', width: W, height: WALL_H, thickness: 0.26, base: 0, center: [0, 0, -hd],
    openings: [{ x: -0.8, width: 1.2, y0: 1.0, y1: 2.1, type: 'window' }]
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.26, base: 0, center: [hw, 0, 0],
    openings: []
  });
  plankWall(kit, mats, {
    along: 'z', width: D, height: WALL_H, thickness: 0.26, base: 0, center: [-hw, 0, 0],
    openings: [{ x: 0.4, width: 1.2, y0: 1.0, y1: 2.1, type: 'window' }]
  });

  doorUnit(kit, mats, { x: 0.6, z: hd, base: 0, along: 'x', width: 1.45, height: 2.2, open: true, openAngle: 70 });
  windowUnit(kit, mats, { x: -0.8, z: -hd - 0.02, base: 0, along: 'x', width: 1.15, height: 1.05, shutters: false });
  windowUnit(kit, mats, { x: -hw - 0.02, z: 0.4, base: 0, along: 'z', width: 1.15, height: 1.05, shutters: false });

  // Slanted lean-to roof, low pitch, thatch strips.
  leanToRoofDetailed(kit, mats, {
    center: [0, WALL_H, 0], width: W + 0.7, depth: D + 0.6, height: 1.5, along: 'x'
  });

  // Net-drying frame beside the hut (front-left).
  const frameX = -hw - 1.3;
  for (const [px, pz] of [[frameX, hd - 0.4], [frameX, -hd + 0.4]]) {
    kit.box(mats.trim, [px, 1.0, pz], [0.12, 2.0, 0.12]);
    kit.colliderCylinder([px, 1.0, pz], 0.14, 2.0);
  }
  kit.beam(mats.rope, [frameX, 1.85, hd - 0.4], [frameX, 1.85, -hd + 0.4], 0.07, 0.06);
  // Hanging net panels (translucent-ish cream cloth with sag).
  for (let i = 0; i < 4; i += 1) {
    const z = hd - 0.7 - i * ((D - 1.0) / 3);
    const sag = 0.12;
    kit.beam(mats.canvasCream, [frameX, 1.8, z], [frameX + 0.02, 1.0 + sag, z], 0.5, 0.04);
    kit.beam(mats.canvasCream, [frameX, 1.0 + sag, z], [frameX + 0.02, 1.35, z + 0.1], 0.5, 0.04);
  }

  // Barrel + crate cluster on the right side.
  kit.cyl(mats.woodBarrel, [hw + 0.75, 0.55, hd - 1.2], 0.48, 1.1, 10);
  kit.cyl(mats.barrelBand, [hw + 0.75, 0.85, hd - 1.2], 0.51, 0.08, 10);
  kit.cyl(mats.barrelBand, [hw + 0.75, 0.25, hd - 1.2], 0.51, 0.08, 10);
  kit.colliderCylinder([hw + 0.75, 0.55, hd - 1.2], 0.53, 1.1);
  kit.box(mats.woodCrate, [hw + 0.8, 0.35, -hd + 0.9], [0.7, 0.7, 0.7]);
  kit.colliderBox([hw + 0.8, 0.35, -hd + 0.9], [0.7, 0.7, 0.7]);

  // Fish rack on the front wall.
  kit.beam(mats.trim, [-1.4, 1.9, hd + 0.25], [2.4, 1.9, hd + 0.25], 0.08, 0.07);
  for (let i = 0; i < 3; i += 1) {
    const fx = -1.0 + i * 1.5;
    kit.beam(mats.rope, [fx, 1.88, hd + 0.25], [fx, 1.55, hd + 0.22], 0.03, 0.025);
    kit.ellipsoid(mats.canvasStripeWhite, [fx, 1.42, hd + 0.22], [0.16, 0.09, 0.07], 5, 4);
  }

  kit.popFrame();
}
