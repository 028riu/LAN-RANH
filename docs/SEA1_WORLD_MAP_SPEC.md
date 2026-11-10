# Fruit Game ZRT — Sea 1 World Map Specification

> Status: **World-layout proposal v0.1**  
> Engine: PlayCanvas  
> Visual target: realistic / high-fidelity PBR  
> World type: large archipelago with separated islands and navigable ocean  
> Scope: world layout and production requirements only. The runtime map has not yet been implemented.

## 1. Design goals

1. Build one continuous ocean world containing distinct islands connected by boat routes.
2. Make the full Sea 1 layout readable from a top-down map and navigable in third person.
3. Support progression from beginner areas to higher-level regions without forcing every island to be visited in a single order.
4. Give every island a recognizable silhouette, coastline, landmark, palette, and gameplay purpose.
5. Keep the world modular: each island can be developed, tested, streamed, and optimized independently.
6. Create original environments inspired by broad adventure-game conventions. Do not copy Blox Fruits meshes, textures, UI, logos, or exact proprietary assets.

## 2. Coordinate system and scale

Use PlayCanvas world coordinates:
- X = east / west.
- Y = height.
- Z = north / south.
- The top-down planning map uses X horizontally and Z vertically.
- Sea level target: Y = 0.
- All dimensions below are initial planning values in PlayCanvas world units, not final measured game dimensions.
- Island center coordinates are anchors. Coastlines should be irregular and handcrafted rather than perfect circles.

### Suggested world envelope

| Property | Initial target |
|---|---:|
| Main playable envelope | 5,600 × 4,400 units |
| Ocean level | Y = 0 |
| Typical island radius | 140–300 units |
| Major landmark height | 35–180 units above sea level |
| Main boat lanes | 250–500 units wide |
| Near-shore shallow water | 20–45 units from coastline |
| World boundary | Soft ocean/fog boundary, not a visible square wall |

The scale is provisional. Calibrate it after the first playable boat and player movement tests.

## 3. Top-down archipelago layout

Coordinates are proposed layout anchors. They are not official Blox Fruits coordinates.

| Region | Center (X, Z) | Footprint target | Role / visual identity |
|---|---:|---:|---|
| Pirate Starter Island | (-2,000, 0) | 360 × 300 | Beginner beach, wooden docks, compact pirate settlement |
| Marine Starter Island | (-1,500, -350) | 340 × 300 | Beginner marine outpost, orderly docks and training yard |
| Middle Town | (-850, -100) | 420 × 360 | Central service hub, shops, quest access and navigation landmark |
| Jungle | (-1,150, 650) | 520 × 480 | Dense tropical canopy, central lake, bridges and elevated clearings |
| Pirate Village | (-1,750, 1,350) | 460 × 380 | Coastal village, watchtowers, rough timber structures |
| Desert | (-650, 1,700) | 600 × 440 | Dunes, dry rock formations and a large distant landmark |
| Frozen Village | (250, 1,750) | 520 × 460 | Snow-covered settlement, ice cliffs and frozen shoreline |
| Marine Fortress | (1,100, 1,250) | 560 × 520 | Stone fortress, walls, towers, harbor and parade ground |
| Prison | (1,750, 650) | 420 × 460 | Isolated fortified island, central prison mass and outer wall |
| Colosseum | (2,350, 0) | 480 × 430 | Large arena landmark, surrounding service structures |
| Skylands | (250, -650) | 500 × 440 | Floating-island group above cloud layer; ground-level access landmark |
| Upper Skylands | (650, -1,350) | 480 × 420 | Higher floating region, ancient structures and vertical traversal |
| Magma Village | (1,550, -1,000) | 560 × 500 | Volcanic island, dark rock, lava channels and heat haze |
| Underwater City | (-500, -1,450) | 560 × 500 | Submerged city zone with a visible surface landmark and underwater entry |
| Fountain City | (2,250, -1,500) | 620 × 520 | Large late-progression coastal city with layered buildings and waterways |
| Jean-Luc Secret Area | (2,550, 1,250) | 180 × 180 | Small hidden discovery area; access and exact placement can change |

### Layout notes

- Keep a navigable sea corridor between the western starter cluster and the eastern / southern progression regions.
- Middle Town should be a strong orientation point, but must not visually block the ocean horizon.
- Starter islands should be close enough to see one another in clear weather, while still requiring a short boat trip.
- Jungle, Pirate Village, Desert and Frozen Village form an early-to-mid progression arc.
- Marine Fortress, Prison and Colosseum form a distinct fortified / challenge cluster.
- Skylands and Upper Skylands are vertical destinations. Their map anchors indicate ground projection; their actual Y positions must be significantly elevated.
- Underwater City is a submerged play-space. Its surface marker is for navigation only.
- Magma Village and Fountain City should read as distant landmarks from the sea.
- Jean-Luc is intentionally a secret point of interest, not a major route destination.

## 4. Navigation and route network

Use boat routes as navigational suggestions rather than fixed rails. The player must be able to steer freely.

