# Edit, delete, and undo an item from its routed detail surface

- **Type:** AFK
- **User stories covered:** Opening an occurrence by URL; editing name or quantity explicitly; discarding unsaved edits; deleting and briefly restoring one occurrence.

## What to build

Deliver the routed item-detail loop above the opened group. A user can deep-link to an occurrence, edit it without mutating catalogue history, delete it without confirmation, and restore only the latest deletion for ten seconds. Validate nested HeroUI drawers first and use the approved bottom-modal fallback when focus, scroll locking, stacking, or iOS behavior is unreliable.

## Acceptance criteria

- [ ] Selecting an item row pushes its occurrence route and opens a smaller detail surface while the group drawer remains mounted and visually subordinate.
- [ ] Refreshing a valid item route restores both layers; explicit close and Browser Back return to the same group, while a missing or soft-deleted item yields the full-page 404.
- [ ] The detail form copies the occurrence's current name and quantity into local state, performs no writes while typing, and silently discards unsaved changes on close.
- [ ] Save remains disabled until cleaned values change, requires a name, preserves completion status, and resolves a changed name to an existing or new catalogue record without renaming the old catalogue record.
- [ ] Save and Delete lock all detail controls and dismissal while pending, preserve the open form on failure, and return to the parent group only after success.
- [ ] Delete soft-deletes only the occurrence without confirmation and presents a ten-second Undo for the most recent individual deletion.
- [ ] A later deletion replaces the prior Undo; changing group, closing the group drawer, or leaving Things dismisses the opportunity.
- [ ] Undo restores the original occurrence without reopening details; active items return at the bottom and completed items retain their original completion timestamp.
- [ ] Portal order, focus trapping and restoration, background scroll locking, keyboard behavior, browser history, and the installed mobile viewport are verified for the chosen detail surface.
- [ ] Deep-link, edit, failure preservation, delete, latest-only Undo, route invalidation, and completed-item restoration are demoable after refresh.

## Blocked by

- [003 — Add catalogue-backed items quickly](./003-catalogue-item-entry.md)
- [004 — Complete, reactivate, and clear items](./004-completion-and-done.md)
