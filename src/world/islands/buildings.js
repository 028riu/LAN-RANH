// Buildings and props for Pirate Starter Island. Each structure is
// built from batched primitives so a single house is one or two draw
// calls instead of dozens.
import * as pc from 'playcanvas';
import { PrimitiveBatch } from '../../core/primitiveBatch.js';
import { pbrMaterial } from '../../core/meshBuilder.js';
import { terrainHeight } from './terrainBuilder.js';

// Shared materials so batches can merge parts.
function materials() {
  return {
    woodPlank: pbrMaterial({ color: [0.42, 0.28, 0.16], roughness: 0.85, metalness: 0.0 }),
    woodDark: pbrMaterial({ color: [0.24, 0.15, 0.09], roughness: 0.92 }),
    woodLight: pbrMaterial({ color: [0.62, 0.45, 0.27], roughness: 0.80 }),
    stone: pbrMaterial({ color: [0.55, 0.51, 0.46], roughness: 0.95 }),
    stoneDark: pbrMaterial({ color: [0.40, 0.36, 0.32], roughness: 0.95 }),
    canvasRed: pbrMaterial({ color: [0.74, 0.30, 0.22], roughness: 0.78 }),
    canvasCream: pbrMaterial({ color: [0.82, 0.74, 0.55], roughness: 0.78 }),
    metalBrass: pbrMaterial({ color: [0.78, 0.62, 0.30], roughness: 0.42, metalness: 0.85 }),
    glassPane: pbrMaterial({ color: [0.42, 0.62, 0.70], roughness: 0.18, metalness: 0.05, opacity: 0.55 }),
    flagRed: pbrMaterial({ color: [0.78, 0.18, 0.18], roughness: 0.85, cull: pc.CULLFACE_NONE })
  };
}

// ---------- DOCK ----------
// A wooden pier running roughly south from the north beach into shore.
// Top planks at y=2.4, with mooring posts at the corners and rope rails.
export function buildDock(app) {
  const batch = new PrimitiveBatch();
  const m = materials();
  // Dock center: extends along Z from z=145 (sea) to z=92 (beach)
  const dockY = 2.4;
  const length = 60;
  const width = 12;
  const centerZ = 116;
  // Planks: a long box for the platform, plus thinner strips on top for detail.
  batch.addBox('woodDark', m.woodDark, [0, dockY - 1.0, centerZ], [width, 1.6, length]);
  // Plank strips on the surface
  const plankCount = 14;
  const plankSpacing = length / plankCount;
  for (let i = 0; i < plankCount; i += 1) {
    const z = centerZ - length / 2 + plankSpacing * (i + 0.5);
    batch.addBox('woodPlank', m.woodPlank, [0, dockY, z], [width - 0.4, 0.16, plankSpacing - 0.18]);
  }
  // Mooring posts at corners
  const postPositions = [
    [-width / 2 + 0.5, dockY + 0.0, centerZ + length / 2 - 1.0],
    [width / 2 - 0.5,  dockY + 0.0, centerZ + length / 2 - 1.0],
    [-width / 2 + 0.5, dockY + 0.0, centerZ - length / 2 + 1.0],
    [width / 2 - 0.5,  dockY + 0.0, centerZ - length / 2 + 1.0],
    [-width / 2 + 0.5, dockY + 0.0, centerZ + length / 2 - 14],
    [width / 2 - 0.5,  dockY + 0.0, centerZ + length / 2 - 14]
  ];
  for (const p of postPositions) {
    batch.addCylinder('woodDark', m.woodDark, [p[0], dockY - 4.0, p[2]], [0.45, 6.5], [0, 0, 0], 8);
  }
  // Brass-style mooring bollards on top of corner posts
  for (const p of postPositions) {
    batch.addCylinder('brass', m.metalBrass, [p[0], dockY + 0.5, p[2]], [0.34, 0.6], [0, 0, 0], 10);
  }
  // Rope rail — thin boxes between posts (top of post)
  for (let i = 0; i < postPositions.length; i += 2) {
    const a = postPositions[i];
    const b = postPositions[i + 1];
    // Two rails at different heights
    for (const yOff of [1.2, 0.0]) {
      const mid = [(a[0] + b[0]) / 2, dockY + yOff, (a[2] + b[2]) / 2];
      const sz = [Math.abs(b[0] - a[0]) + 0.3, 0.12, Math.abs(b[2] - a[2]) + 0.3];
      batch.addBox('woodLight', m.woodLight, mid, sz);
    }
  }
  // A small steps ramp going down to the beach on the south end
  for (let i = 0; i < 3; i += 1) {
    batch.addBox('woodPlank', m.woodPlank,
      [0, dockY - 0.5 - i * 0.35, centerZ - length / 2 + 0.8 - i * 1.5],
      [width - 0.4, 0.18, 1.5]);
  }
  // A small boat moored at the dock — long box hull + small box as mast base
  const boatX = width / 2 + 4.5;
  batch.addBox('woodPlank', m.woodPlank, [boatX, 0.7, centerZ + 18], [2.4, 0.8, 9.0], [0, 12, 0]);
  batch.addBox('woodDark', m.woodDark, [boatX, 1.2, centerZ + 14], [0.18, 3.4, 0.18]);
  // Boat sail — thin box
  batch.addBox('canvasCream', m.canvasCream, [boatX + 0.0, 2.6, centerZ + 16], [0.05, 2.2, 4.2], [0, 12, 0]);

  return batch.build(app, 'Pirate Dock', [0, 0, 0], [0, 0, 0], [1, 1, 1]);
}

