# Bookster in Gateway

## Outcome

Bookster is a complete, independently testable Gateway application at `/bookster/`. It shares
Gateway's Convex deployment but owns namespaced tables. The standalone Bookster project remains
untouched. Production data migration is a separate later task: test data will first be cleared from
only the Gateway Bookster tables, then standalone Bookster data will be copied and verified.

## Product behavior

- No authentication, logging, analytics, offline writes, or user accounts.
- Designed for two family members and roughly 1,000–2,000 books.
- Books have title, author, categories, locations, sample status, and original timestamps.
- Categories and locations are managed in Settings; deleting one removes its book associations and
  then soft-deletes the label.
- Active category and location labels are unique after whitespace cleanup and case folding.
- Search activates at three characters, matches title and author case-insensitively, and ranks title
  prefixes, title substrings, then author substrings.
- Search, default sorting, and category filtering are local over one live compact library result.
- The full list and search results use dynamically measured TanStack Virtual rows.
- Category chips begin enabled. Once any is disabled, a book is shown only when it has at least one
  enabled category; uncategorized books are hidden. An All action restores every category.
- Default sort is shared in Convex. Theme is stored per device and defaults to system appearance.
- Create, update, and CSV import reject duplicate title+author pairs. Duplicate cleanup deliberately
  groups by title alone for human review.
- Successful single-book creation keeps the sheet open, clears title/author, preserves category and
  location selections, resets sample status, and focuses Title.
- CSV paste/import supports up to roughly 2,000 rows with an exact local preview and safe idempotent
  backend batches.
- Route-owned states use `/bookster/add`, `/bookster/books/:bookId`, and
  `/bookster/settings/:tab`. Dirty forms block dismissal until discarded or saved.
- Book deletion is permanent and uses the existing ten-second two-press confirmation in details.

## Visual behavior

- Preserve Bookster's warm serif, pastel Art Deco identity using HeroUI React v3.
- The library scrolls beneath transparent top and bottom chrome. Floating glass surfaces, category
  pills, search capsule, and add button provide legibility without opaque full-width bars.
- Mobile forms are bottom sheets; wider screens use centered dialogs in an approximately 600px
  column.
- Book rows keep one-line title and author, wrapping no more than the normally small badge set.
- The main row displays a subdued SAMPLE badge when applicable.
- Light, dark, iOS safe-area, onscreen-keyboard, PWA, and current Chromium behavior are required.

## Data and deployment

- Tables are `booksterBooks`, `booksterCategories`, `booksterLocations`, and `booksterSettings`.
- The lifted field model is unchanged apart from table and referenced-table names.
- Empty tables initialize the original five locations and default settings so the app can be tested
  before migration.
- `/bookster/` is registered in the launcher, production build, typecheck, service-worker shell, and
  Vercel rewrite.
- The launcher shows only Things and Bookster. Counter Lab and Notes Bench are removed from the
  launcher registry and production build discovery.

## Validation seams

- Bun tests cover observable pure rules: cleanup, search, filtering, sorting, duplicates, CSV, and
  deterministic cover presentation.
- Integrated verification covers Convex CRUD, route/back behavior, dirty-form dismissal, settings,
  duplicate cleanup, bulk import, themes, responsive layout, PWA assets, and Gateway's production
  build shape.

## Out of scope

ISBN or barcode scanning, external cover lookup, reading status, ratings, notes, lending, per-person
ownership, authentication, export UI, fuzzy search, automated duplicate merging, queued offline
writes, and migration tooling or execution.
