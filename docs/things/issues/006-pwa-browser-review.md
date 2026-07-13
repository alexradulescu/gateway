# Install and browser-verify the polished Things app

- **Type:** AFK
- **User stories covered:** Installing Things; using it safely on iPhone and desktop; following system appearance; receiving consistent accessible feedback throughout every workflow.

## What to build

Finish Things as an installable, production-shaped Gateway app and review the complete experience in real browsers. Apply the supplied original frosted Art Deco material to shared surfaces, preserve the compact iOS-like hierarchy, cache only the application shell and static assets, and correct issues found while exercising the full acceptance checklist in light and dark modes.

## Acceptance criteria

- [ ] The web app manifest identifies Things, launches standalone at `/things/`, and uses an original minimal list/checkbox icon at required install sizes.
- [ ] The service worker caches the shell and versioned static assets but never Convex responses or user list data, and no custom install or update prompt is introduced.
- [ ] Production rewrites restore home, group, and item routes directly, and the complete Gateway build includes Things without regressing existing apps.
- [ ] The supplied Art Deco SVG and frosted theme are integrated as app-owned assets with readable opaque fallbacks when `backdrop-filter` is unavailable.
- [ ] Glass is limited to shared panels, overlays, popovers, dialogs, toasts, and unified controls; rows remain transparent with clear dividers.
- [ ] System light and dark modes share the muted emerald hierarchy, readable contrast, visible focus, clear selected state, and sufficiently opaque text surfaces.
- [ ] The centred layout remains usable from a 320px mobile viewport through desktop, respects iOS safe areas and keyboard opening, and keeps touch targets and clipped text accessible.
- [ ] Row controls remain sibling interactions with accurate accessible names; confirmation, validation, form, row-action, loading, error, and 404 feedback use their specified channels.
- [ ] The full manual acceptance checklist passes against a production build with real Convex subscriptions, including refresh, Back, replace navigation, concurrent updates, pending locks, reorder recovery, and invalid routes.
- [ ] Light and dark browser screenshots or an equivalent visual review record document the final home, group, and item views plus any verified HeroUI API adaptation.
- [ ] Typechecking, linting, formatting checks, and the full Gateway build complete successfully.

## Blocked by

- [002 — Manage and switch household groups](./002-manage-groups.md)
- [003 — Add catalogue-backed items quickly](./003-catalogue-item-entry.md)
- [004 — Complete, reactivate, and clear items](./004-completion-and-done.md)
- [005 — Edit, delete, and undo an item from its routed detail surface](./005-item-detail-and-undo.md)
