# Thalassa placement guide

## BLUF

Edit building placement in:

- `apps/polis/src/cityStageLayout.ts`
- `POSITIONS` controls the 24 normal building anchors.
- `THALASSA_LAYOUT.townHall.position` controls the Town Hall.
- `THALASSA_LAYOUT.harbour.position` controls the harbour.

Each `{ x, y }` value is the building's ground-contact point on the fixed `1536 × 1024` stage.
Increasing `x` moves right. Increasing `y` moves down and also moves the building later in the
visual depth order.

## Recommended calibration workflow

1. Run Polis and open **Tools → Open placement editor**.
2. Use **District 1 / 3** to cycle through the three groups of anchors.
3. Drag each numbered anchor to the centre-front of its intended clearing.
4. Select **Export JSON**.
5. Copy the exported coordinates into `POSITIONS` in `cityStageLayout.ts`, keeping plot order
   unchanged.
6. Reload and inspect the building base, stairs, cast shadow, road clearance, and overlap with the
   building behind it.

The editor changes only the current browser preview. It does not rewrite source files or save
placement changes into the city save.

## Current normal-building anchors

Plot numbers below match the player-facing plot number. Source arrays are zero-indexed, so Plot 1 is
the first entry in `POSITIONS`.

| Plot | District     | Terrain         |    X |   Y |
| ---: | ------------ | --------------- | ---: | --: |
|    1 | Civic heart  | Plain           |  365 | 360 |
|    2 | Civic heart  | Coastal         |  245 | 455 |
|    3 | Civic heart  | Plain           |  480 | 450 |
|    4 | Civic heart  | Fertile         |  350 | 538 |
|    5 | Civic heart  | Plain           |  535 | 605 |
|    6 | Civic heart  | Plain           |  700 | 675 |
|    7 | Civic heart  | Coastal · large |  390 | 730 |
|    8 | Civic heart  | Coastal         |  550 | 740 |
|    9 | Olive ridge  | Plain           |  490 | 286 |
|   10 | Olive ridge  | Hillside        |  610 | 165 |
|   11 | Olive ridge  | Hillside        |  808 | 138 |
|   12 | Olive ridge  | Hillside        |  950 | 170 |
|   13 | Olive ridge  | Hillside        | 1080 | 145 |
|   14 | Olive ridge  | Fertile         | 1215 | 175 |
|   15 | Olive ridge  | Hillside        | 1360 | 235 |
|   16 | Olive ridge  | Fertile         |  700 | 260 |
|   17 | Harbour ward | Plain           |  860 | 280 |
|   18 | Harbour ward | Hillside        | 1195 | 295 |
|   19 | Harbour ward | Coastal · large | 1350 | 362 |
|   20 | Harbour ward | Hillside        | 1135 | 410 |
|   21 | Harbour ward | Plain           | 1300 | 495 |
|   22 | Harbour ward | Coastal         | 1225 | 595 |
|   23 | Harbour ward | Coastal         | 1370 | 630 |
|   24 | Harbour ward | Fertile         |  875 | 578 |

## Fixed landmarks

| Landmark  |    X |   Y | Scale |
| --------- | ---: | --: | ----: |
| Town Hall |  720 | 470 |  1.08 |
| Harbour   | 1100 | 735 |     1 |

## Practical placement checks

- Put the anchor at the front-centre of the building's ground footprint, not at the image centre.
- Keep stairs and entrances clear of trees, walls, water, and neighbouring roofs.
- Inspect both a small house and a tall academy on each adjusted site.
- Test levels 1–3 because upgraded sprites have different silhouettes.
- Check road levels 1–4; all four background plates must keep the same anchors.
- The isolated beach clearing near the bottom edge is reserved for a future sanctuary landmark and
  is intentionally not one of the 24 normal plots.
- If two sprites overlap, the one with the greater `y` appears in front.
- Adjust `radiusX` and `radiusY` in `cityStageLayout.ts` only when the clickable clearing is wrong;
  those values do not move the building.
