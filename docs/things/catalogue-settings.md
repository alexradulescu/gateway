# Things catalogue settings

## Agreed behavior

- `/things/settings` is a separate routed page reached from a HeroUI icon button in the home header.
- The page shows alphabetized Active and Hidden sections with item counts.
- Catalogue rows visually follow the grouped rows on the Things home page.
- Tapping a name starts inline editing with grouped Save and Cancel icon buttons.
- Names remain unique across active and hidden records using catalogue normalization.
- A checked visibility control means the item appears in future autocomplete suggestions.
- Visibility changes are immediate, reversible, and move the row between sections.
- Hidden records remain visible and editable in Settings.
- Hiding does not alter existing group items.
- Adding a hidden name, or changing another item to it, restores its visibility.
- Editing only the quantity of an existing item does not restore its hidden catalogue record.

## Related drawer changes

- Major drawer zones use 24px vertical separation while rows within a zone stay compact.
- At phone widths, the group drawer uses
  `calc(100dvh - 48px - env(safe-area-inset-top))` with no 720px cap.
- Wider screens retain the existing 720px cap.
- The nested item-edit modal is unchanged.
