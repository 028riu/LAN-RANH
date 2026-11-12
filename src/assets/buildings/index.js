// Building asset registry — every structure module in one place.
import * as houseWoodSmall from './houseWoodSmall.js';
import * as houseWoodLarge from './houseWoodLarge.js';
import * as houseStone from './houseStone.js';
import * as pirateCaptainHouse from './pirateCaptainHouse.js';
import * as marketStall from './marketStall.js';
import * as weaponShop from './weaponShop.js';
import * as storageHouse from './storageHouse.js';
import * as watchtower from './watchtower.js';
import * as coastalHouse from './coastalHouse.js';
import * as beachHut from './beachHut.js';
import * as fishingHut from './fishingHut.js';
import * as harborWarehouse from './harborWarehouse.js';
import * as dockHouse from './dockHouse.js';
import * as dockPier from './dockPieces.js';

export const BUILDING_ASSETS = [
  houseWoodSmall,
  houseWoodLarge,
  houseStone,
  pirateCaptainHouse,
  marketStall,
  weaponShop,
  storageHouse,
  watchtower,
  coastalHouse,
  beachHut,
  fishingHut,
  harborWarehouse,
  dockHouse,
  dockPier
];

// Named exports used directly by island layouts for composite structures.
export { fishingBoat, cargoBoat } from './dockPieces.js';
