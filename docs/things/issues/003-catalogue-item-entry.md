# Add catalogue-backed items quickly

- **Type:** AFK
- **User stories covered:** Fast item entry; optional quantities; learning canonical item names; deterministic autocomplete; scanning and ordering active items.

## What to build

Deliver the primary list-entry loop end to end. A user can add an item occurrence with an optional free-text quantity, reuse the permanent global catalogue through deterministic autocomplete, see the canonical result in the opened group and its active count on the home screen, and reorder active occurrences without changing catalogue identity.

## Acceptance criteria

- [ ] One feature-root catalogue subscription supplies canonical names and normalized keys to every Things item-name control without per-component subscriptions.
- [ ] Server-side item creation cleans visible text, applies aggressive Unicode catalogue normalization, reuses the first canonical match or creates a permanent catalogue record, and allows duplicate occurrences in one group.
- [ ] The combined `Item name | Quantity | Add` control submits from either field or the add button, stores quantity without a multiplication sign, and rejects an empty cleaned name.
- [ ] Pending and failed submissions prevent duplicates, preserve entered values on failure, and clear both fields and refocus item name on success.
- [ ] Autocomplete hides for empty input, ranks exact then prefix then contiguous substring matches, sorts alphabetically within a tier, and returns no more than ten canonical names.
- [ ] Selecting a suggestion fills only the item name and preserves quantity; highlighted Enter selects without submitting, while a later Enter submits.
- [ ] Active rows render canonical name and optional ` × quantity` on one line with sibling row and handle controls, and new occurrences appear at the bottom.
- [ ] A dedicated handle reorders active occurrences atomically; completed occurrences are ineligible, concurrent reorder is blocked, and failure restores the prior visible order with an error notice.
- [ ] Home group metadata reports active and completed counts from non-deleted occurrences while omitting zero-valued parts.
- [ ] Catalogue reuse, duplicate occurrence creation, quantity display, counts, and reorder persistence are demoable after refresh.

## Blocked by

- [001 — Create and reopen the first Things group](./001-first-group.md)
