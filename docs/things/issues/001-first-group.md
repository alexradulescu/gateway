# Create and reopen the first Things group

- **Type:** AFK
- **User stories covered:** Discovering Things from Gateway; creating a household group; reopening persisted group data; restoring and recovering routed views.

## What to build

Deliver the first complete Things path: a user can open Things from the Gateway launcher, create a valid group, see it in the ordered home list, and open or refresh its route-controlled drawer. Establish the Things application, persistence model, read model, route shell, and original frosted Art Deco baseline needed by later slices without changing the behavior of existing Gateway apps.

## Acceptance criteria

- [ ] Things appears in the Gateway launcher, builds into the shared deployment output, and serves from the canonical `/things/` path.
- [ ] The data model supports groups, permanent catalogue records, and independently ordered group-item occurrences with soft deletion.
- [ ] The home subscription returns active groups in manual order without briefly rendering an empty state while loading.
- [ ] Enter and the add button create a cleaned, non-empty, case-insensitively unique active group at the bottom of the list.
- [ ] Group validation and mutation failures appear inline; pending creation prevents duplicate submission and successful creation clears and refocuses the field.
- [ ] Selecting a group opens a route-controlled bottom drawer; explicit close and browser Back return to `/things/`.
- [ ] Refreshing a valid group route restores the drawer, while a missing or soft-deleted group resolves to a full-page 404 with Back to Things.
- [ ] Initial loading and query failure states provide a centred progress indicator, Retry, and Back to Things as appropriate.
- [ ] The first-group flow is demoable after a production build and persists through a browser refresh against Convex.

## Blocked by

None - can start immediately.