// ---------- CAPTAIN'S HOUSE ----------
// Two-storey wooden house on a raised stone foundation. Sloped roof,
// windows, door, small balcony on the upper floor facing the square.
export function buildCaptainHouse(app) {
  const batch = new PrimitiveBatch();
  const m = materials();
  const cx = 48, cz = 42;
  const groundY = terrainHeight(cx, cz);
  const baseY = groundY + 0.4; // stone foundation starts above the grass
  const houseWidth = 12;
  const houseDepth = 9;
  const wallHeight = 6.0;

  // Stone foundation — slightly larger than the house footprint
  batch.addBox('stone', m.stone, [cx, baseY - 0.2, cz], [houseWidth + 1.0, 1.6, houseDepth + 1.0]);
  // Lower floor walls
  batch.addBox('woodPlank', m.woodPlank, [cx, baseY + wallHeight * 0.5, cz], [houseWidth, wallHeight, houseDepth]);
  // Carve door — we'll just paint the door on with a darker box on the front face
  batch.addBox('woodDark', m.woodDark, [cx - 1.6, baseY + 1.3, cz + houseDepth / 2 + 0.02], [2.2, 2.6, 0.04]);
  // Brass door knob
  batch.addCylinder('brass', m.metalBrass, [cx - 2.4, baseY + 1.3, cz + houseDepth / 2 + 0.1], [0.06, 0.06, 0, 0.06], [90, 0, 0], 8);
  // Two ground-floor windows
  for (const xOff of [-4.5, 4.0]) {
    batch.addBox('glass', m.glassPane, [cx + xOff, baseY + 3.0, cz + houseDepth / 2 + 0.02], [1.6, 1.4, 0.04]);
    batch.addBox('woodDark', m.woodDark, [cx + xOff, baseY + 3.0, cz + houseDepth / 2 + 0.06], [1.8, 0.12, 0.06]);
    batch.addBox('woodDark', m.woodDark, [cx + xOff, baseY + 3.7, cz + houseDepth / 2 + 0.06], [1.8, 0.12, 0.06]);
    batch.addBox('woodDark', m.woodDark, [cx + xOff - 0.8, baseY + 3.0, cz + houseDepth / 2 + 0.06], [0.12, 1.4, 0.06]);
  }
  // Side windows
  batch.addBox('glass', m.glassPane, [cx + houseWidth / 2 + 0.02, baseY + 3.0, cz], [0.04, 1.4, 1.6]);
  batch.addBox('glass', m.glassPane, [cx - houseWidth / 2 - 0.02, baseY + 3.0, cz], [0.04, 1.4, 1.6]);

  // Upper floor (slightly narrower, balcony facing -X)
  const upperY = baseY + wallHeight;
  batch.addBox('woodLight', m.woodLight, [cx, upperY + 1.6, cz], [houseWidth - 1.0, 3.2, houseDepth - 1.0]);
  // Balcony rail
  batch.addBox('woodDark', m.woodDark, [cx - houseWidth / 2 - 0.6, upperY + 1.2, cz], [0.3, 0.9, houseDepth - 2.0]);
  // Upper windows facing the square (-X side)
  for (const zOff of [-2.0, 2.0]) {
    batch.addBox('glass', m.glassPane, [cx - houseWidth / 2 + 0.6, upperY + 2.3, cz + zOff], [0.04, 1.3, 1.5]);
  }
  // Sloped roof — triangular prism running along the X axis
  batch.addRoof('woodDark', m.woodDark, [cx, upperY + 3.2, cz], houseWidth + 0.8, houseDepth + 0.6, 3.2);
  // Chimney
  batch.addBox('stone', m.stoneDark, [cx + houseWidth / 2 - 2.0, upperY + 4.5, cz - houseDepth / 2 + 1.5], [1.4, 2.2, 1.4]);

  // Small signal mast behind the house
  batch.addCylinder('woodDark', m.woodDark, [cx + houseWidth / 2 + 1.0, baseY + 4.5, cz + houseDepth / 2 + 1.0], [0.18, 9.0], [0, 0, 0], 8);
  batch.addBox('flag', m.flagRed, [cx + houseWidth / 2 + 1.0, baseY + 8.5, cz + houseDepth / 2 + 2.4], [0.05, 1.8, 2.8]);

  return batch.build(app, "Captain's House", [0, 0, 0], [0, 0, 0], [1, 1, 1]);
}

