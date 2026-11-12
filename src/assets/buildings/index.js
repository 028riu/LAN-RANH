// Building asset registry — only code-authored non-house structures remain.
// All houses are loaded from the uploaded GLB library by IslandManager.
import * as marketStall from './marketStall.js';
import * as weaponShop from './weaponShop.js';
import * as watchtower from './watchtower.js';
import * as dockPier from './dockPieces.js';

export const BUILDING_ASSETS = [marketStall, weaponShop, watchtower, dockPier];

// Named exports used directly by island layouts for boats.
export { fishingBoat, cargoBoat } from './dockPieces.js';
