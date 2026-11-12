// Shared material library with per-theme palettes.
//
// The library is created ONCE for the whole game. Asset modules reference
// materials by ROLE (wall, trim, roof, foundation, door...) via a theme
// handle, so the same house module renders as tropical wood on the pirate
// island, sandstone in the desert or dark timber in the snow — without
// any code duplication.
//
// Many materials come in 2-3 tone variants. AssetKit picks a variant per
// part so big surfaces read as varied construction instead of flat colour.
import * as pc from 'playcanvas';
import { pbrMaterial } from '../core/meshBuilder.js';

function toneSet(colors, opts = {}) {
  return colors.map((c) => pbrMaterial({ ...opts, color: c }));
}

function single(color, opts = {}) {
  return pbrMaterial({ ...opts, color });
}

// --- Shared (theme independent) materials ----------------------------------
function sharedMaterials() {
  return {
    // Metals
    brass: single([0.80, 0.63, 0.30], { roughness: 0.38, metalness: 0.85 }),
    iron: single([0.32, 0.33, 0.36], { roughness: 0.5, metalness: 0.75 }),
    ironDark: single([0.20, 0.21, 0.24], { roughness: 0.6, metalness: 0.7 }),
    gold: single([0.94, 0.78, 0.32], { roughness: 0.35, metalness: 0.85 }),
    copper: single([0.72, 0.44, 0.28], { roughness: 0.45, metalness: 0.8 }),

    // Glass / glow
    glass: single([0.55, 0.72, 0.78], { roughness: 0.15, metalness: 0.05, opacity: 0.5 }),
    lanternGlow: pbrMaterial({ color: [0.95, 0.72, 0.35], emissive: new pc.Color(0.9, 0.55, 0.18), roughness: 0.4 }),

    // Canvases & cloth
    canvasRed: toneSet([[0.72, 0.28, 0.20], [0.66, 0.24, 0.18]], { roughness: 0.85 }),
    canvasCream: toneSet([[0.84, 0.76, 0.58], [0.80, 0.71, 0.52]], { roughness: 0.85 }),
    canvasTeal: toneSet([[0.20, 0.48, 0.48], [0.18, 0.43, 0.44]], { roughness: 0.85 }),
    flagRed: single([0.78, 0.18, 0.18], { roughness: 0.85, cull: pc.CULLFACE_NONE }),
    flagJolly: single([0.12, 0.12, 0.14], { roughness: 0.9, cull: pc.CULLFACE_NONE }),
    rope: single([0.68, 0.55, 0.34], { roughness: 0.95 }),

    // Common wood tones used by props on every island
    woodCrate: toneSet([[0.64, 0.47, 0.28], [0.58, 0.42, 0.25], [0.70, 0.52, 0.31]], { roughness: 0.85 }),
    woodBarrel: toneSet([[0.42, 0.28, 0.15], [0.38, 0.25, 0.13]], { roughness: 0.8 }),
    barrelBand: single([0.35, 0.30, 0.26], { roughness: 0.5, metalness: 0.6 }),

    // --- Extended wood family (Part 08.1 — distinct wood types) ---------------
    // Light tropical wood: pale honey tone for fresh construction.
    woodLight: toneSet([[0.78, 0.64, 0.42], [0.74, 0.60, 0.38], [0.82, 0.69, 0.46]], { roughness: 0.8 }),
    // Painted wood: harbour teal and market red for shutters, signs, trim.
    woodPaintedTeal: toneSet([[0.22, 0.44, 0.47], [0.20, 0.40, 0.43]], { roughness: 0.68 }),
    woodPaintedRed: toneSet([[0.56, 0.20, 0.16], [0.60, 0.23, 0.18]], { roughness: 0.68 }),
    // Weathered harbour wood: sun-bleached grey planks for docks & sheds.
    woodWeathered: toneSet([[0.55, 0.51, 0.45], [0.50, 0.47, 0.41], [0.59, 0.55, 0.48]], { roughness: 0.95 }),
    // Dark aged wood: heavy beams, door leaves, furniture.
    woodDark: toneSet([[0.30, 0.19, 0.10], [0.27, 0.17, 0.09], [0.33, 0.21, 0.12]], { roughness: 0.78 }),
    // Palm thatch: dried frond roofs for huts.
    thatch: toneSet([[0.67, 0.53, 0.27], [0.61, 0.48, 0.24], [0.72, 0.58, 0.31]], { roughness: 0.96 }),

    // --- Extended stone family (Part 08.2) -------------------------------------
    stoneSmooth: toneSet([[0.58, 0.56, 0.52], [0.54, 0.52, 0.48], [0.61, 0.59, 0.55]], { roughness: 0.85, cull: pc.CULLFACE_NONE }),
    stoneVolcanic: toneSet([[0.24, 0.21, 0.21], [0.20, 0.18, 0.18], [0.28, 0.25, 0.24]], { roughness: 0.96 }),
    stoneSnow: toneSet([[0.63, 0.67, 0.71], [0.58, 0.63, 0.68]], { roughness: 0.9 }),

    // --- Extended foliage family (Part 08.3) -----------------------------------
    leafBroadleaf: toneSet([[0.33, 0.55, 0.21], [0.29, 0.51, 0.18], [0.37, 0.59, 0.24]], { roughness: 0.9, cull: pc.CULLFACE_NONE }),
    leafBanana: toneSet([[0.35, 0.57, 0.23], [0.31, 0.53, 0.20]], { roughness: 0.88, cull: pc.CULLFACE_NONE }),
    grassBeach: toneSet([[0.60, 0.62, 0.26], [0.64, 0.66, 0.30], [0.55, 0.58, 0.24]], { roughness: 0.95, cull: pc.CULLFACE_NONE }),
    flowerVine: toneSet([[0.76, 0.28, 0.54], [0.70, 0.24, 0.48], [0.82, 0.34, 0.58]], { roughness: 0.72, cull: pc.CULLFACE_NONE }),
    fruitOrange: single([0.90, 0.52, 0.12], { roughness: 0.62 }),

    // --- Prop materials ----------------------------------------------------------
    potTerracotta: toneSet([[0.66, 0.38, 0.24], [0.60, 0.34, 0.21]], { roughness: 0.9 }),
    wicker: toneSet([[0.72, 0.56, 0.30], [0.66, 0.51, 0.27], [0.77, 0.60, 0.33]], { roughness: 0.9 }),
    canvasStripeWhite: toneSet([[0.88, 0.86, 0.80], [0.84, 0.82, 0.76]], { roughness: 0.85, cull: pc.CULLFACE_NONE }),
    cloud: pbrMaterial({ color: [0.97, 0.97, 1.0], emissive: new pc.Color(0.30, 0.32, 0.38), roughness: 1.0, metalness: 0.0 }),

    // Vegetation & terrain dressing (shared bases; themes may override)
    bark: toneSet([[0.40, 0.26, 0.14], [0.36, 0.23, 0.12], [0.44, 0.29, 0.16]], { roughness: 0.92 }),
    barkDry: single([0.48, 0.34, 0.18], { roughness: 0.92 }),
    barkBurnt: single([0.16, 0.13, 0.12], { roughness: 0.95 }),
    leafPalm: toneSet([[0.26, 0.48, 0.20], [0.29, 0.52, 0.22], [0.23, 0.44, 0.18]], { roughness: 0.88, cull: pc.CULLFACE_NONE }),
    leafDry: toneSet([[0.55, 0.52, 0.24], [0.50, 0.47, 0.22]], { roughness: 0.9, cull: pc.CULLFACE_NONE }),
    leaf: toneSet([[0.22, 0.44, 0.18], [0.25, 0.48, 0.20]], { roughness: 0.9 }),
    leafJungle: toneSet([[0.14, 0.38, 0.14], [0.17, 0.42, 0.16], [0.12, 0.34, 0.13]], { roughness: 0.9 }),
    leafPine: toneSet([[0.16, 0.34, 0.20], [0.14, 0.30, 0.18]], { roughness: 0.9 }),
    leafCactus: toneSet([[0.30, 0.52, 0.28], [0.27, 0.48, 0.25]], { roughness: 0.8 }),
    vine: single([0.30, 0.42, 0.16], { roughness: 0.9 }),
    grass: toneSet([[0.48, 0.58, 0.22], [0.44, 0.55, 0.20], [0.52, 0.62, 0.24]], { roughness: 0.95, cull: pc.CULLFACE_NONE }),
    grassDry: single([0.60, 0.58, 0.28], { roughness: 0.95, cull: pc.CULLFACE_NONE }),
    coconut: single([0.20, 0.11, 0.06], { roughness: 0.7 }),
    stem: single([0.34, 0.44, 0.20], { roughness: 0.9 }),
    flower: toneSet([[0.92, 0.42, 0.45], [0.95, 0.65, 0.30], [0.80, 0.50, 0.85], [0.95, 0.85, 0.35]], { roughness: 0.7 }),
    flowerAlt: single([0.96, 0.92, 0.55], { roughness: 0.6 }),
    snow: single([0.93, 0.95, 0.97], { roughness: 0.85 }),

    // Rocks
    rock: toneSet([[0.46, 0.44, 0.40], [0.50, 0.47, 0.43], [0.42, 0.41, 0.38]], { roughness: 0.92, cull: pc.CULLFACE_NONE }),
    rockDry: toneSet([[0.55, 0.50, 0.42], [0.58, 0.52, 0.44]], { roughness: 0.95, cull: pc.CULLFACE_NONE }),
    rockWet: toneSet([[0.38, 0.40, 0.40], [0.35, 0.37, 0.38]], { roughness: 0.6, cull: pc.CULLFACE_NONE }),
    ember: pbrMaterial({ color: [0.95, 0.45, 0.12], emissive: new pc.Color(0.85, 0.28, 0.03), roughness: 0.6 }),
    lava: pbrMaterial({ color: [1.0, 0.42, 0.08], emissive: new pc.Color(1.0, 0.3, 0.02), roughness: 0.55 }),
    pondWater: single([0.22, 0.42, 0.44], { roughness: 0.15, metalness: 0.1, opacity: 0.72 })
  };
}

