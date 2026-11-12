// Global world configuration.
export const WORLD_CONFIG = {
  seaLevel: 0,

  // Player controller limits
  player: {
    walkSpeed: 4.8,
    runSpeed: 9.0,
    jumpVelocity: 8.4,
    deepWaterLimit: -1.4,   // terrain below this Y blocks walking
    worldBoundRadius: 1500
  },

  // Camera
  camera: {
    distance: 7.5,
    heightOffset: 1.4,
    targetHeight: 1.45,
    minPitch: -0.6,    // camera low → looking up
    maxPitch: 1.1,     // camera high → looking down
    sensitivity: 0.0022
  },

  // Ocean + sky
  ocean: { size: 4200, segments: 150 },
  sky: { radius: 4200 },
  fog: { start: 320, end: 2600, color: [0.66, 0.78, 0.86] },

  // LOD: static batches beyond this distance from the camera have their
  // micro-detail layer (grass/flowers) hidden.
  detailHideDistance: 420
};

export default WORLD_CONFIG;
