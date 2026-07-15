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

- Major drawer zones use 28px vertical separation while rows within a zone stay compact.
- The Add Item form sits inside the To do grouped surface after the active rows.
- Add Item inputs use the compact 44px control size.
- The phone-only fixed `dvh` height experiment is reverted.
- The group drawer returns to its responsive, capped maximum-height behavior.
- Dark mode uses a more visible, opaque item-group surface while light mode remains unchanged.
- The nested item-edit modal is unchanged.