1. **Starter route:** Pirate Starter ↔ Marine Starter ↔ Middle Town.
2. **Early exploration route:** Middle Town ↔ Jungle ↔ Pirate Village ↔ Desert.
3. **Northern route:** Desert ↔ Frozen Village ↔ Marine Fortress.
4. **Fortress route:** Marine Fortress ↔ Prison ↔ Colosseum.
5. **Vertical route:** Middle Town / Jungle coast ↔ Skylands ↔ Upper Skylands. Use a lift, cloud current, portal, or other readable access mechanic.
6. **Southern route:** Middle Town ↔ Underwater City ↔ Magma Village.
7. **Late route:** Prison / Colosseum ↔ Fountain City.
8. **Secret route:** a hidden clue or discovery chain leading to Jean-Luc.

Avoid straight-line roads across the ocean. Communicate routes with distant silhouettes, beacons, coastline gaps, buoys, and map markers.

## 5. Island production briefs

Every island needs terrain silhouette and coastline, beach / shallow-water transition, a main landmark visible from the sea, secondary structures and props, NPC / enemy / boss staging zones, quest and exploration points, boat approach and safe docking area, ambient audio and local atmosphere, collision and navigation pass, and LOD / performance pass.

### 5.1 Pirate Starter Island
Warm tropical sand, shallow turquoise water, wooden piers and a small settlement. Provide a clear spawn area and an obvious route to the first quest giver. Keep sightlines open. Props: boats, crates, ropes, lanterns, simple market stalls and palms.

### 5.2 Marine Starter Island
A contrasting orderly outpost with pale stone or painted timber, training yard and guarded dock. Separate spawn route from Pirate Starter while maintaining equivalent beginner usability. Props: flags, practice equipment, supply crates and watch structures.

### 5.3 Middle Town
Central town square, service buildings, shop fronts, harbor and a tall navigation landmark. This is the main hub for orientation and services. Provide clear paths from dock to town center and onward to quest areas.

### 5.4 Jungle
Dense tropical forest around a lake or river basin. Wooden bridges, roots, layered vegetation, rocky rises and open combat clearings. Maintain multiple readable paths; avoid making foliage a solid wall.

### 5.5 Pirate Village
Coastal village with clustered timber buildings, uneven paths, lookout platforms and a protected cove. Use a strong roofline silhouette visible from a distance. Separate combat perimeter from the main dock.

### 5.6 Desert
Broad dune forms, eroded rock, dry gullies and a large distant landmark such as a pyramid-like ruin. Warm, dusty atmosphere with restrained heat distortion. Use sparse vegetation and strong terrain contrast.

### 5.7 Frozen Village
Snow layers, ice shelves, frozen pools, cliffs and compact cold-weather buildings. Cool daylight and atmospheric fog, while preserving gameplay visibility. Ice materials need controlled roughness and readable collision.

### 5.8 Marine Fortress
Large stone harbor fortress with layered walls, towers, gates and a central courtyard. Make the main entrance and dock obvious from the sea. Combat spaces should support enemy groups and boss encounters.

### 5.9 Prison
Isolated fortified island with a strong outer wall and central prison structure. A circular or radial organization is a design direction, not a requirement to copy an existing map. Include a controlled entry route, perimeter patrol spaces and hidden exploration corners.

### 5.10 Colosseum
Large arena as the primary landmark, with spectator tiers and surrounding support buildings. Keep the arena interior unobstructed for combat and events. Establish a visible arrival dock and route to the entrance.

### 5.11 Skylands
A group of floating landforms above a cloud layer. Use bridges, waterfalls or cloud streams to visually connect the group. Provide a safe, understandable access point and fall-recovery rules.

### 5.12 Upper Skylands
A higher and more remote floating region with larger vertical separation. Give it a stronger ancient / sacred architectural identity than the lower Skylands. Use vertical landmarks to help players understand elevation and direction.

### 5.13 Magma Village
Volcanic rock, cooled basalt, glowing lava channels, vents and a central volcanic landmark. Lava is a hazard surface and must have clear visual signaling. Use warm emissive accents without turning the whole scene into a flat orange glow.

### 5.14 Underwater City
Submerged architecture, underwater vegetation, shafts of light and a protected central plaza. Establish a clear underwater entry and exit landmark. Underwater movement, oxygen / pressure rules, and camera effects are gameplay systems to specify separately.

### 5.15 Fountain City
Large late-progression city with layered waterfront architecture, canals / fountains and a strong skyline. Use a broad harbor approach and a clearly readable central landmark. Keep distant architecture as simplified LOD silhouettes.

### 5.16 Jean-Luc Secret Area
Small, visually quiet discovery space. Avoid a prominent map marker until discovered. The access condition, reward and exact placement remain undecided.

## 6. Height and vertical composition

