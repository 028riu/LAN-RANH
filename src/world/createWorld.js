// World assembly: environment (sky/sun/fog/ocean/clouds) + the multi-island
// archipelago + shoreline foam + collision + travel wiring.
import { WORLD_CONFIG } from './worldConfig.js';
import { CollisionSystem } from './systems/collisionSystem.js';
import { createEnvironment } from './systems/environmentSystem.js';
import { IslandManager } from './islands/islandManager.js';
import { buildShoreFoam } from './islands/shoreFoam.js';

export function createWorld(app) {
  const environment = createEnvironment(app);
  const collision = new CollisionSystem();
  const islands = new IslandManager(app, app.graphicsDevice, collision);
  islands.buildAll();

  // Shore foam rings after the islands exist — each ring marches that
  // island's own terrain height function to hug the real waterline.
  const shoreFoam = buildShoreFoam(app, app.graphicsDevice,
    islands.islands.map((i) => ({ def: i.def, height: i.terrain.height })));

  const spawn = islands.spawn();

  const world = {
    config: WORLD_CONFIG,
    environment,
    collision,
    islands,
    shoreFoam,
    spawn,

    groundAt: (x, z) => islands.groundAt(x, z),
    slopeAt: (x, z) => islands.slopeAt(x, z),
    sunDirection: environment.sunDirection,

    // Called by the connection system when a boat trip completes.
    onTravelArrive: null,

    followSky(camera) {
      environment.followSky(camera);
    },
    updateOcean(dt, time) {
      environment.updateOcean(dt, time);
      shoreFoam.update(time);
    },
    updateDetail(cameraPos) {
      islands.updateDetailVisibility(cameraPos);
    }
  };

  return world;
}
