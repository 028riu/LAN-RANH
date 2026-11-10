# Sea 1 Greybox Implementation — Phase 1

Status: first runtime pass; not final art.

## Scope
- Adds all 16 planned island anchors to a shared world configuration.
- Replaces the single central prototype island with a large ocean and greybox island silhouettes.
- Adds temporary landmark and dock markers.
- Aligns island anchors with `SEA1_WORLD_MAP_SPEC.md`.

## Limitations
- Island meshes are temporary primitive geometry, not realistic final terrain.
- Dock markers and landmarks are placeholders.
- Boat travel, swimming, island streaming, NPCs, combat and PBR texture integration are not implemented.
- Underwater City and floating islands are visual greyboxes only.
- Coordinates remain project proposals, not official game coordinates.

## Acceptance checks
1. Run `npm install` and `npm run dev`.
2. Confirm all 16 islands render without console errors.
3. Confirm the player spawns on Pirate Starter Island.
4. Confirm the camera far clip includes distant islands.
5. Inspect Skylands / Upper Skylands elevations and underwater placement.
6. Tune scale and visibility before integrating GLB assets.
