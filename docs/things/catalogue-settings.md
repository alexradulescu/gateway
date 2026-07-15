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
- Add Item inputs and action use a compact 40px control size.
- The name and quantity inputs form one subtly bordered control with a matching divider.
- The fully round Add action sits inside the quantity end of the control as a trailing decoration.
- Add Group uses the same 40px bordered control and inset Add action, separated from the group rows.
- Home and item-group surfaces use a 28px radius so their curves stay parallel to the 20px control curve across the 8px inset.
- Dark mode uses a clearer creation-control outline and divider than light mode.
- The phone-only fixed `dvh` height experiment is reverted.
- The group drawer returns to its responsive, capped maximum-height behavior.
- Dark mode uses a more visible, opaque item-group surface while light mode remains unchanged.
- The nested item-edit modal is unchanged.