// ---------- MARKET STALLS ----------
// Three small stalls with canvas awnings, each with a wooden counter,
// two posts and a slanted canvas roof.
export function buildMarketStalls(app) {
  const batch = new PrimitiveBatch();
  const m = materials();
  const centerX = -58;
  const centerZ = 30;
  const stallSpacing = 10;
  const awningColors = [m.canvasRed, m.canvasCream, m.canvasRed];
  for (let i = 0; i < 3; i += 1) {
    const sx = centerX + (i - 1) * stallSpacing;
    const sz = centerZ;
    const groundY = terrainHeight(sx, sz);
    // Counter
    batch.addBox('woodPlank', m.woodPlank, [sx, groundY + 1.0, sz], [4.0, 2.0, 1.6]);
    batch.addBox('woodDark', m.woodDark, [sx, groundY + 2.0, sz + 0.8], [4.0, 0.06, 0.3]);
    // Posts (two at back)
    batch.addBox('woodDark', m.woodDark, [sx - 1.6, groundY + 2.6, sz - 0.6], [0.18, 3.2, 0.18]);
    batch.addBox('woodDark', m.woodDark, [sx + 1.6, groundY + 2.6, sz - 0.6], [0.18, 3.2, 0.18]);
    // Slanted awning — box rotated 12 degrees
    batch.addBox('awning', awningColors[i], [sx, groundY + 4.2, sz + 0.3], [4.4, 0.16, 2.6], [12, 0, 0]);
    // Crates stacked on the counter
    batch.addBox('woodLight', m.woodLight, [sx - 1.0, groundY + 2.3, sz - 0.4], [0.7, 0.7, 0.7]);
    batch.addBox('woodLight', m.woodLight, [sx + 0.6, groundY + 2.3, sz + 0.4], [0.7, 0.7, 0.7]);
    batch.addBox('woodLight', m.woodLight, [sx - 1.0, groundY + 3.0, sz - 0.4], [0.7, 0.7, 0.7]);
    // A small lantern hanging on a post
    batch.addCylinder('brass', m.metalBrass, [sx - 1.6, groundY + 4.0, sz - 0.6], [0.12, 0.4], [0, 0, 0], 8);
  }
  return batch.build(app, 'Market Stalls', [0, 0, 0], [0, 0, 0], [1, 1, 1]);
}

// ---------- STORAGE SHED ----------
// Small wooden shed with slanted roof. Located near the dock.
export function buildStorageShed(app) {
  const batch = new PrimitiveBatch();
  const m = materials();
  const sx = 14, sz = 96;
  const groundY = terrainHeight(sx, sz);
  batch.addBox('woodPlank', m.woodPlank, [sx, groundY + 1.2, sz], [4.5, 2.4, 3.5]);
  batch.addRoof('woodDark', m.woodDark, [sx, groundY + 2.4, sz], 5.0, 4.0, 1.4);
  batch.addBox('woodDark', m.woodDark, [sx, groundY + 0.85, sz + 1.75], [1.0, 1.7, 0.08]);
  // Crates next to the shed
  batch.addBox('woodLight', m.woodLight, [sx + 3.0, groundY + 0.5, sz - 1.0], [0.9, 0.9, 0.9]);
  batch.addBox('woodLight', m.woodLight, [sx + 3.0, groundY + 1.4, sz - 1.0], [0.9, 0.9, 0.9]);
  batch.addBox('woodLight', m.woodLight, [sx + 3.9, groundY + 0.5, sz - 0.3], [0.9, 0.9, 0.9]);
  // Barrel
  batch.addCylinder('woodDark', m.woodDark, [sx - 3.5, groundY + 0.6, sz - 1.5], [0.55, 1.2], [0, 0, 0], 12);
  return batch.build(app, 'Storage Shed', [0, 0, 0], [0, 0, 0], [1, 1, 1]);
}

