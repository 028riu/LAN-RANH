// Environment system — sky dome, sun + fill lights, fog and the animated
// ocean. This wraps the existing (proven) sky.js and ocean.js shaders so
// createWorld stays tiny.
import * as pc from 'playcanvas';
import { buildSky, buildClouds } from '../islands/sky.js';
import { buildOcean } from '../islands/ocean.js';
import { WORLD_CONFIG } from '../worldConfig.js';

export function createEnvironment(app) {
  // --- Scene atmosphere -------------------------------------------------------
  app.scene.ambientLight = new pc.Color(0.30, 0.34, 0.40);
  app.scene.exposure = 1.18;
  app.scene.gammaCorrection = pc.GAMMA_SRGB;
  app.scene.toneMapping = pc.TONEMAP_ACES;

  app.scene.fog.type = pc.FOG_LINEAR;
  app.scene.fog.color = new pc.Color(...WORLD_CONFIG.fog.color);
  app.scene.fog.start = WORLD_CONFIG.fog.start;
  app.scene.fog.end = WORLD_CONFIG.fog.end;

  const skyboxLayer = app.scene.layers.getLayerById(pc.LAYERID_SKYBOX);
  if (skyboxLayer) skyboxLayer.enabled = false;

  // --- Sky dome ----------------------------------------------------------------
  const sky = buildSky(app, app.graphicsDevice, { radius: WORLD_CONFIG.sky.radius });

  // --- Sun ---------------------------------------------------------------------
  const sunDir = new pc.Vec3(0.42, 0.66, 0.62).normalize();
  // Low-fx mode (for weak machines / automated software-rendered tests):
  //   ?fx=low  → smaller, nearer shadow map
  const lowFx = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('fx') === 'low';
  const sun = new pc.Entity('Sun');
  sun.addComponent('light', {
    type: 'directional',
    color: new pc.Color(1.0, 0.93, 0.78),
    intensity: 0.72,
    castShadows: true,
    shadowDistance: lowFx ? 140 : 320,
    shadowResolution: lowFx ? 1024 : 2048,
    shadowBias: 0.012,
    normalOffsetBias: 0.04
  });
  sun.setEulerAngles(
    Math.asin(sunDir.y) * 180 / Math.PI,
    Math.atan2(sunDir.x, sunDir.z) * 180 / Math.PI,
    0
  );
  app.root.addChild(sun);

  const fill = new pc.Entity('Sky Fill');
  fill.addComponent('light', {
    type: 'directional',
    color: new pc.Color(0.62, 0.78, 0.92),
    intensity: 0.2,
    castShadows: false
  });
  fill.setEulerAngles(-28, -32, 0);
  app.root.addChild(fill);

  // --- Ocean ---------------------------------------------------------------------
  const ocean = buildOcean(app, app.graphicsDevice, {
    size: WORLD_CONFIG.ocean.size,
    segments: WORLD_CONFIG.ocean.segments
  });
  ocean.update(0, 0, sunDir);
  sky.setSunDirection(sunDir);

  // --- Stylized cloud layer --------------------------------------------------------
  const clouds = buildClouds(app, app.graphicsDevice, {
    count: 9,
    seed: 9182
  });
  clouds.update(0);

  return {
    sky,
    sun,
    sunDirection: sunDir,
    ocean,
    clouds,
    followSky(camera) {
      sky.follow(camera);
    },
    updateOcean(dt, time) {
      ocean.update(dt, time, sunDir);
      clouds.update(time);
    }
  };
}
