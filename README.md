# LẰN RANH

**3D Open-World Exploration Prototype**

> Vượt qua lằn ranh. Khám phá giới hạn.

LẰN RANH is a browser-based 3D exploration prototype built with **PlayCanvas Engine 2.24.0** and **Vite 7.3.8**. It uses the PlayCanvas engine directly and does not require the PlayCanvas Editor.

## Visual direction: Realistic Game

The world is designed around real GLB/glTF assets with their original meshes and PBR materials. JavaScript handles asset loading, placement, lighting, movement and gameplay logic; it does not generate the main terrain, trees, rocks or buildings from primitive shapes.

### Required model files

Place licensed GLB files in these exact locations:

```text
public/
  assets/
    models/
      terrain/
        highland_terrain.glb
      vegetation/
        pine_tree.glb
      structures/
        field_station.glb
        observation_outpost.glb
      nature/
        boulder.glb
```

| File | Purpose | Required |
| --- | --- | --- |
| `terrain/highland_terrain.glb` | Main highland terrain mesh | Yes |
| `vegetation/pine_tree.glb` | Instanced pine forest | Yes |
| `structures/field_station.glb` | Starting field station | Yes |
| `structures/observation_outpost.glb` | Observation outpost | Yes |
| `nature/boulder.glb` | Scattered natural rocks | Optional |

Models should use metre-scale dimensions, Y-up orientation, and have their origin near the ground contact point. Keep PBR base-colour, normal and roughness maps embedded in the GLB where possible. Use assets whose licences permit redistribution in this project, and retain any required attribution files.

**Important:** the loader expects these files but does not fabricate replacement geometry. Until the required GLBs are added, the corresponding world objects will be absent. This is intentional: missing models must not silently turn back into primitive placeholders.

## Current prototype systems

- First-person camera with mouse look and pointer lock
- WASD movement, sprint and jump
- GLB container loading through PlayCanvas AssetRegistry
- Reuse of loaded model resources for repeated forest and rock instances
- Directional lighting, shadow configuration and distance fog
- On-screen coordinates and FPS counter
- Pause/resume overlay

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To create a production build:

```bash
npm run build
npm run preview
```

## Controls

| Key | Action |
| --- | --- |
| W A S D | Move |
| Shift | Sprint |
| Space | Jump |
| Mouse | Look around |
| Esc | Release pointer / pause |

## Structure

```text
index.html
package.json
style.css
src/
  main.js
  player.js
  world.js
public/
  assets/
    models/
```

## Roadmap

- [x] PlayCanvas and Vite setup
- [x] First-person exploration prototype
- [x] GLB-based world asset pipeline (no primitive-art fallback)
- [ ] Add and validate the highland terrain and environment GLBs
- [ ] Terrain-aware movement and collision
- [ ] Interactable observation outposts
- [ ] Ambient audio, weather and environmental effects
- [ ] Save data and exploration objectives
