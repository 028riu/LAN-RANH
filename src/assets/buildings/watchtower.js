// Watchtower — tall four-leg observation tower with cross-braced legs,
// a ladder staircase, a railed platform, a pyramidal roof canopy and a
// signal flag. The platform and every landing are walkable.
// Local space: origin at ground centre, +Z = front (stairs side).
import { railingRun, ladderRun, stepsRun } from '../parts/architectureParts.js';

export const meta = {
  id: 'watchtower',
  label: 'Watchtower'
};

const PLATFORM_SIZE = 4.6;
const LEG_H = 7.0;

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const variant = opts.variant || 0;
  const h = LEG_H * (variant === 1 ? 1.25 : 1.0);

  const half = PLATFORM_SIZE / 2;

  // --- Four legs (tapered, braced) ---
  const legTops = [[-half, -half], [half, -half], [-half, half], [half, half]];
  for (const [lx, lz] of legTops) {
    kit.box(mats.trim, [lx, h / 2, lz], [0.34, h, 0.34]);
    kit.box(mats.foundation, [lx, 0.2, lz], [0.7, 0.4, 0.7]);
    kit.colliderBox([lx, h / 2, lz], [0.4, h, 0.4]);
  }

  // Cross braces on all four sides (two levels)
  for (let level = 0; level < 2; level += 1) {
    const y = 1.8 + level * 2.4;
    // -Z and +Z sides
    for (const sz of [-1, 1]) {
      kit.box(mats.wall, [0, y, sz * half], [PLATFORM_SIZE, 0.14, 0.18], [22 * sz, 0, 0]);
      kit.box(mats.wall, [0, y + 0.4, sz * half], [PLATFORM_SIZE, 0.14, 0.18], [-22 * sz, 0, 0]);
    }
    // ±X sides
    for (const sx of [-1, 1]) {
      kit.box(mats.wall, [sx * half, y, 0], [0.18, 0.14, PLATFORM_SIZE], [0, 0, -22 * sx]);
      kit.box(mats.wall, [sx * half, y + 0.4, 0], [0.18, 0.14, PLATFORM_SIZE], [0, 0, 22 * sx]);
    }
  }

  // --- Platform ---
  const platY = h;
  for (let i = 0; i < 7; i += 1) {
    kit.box(mats.wall, [-half + 0.15 + i * (PLATFORM_SIZE - 0.3) / 6, platY + 0.06, 0], [(PLATFORM_SIZE - 0.3) / 6 - 0.04, 0.14, PLATFORM_SIZE]);
  }
  kit.colliderBox([0, platY, 0], [PLATFORM_SIZE + 0.3, 0.4, PLATFORM_SIZE + 0.3], {
    y0: platY - 1.0, y1: platY + 0.15
  });

  // Underside joists
  kit.box(mats.trim, [0, platY - 0.2, 0], [PLATFORM_SIZE + 0.3, 0.18, PLATFORM_SIZE + 0.3]);

  // --- Platform railings (gap on the stairs side) ---
  const railY = platY + 0.14;
  railingRun(kit, mats, { from: [-half, -half + 0.1], to: [half, -half + 0.1], y: railY });
  railingRun(kit, mats, { from: [-half, half - 0.1], to: [-1.3, half - 0.1], y: railY });
  railingRun(kit, mats, { from: [1.3, half - 0.1], to: [half, half - 0.1], y: railY });
  railingRun(kit, mats, { from: [-half + 0.1, -half], to: [-half + 0.1, half], y: railY });
  railingRun(kit, mats, { from: [half - 0.1, -half], to: [half - 0.1, half], y: railY });

  // --- Roof canopy ---
  const roofBase = platY + 1.35;
  for (const [lx, lz] of legTops) {
    kit.box(mats.trim, [lx * 0.72, platY + 0.75, lz * 0.72], [0.16, 1.3, 0.16]);
  }
  kit.pyramid(mats.roof, [0, roofBase, 0], PLATFORM_SIZE + 1.3, PLATFORM_SIZE + 1.3, 2.0);
  for (let k = 0; k < 3; k += 1) {
    const t = (k + 0.5) / 3;
    kit.box(mats.roof, [0, roofBase + 2.0 * t + 0.04, 0], [(PLATFORM_SIZE + 1.3) * (1 - t) + 0.14, 0.08, (PLATFORM_SIZE + 1.3) * (1 - t) + 0.14]);
  }
  kit.box(mats.roofTrim, [0, roofBase + 2.05, 0], [0.4, 0.14, 0.4]);
  kit.sphere(mats.gold, [0, roofBase + 2.25, 0], 0.13, 6, 5);

  // --- Signal flag ---
  kit.cyl(mats.trim, [half + 0.5, platY + 3.4, half + 0.5], 0.09, 6.0, 8);
  kit.colliderCylinder([half + 0.5, platY + 3.4, half + 0.5], 0.15, 6.0);
  kit.pushFrame([half + 0.5, platY + 5.9, half + 0.5], 90);
  kit.box(mats.trim, [0.85, 0, 0], [1.7, 0.07, 0.07]);
  kit.popFrame();
  kit.box(mats.flagRed, [half + 0.5 + 0.9, platY + 5.4, half + 0.5], [1.7, 1.0, 0.05], [0, 90, 0]);

  // --- Stairs: two straight flights with a mid landing ---
  const groundY = opts.position[1];
  const totalRise = platY + 0.14;
  // Flight 1: from ground at +Z going toward the tower
  stepsRun(kit, mats, {
    center: [0, 0, half + 2.6],
    baseY: -0.05, width: 1.5, count: 8, stepH: 0.34, stepD: 0.62, yaw: 0
  });
  // Landing at mid height (colliders give walkable top)
  const midY = 8 * 0.34;
  kit.box(mats.wall, [0, midY, half + 2.6 - 0.5], [1.6, 0.2, 1.6], [0, 0, 0]);
  kit.colliderBox([0, midY, half + 2.6 - 0.5], [1.7, 0.3, 1.7], { y0: midY - 1.0, y1: midY + 0.1 });
  railingRun(kit, mats, { from: [-0.85, half + 1.7], to: [-0.85, half + 3.4], y: midY + 0.1 });
  railingRun(kit, mats, { from: [0.85, half + 1.7], to: [0.85, half + 3.4], y: midY + 0.1 });

  // Flight 2: steeper ladder-steps from the landing up to the platform
  const rise2 = totalRise - midY;
  const count2 = Math.ceil(rise2 / 0.36);
  stepsRun(kit, mats, {
    center: [0, midY, half + 0.35],
    baseY: midY - 0.05, width: 1.5, count: count2, stepH: 0.36, stepD: 0.5, yaw: 0
  });
  // Side rails up the second flight
  railingRun(kit, mats, { from: [-0.8, half + 0.2], to: [-0.8, half + 2.4], y: midY + 1.1 });
  railingRun(kit, mats, { from: [0.8, half + 0.2], to: [0.8, half + 2.4], y: midY + 1.1 });

  void groundY;
  void variant;
}
