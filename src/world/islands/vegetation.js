// Procedural vegetation for Pirate Starter Island: palm trees (3 size
// variants), tropical shrubs, grass tufts, and coastal rocks. All
// instances of the same material are merged into a single mesh, so the
// entire palm grove is roughly 3 draw calls total.
import * as pc from 'playcanvas';
import { PrimitiveBatch } from '../../core/primitiveBatch.js';
import { pbrMaterial, meshEntity, buildMesh } from '../../core/meshBuilder.js';
import { terrainHeight, terrainSlope } from './terrainBuilder.js';
import { fbm2D, makePRNG } from '../../core/mathUtils.js';

// Materials shared across all vegetation.
function vegMaterials() {
  return {
    palmTrunk: pbrMaterial({ color: [0.42, 0.27, 0.14], roughness: 0.92 }),
    palmFrond: pbrMaterial({ color: [0.27, 0.46, 0.20], roughness: 0.88 }),
    palmFrondDry: pbrMaterial({ color: [0.55, 0.58, 0.24], roughness: 0.85 }),
    coconut: pbrMaterial({ color: [0.18, 0.10, 0.05], roughness: 0.7 }),
    shrubLeaf: pbrMaterial({ color: [0.22, 0.42, 0.18], roughness: 0.92 }),
    grass: pbrMaterial({ color: [0.50, 0.60, 0.20], roughness: 0.95, cull: pc.CULLFACE_NONE }),
    rockWet: pbrMaterial({ color: [0.40, 0.42, 0.42], roughness: 0.55 }),
    rockDry: pbrMaterial({ color: [0.50, 0.46, 0.40], roughness: 0.92 })
  };
}

// Place one palm tree at (x, z) by adding parts to a PrimitiveBatch.
// variant: 0 (small), 1 (medium), 2 (large).
function addPalm(batch, m, x, z, variant, seed) {
  const rng = makePRNG(seed);
  const groundY = terrainHeight(x, z);
  const scale = [0.75, 1.0, 1.25][variant] * (0.92 + rng() * 0.18);
  const trunkHeight = (4.5 + variant * 1.6) * scale;
  const trunkRadius = 0.22 * scale;
  const trunkTop = groundY + trunkHeight;
  const yaw = rng() * 360;
  // Slight lean for a tropical look
  const leanX = (rng() - 0.5) * 6;
  const leanZ = (rng() - 0.5) * 6;
  // Build trunk as 3 stacked cylinders (slightly tapered)
  const segments = 3;
  for (let i = 0; i < segments; i += 1) {
    const yLow = groundY + (i / segments) * trunkHeight;
    const yHigh = groundY + ((i + 1) / segments) * trunkHeight;
    const yMid = (yLow + yHigh) / 2;
    const r = trunkRadius * (1 - i * 0.07);
    const h = yHigh - yLow;
    const xOff = leanX * (i / segments);
    const zOff = leanZ * (i / segments);
    batch.addCylinder('palmTrunk', m.palmTrunk, [x + xOff, yMid, z + zOff], [r, h], [0, yaw, 0], 8);
  }
  // Fronds: 8 thin leaf blades radiating from the top, each slightly drooping
  const frondCount = 8;
  const frondLen = (3.2 + variant * 0.7) * scale;
  for (let i = 0; i < frondCount; i += 1) {
    const angle = (i / frondCount) * Math.PI * 2 + yaw * Math.PI / 180;
    const dropAngle = 22 + rng() * 22; // droop angle in degrees
    // Position frond at the trunk top, rotated outward
    const fx = x + leanX * (segments / segments) + Math.cos(angle) * frondLen * 0.5;
    const fz = z + leanZ * (segments / segments) + Math.sin(angle) * frondLen * 0.5;
    const fy = trunkTop + 0.2 - Math.sin(dropAngle * Math.PI / 180) * frondLen * 0.4;
    const mat = (rng() > 0.7) ? m.palmFrondDry : m.palmFrond;
    batch.addBox('palmFrond', mat, [fx, fy, fz], [0.06, 0.10, frondLen],
      [-dropAngle, yaw + i * (360 / frondCount), 0]);
  }
  // A small cluster of coconuts under the fronds
  const coconutCount = 2 + Math.floor(rng() * 3);
  for (let i = 0; i < coconutCount; i += 1) {
    const a = rng() * Math.PI * 2;
    const r = 0.35 + rng() * 0.2;
    batch.addBox('coconut', m.coconut, [
      x + leanX + Math.cos(a) * r,
      trunkTop + 0.1 - rng() * 0.2,
      z + leanZ + Math.sin(a) * r
    ], [0.22, 0.22, 0.22]);
  }
}

