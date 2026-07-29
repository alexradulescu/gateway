# Aegean Polis

## Problem Statement

The player wants a relaxing, open-ended city-building game that captures the pleasure of watching a
small classical Greek city grow. Existing games with this visual and strategic appeal often add
multiplayer pressure, aggressive expansion, monetisation, or large maps that dilute the intimacy of
one carefully developed city. The player wants meaningful choices, limited land, research,
specialisation, preparation for occasional crises, and attractive visual progress without chores or
punishing loss.

## Solution

Aegean Polis is a single-city, fixed-angle isometric game at `/polis/`. The player develops a
handcrafted 24-plot Aegean island through building, upgrading, research, civic specialisation,
defence, beautification, and land clearance. The simulation rewards multiple viable city identities,
including industrial, scholarly, maritime, civic, cultural, resort, and balanced development.

The first playable release is a polished vertical slice. It begins with eight open plots and expands
through two further 8-plot districts. It includes 12 placeable building types with three visible levels,
fixed Town Hall and harbour landmarks, six resources, four city conditions, research, road and wall
upgrades, defensive crises, minor events, safe offline progress, import/export, and developer
controls.

## User Stories

1. As a player, I want to found a named Greek city, so that the settlement feels like my own.
2. As a player, I want one attractive city view, so that I can remain connected to the place while
   managing it.
3. As a player, I want to pan and zoom the city, so that I can inspect both its whole shape and
   individual buildings.
4. As a desktop player, I want city information around the edges of the view, so that the city
   remains the main focus.
5. As a tablet player, I want large action targets, so that the game remains comfortable to use by
   touch.
6. As a small-screen player, I want management panels to become modals, so that controls remain
   usable.
7. As a player, I want eight plots available at the start, so that early planning is meaningful without
   feeling cramped.
8. As a player, I want to unlock two further districts of eight plots each, so that land expansion
   becomes a long-term goal.
9. As a player, I want district clearance to cost resources and time, so that expansion is earned.
10. As a player, I want a bounded variable reward when clearing land, so that expansion retains an
    element of discovery.
11. As a player, I want terrain traits to influence plots, so that location matters.
12. As a player, I want to build houses, farms, lumber yards, quarries, warehouses, workshops,
    markets, academies, clinics, fire watches, barracks, and parks or gardens, so that the first city
    supports a complete economy.
13. As a player, I want the Town Hall and harbour to begin as fixed landmarks, so that every city
    starts with a clear civic and coastal centre.
14. As a player, I want buildings to have three visible upgrade levels, so that growth can be seen as
    well as measured.
15. As a player, I want to move a building for a modest cost, so that an early layout mistake is not
    permanent.
16. As a player, I want demolition to return only some materials, so that rebuilding is possible but
    still consequential.
17. As a player, I want damaged buildings to be repairable or rebuildable, so that crises create
    recovery goals.
18. As a player, I want roads to appear automatically between occupied areas, so that I do not have
    to draw utility networks.
19. As a player, I want to upgrade roads separately, so that wider and more elegant streets become a
    visible city achievement.
20. As a player, I want city walls to use a separate upgrade track, so that defence does not consume
    normal building plots.
21. As a player, I want parks and gardens to occupy real plots, so that beauty competes fairly with
    production.
22. As a player, I want nearby parks, markets, clinics, and services to improve surrounding plots,
    so that thoughtful placement is rewarded.
23. As a player, I want noisy or heavy buildings to reduce nearby residential appeal, so that
    industrial planning has a trade-off.
24. As a player, I want goods to move automatically, so that location choices do not become a
    logistics-management game.
25. As a player, I want to manage food, timber, stone, coin, crafted goods, and knowledge, so that
    the economy has useful depth without excessive bookkeeping.
26. As a player, I want to understand population, employment, happiness, and health and safety, so
    that I can diagnose city conditions.
27. As a player, I want to set building staffing to closed, low, normal, or high, so that I control
    priorities without assigning individual workers.
28. As a player, I want the city to assign workers automatically, so that shortages are manageable.
29. As a player, I want research to unlock buildings, bonuses, and civic options, so that knowledge
    changes how the city develops.
30. As a player, I want most research to remain learnable eventually, so that no early choice ruins
    a long-running city.
31. As a player, I want to adopt an industrial, scholarly, maritime, civic, cultural, or
    pastoral/resort doctrine, so that the city gains a recognisable identity.
32. As a player, I want doctrine changes to remain possible at substantial cost, so that I can
    redesign a mature city.
33. As a player, I want open-ended milestones rather than a final victory, so that I can continue
    improving a city indefinitely.
34. As a player, I want buildings, decorations, and civic measures to reflect my development path,
    so that different cities look and behave differently.
35. As a player, I want visual life such as water, flags, smoke, trees, ships, birds, and citizens,
    so that the city feels inhabited.
36. As a player, I want a subtle day-night tint, so that the view changes atmospherically without
    creating time-sensitive chores.
