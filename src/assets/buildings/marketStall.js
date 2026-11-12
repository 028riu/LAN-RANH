// Market stall — open-air counter with goods, striped awning, price
// signs and stacked crates. Sold as a module so market rows can be laid
// out on any island.
// Local space: origin at ground centre, +Z = customer side.
import { railingRun, stepsRun } from '../parts/architectureParts.js';

export const meta = {
  id: 'market_stall',
  label: 'Market Stall'
};

const W = 4.6;
const D = 2.6;

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const groundY = opts.position[1];
  // Small foundation blocks keep it stable on uneven ground.
  const corners = [
    env.groundAt(opts.position[0] - W / 2, opts.position[2] - D / 2),
    env.groundAt(opts.position[0] + W / 2, opts.position[2] - D / 2),
    env.groundAt(opts.position[0] - W / 2, opts.position[2] + D / 2),
    env.groundAt(opts.position[0] + W / 2, opts.position[2] + D / 2)
  ];
  const drop = Math.max(...corners) - groundY + 0.15;
  for (const [ox, oz] of [[-W / 2 + 0.3, -D / 2 + 0.3], [W / 2 - 0.3, -D / 2 + 0.3], [-W / 2 + 0.3, D / 2 - 0.3], [W / 2 - 0.3, D / 2 - 0.3]]) {
    kit.box(mats.foundation, [ox, -drop / 2 + 0.05, oz], [0.45, drop + 0.1, 0.45]);
  }

  const variant = opts.variant || 0;
  const awning = variant % 3 === 0 ? mats.canvasRed : variant % 3 === 1 ? mats.canvasTeal : mats.canvasCream;

  // --- Counter -----------------------------------------------------------------
  kit.box(mats.wall, [0, 0.55, -0.2], [W, 0.14, 1.1]);
  kit.box(mats.trim, [0, 0.25, -0.2], [W - 0.5, 0.5, 0.9]);
  kit.box(mats.trim, [0, 0.62, 0.35], [W + 0.15, 0.1, 0.16]);   // counter lip
  kit.colliderBox([0, 0.55, -0.2], [W, 1.1, 1.1]);

  // Goods on the counter (fruit bowls, sacks)
  for (let i = 0; i < 3; i += 1) {
    const gx = -W / 2 + 0.9 + i * 1.4;
    kit.cyl(mats.woodCrate, [gx, 0.72, -0.1], 0.3, 0.16, 10);
    for (let f = 0; f < 5; f += 1) {
      const a = (f / 5) * Math.PI * 2;
      kit.sphere(mats.accent, [gx + Math.cos(a) * 0.16, 0.85, -0.1 + Math.sin(a) * 0.16], 0.09, 6, 5);
    }
    kit.sphere(mats.accent, [gx, 0.86, -0.1], 0.09, 6, 5);
  }
  kit.box(mats.canvasCream, [W / 2 - 0.6, 0.78, -0.3], [0.55, 0.4, 0.55]);

  // --- Posts + striped awning ---------------------------------------------------
  const backZ = -D / 2 + 0.15;
  const frontZ = D / 2 - 0.2;
  const roofBackY = 2.85;
  const roofFrontY = 2.15;
  for (const px of [-W / 2 + 0.2, W / 2 - 0.2]) {
    kit.box(mats.trim, [px, (roofBackY + drop) / 2, backZ], [0.16, roofBackY + drop, 0.16]);
    kit.colliderCylinder([px, 1.4, backZ], 0.17, roofBackY);
  }
  for (const px of [-W / 2 + 0.2, W / 2 - 0.2]) {
    kit.box(mats.trim, [px, (roofFrontY + drop) / 2, frontZ], [0.14, roofFrontY + drop, 0.14]);
    kit.colliderCylinder([px, 1.2, frontZ], 0.15, roofFrontY);
  }

  // Striped canopy: alternating colour strips on a slanted frame.
  const strips = 7;
  const stripW = (W + 0.6) / strips;
  const tilt = Math.atan2(roofBackY - roofFrontY, frontZ - backZ);
  kit.pushFrame([0, (roofBackY + roofFrontY) / 2 + 0.05, (frontZ + backZ) / 2], 0);
  for (let i = 0; i < strips; i += 1) {
    const mat = i % 2 === 0 ? awning : mats.canvasCream;
    kit.box(mat, [-W / 2 - 0.3 + stripW * (i + 0.5), 0, 0], [stripW + 0.02, 0.07, D + 0.55], [tilt * 180 / Math.PI, 0, 0]);
  }
  // Frame poles at the two high corners
  kit.box(mats.trim, [-W / 2 - 0.28, -0.02, -(D + 0.5) / 2 + 0.1], [0.09, 0.09, D + 0.5], [tilt * 180 / Math.PI, 0, 0]);
  kit.box(mats.trim, [W / 2 + 0.28, -0.02, -(D + 0.5) / 2 + 0.1], [0.09, 0.09, D + 0.5], [tilt * 180 / Math.PI, 0, 0]);
  kit.popFrame();

  // Back shelf with wares
  kit.box(mats.wall, [0, 1.5, backZ - 0.12], [W - 0.6, 0.1, 0.5]);
  kit.box(mats.woodCrate, [-1.2, 1.78, backZ - 0.12], [0.42, 0.42, 0.42]);
  kit.box(mats.canvasRed, [0.2, 1.8, backZ - 0.12], [0.36, 0.36, 0.36]);
  kit.box(mats.woodCrate, [1.3, 1.78, backZ - 0.12], [0.42, 0.42, 0.42]);

  // Crates stacked beside the stall
  kit.box(mats.woodCrate, [-W / 2 - 0.55, 0.32, -0.4], [0.62, 0.62, 0.62]);
  kit.colliderBox([-W / 2 - 0.55, 0.32, -0.4], [0.62, 0.64, 0.62]);
  kit.box(mats.woodCrate, [W / 2 + 0.5, 0.32, 0.2], [0.62, 0.62, 0.62]);
  kit.colliderBox([W / 2 + 0.5, 0.32, 0.2], [0.62, 0.64, 0.62]);
  kit.box(mats.woodCrate, [W / 2 + 0.5, 0.95, 0.2], [0.58, 0.58, 0.58], [0, 18, 0]);

  // Price sign on the front post
  kit.pushFrame([W / 2 - 0.2, 1.75, frontZ + 0.05], 0);
  kit.box(mats.wall, [0.35, 0, 0.06], [0.7, 0.45, 0.05]);
  kit.box(mats.accent, [0.35, 0.02, 0.09], [0.4, 0.12, 0.02]);
  kit.popFrame();
}