// Add a small coastal shrub — a low cluster of overlapping leafy boxes.
function addShrub(batch, m, x, z, seed) {
  const rng = makePRNG(seed);
  const groundY = terrainHeight(x, z);
  const lobes = 3 + Math.floor(rng() * 3);
  for (let i = 0; i < lobes; i += 1) {
    const ox = (rng() - 0.5) * 1.6;
    const oz = (rng() - 0.5) * 1.6;
    const h = 0.6 + rng() * 0.8;
    batch.addBox('shrubLeaf', m.shrubLeaf, [x + ox, groundY + h * 0.5, z + oz], [1.1, h, 1.1], [0, rng() * 360, 0]);
  }
}

// Add a single grass tuft — a couple of crossed thin boxes.
function addGrass(batch, m, x, z, seed) {
  const rng = makePRNG(seed);
  const groundY = terrainHeight(x, z);
  const blades = 3;
  for (let i = 0; i < blades; i += 1) {
    const angle = (i / blades) * 180 + rng() * 30;
    const h = 0.4 + rng() * 0.3;
    batch.addBox('grass', m.grass, [x, groundY + h * 0.5, z], [0.06, h, 0.55], [-8, angle, 0]);
  }
}

// Add a coastal rock — a lumpy irregular shape made from a few overlapping
// spheres via boxes (since we batch boxes).
function addRock(batch, m, x, z, seed) {
  const rng = makePRNG(seed);
  const groundY = terrainHeight(x, z);
  const lobes = 2 + Math.floor(rng() * 3);
  const mat = groundY < 0.5 ? m.rockWet : m.rockDry;
  const baseSize = 1.2 + rng() * 2.0;
  for (let i = 0; i < lobes; i += 1) {
    const ox = (rng() - 0.5) * baseSize;
    const oz = (rng() - 0.5) * baseSize;
    const s = baseSize * (0.6 + rng() * 0.5);
    const y = groundY + s * 0.35;
    batch.addBox('rock', mat, [x + ox, y, z + oz], [s, s * 0.7, s], [rng() * 30, rng() * 360, rng() * 10]);
  }
}

// Master entry point. Builds all vegetation on the island into a small
// number of batched entities.
export function buildVegetation(app) {
  const m = vegMaterials();
  const batch = new PrimitiveBatch();
  const rng = makePRNG(9876);

  // Density sampling: walk a jittered grid and place palms where the
  // terrain is above water and reasonably flat.
  const gridStep = 12;
  const range = 160;
  let palmSeed = 100;
  let palmCount = 0;
  // Palm grove concentration around (-8, -78)
  for (let gx = -range; gx < range; gx += gridStep) {
    for (let gz = -range; gz < range; gz += gridStep) {
      const jx = gx + (rng() - 0.5) * 8;
      const jz = gz + (rng() - 0.5) * 8;
      const h = terrainHeight(jx, jz);
      if (h < 1.4) continue; // skip beaches and underwater
      const slope = terrainSlope(jx, jz);
      if (slope > 0.55) continue;
      // Density bias: more palms near the grove, fewer elsewhere
      const groveDx = jx + 8;
      const groveDz = jz + 78;
      const groveDist = Math.hypot(groveDx, groveDz);
      const groveBias = Math.exp(-groveDist / 60) * 0.65;
      // Sparse palms in the settlement area (don't crowd buildings)
      const settlementDist = Math.hypot(jx, jz - 48);
      const settlementBias = settlementDist < 28 ? -0.4 : 0;
      // Avoid placing on the dock
      const dockDist = Math.hypot(jx, jz - 116);
      const dockBias = dockDist < 24 ? -0.4 : 0;
      // Lookout exclusion zone (rocky hilltop)
      const lookDist = Math.hypot(jx - 80, jz);
      const lookBias = lookDist < 22 ? -0.5 : 0;
      const prob = 0.18 + groveBias + settlementBias + dockBias + lookBias;
      if (rng() < prob && palmCount < 45) {
        const variant = rng() < 0.55 ? 1 : rng() < 0.85 ? 0 : 2;
        addPalm(batch, m, jx, jz, variant, palmSeed++);
        palmCount += 1;
      } else if (rng() < 0.3) {
        addShrub(batch, m, jx, jz, palmSeed++);
      } else if (rng() < 0.45) {
        addGrass(batch, m, jx, jz, palmSeed++);
      } else if (rng() < 0.25 && h < 2.5) {
        addRock(batch, m, jx, jz, palmSeed++);
      }
    }
  }
  // Extra rocks scattered along the coastline
  for (let i = 0; i < 35; i += 1) {
    const a = rng() * Math.PI * 2;
    const r = 145 + rng() * 25;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    addRock(batch, m, x, z, palmSeed++);
  }

  return batch.build(app, 'Island Vegetation', [0, 0, 0], [0, 0, 0], [1, 1, 1]);
}