37. As a player, I want minor situations such as merchants, petitions, festivals, shortages, and
    small fires, so that city management produces stories.
38. As a player, I want minor-event and severe-crisis frequency to be configurable, so that pacing
    can be tuned easily.
39. As a player, I want severe crises to occur roughly every two to five calendar days, so that
    defence matters without disturbing the relaxed pace.
40. As a player, I want severe crises to wait until the city is opened, so that I am not punished
    while away.
41. As a player, I want warning signs before serious danger, so that preparation is useful.
42. As a player, I want fires, plague, drought, unrest, storms, and invasions to offer clear response
    choices, so that crises are decisions rather than random damage.
43. As a prepared player, I want services and defences to prevent or reduce damage, so that planning
    is rewarded.
44. As an unprepared player, I accept small resource theft, building damage, or an occasional
    destroyed building, so that danger remains credible.
45. As a player, I want losses to remain limited and recoverable, so that a crisis cannot erase my
    city.
46. As a player, I want stationary militia, hoplites, archers, and ships represented by defence
    capacity and upkeep, so that defence involves a continuing commitment.
47. As a player, I want battles to resolve automatically from my preparation and response, so that
    there is no tactical combat screen.
48. As a sufficiently prepared player, I want to send an off-screen force against a barbarian camp,
    so that military investment has a limited proactive use.
49. As a player, I want harbour trade, fishing, exploration, merchants, pirates, and foreign powers
    represented through results and events, so that the world feels larger without a second map.
50. As a player, I do not want aggressive conquest, so that the game remains focused on building and
    defence.
51. As a player, I want early construction to complete in seconds and later upgrades in minutes, so
    that every short visit can change the city.
52. As a player, I want construction and research to run independently, so that progress has two
    parallel tracks.
53. As a player, I want pause, 1×, and 2× simulation controls, so that I can plan or accelerate normal
    play.
54. As a developer, I want speeds up to 20×, so that long timers can be tested quickly.
55. As a player, I want active-city progress while away, capped at eight hours, so that returning is
    rewarding but not compulsory.
56. As a player, I want offline progress to include production, research, and construction but not
    destructive crisis resolution, so that absence remains safe.
57. As a player, I want the city to autosave locally, so that ordinary play requires no save
    management.
58. As a player, I want to export the city as a frozen file, so that I can archive several
    experiments.
59. As a player, I want to import a city file after a backup warning, so that I can resume an archived
    city safely.
60. As a player, I want exported cities to gain no offline progress until loaded, so that archives
    remain exact snapshots.
61. As a player, I want a short optional sequence of civic goals, so that I learn the game by
    improving the city.
62. As an experienced player, I want to dismiss guidance, so that the tutorial never blocks free
    play.
63. As a developer, I want a panel that can grant resources, change time, finish timers, damage
    buildings, and trigger any event, so that systems can be tested on demand.
64. As a player, I want clear English labels and historically inspired concepts, so that the game is
    understandable without requiring specialist knowledge.
65. As a player, I want schools, clinics, hospitals, and similar recognisable civic ideas to fit the
    classical setting, so that the city is rich without becoming anachronistic science fiction.
66. As a player, I want no premium currency, energy system, daily limit, account, or multiplayer
    pressure, so that the experience remains personal and relaxing.

## Implementation Decisions

- Aegean Polis is an independent Vite React application registered with Gateway and built to the
  stable `/polis/` path.
- The first release uses one responsive game surface. Desktop and laptop layouts use edge-mounted
  panels; narrow layouts use modal sheets and retain large touch targets.
- The visual direction is a fixed three-quarter isometric, sunlit classical Aegean scene: warm
  limestone, white plaster, terracotta roofs, restrained cobalt accents, marble civic structures,
  olive and cypress trees, bright water, and soft painterly shadows.
- The visible map is the fixed `thalassa-02` authored stage at `1536 × 1024`. Coast, terrain,
  streams, permanent vegetation, empty clearings, plazas, and the complete road network are painted
  as one coherent scene. The player never sees a tile boundary.
- Four registered AVIF stage plates share the same composition and building anchors. Road upgrades
  swap the whole plate: packed earth roads and plots; stone roads; stone roads and plots with a few
  lamps; then refined stone, sidewalks, more lamps, benches, and small street trees. There are no
  procedural road, junction, coast, or wall pieces in the visible map.
- Buildings and landmarks are ordinary absolutely positioned HTML controls over the stage. Each
  uses a fixed ground-contact anchor and vertical depth order. The camera is one CSS transform with
  pointer panning, cursor-centred zoom, and large accessible hit areas.
- `thalassa-02` defines 24 adjustable building anchors, a fixed Town Hall, and a fixed harbour. The
  sites form three eight-site districts: one begins available and the other two unlock separately.
  Terrain traits and the existing axial adjacency model may remain invisible simulation data; they
  do not control the visible ground geometry.
- Future island art may vary coast, fields, and permanent scenery, but a compatible plate keeps the
  same stage dimensions and anchor contract. A developer placement editor exposes one district at a
  time and exports calibrated anchor JSON.