| Zone | Proposed vertical treatment |
|---|---|
| Main ocean | Y = 0 |
| Normal islands | Terrain base around Y = 0 to 12 |
| Cliffs / high landmarks | Up to approximately Y = 180 |
| Skylands | Floating terrain approximately Y = 220 to 360 |
| Upper Skylands | Floating terrain approximately Y = 420 to 560 |
| Underwater City | Playable spaces below sea level; exact depth TBD |

These are first-pass art-direction values only. Confirm them against camera range, fog, boat travel and player movement.

## 7. Shared world systems required

### World / environment
- Ocean surface with animated waves, shoreline foam and depth tint.
- Skybox / sky atmosphere, sun direction, clouds and distance fog.
- Day-night cycle only if it does not undermine quest readability.
- Island-specific weather and ambient sound zones.
- World boundary handled through distance, fog, currents or gameplay limits.

### Navigation
- World map with island labels and discovered / undiscovered states.
- Compass or directional indicator.
- Boat spawn / docking points.
- Quest markers and boss markers with clear visibility rules.
- Fast travel only where game progression permits it.

### Streaming and performance
- Each island is a separate scene group / root entity.
- Load nearby islands and unload or simplify distant detail.
- Use LOD for buildings, rocks, trees and large props.
- Use instancing for repeated vegetation and props.
- Frustum and distance culling.
- Compress textures for delivery; use appropriate mipmaps.
- Keep collision meshes simpler than render meshes.
- Provide Ultra / High / Balanced quality presets.
- Do not claim a frame-rate target is achieved until tested on actual hardware.

## 8. Asset handoff format for z.ai

For each asset package, request:
1. Original concept image(s) with front / side / back or top-down views as appropriate.
2. A clean, game-ready 3D model in .glb or .gltf.
3. PBR texture maps where relevant: Base Color / Albedo, Normal, Roughness, Metallic, Ambient Occlusion.
4. Correct proportions and a stated unit scale.
5. Pivot / origin placement and forward-axis convention.
6. Separate collision mesh or collision guidance.
7. LOD variants for large or frequently repeated assets.
8. Texture resolution and file-size notes.
9. License / ownership confirmation for every external source used.
10. A short integration note describing hierarchy, materials, animation clips and known limitations.

Do not deliver only a concept image when the task requires an in-game 3D asset. If the generation tool cannot produce a usable GLB, use the concept as a reference for a separately created or sourced model.

## 9. Suggested implementation phases

| Phase | Deliverable | Acceptance criteria |
|---|---|---|
| 0 — World layout | Coordinate map, region metadata, route graph | Every planned region has an anchor, footprint and role |
| 1 — Greybox sea | Ocean, island masses, coastline and docks | Player can travel between starter islands and hub |
| 2 — Terrain foundation | Terrain profiles, cliffs, beaches and vertical regions | Each island is recognizable by silhouette |
| 3 — Art pass | PBR materials, buildings, vegetation, props and landmarks | No placeholder primitives in the main view of completed areas |
| 4 — Gameplay pass | NPC zones, quests, enemies, bosses, secrets and boat access | Each region has a playable purpose |
| 5 — Polish | Lighting, VFX, audio, LOD and optimization | Stable behavior on agreed PC / mobile target devices |

## 10. Open decisions

- Exact playable island list and progression order.
- Final world scale after movement and boat-speed tests.
- Whether Pirate and Marine starts remain separate throughout early progression.
- Skylands access mechanic.
- Underwater movement and survival rules.
- Secret-area access and reward.
- Final target device profile and minimum graphics preset.
- Which assets are generated by z.ai, authored in Blender, or sourced from licensed libraries.

## 11. Source and confidence notes

This proposal uses the user-provided Sea 1 research report as its initial reference for region names, broad landmarks and gameplay themes. That report lists: Starter Islands (Pirate / Marine), Middle Town, Jungle, Pirate Village, Desert, Frozen Village, Marine Fortress, Skylands, Prison, Colosseum, Magma Village, Underwater City, Upper Skylands, Fountain City and the Jean-Luc secret area.

This list is preserved as a **project planning baseline**, not asserted as a verified current official island count. Before finalizing progression or recreating any recognizable landmark, verify current references independently. Coordinates, footprints, height ranges, route graph and implementation phases are original project proposals and must be tuned during greyboxing.

Reference material supplied with the research report:
- First Sea map image: https://bffr.fr/wiki/first-sea/g-carte-actuelle.webp
- Pirate Starter reference: https://static.wikia.nocookie.net/roblox-blox-piece/images/6/6d/Pirate_Starter_30.png
- Jungle reference: https://asset.gamersberg.com/blox-fruits/junglerework.webp
- Jungle reference (alternate): https://www.u7buy.com/blog/wp-content/uploads/image-1-234-1024x569.webp
- Prison reference: https://www.u7buy.com/blog/wp-content/uploads/image2-7-1024x738.webp
- Underwater City reference: https://www.u7buy.com/blog/wp-content/uploads/image3-6-1024x769.webp

Use these links for visual study only. Do not redistribute extracted proprietary assets or use them as game-ready assets without permission.
