// Island registry — the single source of truth for the archipelago.
//
// Each definition carries: world position, elliptical size, terrain
// profile (seeded), visual theme, spawn point, travel dock placement,
// HUD zones and LOD detail level. Island layout code lives in the
// per-island modules; this file only declares data.
export const ISLAND_DEFS = [
  {
    id: 'pirate_starter',
    name: 'Pirate Starter Island',
    theme: 'tropical',
    cx: 0, cz: 0,
    rx: 170, rz: 150,
    meshSize: 700, meshSegments: 200,
    terrain: { kind: 'starter' },
    detail: 1.0,
    spawn: { x: 0, z: 126, yaw: 180 },          // at the pier foot on land
    travelDock: { x: 0, z: 151, rotationY: 180, length: 46, width: 7, deckY: null },
    zones: [
      { id: 'harbour',    name: 'Harbour & Arrival',  x: 0,    z: 122, radius: 42 },
      { id: 'settlement', name: 'Village Square',     x: 0,    z: 48,  radius: 50 },
      { id: 'market',     name: 'Market Lane',        x: -58,  z: 30,  radius: 36 },
      { id: 'captain',    name: "Captain's House",    x: 48,   z: 42,  radius: 40 },
      { id: 'training',   name: 'Training Clearing',  x: 48,   z: -48, radius: 40 },
      { id: 'palms',      name: 'Palm Grove',         x: -8,   z: -78, radius: 48 },
      { id: 'lookout',    name: 'Scenic Lookout',     x: 80,   z: 0,   radius: 38 },
      { id: 'watchtower', name: 'Watchtower Hill',    x: 36,   z: 72,  radius: 24 },
      { id: 'coast_row',  name: 'Coastal Row',        x: -20,  z: 98,  radius: 36 },
      { id: 'cove',       name: 'Hidden Cove',        x: -112, z: -88, radius: 34 },
      { id: 'beach',      name: 'South Beach',        x: -4,   z: -126, radius: 44 }
    ]
  },
  {
    id: 'jungle_isle',
    name: 'Jungle Isle',
    theme: 'jungle',
    cx: -680, cz: -240,
    rx: 150, rz: 125,
    meshSize: 640, meshSegments: 176,
    terrain: { kind: 'param', seed: 2, peak: 7.5, detail: 1.8, undulation: 1.5, coastVariation: 0.2,
      bumps: [
        { x: 40, z: -30, height: 7, radius: 60 },
        { x: -55, z: 25, height: 5, radius: 55 }
      ],
      valleys: [ { x: 10, z: 20, depth: 2.2, radius: 30 } ] },
    detail: 0.85,
    spawn: { x: 0, z: 101, yaw: 180 },
    travelDock: { x: 0, z: 120, rotationY: 180, length: 34, width: 6, deckY: null },
    zones: [
      { id: 'landing',   name: 'Vine Landing',     x: 0,    z: 104, radius: 34 },
      { id: 'deepwood',  name: 'The Deepwood',     x: -40,  z: -20, radius: 48 },
      { id: 'canopy',    name: 'Canopy Rise',      x: 45,   z: -35, radius: 40 },
      { id: 'pond',      name: 'Fern Pond',        x: 15,   z: 25,  radius: 30 }
    ]
  },
  {
    id: 'desert_isle',
    name: 'Dune Desert Isle',
    theme: 'desert',
    cx: 640, cz: -380,
    rx: 165, rz: 135,
    meshSize: 660, meshSegments: 176,
    terrain: { kind: 'param', seed: 3, peak: 5.5, detail: 2.2, undulation: 1.6, beachWidth: 0.24, beachRise: 1.2,
      bumps: [ { x: -35, z: -20, height: 8, radius: 75 } ],
      valleys: [ { x: 40, z: 30, depth: 2.0, radius: 40 } ] },
    detail: 0.8,
    spawn: { x: 0, z: 106, yaw: 180 },
    travelDock: { x: 0, z: 125, rotationY: 180, length: 34, width: 6, deckY: null },
    zones: [
      { id: 'landing',  name: 'Sun Landing',    x: 0,   z: 108, radius: 34 },
      { id: 'dunes',    name: 'Singing Dunes',  x: -35, z: -15, radius: 52 },
      { id: 'ruins',    name: 'Old Ruins',      x: 42,  z: 18,  radius: 38 },
      { id: 'oasis',    name: 'Dry Oasis',      x: 10,  z: -52, radius: 34 }
    ]
  },
  {
    id: 'snow_isle',
    name: 'Frostpeak Isle',
    theme: 'snow',
    cx: -520, cz: 640,
    rx: 150, rz: 140,
    meshSize: 640, meshSegments: 176,
    terrain: { kind: 'param', seed: 4, peak: 8.5, detail: 1.6, undulation: 1.3, snowLine: 6.5,
      bumps: [
        { x: 30, z: 20, height: 10, radius: 65 },
        { x: -45, z: -25, height: 7, radius: 55 }
      ] },
    detail: 0.8,
    spawn: { x: 0, z: 115, yaw: 180 },
    travelDock: { x: 0, z: 134, rotationY: 180, length: 34, width: 6, deckY: null },
    zones: [
      { id: 'landing', name: 'Icy Landing',   x: 0,   z: 118, radius: 34 },
      { id: 'peak',    name: 'Frostpeak',     x: 30,  z: 20,  radius: 48 },
      { id: 'pines',   name: 'Whisper Pines', x: -45, z: -20, radius: 48 }
    ]
  },
  {
    id: 'volcanic_isle',
    name: 'Ember Volcanic Isle',
    theme: 'volcanic',
    cx: 560, cz: 600,
    rx: 140, rz: 125,
    meshSize: 620, meshSegments: 176,
    terrain: { kind: 'param', seed: 5, peak: 5.0, detail: 1.5, undulation: 1.2,
      plateau: { x: -15, z: -10, height: 14, radius: 62, craterRadius: 26, craterDepth: 6 },
      bumps: [ { x: 45, z: 25, height: 6, radius: 50 } ] },
    detail: 0.8,
    spawn: { x: 0, z: 126, yaw: 180 },
    travelDock: { x: 0, z: 145, rotationY: 180, length: 34, width: 6, deckY: null },
    zones: [
      { id: 'landing', name: 'Ash Landing',    x: 0,   z: 128, radius: 34 },
      { id: 'caldera', name: 'The Caldera',    x: -15, z: -10, radius: 46 },
      { id: 'fields',  name: 'Ember Fields',   x: 45,  z: 25,  radius: 40 }
    ]
  }
];

export function islandDefById(id) {
  return ISLAND_DEFS.find((d) => d.id === id) || null;
}
