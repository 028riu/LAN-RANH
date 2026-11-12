// Beach grass — tall wind-combed dune grass clump for the shoreline ring.
// Blades arc in one prevailing direction per clump (seeded) so beaches read
// as wind-blown. No collider (walk-through detail).
// Local space: origin at ground centre.
import { arcBlade } from './frondKit.js';

export const meta = {
  id: 'beach_grass',
  label: 'Beach Grass'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const windYaw = rng * 360;
  const blades = 6 + Math.floor(rng * 3);

  for (let i = 0; i < blades; i += 1) {
    const a = (i / blades) * Math.PI * 2 + rng * 0.7;
    const r = 0.05 + rng * 0.22;
    kit.pushFrame([Math.cos(a) * r, 0, Math.sin(a) * r], windYaw + (rng - 0.5) * 50);
    arcBlade(kit, {
      length: 0.5 + rng * 0.45,
      rise: 0.55,
      bend: 58 + rng * 40,
      width: 0.075,
      segments: 2,
      mat: i % 3 === 1 ? mats.grass : mats.grassBeach
    });
    kit.popFrame();
  }

  // Occasional seed head on a tall stalk.
  if (rng > 0.55) {
    kit.pushFrame([0.1, 0, 0], windYaw + 20);
    arcBlade(kit, { length: 0.75, rise: 0.8, bend: 40, width: 0.05, segments: 2, mat: mats.grassBeach });
    kit.sphere(mats.wicker, [0.7, 0.55, 0], 0.07, 5, 4);
    kit.popFrame();
  }
}
