# Complete, reactivate, and clear items

- **Type:** AFK
- **User stories covered:** Completing active items; reviewing finished work; reactivating an item; clearing completed occurrences safely.

## What to build

Complete the item lifecycle from active to Done and back. The server remains authoritative for movement and timestamps, while the interface limits pending feedback to the affected action and keeps completed-item cleanup explicit and reversible only where the product allows it.

## Acceptance criteria

- [ ] Selecting an active item's checkbox generates `completedAt` in Convex, disables only that checkbox, and shows a small pending indicator without optimistically moving the row.
- [ ] Confirmed completions appear at the top of Done ordered by newest server timestamp, and row-action failure leaves the item active and reports an error notice.
- [ ] The Done section is hidden when empty, starts expanded whenever a group opens, shows its count, and can be collapsed without persisting disclosure state.
- [ ] Completed rows show muted full-text strikethrough, remain independently interactive, and never expose a drag handle.
- [ ] Reactivating clears `completedAt` and places the occurrence at the bottom of the active list rather than restoring its former position.
- [ ] Clear all requires explicit confirmation, soft-deletes every completed occurrence in the current group, preserves catalogue records, and offers no Undo.
- [ ] The home screen's active and completed counts update through normal Convex subscriptions after complete, reactivate, and clear operations.
- [ ] Completion, newest-first Done ordering, reactivation-at-bottom, disclosure reset, Clear all, and real-time count updates are demoable across two browser sessions.

## Blocked by

- [003 — Add catalogue-backed items quickly](./003-catalogue-item-entry.md)
