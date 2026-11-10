# Island 01 — Pirate Starter Island
> Status: Design brief v0.1 — planning only  
> Project: Fruit Game ZRT  
> Engine: PlayCanvas  
> World anchor: X = -2000, Z = 0  
> Current map footprint: 360 × 300 world units  
> Design rule: finish this island as a complete playable vertical slice before starting another island.

## 1. Design direction

Create a compact, welcoming tropical pirate outpost that teaches the player the basic game loop: arrive, explore, speak to an NPC, accept a task, travel through a small combat area, collect a reward, and return to the dock.

The island must feel like a coherent place rather than a collection of props. Give it a recognizable coastline, a clear central landmark, readable paths, layered terrain, and a strong view from the sea.

This is an original environment brief. Use broad pirate-adventure themes only; do not copy proprietary maps, meshes, textures, UI, logos, or exact layouts from another game.

## 2. Player experience

**First 30 seconds**
- Player appears on a safe wooden arrival pier.
- The camera faces inland toward the settlement and its tallest landmark.
- A short path and simple environmental sign lead toward the settlement square.
- The first quest giver is visible from the arrival route.

**First 3–5 minutes**
- Player learns movement and interaction in the settlement.
- Player accepts a simple collection or training task.
- The path leads past the beach to a small training clearing.
- Player completes the task and returns to the quest giver or dock.

**After the tutorial**
- The player can explore the upper lookout, beach edges and a small hidden cove.
- The dock becomes the obvious departure point for future boat travel.

## 3. Spatial layout

All positions below are local offsets from the island anchor, not final world coordinates. Keep the whole playable footprint inside approximately 360 × 300 units.

| Zone | Approx. local center (X, Z) | Purpose |
|---|---:|---|
| Arrival dock | (0, 112) | Spawn / boat arrival / departure |
| Settlement square | (0, 48) | Main orientation point and quest giver |
| Market lane | (-58, 30) | Two or three small service stalls |
| Captain's house | (48, 42) | Main settlement landmark |
| Beach trail | (-78, -28) | Scenic route and starter collection task |
| Training clearing | (48, -48) | Safe beginner combat / movement practice |
| Palm grove | (-8, -78) | Exploration, cover and environmental storytelling |
| Upper lookout | (80, 0) | High point visible from sea |
| Hidden cove | (-112, -88) | Optional discovery and small reward |

**Path structure**
- Main route: dock → settlement square → captain's house.
- Tutorial route: settlement square → beach trail → training clearing → settlement square.
- Exploration branch: beach trail → palm grove → hidden cove.
- Vertical branch: settlement square → stepped path → upper lookout.
- Paths should be wide and readable; avoid narrow maze-like corridors.

## 4. Terrain and coastline

- Use one irregular island silhouette, not a circular disk.
- Give the settlement a mostly level central terrace.
- Raise the lookout and captain's house slightly above the square.
- Use low rocky shelves along selected coastline sections; keep the arrival beach open and easy to read.
- Add a shallow-water shelf around the dock and beach, transitioning to deeper turquoise water farther out.
- Create at least two distinct beach shapes and one small rocky cove.
- Avoid steep cliffs that block the player or make the island feel artificially cut out.
- Terrain must have a walkable collision surface that matches the visible ground.

Suggested relative elevation bands (tune after movement tests):
- Beach: Y = 0–2
- Settlement terrace: Y = 3–5
- Training clearing: Y = 2–4
- Captain's house platform: Y = 5–7
- Upper lookout: Y = 10–14

## 5. Visual identity

**Palette**
- Warm pale sand, weathered dark timber, faded canvas, muted tropical greens.
- Clear shallow turquoise water with a darker offshore gradient.
- Small restrained accents of rust-red cloth and aged brass.
- Avoid oversaturated cartoon colors and avoid making every surface glossy.

**Landmark silhouette**
- A two-storey weathered captain's house with a simple lookout mast or signal post.
- One tall palm cluster near the settlement, visible above the roofline.
- A small signal flag at the upper lookout.
- From offshore, the player should identify the dock, captain's house and lookout as three separate shapes.

**Lighting and atmosphere**
- Warm late-morning daylight as the default tutorial lighting.
- Soft contact shadows under buildings and trees.
- Gentle sea haze at long distance, but keep the dock and quest giver crisp.
- Ambient sound direction: calm waves, light wind, distant seabirds, quiet settlement activity.

