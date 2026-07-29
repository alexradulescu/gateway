# Thalassa placement guide

## BLUF

Edit building placement in:

- `apps/polis/src/cityStageLayout.ts`
- `POSITIONS` controls the 36 normal building anchors.
- `THALASSA_LAYOUT.townHall.position` controls the Town Hall.
- `THALASSA_LAYOUT.harbour.position` controls the harbour.

Each `{ x, y }` value is the building's ground-contact point on the fixed `1536 × 1024` stage.
Increasing `x` moves right. Increasing `y` moves down and also moves the building later in the
visual depth order.

## Recommended calibration workflow

1. Run Polis and open **Tools → Open placement editor**.
2. Use **District 1 / 4** to cycle through the four groups of anchors.
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

| Plot | District        | Terrain          |    X |   Y |
| ---: | --------------- | ---------------- | ---: | --: |
|    1 | Olive ridge     | Hillside         |  230 | 210 |
|    2 | Olive ridge     | Hillside         |  420 | 185 |
|    3 | Olive ridge     | Plain            |  585 | 178 |
|    4 | Olive ridge     | Plain            |  785 | 180 |
|    5 | Olive ridge     | Fertile          |  980 | 188 |
|    6 | Olive ridge     | Hillside         | 1180 | 205 |
|    7 | Olive ridge     | Coastal          | 1350 | 285 |
|    8 | Civic heart     | Hillside         |  365 | 275 |
|    9 | Civic heart     | Plain            |  650 | 286 |
|   10 | Civic heart     | Fertile          | 1162 | 298 |
|   11 | Civic heart     | Plain            |  315 | 410 |
|   12 | Olive ridge     | Hillside         | 1330 | 390 |
|   13 | Harbour ward    | Coastal          |  215 | 590 |
|   14 | Civic heart     | Plain            |  610 | 610 |
|   15 | Civic heart     | Fertile          |  430 | 710 |
|   16 | Civic heart     | Fertile · large  | 1085 | 420 |
|   17 | Civic heart     | Hillside · large | 1240 | 535 |
|   18 | Harbour ward    | Coastal          |  300 | 675 |
|   19 | Harbour ward    | Fertile          |  560 | 760 |
|   20 | Civic heart     | Plain            |  338 | 520 |
|   21 | Civic heart     | Fertile          |  720 | 690 |
|   22 | Civic heart     | Plain            |  970 | 520 |
|   23 | Civic heart     | Fertile          |  905 | 305 |
|   24 | Harbour ward    | Coastal          |  760 | 810 |
|   25 | Harbour ward    | Coastal          |  900 | 760 |
|   26 | Harbour ward    | Coastal          | 1050 | 710 |
|   27 | Sunset terraces | Coastal          |  220 | 795 |
|   28 | Sunset terraces | Plain            |  380 | 850 |
|   29 | Sunset terraces | Plain            |  555 | 875 |
|   30 | Sunset terraces | Coastal          |  735 | 900 |
|   31 | Harbour ward    | Coastal          | 1230 | 650 |
|   32 | Harbour ward    | Hillside         | 1330 | 585 |
|   33 | Sunset terraces | Plain            |  915 | 870 |
|   34 | Sunset terraces | Hillside         | 1080 | 835 |
|   35 | Sunset terraces | Coastal          | 1230 | 790 |
|   36 | Sunset terraces | Coastal          | 1360 | 715 |

## Fixed landmarks

| Landmark  |    X |   Y | Scale |
| --------- | ---: | --: | ----: |
| Town Hall |  750 | 470 |  1.16 |
| Harbour   | 1180 | 715 |  1.06 |

## Practical placement checks

- Put the anchor at the front-centre of the building's ground footprint, not at the image centre.
- Keep stairs and entrances clear of trees, walls, water, and neighbouring roofs.
- Inspect both a small house and a tall academy on each adjusted site.
- Test levels 1–3 because upgraded sprites have different silhouettes.
- Check road levels 1–4; all four background plates must keep the same anchors.
- If two sprites overlap, the one with the greater `y` appears in front.
- Adjust `radiusX` and `radiusY` in `cityStageLayout.ts` only when the clickable clearing is wrong;
  those values do not move the building.
