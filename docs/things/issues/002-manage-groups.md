# Manage and switch household groups

- **Type:** AFK
- **User stories covered:** Renaming groups; deleting groups safely; manually ordering groups; switching lists without polluting browser history.

## What to build

Complete the group-management loop so a user can maintain several household lists from the home screen and opened group drawer. Group changes must remain route-aware, persist atomically, preserve focused local work on failure, and never affect the permanent item catalogue.

## Acceptance criteria

- [ ] Tapping the drawer title enters rename mode; Enter saves, blur or drawer close cancels, and long titles remain legible with ellipsis.
- [ ] Empty and duplicate active group names are rejected inline after the same cleanup and uniqueness rules used at creation.
- [ ] Confirmed group deletion soft-deletes the group and all of its group-item occurrences with one server-generated timestamp, leaves catalogue records untouched, and returns to `/things/` without Undo.
- [ ] A dedicated handle reorders groups using one complete ordered-ID mutation; rendered order markers remain zero-padded array indexes.
- [ ] Reorder failure restores the previous local order, reports a row-action error, and blocks only concurrent reorder attempts while pending.
- [ ] When at least two groups exist, the drawer shows horizontally scrollable switching controls in home order with the current group selected.
- [ ] Switching groups replaces the current route, resets drawer scroll and Done expansion, and Browser Back closes the drawer instead of retracing group selections.
- [ ] Rename, delete, reorder, route refresh, and group switching are demoable with at least three persisted groups.

## Blocked by

- [001 — Create and reopen the first Things group](./001-first-group.md)
