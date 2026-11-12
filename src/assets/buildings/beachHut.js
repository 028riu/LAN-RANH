// Beach hut — a tiny open-front shade hut on the sand: solid plank walls,
// a thick palm-thatch gable roof with a generous overhang, a raised deck
// platform, and a couple of props inside. Composes with the beach zone of
// any tropical-themed island.
// Local space: origin at ground centre, +Z = open side.
import { railingRun } from '../parts/architectureParts.js';

export const meta = {
  id: 'beach_hut',
  label: 'Beach Hut'
};

const W = 3.6;
const D = 3.0;

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const variant = opts.variant || 0;

  // Raised wooden platform (walkable) buried into the sand.
  const platY = 0.45;
  for (let i = 0; i < 7; i += 1) {
    kit.box(mats.woodWeathered, [-W / 2 + 0.2 + i * (W - 0.4) / 6, platY - 0.1, 0], [(W - 0.4) / 6 - 0.05, 0.16, D]);
  }
  kit.colliderBox([0, platY - 0.12, 0], [W, 0.35, D], { y0: -0.4, y1: platY + 0.06 });
  for (const [ox, oz] of [[-W / 2 + 0.3, -D / 2 + 0.3], [W / 2 - 0.3, -D / 2 + 0.3], [-W / 2 + 0.3, D / 2 - 0.3], [W / 2 - 0.3, D / 2 - 0.3]]) {
    kit.box(mats.woodBarrel, [ox, 0.15, oz], [0.22, 0.4, 0.22]);
    kit.colliderCylinder([ox, 0.15, oz], 0.16, 0.42, { y0: -0.4, y1: 0.4 });
  }

  kit.pushFrame([0, platY, 0]);

  // --- Walls: solid vertical plank back + solid half-height sides --------
  const wallH = 2.3;
  const hw = W / 2;
  const hd = D / 2;
  const plankN = 8;
  const pw = W / plankN;
  // Back wall (full, solid planks).
  for (let i = 0; i < plankN; i += 1) {
    const x = -hw + pw * (i + 0.5);
    kit.box(mats.wall, [x, wallH / 2, -hd], [pw - 0.03, wallH, 0.14]);
  }
  kit.box(mats.woodDark, [0, 0.12, -hd], [W + 0.1, 0.24, 0.2]);
  kit.box(mats.woodDark, [0, wallH - 0.1, -hd], [W + 0.1, 0.16, 0.2]);
  kit.colliderBox([0, wallH / 2, -hd], [W, wallH, 0.24]);
  // Side walls: solid lower panels + open upper (beach-shade look).
  const sideH = 1.3;
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 5; i += 1) {
      const z = -hd + 0.15 + i * ((D - 0.3) / 4);
      kit.box(mats.wall, [sx * hw, sideH / 2, z], [0.13, sideH, (D - 0.3) / 4 - 0.04]);
    }
    kit.box(mats.woodDark, [sx * hw, sideH - 0.06, 0], [0.18, 0.12, D]);
    kit.colliderBox([sx * hw, sideH / 2, 0], [0.2, sideH, D - 0.2]);
  }

  // Corner posts + ridge pole + tie beams.
  const postH = 2.55;
  for (const [px, pz] of [[-hw + 0.1, -hd + 0.1], [hw - 0.1, -hd + 0.1], [-hw + 0.1, hd - 0.1], [hw - 0.1, hd - 0.1]]) {
    kit.box(mats.trim, [px, postH / 2, pz], [0.17, postH, 0.17]);
    kit.colliderCylinder([px, postH / 2, pz], 0.19, postH);
  }
  kit.beam(mats.trim, [-hw, postH - 0.08, -hd + 0.1], [hw, postH - 0.08, -hd + 0.1], 0.13, 0.11);
  kit.beam(mats.trim, [-hw, postH - 0.28, hd - 0.1], [hw, postH - 0.28, hd - 0.1], 0.13, 0.11);

  // --- Solid thatch gable roof -------------------------------------------
  const ridge = postH + 0.65;
  const rise = ridge - (postH - 0.1);
  const slopeD = hd + 0.55;                       // covers the overhang
  const slabLen = Math.hypot(rise, slopeD) + 0.3;
  const slabAng = Math.atan2(rise, slopeD) * 180 / Math.PI;
  for (const sgn of [1, -1]) {
    kit.box(mats.thatch, [0, postH - 0.1 + rise / 2 + 0.06, sgn * slopeD / 2],
      [W + 1.0, 0.2, slabLen], [sgn * slabAng, 0, 0]);
    // Under-eave fascia.
    kit.box(mats.woodDark, [0, postH + 0.02, sgn * (slopeD + 0.12)], [W + 1.0, 0.16, 0.14], [sgn * slabAng, 0, 0]);
  }
  // Ridge cap + gable end fill (front gable left open for air).
  kit.box(mats.woodDark, [0, ridge + 0.12, 0], [W + 0.9, 0.14, 0.4]);
  kit.box(mats.thatch, [0, (postH + ridge) / 2, -hd], [W - 0.2, ridge - postH + 0.5, 0.1]);

  // Furnishing: crate, rolled sail, hanging lantern.
  kit.box(mats.woodCrate, [-hw + 0.55, 0.45, -hd + 0.7], [0.7, 0.7, 0.7]);
  kit.box(mats.canvasCream, [hw - 0.7, 0.3, -hd + 0.8], [0.5, 0.4, 0.9]);
  kit.box(mats.lanternGlow, [0, postH - 0.5, -hd + 0.2], [0.2, 0.26, 0.2]);
  kit.box(mats.ironDark, [0, postH - 0.3, -hd + 0.2], [0.05, 0.1, 0.05]);

  // Front deck edge railing (leaves the centre open).
  railingRun(kit, mats, { from: [-hw + 0.15, hd - 0.1], to: [-0.8, hd - 0.1], y: platY - 0.02, postH: 0.85 });
  railingRun(kit, mats, { from: [0.8, hd - 0.1], to: [hw - 0.15, hd - 0.1], y: platY - 0.02, postH: 0.85 });

  kit.popFrame();
  void variant; void rng;
}
