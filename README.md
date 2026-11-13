# LẰN RANH

**3D Open-World Exploration Prototype**

> Vượt qua lằn ranh. Khám phá giới hạn.

LẰN RANH is a browser-based 3D exploration prototype built with **PlayCanvas Engine 2.24.0** and **Vite 7.3.8**. It uses the PlayCanvas engine directly; it does not require the PlayCanvas Editor.

## Current prototype

- First-person camera with mouse look and pointer lock
- WASD movement, sprint and jump
- Procedural highland environment with pine trees, ridges, rocks and a small field station
- Directional lighting, shadows and distance fog
- On-screen coordinates and FPS counter
- Pause/resume overlay

The project focuses on exploration, environmental interaction and rescue-style objectives.

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
```

## Status

- [x] PlayCanvas and Vite setup
- [x] Initial first-person exploration prototype
- [ ] Collision and terrain elevation
- [ ] Interactable observation outposts
- [ ] Audio, ambient effects and optimized environment assets
- [ ] Save data and exploration objectives