// ---------- LOOKOUT PLATFORM ----------
// A wooden tower at the top of the eastern hill. Ladder/steps, a small
// platform, and a tall signal flag pole.
export function buildLookout(app) {
  const batch = new PrimitiveBatch();
  const m = materials();
  const lx = 80, lz = 0;
  const groundY = terrainHeight(lx, lz);
  // Four posts
  const platformY = groundY + 5.5;
  const platformSize = 5.0;
  const cornerOff = [
    [-platformSize / 2, -platformSize / 2],
    [platformSize / 2, -platformSize / 2],
    [-platformSize / 2, platformSize / 2],
    [platformSize / 2, platformSize / 2]
  ];
  for (const [ox, oz] of cornerOff) {
    batch.addBox('woodDark', m.woodDark, [lx + ox, groundY + 2.75, lz + oz], [0.3, 5.5, 0.3]);
  }
  // Cross-braces
  for (let i = 0; i < 3; i += 1) {
    const y = groundY + 1.5 + i * 1.7;
    batch.addBox('woodPlank', m.woodPlank, [lx, y, lz - platformSize / 2], [platformSize, 0.15, 0.2]);
    batch.addBox('woodPlank', m.woodPlank, [lx, y, lz + platformSize / 2], [platformSize, 0.15, 0.2]);
  }
  // Platform top
  batch.addBox('woodPlank', m.woodPlank, [lx, platformY, lz], [platformSize + 0.2, 0.18, platformSize + 0.2]);
  // Rail posts + rails
  for (const [ox, oz] of cornerOff) {
    batch.addBox('woodDark', m.woodDark, [lx + ox, platformY + 0.55, lz + oz], [0.12, 1.1, 0.12]);
  }
  batch.addBox('woodLight', m.woodLight, [lx, platformY + 1.0, lz - platformSize / 2], [platformSize + 0.2, 0.12, 0.12]);
  batch.addBox('woodLight', m.woodLight, [lx, platformY + 1.0, lz + platformSize / 2], [platformSize + 0.2, 0.12, 0.12]);
  batch.addBox('woodLight', m.woodLight, [lx - platformSize / 2, platformY + 1.0, lz], [0.12, 0.12, platformSize + 0.2]);
  batch.addBox('woodLight', m.woodLight, [lx + platformSize / 2, platformY + 1.0, lz], [0.12, 0.12, platformSize + 0.2]);
  // Signal flag pole
  batch.addCylinder('woodDark', m.woodDark, [lx + platformSize / 2 + 0.6, platformY + 4.5, lz + platformSize / 2 + 0.6], [0.18, 9.0], [0, 0, 0], 8);
  batch.addBox('flag', m.flagRed, [lx + platformSize / 2 + 0.6, platformY + 8.5, lz + platformSize / 2 + 2.4], [0.05, 1.8, 2.8]);
  // A small ladder
  for (let i = 0; i < 6; i += 1) {
    batch.addBox('woodLight', m.woodLight, [lx - platformSize / 2 - 0.4, groundY + 0.5 + i * 0.9, lz], [0.16, 0.1, 0.6]);
  }
  return batch.build(app, 'Lookout Platform', [0, 0, 0], [0, 0, 0], [1, 1, 1]);
}

// ---------- SIGNPOSTS ----------
// Two wooden signposts at path junctions.
export function buildSignposts(app) {
  const batch = new PrimitiveBatch();
  const m = materials();
  const posts = [
    { x: -10, z: 78, signs: [['VILLAGE', -22], ['DOCK', 25], ['LOOKOUT', -68]] },
    { x: -52, z: 6, signs: [['MARKET', 12], ['PALM GROVE', -50], ['COVE', -120]] }
  ];
  for (const p of posts) {
    const groundY = terrainHeight(p.x, p.z);
    batch.addCylinder('woodDark', m.woodDark, [p.x, groundY + 1.4, p.z], [0.16, 2.8], [0, 0, 0], 8);
    for (let i = 0; i < p.signs.length; i += 1) {
      const [text, yaw] = p.signs[i];
      void text;
      batch.addBox('woodLight', m.woodLight, [p.x, groundY + 2.0 - i * 0.7, p.z], [1.6, 0.5, 0.06], [0, yaw, 0]);
    }
  }
  return batch.build(app, 'Signposts', [0, 0, 0], [0, 0, 0], [1, 1, 1]);
}

