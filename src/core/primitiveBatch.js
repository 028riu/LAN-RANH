// Batched primitive builder. Builds a list of simple shapes (boxes,
// cylinders) and merges them into a single mesh + MeshInstance per
// material, drastically reducing draw calls for things like docks,
// market stalls, fences, etc.
import * as pc from 'playcanvas';
import { buildMesh, multiMeshEntity } from './meshBuilder.js';

// Generate vertices for a box centered at origin with the given size.
// Returns {positions, indices} in local space (caller transforms).
function boxGeometry(size) {
  const hx = size[0] / 2;
  const hy = size[1] / 2;
  const hz = size[2] / 2;
  const positions = [
    -hx,-hy,-hz,  hx,-hy,-hz,  hx, hy,-hz, -hx, hy,-hz, // back
     hx,-hy, hz, -hx,-hy, hz, -hx, hy, hz,  hx, hy, hz, // front
    -hx,-hy, hz, -hx,-hy,-hz, -hx, hy,-hz, -hx, hy, hz, // left
     hx,-hy,-hz,  hx,-hy, hz,  hx, hy, hz,  hx, hy,-hz, // right
    -hx, hy,-hz,  hx, hy,-hz,  hx, hy, hz, -hx, hy, hz, // top
    -hx,-hy, hz,  hx,-hy, hz,  hx,-hy,-hz, -hx,-hy,-hz  // bottom
  ];
  const indices = [
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    8,9,10, 8,10,11,
    12,13,14, 12,14,15,
    16,17,18, 16,18,19,
    20,21,22, 20,22,23
  ];
  return { positions, indices };
}

// Generate vertices for a cylinder along the Y axis.
function cylinderGeometry(radius, height, radialSegments = 12) {
  const positions = [];
  const indices = [];
  const hy = height / 2;
  // Two rings (top, bottom)
  for (let r = 0; r < 2; r += 1) {
    const y = (r === 0) ? -hy : hy;
    for (let s = 0; s < radialSegments; s += 1) {
      const a = (s / radialSegments) * Math.PI * 2;
      positions.push(Math.cos(a) * radius, y, Math.sin(a) * radius);
    }
  }
  // Side faces
  for (let s = 0; s < radialSegments; s += 1) {
    const s0 = s;
    const s1 = (s + 1) % radialSegments;
    const t0 = s + radialSegments;
    const t1 = ((s + 1) % radialSegments) + radialSegments;
    indices.push(s0, t0, s1);
    indices.push(s1, t0, t1);
  }
  // Caps
  const topCenter = positions.length / 3;
  positions.push(0, hy, 0);
  const botCenter = positions.length / 3;
  positions.push(0, -hy, 0);
  for (let s = 0; s < radialSegments; s += 1) {
    const s1 = (s + 1) % radialSegments;
    indices.push(s1 + radialSegments, s + radialSegments, topCenter);
    indices.push(s, s1, botCenter);
  }
  return { positions, indices };
}

