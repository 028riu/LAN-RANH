// Helpers for building custom PlayCanvas meshes from raw vertex data.
import * as pc from 'playcanvas';

// Build a pc.Mesh from positions/normals/uvs/colors/indices arrays.
export function buildMesh(device, opts) {
  const mesh = new pc.Mesh(device);
  mesh.setPositions(opts.positions);
  if (opts.uvs) mesh.setUvs(0, opts.uvs);
  if (opts.colors) mesh.setColors(opts.colors);
  if (opts.indices) mesh.setIndices(opts.indices);
  if (opts.normals) {
    mesh.setNormals(opts.normals);
  } else if (opts.indices) {
    // Auto-compute normals from positions + indices
    const normals = pc.calculateNormals(opts.positions, opts.indices);
    mesh.setNormals(normals);
  }
  mesh.update();
  return mesh;
}

// Create a render component entity with a custom mesh and material.
export function meshEntity(app, name, mesh, material, position = [0, 0, 0], euler = [0, 0, 0], scale = [1, 1, 1]) {
  const entity = new pc.Entity(name);
  const meshInstance = new pc.MeshInstance(mesh, material);
  entity.addComponent('render', {
    meshInstances: [meshInstance],
    castShadows: true,
    receiveShadows: true
  });
  entity.setLocalPosition(position[0], position[1], position[2]);
  entity.setLocalEulerAngles(euler[0], euler[1], euler[2]);
  entity.setLocalScale(scale[0], scale[1], scale[2]);
  app.root.addChild(entity);
  return entity;
}

// Create a PBR StandardMaterial with sane defaults.
export function pbrMaterial(opts = {}) {
  const m = new pc.StandardMaterial();
  if (opts.color) m.diffuse = new pc.Color(opts.color[0], opts.color[1], opts.color[2]);
  if (opts.emissive) m.emissive = new pc.Color(opts.emissive[0], opts.emissive[1], opts.emissive[2]);
  if (opts.metalness !== undefined) m.metalness = opts.metalness;
  if (opts.roughness !== undefined) m.roughness = opts.roughness;
  if (opts.specular !== undefined) m.specular = new pc.Color(opts.specular[0], opts.specular[1], opts.specular[2]);
  if (opts.opacity !== undefined) {
    m.opacity = opts.opacity;
    m.blendType = pc.BLEND_NORMAL;
  }
  if (opts.useVertexColors) m.vertexColors = true;
  if (opts.cull !== undefined) m.cull = opts.cull;
  if (opts.castShadows !== undefined) {
    // Per-material control is via the render component; we still record it
    m._castShadows = opts.castShadows;
  }
  m.update();
  return m;
}

// Group of meshInstances attached to one entity for batching related parts.
export function multiMeshEntity(app, name, meshInstances, position = [0, 0, 0], euler = [0, 0, 0], scale = [1, 1, 1]) {
  const entity = new pc.Entity(name);
  entity.addComponent('render', {
    meshInstances,
    castShadows: true,
    receiveShadows: true
  });
  entity.setLocalPosition(position[0], position[1], position[2]);
  entity.setLocalEulerAngles(euler[0], euler[1], euler[2]);
  entity.setLocalScale(scale[0], scale[1], scale[2]);
  app.root.addChild(entity);
  return entity;
}