// ---------- TRAINING TARGET ----------
// A simple straw-stuffed training post, located in the training clearing.
export function buildTrainingTarget(app) {
  const batch = new PrimitiveBatch();
  const m = materials();
  const tx = 48, tz = -48;
  const groundY = terrainHeight(tx, tz);
  // Wooden post
  batch.addCylinder('woodDark', m.woodDark, [tx, groundY + 1.4, tz], [0.18, 2.8], [0, 0, 0], 8);
  // Target disk — paint a darker "bullseye" pattern using stacked disks
  batch.addCylinder('woodLight', m.woodLight, [tx, groundY + 2.4, tz], [1.0, 0.15], [90, 0, 0], 18);
  batch.addCylinder('canvasRed', m.canvasRed, [tx, groundY + 2.4, tz], [0.45, 0.18], [90, 0, 0], 18);
  return batch.build(app, 'Training Target', [0, 0, 0], [0, 0, 0], [1, 1, 1]);
}

// ---------- SCATTERED PROPS ----------
// Crates, barrels, rope coils, fish baskets scattered around the
// settlement and dock. Adds life to the island.
export function buildSettlementProps(app) {
  const batch = new PrimitiveBatch();
  const m = materials();
  // A few prop clusters: position pairs of [x, z, kind]
  const props = [
    [-12, 50, 'crate'], [-10, 52, 'crate'], [-12, 54, 'barrel'],
    [10, 36, 'barrel'], [12, 38, 'barrel'],
    [-44, 38, 'crate'], [-46, 38, 'crate'], [-44, 40, 'crate'],
    [-2, 18, 'crate'], [-4, 18, 'barrel'], [4, 22, 'barrel']
  ];
  for (const [x, z, kind] of props) {
    const groundY = terrainHeight(x, z);
    if (kind === 'crate') {
      batch.addBox('woodLight', m.woodLight, [x, groundY + 0.45, z], [0.9, 0.9, 0.9]);
    } else {
      batch.addCylinder('woodDark', m.woodDark, [x, groundY + 0.55, z], [0.55, 1.1], [0, 0, 0], 12);
      batch.addCylinder('woodLight', m.woodLight, [x, groundY + 0.95, z], [0.58, 0.1], [0, 0, 0], 12);
    }
  }
  return batch.build(app, 'Settlement Props', [0, 0, 0], [0, 0, 0], [1, 1, 1]);
}

// ---------- PATH STONES ----------
// A subtle row of slightly raised stone tiles along the main path from
// dock to settlement square. Visual guide without blocking movement.
export function buildPathStones(app) {
  const batch = new PrimitiveBatch();
  const m = materials();
  // Trace a path from dock (0, 110) to settlement (0, 48), then split
  // toward captain (48, 42) and palm grove (-8, -78).
  const pathPoints = [];
  // Dock -> Square
  for (let t = 0; t <= 1; t += 0.1) {
    const z = 110 + (48 - 110) * t;
    const x = Math.sin(t * Math.PI) * 1.5;
    pathPoints.push([x, z]);
  }
  // Square -> Captain
  for (let t = 0.1; t <= 1; t += 0.1) {
    const x = 0 + (48 - 0) * t;
    const z = 48 + (42 - 48) * t;
    pathPoints.push([x, z]);
  }
  // Square -> Palm grove
  for (let t = 0.1; t <= 1; t += 0.1) {
    const x = 0 + (-8 - 0) * t;
    const z = 48 + (-78 - 48) * t;
    pathPoints.push([x, z]);
  }
  for (const [x, z] of pathPoints) {
    const groundY = terrainHeight(x, z);
    batch.addBox('pathstone', m.stoneDark, [x, groundY + 0.08, z], [2.2, 0.16, 2.0]);
  }
  return batch.build(app, 'Path Stones', [0, 0, 0], [0, 0, 0], [1, 1, 1]);
}
