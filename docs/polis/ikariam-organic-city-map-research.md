# How Ikariam made its city feel organic

## BLUF

Ikariam did **not** get its organic city by solving a better square or hex grid. It largely avoided visible tiling.

The old town view was an illustrated stage:

- a large, hand-authored city background containing the coast, grass, roads, plazas, parks, walls, water channels, trees, and small houses;
- an irregular set of fixed building anchors placed over that background;
- transparent building images offset from those anchors;
- separate hover, construction, ship, citizen, and other event layers.

The technology was ordinary HTML, CSS, JPEGs, and PNGs. The important decision was artistic constraint: one camera, one coherent ground painting, fixed sites, and a common lighting/perspective system.

For Polis, the strongest direction is therefore to **remove visible hexes entirely**. If adjacency is useful to the simulation, it can remain invisible in the data model.

## Evidence

### Verified or directly observable

- Gameforge still describes Ikariam as a browser game with “lovingly animated graphics”; the official product imagery shows the same fixed, elevated three-quarter city camera and a continuous ground plane rather than a tile lattice. [Official Gameforge product page](https://gameforge.com/en-US/play/ikariam)
- In December 2024, Gameforge officially added the ability to rearrange buildings in towns. This confirms that buildings occupy discrete places, even though the town looks like a continuous settlement. [Official version 12.0.0 announcement](https://forum.ikariam.gameforge.com/forum/thread/104655-version-12-0-0-04-12-2024/)
- The community-maintained Town View reference documents a central, immovable Town Hall, normal building grounds, special waterfront grounds, one wall ground, and a separate pirate-fortress ground. It also records that higher Town Hall levels change the town background and introduce roads, parks, fountains, gazebos, and small homes as visual decoration. [Town View reference](https://ikariam.fandom.com/wiki/Town_view)
- A preserved town-view stylesheet defines a `1920 × 1200` location stage, divided into four `960 × 600` background images (`nw`, `ne`, `sw`, `se`), plus a lower water image. CSS classes such as `phase1` through later phases select different background quadrants. [Archived town-view stylesheet/PDF](https://vignette2.wikia.nocookie.net/ikariam/images/e/ea/Town_view-0.5.0-Normal.pdf/revision/latest?cb=20141222225424)
- The IkaTweaks userscript exposes five sets of four city-background images and assigns the game’s location elements explicit `left`/`top` coordinates. The coordinates form an asymmetric city composition, not a rectangular or hexagonal lattice. It also exposes separate port orientations, busy-port images, hover images, sprite offsets, and restricted waterfront/wall locations. [IkaTweaks source: background sets](https://greasyfork.org/en/scripts/401313-ikatweaks/code#L896), [IkaTweaks source: fixed positions and sprite offsets](https://greasyfork.org/en/scripts/401313-ikatweaks/code#L2284)
- Ikariam players themselves distinguish the authored old view from the later, more repetitive appearance, explicitly criticising “copy paste” trees and asking for the old city aesthetic. The attached old-view screenshots show broad continuous roads, irregular lawns, channels, shoreline, plazas, and buildings that overhang their nominal sites. [Officially hosted community discussion and screenshots](https://forum.ikariam.gameforge.com/forum/thread/103613-old-city-view/)
- A recent building-art discussion identifies inconsistent palette, light direction, and cast shadow as the reason a new building appears not to belong beside older ones. This is community analysis, but it matches the visual evidence: shared lighting is a major part of the illusion. [Officially hosted community discussion](https://forum.ikariam.gameforge.com/forum/thread/109579-please-redesign-chronos-forge-graphic/)

### Technical inference

The surviving CSS and userscript are not Gameforge architecture documentation, so the following is inference:

1. The background quadrants were probably used to reduce image size and loading cost while presenting one continuous authored scene.
2. Building “plots” were logical anchors or DOM hit targets, not visible pieces of ground. A sprite could be much wider or taller than its anchor because CSS offsets positioned its visual footprint.
3. Z-order was likely controlled by the predefined location layering and element stacking rather than by a general-purpose 3D engine.
4. Road connectivity did not need to be generated. Roads were already painted around known anchor positions. A new building merely occupied one of those positions.
5. The five background phases let the whole city become denser and more civic as it advanced without recomposing hundreds of independent terrain tiles.

These conclusions also match the screenshots supplied for Polis: roads bend and widen freely; plazas, streams, lawns, coast, and wall are continuous; empty sites are flags or clearings; no cell boundary is visible.

## Why the hex experiments feel wrong

A visible equal-sided hex imposes six repeated boundaries on every plot. That causes three problems:

1. The eye reads the tessellation before it reads the town.
2. Every building becomes an isolated game piece on a coaster.
3. Roads are forced into identical edge and junction geometry instead of behaving like streets laid through terrain.

Making the sprites smaller does not fix this. Adding a pavement hex strengthens the board-game appearance. Ikariam’s buildings are allowed to overhang their logical sites and visually participate in one shared scene.

## Recommended direction for Polis

### 1. Authored city stage — recommended

Use one large Mediterranean island scene with 36 irregular building sites.

- Paint the coastline, elevation, fields, central civic space, harbour, streams, main roads, footpaths, and permanent vegetation as one coherent base.
- Store sites as `slotId`, `x`, `y`, `depthY`, `hitPolygon`, `kind`, and `district`; do not store or render a tile shape.
- Render buildings as transparent 2.5D sprites anchored by their ground-contact point.
- Permit roofs, stairs, trees, and shadows to extend well beyond the hit polygon.
- Sort dynamic objects by the ground-contact `depthY`.
- Indicate an empty site with an organic clearing, stakes, a small flag, or a foundation—not an outlined cell.

This is closest to Ikariam, supports the existing gameplay, and makes best use of the strong building art.

### 2. Grow the stage in authored phases

Prepare several versions or overlays of the same scene:

- settlement;
- established town;
- civic city;
- flourishing polis.

Road upgrades should be full-network or district overlays—dirt tracks, limestone roads, grand paving, tree-lined avenues—registered to the same base painting. Parks, fountains, minor homes, lamps, statues, and crowds can appear as the city advances.

This produces visible growth without rebuilding the world from tiny interchangeable pieces.

### 3. Use districts for expansion

The initial quarter can be a finished central district. Forest, scrub, ruins, or rocky terraces conceal the other three districts. Clearing a district removes a large foreground mask and reveals six to ten new authored anchors and connecting paths.

This preserves the planned expansion mechanic while making each unlock feel like reclaiming part of an island.

### 4. Keep terrain as regions, not cells

“Fertile”, “plain”, “hill”, and “coastal” remain useful game data, but present them as natural areas:

- fertile sites sit near orchards and dark soil;
- hill sites use terraces and stone retaining walls;
- coastal sites sit near sand and harbour paths;
- civic sites face plazas and broad streets.

The terrain benefit belongs to the site; the player never needs to see its polygon.

## Alternatives

### District modules

Create four to six large hand-painted district pieces with masked, irregular borders and six to nine anchors each. This allows more map variation than one stage, but seams and road joins require careful art direction.

### Invisible graph with spline roads

Retain nodes and adjacency internally, then generate curved roads between sites and scatter vegetation around them. This offers more layouts, but it is harder to make consistently beautiful than an authored stage. It is better as a later experiment.

### Invisible hex logic

The existing axial grid can remain temporarily for distance, neighbourhood, or expansion rules, provided it never determines the visible ground shape. Hand-authored screen positions can map each logical coordinate to an irregular site. Long term, a simple site graph would express the design more honestly.

## Art rules

All assets must share:

- one fixed orthographic/elevated camera;
- one ground scale;
- sunlight from the same upper-left direction;
- cast shadows toward the same lower-right direction;
- comparable contrast, saturation, and marble warmth;
- a defined ground-contact anchor;
- transparent margins large enough for natural overhang.

Buildings should be designed for the scene, not constrained to 50–60% of an invisible cell. Their practical limit is collision with neighbouring anchor compositions and important roads.

## Decision

Do not make another pavement or hex sprite set.

Prototype one authored town section instead:

1. a continuous background containing the harbour, central plaza, curving road, grass, rocks, trees, and six irregular empty sites;
2. six current building sprites re-anchored over it;
3. one dirt-road and one limestone-road background state;
4. empty-site, hover, and selection treatments with no visible cell.

If that small section feels like a place rather than a board, extend the method to the 36-site island.

## Implemented decision

Status: accepted and implemented on 29 July 2026.

The prototype question is: **does a continuous authored city stage make Polis feel like a
Mediterranean settlement rather than a board game while preserving the existing play loop?**

- The main Polis route now uses the fixed `1536 × 1024` `thalassa-01` authored island stage.
- All 36 building sites are stable, irregular HTML hit areas; twelve begin available.
- Site markers appear only while placing a building or hovering an empty site.
- Existing building, simulation, construction, research, road, wall, crisis, save, and camera logic
  remains active.
- Road levels select one of four complete, registered AVIF stage plates. No procedural road overlay
  remains.
- Buildings and landmarks are positioned as HTML controls over the stage, with camera panning and
  zoom applied through one parent transform.
- The developer placement editor shows one district at a time, permits anchor calibration, and
  exports all 36 coordinates as JSON.

Runtime assets:
`apps/polis/public/assets/thalassa-01-road-{1,2,3,4}.avif`.
