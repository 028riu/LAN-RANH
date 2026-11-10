// Sea 1 greybox layout. Coordinates are project proposals from docs/SEA1_WORLD_MAP_SPEC.md.
export const WORLD_CONFIG = {
  seaLevel: 0,
  bounds: { width: 5600, depth: 4400 },
  spawnIslandId: 'pirate-starter',
  islands: [
    { id:'pirate-starter', name:'Pirate Starter Island', x:-2000, z:0, width:360, depth:300, biome:'tropical', height:10, role:'starter', color:[0.28,0.52,0.30] },
    { id:'marine-starter', name:'Marine Starter Island', x:-1500, z:-350, width:340, depth:300, biome:'coastal', height:10, role:'starter', color:[0.42,0.57,0.48] },
    { id:'middle-town', name:'Middle Town', x:-850, z:-100, width:420, depth:360, biome:'town', height:12, role:'hub', color:[0.38,0.53,0.34] },
    { id:'jungle', name:'Jungle', x:-1150, z:650, width:520, depth:480, biome:'jungle', height:16, role:'exploration', color:[0.12,0.36,0.19] },
    { id:'pirate-village', name:'Pirate Village', x:-1750, z:1350, width:460, depth:380, biome:'tropical', height:13, role:'village', color:[0.25,0.43,0.25] },
    { id:'desert', name:'Desert', x:-650, z:1700, width:600, depth:440, biome:'desert', height:12, role:'biome', color:[0.70,0.55,0.31] },
    { id:'frozen-village', name:'Frozen Village', x:250, z:1750, width:520, depth:460, biome:'frozen', height:16, role:'village', color:[0.65,0.78,0.83] },
    { id:'marine-fortress', name:'Marine Fortress', x:1100, z:1250, width:560, depth:520, biome:'fortress', height:18, role:'fortress', color:[0.43,0.48,0.49] },
    { id:'prison', name:'Prison', x:1750, z:650, width:420, depth:460, biome:'fortress', height:14, role:'fortress', color:[0.35,0.39,0.41] },
    { id:'colosseum', name:'Colosseum', x:2350, z:0, width:480, depth:430, biome:'stone', height:14, role:'arena', color:[0.58,0.48,0.37] },
    { id:'skylands', name:'Skylands', x:250, z:-650, width:500, depth:440, biome:'sky', height:24, elevation:280, role:'floating', color:[0.43,0.65,0.48] },
    { id:'upper-skylands', name:'Upper Skylands', x:650, z:-1350, width:480, depth:420, biome:'sky', height:24, elevation:490, role:'floating', color:[0.56,0.68,0.58] },
    { id:'magma-village', name:'Magma Village', x:1550, z:-1000, width:560, depth:500, biome:'volcanic', height:20, role:'volcanic', color:[0.28,0.25,0.23] },
    { id:'underwater-city', name:'Underwater City', x:-500, z:-1450, width:560, depth:500, biome:'underwater', height:12, elevation:-28, role:'underwater', color:[0.12,0.37,0.43] },
    { id:'fountain-city', name:'Fountain City', x:2250, z:-1500, width:620, depth:520, biome:'city', height:18, role:'late', color:[0.48,0.57,0.57] },
    { id:'jean-luc-secret', name:'Jean-Luc Secret Area', x:2550, z:1250, width:180, depth:180, biome:'secret', height:9, role:'secret', color:[0.25,0.39,0.31] }
  ],
  routes: [
    ['pirate-starter','marine-starter','middle-town'],
    ['middle-town','jungle','pirate-village','desert'],
    ['desert','frozen-village','marine-fortress'],
    ['marine-fortress','prison','colosseum'],
    ['middle-town','skylands','upper-skylands'],
    ['middle-town','underwater-city','magma-village'],
    ['prison','fountain-city']
  ]
};