## 6. Buildings, props and vegetation

Required first-pass assets:
- One main dock with a safe arrival platform, mooring posts and rope details.
- One captain's house / quest building.
- Two or three compact market stalls.
- One small storage shed.
- One lookout platform and signal flag.
- One simple training target or practice structure.
- Palm trees in three size variations.
- Low tropical shrubs, grass clumps and a few broad-leaf plants.
- Crates, barrels, nets, lanterns, ropes, baskets and small boats as set dressing.
- A few rocks and driftwood pieces to break up the shoreline.

Do not scatter props randomly. Every prop cluster should support a believable activity or help guide the player's eye.

## 7. Gameplay design

**NPC roles**
- Dock Guide: short welcome and basic movement / island navigation hint.
- Quartermaster: optional supplies or a simple shop placeholder.
- Island Captain: gives the first objective and explains the training area.

**Starter objective**
- The Island Captain asks the player to collect a small number of marked supply bundles from the beach trail.
- The bundles are placed along the safe route, not hidden behind difficult jumps.
- Returning to the captain completes the objective and awards starter currency or experience.
- Keep combat optional in the first objective; combat can be introduced in a separate training task after the basic interaction loop works.

**Training task**
- One small group of low-difficulty training targets or beginner enemies in the training clearing.
- Clear boundary between the training space and the settlement.
- The player can leave the area without being trapped.
- Rewards and difficulty values remain placeholders until the combat system exists.

**Exploration reward**
- A small chest or collectible in the hidden cove.
- It should be discoverable through a visible gap in the rocks or a trail clue, not by pixel hunting.

## 8. Interaction and navigation requirements

- NPCs have clear interaction range and a visible prompt.
- Quest objectives appear in a compact HUD panel.
- Quest markers must not obscure the scene.
- The dock has a clear interaction point for future boat boarding.
- Add simple signposts at the two most important path junctions.
- Ensure the player can return from every zone without jumping or exploiting collision.
- Provide a clear respawn point near the arrival dock.

## 9. Asset production and technical handoff

For every custom asset, record:
- Filename and intended scene location.
- Approximate dimensions in world units.
- Pivot / origin and forward direction.
- Material slots and PBR texture requirements.
- Collision requirement (none / simple box / simplified mesh).
- LOD requirement (hero / medium / distant).
- Animation requirement, if any.
- Source and license.

Preferred delivery format: GLB / glTF with separate, clearly named assets where practical. Use lightweight collision meshes. Repeated palms, rocks and props should be instanced where possible. Do not use a large high-poly mesh for the entire island if it prevents modular collision or future edits.

## 10. Build order

1. **Blockout:** sculpt the island outline, beaches, terraces, cove and lookout. Verify player movement and camera.
2. **Navigation:** build the dock and path network. Confirm every zone is reachable on foot.
3. **Landmark pass:** add captain's house, lookout and market silhouettes.
4. **Environment pass:** add shoreline materials, vegetation, rocks and prop clusters.
5. **Gameplay pass:** add spawn, NPC interaction, one collection quest and one training activity.
6. **Polish pass:** lighting, ambient audio, VFX, collision cleanup and performance.
7. **Review:** capture screenshots from dock approach, settlement square, training clearing, lookout and hidden cove.

Do not begin Island 02 until the acceptance checklist below passes.

## 11. Acceptance checklist

- [ ] Island silhouette is recognizable from the sea.
- [ ] Dock, settlement and lookout are visually distinct.
- [ ] Player spawn faces the main route and is not obstructed.
- [ ] All five gameplay zones are reachable without glitches.
- [ ] Terrain collision matches the visible terrain.
- [ ] Main path is understandable without a minimap.
- [ ] Quest giver and interaction prompt work.
- [ ] One complete starter objective can be accepted, completed and turned in.
- [ ] Training area is separated from the safe settlement.
- [ ] Hidden cove contains a discoverable optional reward.
- [ ] No visible greybox primitives remain in the island's main player-facing view.
- [ ] No console errors during a full island playthrough.
- [ ] Performance is checked on the agreed target device; do not claim optimization without measurement.

## 12. Current implementation status

This document is a design target, not a claim that these features already exist. The current repository contains a greybox world and a starter-island movement prototype. Terrain sculpting, final assets, NPCs, quests, combat, boat travel and the above acceptance checks still need implementation.