// Transform a vertex array in-place by a 4x4 transform.
function applyTransform(positions, t) {
  const out = new Array(positions.length);
  const m = t;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    out[i] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[i + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[i + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
  }
  return out;
}

// Build a 4x4 matrix from translation, euler angles (deg), scale.
function composeMatrix(pos, eulerDeg, scale) {
  const m = new pc.Mat4();
  m.setTRS(
    new pc.Vec3(pos[0], pos[1], pos[2]),
    new pc.Quat().setFromEulerAngles(eulerDeg[0], eulerDeg[1], eulerDeg[2]),
    new pc.Vec3(scale[0], scale[1], scale[2])
  );
  return m.data;
}

// Main class: collect primitive placements, then build a single batched
// MeshInstance per material.
export class PrimitiveBatch {
  constructor() {
    this.buckets = new Map(); // materialKey -> { material, parts: [] }
    this._rawBuckets = new WeakMap(); // material object -> bucket
  }

  // Add a box. transform is in WORLD space (relative to the batch's parent).
  addBox(materialKey, material, position, size, euler = [0, 0, 0]) {
    const geo = boxGeometry(size);
    const t = composeMatrix(position, euler, [1, 1, 1]);
    const transformed = applyTransform(geo.positions, t);
    this._push(materialKey, material, transformed, geo.indices);
    return this;
  }

  // Add a cylinder.
  addCylinder(materialKey, material, position, size, euler = [0, 0, 0], segments = 12) {
    const geo = cylinderGeometry(size[0], size[1], segments);
    const t = composeMatrix(position, euler, [size[0], size[1], size[2]]); // scale radius/height
    // Actually cylinder is built with absolute radius/height, so we should
    // treat size[0] as the radius and size[1] as the height. Don't scale.
    const tm = composeMatrix(position, euler, [1, 1, 1]);
    const transformed = applyTransform(geo.positions, tm);
    this._push(materialKey, material, transformed, geo.indices);
    return this;
  }

  // Add a sloped roof — a triangular prism along the X axis.
  addRoof(materialKey, material, position, width, depth, height, euler = [0, 0, 0]) {
    const hx = width / 2;
    const hz = depth / 2;
    // Triangular cross-section in the X-Y plane, extruded along Z.
    // 6 vertices: bottom-back-left, bottom-back-right, top-back,
    // bottom-front-left, bottom-front-right, top-front
    const positions = [
      -hx, 0, -hz,
       hx, 0, -hz,
       0, height, -hz,
      -hx, 0,  hz,
       hx, 0,  hz,
       0, height,  hz
    ];
    const indices = [
      // back triangle
      0, 1, 2,
      // front triangle (reverse)
      3, 5, 4,
      // slope left
      0, 2, 3,
      3, 2, 5,
      // slope right
      1, 4, 2,
      4, 5, 2,
      // bottom
      0, 3, 1,
      3, 4, 1
    ];
    const t = composeMatrix(position, euler, [1, 1, 1]);
    const transformed = applyTransform(positions, t);
    this._push(materialKey, material, transformed, indices);
    return this;
  }

  _push(key, material, positions, indices) {
    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { material, parts: [] };
      this.buckets.set(key, bucket);
    }
    bucket.parts.push({ positions, indices, vertexOffset: 0, indexOffset: 0 });
  }

  // Push already-transformed (world space) geometry. Used by AssetKit when
  // merging local-space asset geometry into an island batch.
  _pushRaw(material, positions, indices) {
    let bucket = this._rawBuckets.get(material);
    if (!bucket) {
      bucket = { material, parts: [] };
      this._rawBuckets.set(material, bucket);
      this.buckets.set(`raw_${this.buckets.size}`, bucket);
    }
    bucket.parts.push({ positions, indices, vertexOffset: 0, indexOffset: 0 });
  }

  // Build all batched mesh instances and return as one entity.
  build(app, name, position = [0, 0, 0], euler = [0, 0, 0], scale = [1, 1, 1]) {
    const meshInstances = [];
    const device = app.graphicsDevice;

    for (const [, bucket] of this.buckets) {
      // Compute total vertex/index counts
      let totalVerts = 0;
      let totalIndices = 0;
      for (const part of bucket.parts) {
        part.vertexOffset = totalVerts;
        part.indexOffset = totalIndices;
        totalVerts += part.positions.length / 3;
        totalIndices += part.indices.length;
      }
      const positions = new Float32Array(totalVerts * 3);
      const indices = new Uint32Array(totalIndices);
      let vp = 0;
      let ip = 0;
      const vertexStarts = [];
      for (const part of bucket.parts) {
        vertexStarts.push(part.vertexOffset);
        for (let i = 0; i < part.positions.length; i += 1) {
          positions[vp++] = part.positions[i];
        }
        for (let i = 0; i < part.indices.length; i += 1) {
          indices[ip++] = part.indices[i] + part.vertexOffset;
        }
      }
      const mesh = buildMesh(device, { positions, indices });
      const meshInstance = new pc.MeshInstance(mesh, bucket.material);
      meshInstances.push(meshInstance);
    }

    return multiMeshEntity(app, name, meshInstances, position, euler, scale);
  }
}