// --- Theme palettes ----------------------------------------------------------
// Each theme exposes the same ROLE names so buildings/props can be re-skinned.
const THEMES = {
  tropical: {
    wall: () => toneSet([[0.66, 0.48, 0.30], [0.60, 0.43, 0.27], [0.72, 0.54, 0.34]], { roughness: 0.85 }),
    wallPlaster: () => toneSet([[0.87, 0.80, 0.66], [0.82, 0.74, 0.60]], { roughness: 0.9 }),
    trim: () => toneSet([[0.34, 0.22, 0.12], [0.30, 0.19, 0.10]], { roughness: 0.8 }),
    foundation: () => toneSet([[0.55, 0.52, 0.46], [0.50, 0.47, 0.42]], { roughness: 0.95 }),
    roof: () => toneSet([[0.63, 0.28, 0.18], [0.58, 0.25, 0.16], [0.68, 0.31, 0.20]], { roughness: 0.8 }),
    roofAlt: () => toneSet([[0.18, 0.40, 0.42], [0.16, 0.36, 0.38]], { roughness: 0.8 }),
    roofTrim: () => toneSet([[0.30, 0.19, 0.11]], { roughness: 0.85 }),
    door: () => toneSet([[0.40, 0.26, 0.14], [0.36, 0.23, 0.12]], { roughness: 0.75 }),
    shutter: () => toneSet([[0.24, 0.44, 0.45], [0.22, 0.40, 0.42]], { roughness: 0.8 }),
    accent: () => toneSet([[0.75, 0.55, 0.20]], { roughness: 0.7 })
  },
  jungle: {
    wall: () => toneSet([[0.42, 0.30, 0.18], [0.38, 0.27, 0.16], [0.47, 0.34, 0.20]], { roughness: 0.88 }),
    wallPlaster: () => toneSet([[0.52, 0.50, 0.40], [0.48, 0.46, 0.36]], { roughness: 0.92 }),
    trim: () => toneSet([[0.24, 0.16, 0.09]], { roughness: 0.85 }),
    foundation: () => toneSet([[0.40, 0.42, 0.36], [0.36, 0.38, 0.32]], { roughness: 0.95 }),
    roof: () => toneSet([[0.32, 0.36, 0.16], [0.29, 0.33, 0.14], [0.35, 0.39, 0.18]], { roughness: 0.85 }),
    roofAlt: () => toneSet([[0.40, 0.26, 0.14]], { roughness: 0.85 }),
    roofTrim: () => toneSet([[0.22, 0.15, 0.08]], { roughness: 0.85 }),
    door: () => toneSet([[0.30, 0.20, 0.11]], { roughness: 0.78 }),
    shutter: () => toneSet([[0.30, 0.38, 0.18]], { roughness: 0.8 }),
    accent: () => toneSet([[0.55, 0.62, 0.25]], { roughness: 0.7 })
  },
  desert: {
    wall: () => toneSet([[0.85, 0.72, 0.50], [0.80, 0.67, 0.46], [0.89, 0.77, 0.55]], { roughness: 0.92 }),
    wallPlaster: () => toneSet([[0.92, 0.85, 0.68]], { roughness: 0.9 }),
    trim: () => toneSet([[0.55, 0.42, 0.25]], { roughness: 0.85 }),
    foundation: () => toneSet([[0.62, 0.52, 0.38], [0.57, 0.48, 0.34]], { roughness: 0.95 }),
    roof: () => toneSet([[0.60, 0.42, 0.24], [0.55, 0.38, 0.21]], { roughness: 0.85 }),
    roofAlt: () => toneSet([[0.70, 0.52, 0.30]], { roughness: 0.85 }),
    roofTrim: () => toneSet([[0.48, 0.35, 0.20]], { roughness: 0.85 }),
    door: () => toneSet([[0.45, 0.30, 0.16]], { roughness: 0.78 }),
    shutter: () => toneSet([[0.50, 0.58, 0.42]], { roughness: 0.8 }),
    accent: () => toneSet([[0.72, 0.40, 0.22]], { roughness: 0.7 })
  },
  snow: {
    wall: () => toneSet([[0.50, 0.36, 0.24], [0.45, 0.32, 0.21], [0.55, 0.40, 0.27]], { roughness: 0.85 }),
    wallPlaster: () => toneSet([[0.72, 0.70, 0.66]], { roughness: 0.9 }),
    trim: () => toneSet([[0.30, 0.21, 0.13]], { roughness: 0.82 }),
    foundation: () => toneSet([[0.48, 0.47, 0.46], [0.44, 0.43, 0.42]], { roughness: 0.95 }),
    roof: () => toneSet([[0.35, 0.24, 0.16], [0.32, 0.22, 0.14]], { roughness: 0.8 }),
    roofAlt: () => toneSet([[0.44, 0.30, 0.20]], { roughness: 0.8 }),
    roofTrim: () => toneSet([[0.28, 0.19, 0.12]], { roughness: 0.85 }),
    door: () => toneSet([[0.55, 0.30, 0.16], [0.50, 0.27, 0.14]], { roughness: 0.75 }),
    shutter: () => toneSet([[0.35, 0.44, 0.40]], { roughness: 0.8 }),
    accent: () => toneSet([[0.80, 0.72, 0.55]], { roughness: 0.7 })
  },
  volcanic: {
    wall: () => toneSet([[0.30, 0.26, 0.25], [0.26, 0.23, 0.22], [0.34, 0.30, 0.28]], { roughness: 0.9 }),
    wallPlaster: () => toneSet([[0.38, 0.34, 0.33]], { roughness: 0.92 }),
    trim: () => toneSet([[0.18, 0.16, 0.16]], { roughness: 0.85 }),
    foundation: () => toneSet([[0.24, 0.22, 0.22], [0.20, 0.19, 0.19]], { roughness: 0.95 }),
    roof: () => toneSet([[0.36, 0.20, 0.14], [0.32, 0.18, 0.12]], { roughness: 0.8 }),
    roofAlt: () => toneSet([[0.22, 0.20, 0.20]], { roughness: 0.85 }),
    roofTrim: () => toneSet([[0.15, 0.14, 0.14]], { roughness: 0.85 }),
    door: () => toneSet([[0.38, 0.24, 0.14]], { roughness: 0.78 }),
    shutter: () => toneSet([[0.42, 0.28, 0.18]], { roughness: 0.8 }),
    accent: () => pbrMaterial({ color: [0.9, 0.35, 0.10], emissive: new pc.Color(0.65, 0.16, 0.02), roughness: 0.6 })
  }
};

export class MaterialLibrary {
  constructor() {
    this.shared = sharedMaterials();
    this._themes = {};
    for (const key of Object.keys(THEMES)) {
      const factory = THEMES[key];
      const t = {};
      for (const role of Object.keys(factory)) t[role] = factory[role]();
      this._themes[key] = t;
    }
  }

  // Theme handle: materials for one theme + shared extras.
  forTheme(name = 'tropical') {
    const theme = this._themes[name] || this._themes.tropical;
    return { ...this.shared, ...theme, themeName: name };
  }
}

// Singleton accessor — materials are created once and shared everywhere.
let _lib = null;
export function getMaterials() {
  if (!_lib) _lib = new MaterialLibrary();
  return _lib;
}