- The resource ribbon shows each current balance and net hourly flow. Exact produced and consumed
  rates remain available in the resource description, while unaffordable buildings, research, and
  district clearance show the approximate wait at the current net rates or state that production is
  missing.
- Developer Tools can grant a chosen amount of one resource or every resource, unlock all research,
  finish active projects, or enable instant building, research, repair, upgrade, and land-clearance
  projects. These controls never change normal-game balance.
- All map artwork is original, high-resolution raster art with a coherent camera, lighting,
  ground scale, and visual progression. Transparent building atlases remain separate from the
  authored stage plates.
- Plot placement has local effects. Residential appeal benefits from parks and selected services;
  workshops, barracks, and extraction buildings impose nearby penalties. Coastal and hillside traits
  provide specialised advantages.
- The simulation is a pure state transition boundary. Game actions and elapsed time produce the next
  serialisable city state. The React surface observes this public boundary rather than containing
  economic rules.
- Saved state is versioned and stored in local browser storage. Export and import use the same public
  serialisation format. Imported data is validated before replacing the active city.
- The 24-plot prototype uses save format and browser key version 2. It intentionally does not
  migrate the unused 36-plot prototype format; incompatible local data starts a new city and old
  exports are rejected.
- Only the active local city receives capped offline progress. Exported files are frozen snapshots
  because their last-active timestamp is reset when imported.
- Production, population, conditions, research, construction, expansion, event scheduling, damage,
  and repair are driven by configuration values rather than embedded UI timings.
- The normal simulation supports pause, 1×, and 2×. Developer mode adds faster values and direct
  state controls.
- Severe crises are scheduled in configurable two-to-five-day windows and activate only when the
  city is opened. Minor situations use a separately configurable active-time window.
- Crisis outcomes are bounded. Preparedness changes available responses and outcome severity. The
  worst first-release outcomes are resource theft, repairable damage, and destruction of a small
  number of non-landmark buildings.
- The Town Hall and harbour are fixed landmarks. Roads and walls are city tracks. Twelve normal
  building types occupy plots.
- Building staffing uses four discrete settings. Workforce assignment and production scale
  automatically.
- Research uses soft commitments. Doctrine adoption produces substantial bonuses and later
  landmark choices but ordinary development is not permanently locked.
- The wider Aegean exists only through event copy and resolved expeditions. There is no second map.
- Basic day-night presentation uses CSS colour treatment and atmosphere. It does not alter simulation
  rules in the first release.
- The prose follows clear-English principles: bottom line first, short labels, active voice, one
  action per control, and no unnecessary historical jargon.

## Testing Decisions

- Tests observe the game through three public seams: the rendered `/polis/` application, the
  serialisable simulation-state transition boundary, and the fixed-stage layout/camera contract.
- Browser-level checks cover the visible player journey: founding or loading a city, placing and
  upgrading a building, opening management surfaces, expanding land, responding to an event, using
  developer controls, and exporting/importing a save.
- Pure simulation tests use worked examples with fixed elapsed times and seeded random input. They
  cover affordability, production, capped offline progress, construction completion, land
  expansion, adjacency, crisis bounds, and saved-state round trips.
- Stage tests cover all 24 unique anchors, the four road-level plates, landmark separation,
  reversible camera projection, and cursor-anchored zoom.
- Tests assert observable state and visible outcomes, not React component structure, private helper
  calls, CSS class names, or implementation-specific timers.
- Gateway's existing Bun-test approach is the prior art for pure domain behavior. Production build,
  type checking, linting, and a rendered desktop/tablet/mobile inspection cover integration.

## Out of Scope

- Multiplayer, authentication, accounts, cloud saves, cross-device synchronisation, analytics, and
  monetisation.
- A second island, world, battle, expedition, or city-management map.
- Aggressive conquest, tactical combat, movable armies, or direct unit control.
- True 3D rendering, camera rotation, free grid drawing, and manual road or supply-route placement.
- Detailed storage of wine, pottery, fish, art, and other individual trade goods.
- Permanent research lock-outs or irreversible civic doctrine choices.
- Weather simulation, seasons, sleep-driven production changes, and mechanical day-night effects.
- The full target roster of 24 building types, five visual levels, deep landmark variants, and the
  complete research tree.
- Native mobile application packaging or a phone-first management experience.

## Further Notes

- The project takes broad inspiration from relaxing isometric city builders and classical Greek
  visual language, but its name, artwork, interface, rules, and content must remain original.
- The Mykonos voxel-builder reference is useful for its crisp pre-rendered Canvas approach and warm
  Mediterranean atmosphere. Aegean Polis should be more detailed and more classically civic.
- Future work may add weather, seasons, sleep cycles, slower night production, 24 buildings, five
  levels, more doctrines, deeper trade, additional crises, and richer ambient animation.
- Default balance values are expected to change during play-testing. Event timing, production,
  costs, crisis severity, and expansion rewards must therefore remain easy to configure.
