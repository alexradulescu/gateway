## Problem Statement

Household members need a fast, predictable way to maintain short shared shopping and task lists without the ceremony of a general-purpose task manager. The current Gateway project has no dedicated experience for creating household lists, reusing commonly entered item names, reordering work, completing items, or seeing another device's changes in real time.

The solution must feel quick and native on a phone, remain useful when opened in a desktop browser, and fit Gateway's existing model of one Vercel project hosting independent Vite applications at stable subpaths. It must preserve the approved Things product behavior while adapting an earlier monolithic-application assumption to Gateway's actual multi-app architecture. It must also stay deliberately small: no accounts, permissions, offline data editing, catalogue administration, or general-purpose project-management features.

## Solution

Add Things as a self-contained Gateway application served at `/things/`, with route-restorable group and item drawers at `/things/$groupId` and `/things/$groupId/$itemId`. The application will provide manually ordered household groups, fast item entry, deterministic global catalogue autocomplete, completion and reactivation, item editing, soft deletion, and a ten-second Undo for the latest individual item deletion.

Things will use Gateway's shared Convex deployment for durable real-time state, TanStack Router for URL-owned drawer state, local React state for transient interactions, and open-source HeroUI React v3 for accessible UI infrastructure. Its original frosted Art Deco theme will apply glass to shared surfaces and overlays while keeping rows clear and easy to scan. It will be installable as a system-themed PWA and will cache only its application shell and static assets.

The feature will be integrated as a new Gateway sub-app rather than folded into the launcher. Gateway's registry, build orchestration, typechecking, and Vercel rewrites will include it while the launcher continues to own `/` and existing sub-apps retain their current paths.

## User Stories

1. As a household member, I want to open Things from the Gateway launcher, so that I can find the shared-list application alongside the other Gateway apps.
2. As a household member, I want Things to live at a stable `/things/` address, so that I can bookmark it and install it independently.
3. As a returning household member, I want the application to restore the correct screen from a copied group URL, so that deep links remain useful.
4. As a returning household member, I want the application to restore both group and item context from an item URL, so that refreshing does not lose my place.
5. As a household member, I want browser Back to close the item view before the group view, so that navigation behaves like stacked mobile sheets.
6. As a household member, I want explicit close controls on every drawer, so that I never depend on an undiscoverable gesture.
7. As a household member, I want backdrop taps to leave drawers open, so that an accidental tap does not discard my context.
8. As a household member, I want invalid or deleted links to show a clear not-found screen, so that I understand why the requested list cannot be opened.
9. As a household member, I want a Back to Things action on not-found and load-error screens, so that I can recover without editing the URL.
10. As a household member, I want initial loading to show a clear spinner rather than a false empty list, so that I do not mistake unresolved data for missing data.
11. As a household member, I want failed data loading to offer Retry, so that temporary failures are recoverable.
12. As a household member, I want to create a group inline, so that starting a new list takes only a name and one action.
13. As a keyboard user, I want Enter to create a group, so that I can add lists without moving to the pointer.
14. As a touch user, I want a clear add button to create a group, so that the same action is obvious on a phone.
15. As a household member, I want empty group names rejected inline, so that meaningless lists are not saved.
16. As a household member, I want active group names to be unique without regard to case, so that near-duplicate lists do not create confusion.
17. As a household member, I want punctuation in group names to remain meaningful, so that names such as `Home Tasks` and `Home-Tasks` can coexist.
18. As a household member, I want a deleted group name to be reusable, so that removing an obsolete list does not reserve its name forever.
19. As a household member, I want my typed group name preserved after a failed save, so that I do not have to re-enter it.
20. As a household member, I want the group field cleared and refocused after success, so that creating several lists remains quick.
21. As a household member, I want new groups added at the bottom, so that creation does not unexpectedly disturb my ordering.
22. As a household member, I want each group to show a zero-padded visual order marker, so that the list is easy to scan.
23. As a household member, I want each group to show only non-zero active and completed counts, so that metadata stays concise.
24. As a household member, I want groups with no items to omit count text, so that empty-state rows remain visually quiet.
25. As a household member, I want to open a group by tapping its main row area, so that navigation has a large touch target.
26. As a household member, I want a dedicated drag handle to reorder groups, so that scrolling and opening do not accidentally start a drag.
27. As a household member, I want group order to persist after refresh and on another device, so that the household shares one arrangement.
28. As a household member, I want to rename a group by tapping its drawer title, so that editing is available without an extra settings screen.
29. As a keyboard user, I want Enter to save a group rename, so that the inline edit is efficient.
30. As a household member, I want blur or drawer closure to cancel a rename, so that accidental edits are not persisted.
31. As a household member, I want rename validation shown without leaving edit mode, so that I can correct the value in place.
32. As a household member, I want group deletion to require confirmation, so that an entire shared list is not removed by one mistaken tap.
33. As a household member, I want deleting a group to return me to the Things home screen, so that I land in a valid context.
34. As a household member, I want catalogue names to survive group deletion, so that autocomplete keeps improving over time.
35. As a household member, I want quick group-switching controls inside an open group, so that I can move between household lists without closing the drawer.
36. As a household member, I want group-switching controls ordered like the home screen, so that both views use the same mental model.
37. As a household member, I want the current group visibly selected, so that I always know which list I am editing.
38. As a household member, I want switching groups to replace route history, so that Back closes the drawer instead of retracing every switch.
39. As a household member, I want a switched group to open scrolled to the top with Done expanded, so that each list starts in a predictable state.
40. As a household member, I want to add an item with one combined name, quantity, and add control, so that common entries take seconds.
41. As a household member, I want quantity to be optional free text, so that I can write natural values such as `2 litres` without learning a schema.
42. As a household member, I want quantity displayed with a multiplication sign only when present, so that single items do not imply a quantity of one.
43. As a keyboard user, I want Enter from either add-item field to submit, so that entry remains fast.
44. As a household member, I want both item fields disabled and one spinner shown while adding, so that duplicate submissions are prevented.
45. As a household member, I want both item values preserved after a failed add, so that transient errors do not erase my work.
46. As a household member, I want the item fields cleared and the name field refocused after success, so that adding a short list is rapid.
47. As a household member, I want an empty item name rejected while an empty quantity remains valid, so that validation matches the product model.
48. As a household member, I want previously entered catalogue names suggested as I type, so that repeated household items are faster to add.
49. As a household member, I want autocomplete hidden when the name field is empty, so that an irrelevant global catalogue does not cover the list.
50. As a household member, I want suggestions ranked by exact, prefix, then contiguous substring match, so that results are deterministic and relevant.
51. As a household member, I want alphabetic ordering within each match tier, so that ties are predictable.
52. As a household member, I want at most ten suggestions, so that the mobile popover remains compact.
53. As a household member, I want suggestions to show the canonical item name only, so that results remain easy to scan.
54. As a household member, I want selecting a suggestion to preserve the quantity field, so that catalogue assistance never destroys another edit.
55. As a keyboard user, I want Enter on a highlighted suggestion to fill the name without submitting, so that I can verify the chosen value before adding it.
56. As a keyboard user, I want a second Enter after choosing a suggestion to submit, so that selection and creation remain deliberate.
57. As a keyboard user, I want Enter with no highlighted suggestion to submit my custom text, so that the catalogue never blocks new names.
58. As a household member, I want a no-match message that explains Enter will add my text, so that custom-value behavior is discoverable.
59. As a household member, I want differently punctuated, spaced, cased, or accented forms to reuse an existing catalogue item, so that the catalogue avoids common duplicates.
60. As a household member, I want the first-created canonical spelling to remain the display name, so that a reused item stays visually consistent.
61. As a household member, I want duplicate occurrences of the same catalogue item in one group, so that repeated or separately quantified needs remain possible.
62. As a household member, I want active items listed in manual order without an extra Active heading, so that the main list stays compact.
63. As a household member, I want new, restored, and reactivated active items placed at the bottom, so that ordering behavior is consistent.
64. As a household member, I want item rows to stay on one line with ellipsis, so that short lists remain dense and scannable.
65. As a household member, I want to complete an item from an enlarged checkbox touch area, so that the primary action is easy on a phone.
66. As a household member, I want only the tapped checkbox disabled while completion is pending, so that the rest of the list remains usable.
67. As a household member, I want a completed item to appear at the top of Done only after the server confirms it, so that the display does not falsely imply success.
68. As a household member, I want failed completion to leave the item in place and show a toast, so that state remains trustworthy.
69. As a household member, I want completed items sorted newest first, so that recent progress is easiest to see.
70. As a household member, I want to reactivate a completed item from its checkbox, so that mistakenly completed or recurring work returns to the active list.
71. As a household member, I want Done hidden when empty and collapsible when present, so that completed work does not consume unnecessary space.
72. As a household member, I want Done expanded whenever a group opens, so that completion state is initially visible and predictable.
73. As a household member, I want completed names and quantities muted and fully struck through, so that their status is unmistakable.
74. As a household member, I want Clear all completed to require confirmation, so that a bulk destructive action is deliberate.
75. As a household member, I want Clear all to affect only the current group's completed occurrences, so that other lists remain untouched.
76. As a household member, I want to open item details by tapping the item row away from its checkbox and drag handle, so that independent actions do not conflict.
77. As a household member, I want item details to appear above the still-mounted group drawer, so that I retain list context while editing.
78. As a household member, I want item name and quantity edits to remain local until Save, so that typing does not create partial shared updates.
79. As a household member, I want Save disabled until values change, so that the interface communicates when persistence is necessary.
80. As a household member, I want editing a completed item to preserve its completion status, so that correcting text does not reactivate work.
81. As a household member, I want changing an item's name to resolve through the global catalogue without renaming the old catalogue record, so that other occurrences remain unchanged.
82. As a household member, I want closing an item drawer to discard unsaved changes silently, so that Cancel does not require an additional dialog.
83. As a household member, I want Save and Delete to lock item-drawer controls while pending, so that conflicting mutations cannot be triggered.
84. As a household member, I want individual item deletion to complete without a confirmation dialog, so that the common cleanup action stays fast.
85. As a household member, I want the latest deleted item to offer a ten-second Undo, so that accidental deletion is quickly reversible.
86. As a household member, I want a newer deletion to replace the previous Undo opportunity, so that transient recovery state stays simple.
87. As a household member, I want Undo dismissed when I switch or leave the original group, so that restoration never appears to target an ambiguous context.
88. As a household member, I want Undo to restore active items at the bottom and completed items with their completion time intact, so that restoration follows one predictable rule.
89. As a household member, I want a dedicated drag handle to reorder active items, so that opening, completing, scrolling, and dragging remain distinct.
90. As a household member, I want completed items excluded from drag ordering, so that Done remains chronologically ordered.
91. As a household member, I want the list to show temporary drag order during the gesture, so that the interaction feels direct.
92. As a household member, I want a failed reorder to restore the prior order and show an error toast, so that the display matches persisted state.
93. As a household member using two devices, I want Convex changes to appear automatically, so that both views converge without refresh controls.
94. As a household member, I want the interface to follow system light and dark appearance, so that it fits my device without an application-specific toggle.
95. As a household member, I want a compact centred layout on wide screens, so that the mobile information hierarchy remains coherent on desktop.
96. As an iPhone user, I want controls and overlays to respect safe areas and the onscreen keyboard, so that actions are never obscured.
97. As a household member, I want the app installable in standalone mode, so that it behaves like a focused household utility.
98. As a household member, I want the application shell available after normal static caching while live list data still comes from Convex, so that stale household data is never presented as current.
99. As a keyboard or assistive-technology user, I want semantic labels, visible focus, independent interactive controls, and comfortable targets, so that every workflow remains operable.
100. As a household member, I want frosted surfaces and a subtle Art Deco background without reduced text contrast, so that the app feels polished while staying practical.

## Implementation Decisions

- Things will be a new Vite React sub-app in the Gateway workspace. It will not be merged into the launcher or another existing sub-app.
- Gateway retains ownership of `/`. Things owns the stable public path `/things/` and its group and item descendants.
- The app registry remains the source of truth for launcher visibility and build discovery. Things will be registered there and included in the root typecheck command.
- The production host will rewrite all Things descendant paths to the Things application entry so that direct refreshes work.
- The Vite base is `/things/`. TanStack Router routes are app-relative while the browser exposes the approved public URLs.
- TanStack Router's Vite plugin will run before the React plugin. Generated route types will be used without casts or manually annotated inferred route types.
- Route state owns drawer state. Opening a group or item pushes history, explicit close navigates to the parent route, browser Back follows actual history, and chip switching replaces the current group entry.
- The item route preserves the mounted group view and adds a smaller overlay above it. Nested HeroUI Drawer behavior will be spiked early; a bottom-positioned HeroUI Modal is the approved fallback if portal order, focus trapping, scroll locking, or iOS behavior is unreliable.
- Backdrop dismissal and custom swipe handling are excluded. Native swipe dismissal is used only if the installed HeroUI v3 API supports every required dismissal rule without custom gesture code.
- Raw Convex document IDs remain in route parameters. Route-facing reads will normalize malformed IDs and return missing data so invalid values become 404 states rather than query failures.
- Things will reuse Gateway's shared Convex client package and root Convex deployment conventions. Development and production use separate Convex deployments through environment configuration.
- Dedicated group, catalogue-item, and group-item-occurrence tables will be added. Convex creation time is used instead of redundant creation timestamps.
- A group stores its display name, conservative normalized name, numeric position, and optional deletion timestamp.
- A catalogue item stores its first canonical display name and aggressive normalized key. Catalogue records are permanent in v1.
- A group-item occurrence references a group and catalogue item and independently stores free-text quantity, active position, optional completion timestamp, and optional deletion timestamp.
- Duplicate catalogue-item occurrences are allowed within a group.
- Required indexes will support group-name uniqueness checks, catalogue-key resolution, group occurrence lookup, and ordered reads.
- All behavioral timestamps originate in Convex mutations. Browser-generated timestamps are never accepted for completion or deletion state.
- Visible text cleanup removes line breaks, trims edges, and collapses repeated whitespace while preserving case, punctuation, and symbols.
- Group uniqueness is case-insensitive after visible-text cleanup; punctuation remains meaningful. Only active groups participate in the uniqueness rule.
- Catalogue normalization decomposes Unicode, removes combining marks, lowercases, and keeps letters and numbers only. The intentional collision risk for symbol-heavy names is accepted for v1.
- Catalogue resolution occurs atomically on the server. A normalized match reuses the original canonical record; otherwise the mutation creates a catalogue record.
- Soft-deleted groups and occurrences are excluded from normal reads. Group deletion soft-deletes the group and all its occurrences atomically with one server timestamp.
- No automated purge, trash view, catalogue deletion, or catalogue renaming will be added.
- Home uses one Convex subscription returning ordered active groups with computed active and completed counts. Counts are not denormalized onto group records.
- An opened group uses one subscription returning group details, active occurrences ordered by position, and completed occurrences ordered by completion time descending.
- The item drawer derives its occurrence from the opened-group result and does not add an item-detail subscription.
- One feature-root catalogue subscription returns only catalogue identifiers, canonical names, and normalized keys. Local components share that result rather than creating repeated subscriptions.
- Initial interactive rendering waits for required route data and the catalogue. A resolved missing group or occurrence produces a full-page 404.
- Query failures use a full-page error boundary with Retry and Back to Things. Validation and form failures stay inline; row-action and reorder failures use toasts.
- Local React state owns draft fields, pending controls, Done disclosure, autocomplete highlight, temporary drag order, and the current Undo opportunity. No new global state or server-cache library will be added.
- Catalogue matching occurs locally and ranks exact normalized matches, then prefixes, then contiguous substrings, alphabetically within each tier, with a ten-result limit.
- Autocomplete supports custom values and deliberately controls Enter behavior: highlighted Enter selects only, the next Enter submits, and unhighlighted Enter submits the typed name.
- The Add item control is a Things-specific composition of two independent fields and one action inside a shared material wrapper. It is not forced into one HeroUI InputGroup.
- Group and item rows use sibling interactive controls for the main action, checkbox where applicable, and drag handle. Interactive elements are not nested.
- Active ordering uses integer positions. Completion and soft deletion do not renumber remaining records. New, restored, and reactivated active occurrences append after the maximum active position. A successful reorder rewrites the complete visible order atomically.
- Drag-and-drop will use a small accessible touch-capable sortable implementation with dedicated handles. Native HTML drag-and-drop is not sufficient for the iOS target.
- Broader custom optimistic updates are avoided. Temporary local ordering is allowed during drag; failed persistence restores the previous order.
- Completing and reactivating items wait for Convex confirmation. Only the affected checkbox is pending, and failures restore the prior visible state through the subscription source of truth.
- Done is hidden when empty, locally collapsible, and reset to expanded whenever a group opens or changes. Completed items are never draggable.
- Individual deletion is soft deletion without confirmation. Only the latest deletion offers Undo for ten seconds, and the opportunity is dismissed when its original group context is left.
- Group deletion and Clear all completed require explicit destructive confirmation and offer no Undo.
- Pending-state locking is narrow. Item Save, item Delete, and confirmed group Delete lock dismissal; other operations disable only their directly affected controls.
- HeroUI React v3 supplies accessible drawers or modal fallback, confirmation dialogs, fields, autocomplete infrastructure, buttons, checkboxes, disclosure, toasts, spinners, separators, surfaces, and semantic states.
- The installed HeroUI v3 API and current official documentation determine exact component syntax. HeroUI v2 examples and private HeroUI Pro implementation code are not used.
- The visual implementation is an original Things theme. HeroUI Pro Glass is inspiration for restraint and material hierarchy only.
- Glass is applied to the grouped home surface, drawers or modal, popovers, dialogs, toast, and unified controls. Individual group, active, and completed rows remain transparent within their shared surface.
- The supplied frosted Art Deco tokens and repeating SVG are the initial visual source. Asset paths and stacking behavior will be adapted to the `/things/` Vite base and verified in the production browser seam.
- Theme behavior follows system appearance with no toggle. Light and dark modes retain readable text, dividers, selected states, and solid-enough overlay materials.
- The app targets a centred column around 480 pixels, current iOS Safari and installed iOS PWA, and current Chromium browsers.
- The PWA caches the application shell and static assets only. Convex query results and household list data are never service-worker cached, and writes are never queued offline.
- The manifest identifies the app as Things in standalone mode and uses a minimal original list/check symbol. No custom install or update prompt is added.
- Implementation source priority is fixed: approved product behavior and scope first; Gateway's installed versions and established conventions second; current official HeroUI React v3 documentation and source third; current official TanStack Router and Convex documentation fourth; nonessential handoff code examples fifth; public HeroUI Pro visual inspiration last.
- When an example conflicts with Gateway conventions or the installed API, preserve the higher-priority source while maintaining the approved behavior and record any small adaptation in the implementation summary.
- The specification and implementation issues remain Markdown artifacts on the current branch. No external issue tracker is used because the user explicitly requested branch-local documentation.

## Testing Decisions

- Tests assert externally observable rules and outcomes rather than component structure, private helper calls, generated route details, or HeroUI internals.
- Two primary seams are used: Bun's built-in test runner for deterministic pure product logic, and a production-build browser seam for the integrated application.
- Bun tests cover visible-text cleanup, conservative group-name normalization, aggressive catalogue-key normalization, catalogue-match ranking, alphabetical tie-breaking, result limits, quantity presentation, count presentation, and position-allocation rules.
- Pure logic is written so the browser and Convex code can consume the same behavior without duplicating product rules.
- TDD is used at those pure seams where inputs and outputs are stable: write a failing behavioral example, implement the smallest rule, and refactor only after it passes.
- The project does not add a separate unit-test framework when Bun's built-in runner is sufficient.
- The production browser seam runs against Gateway's built output and rewrite shape, not only the Things development server.
- Browser acceptance covers direct loading and refresh of all three public route shapes; close, Back, and replace-history behavior; valid 404 recovery; loading and error presentation; and preservation of the mounted group beneath item details.
- Browser acceptance covers group creation, duplicate rejection, rename cancellation and save, confirmed deletion, count formatting, and persistent drag order.
- Browser acceptance covers add-item keyboard submission, autocomplete ranking and highlight behavior, canonical catalogue reuse, quantity preservation, duplicate occurrences, and failure-value preservation.
- Browser acceptance covers completion, reactivation, Done ordering and collapse reset, confirmed Clear all, item Save and Delete, ten-second Undo, and Undo dismissal on route-context changes.
- Browser acceptance covers pointer and touch-sized controls, dedicated drag handles, keyboard focus, accessible names, focus restoration where supported, and the absence of nested interactive controls.
- Browser acceptance covers iOS-width layout, wide-screen centring, safe-area padding, onscreen-keyboard behavior, nested overlay focus and scroll locking, and the Modal fallback decision if nested drawers are unreliable.
- Browser acceptance covers system light and dark appearance, text and divider readability, Art Deco pattern subtlety, overlay opacity, and the opaque fallback when backdrop filtering is unavailable.
- Browser acceptance covers manifest availability, standalone metadata, static-asset caching, direct-route rewrites, and confirmation that Convex requests and household data are not served by the service worker.
- Typechecking runs regularly while implementing each issue. Focused Bun test files run after changes to their seam. Linting, formatting checks, the full Bun test suite, typechecking, and the full Gateway production build run at the end.
- The final implementation review uses browser access against the production preview and records light- and dark-mode visual verification plus any installed HeroUI API adaptations.
- Existing Gateway apps provide prior art for workspace scripts, independent Vite bases, shared Convex provider usage, registry-driven builds, and production subpath rewrites. Things adds the first local pure-logic tests and therefore keeps that test setup minimal and feature-scoped.
- Convex mutations and subscriptions are exercised through the integrated browser seam rather than introducing a second backend-test harness for v1. The pure tests protect deterministic rules; the production browser review protects end-to-end wiring.

## Out of Scope

- Authentication, household passcodes, accounts, roles, permissions, and presence.
- Offline list editing, queued writes, offline synchronization, conflict-resolution UI, and cached Convex data presented as current.
- Moving occurrences between groups.
- Bulk selection and bulk item actions other than Clear all completed for the current group.
- Search within a group, fuzzy matching, typo correction, scattered-character matching, frequency ranking, and recency ranking.
- Catalogue management, catalogue merging, hiding, renaming, deletion, typo repair, and catalogue history.
- Structured quantities, units, tags, categories, priorities, notes, reminders, and due dates.
- Automatic item sorting, automatic cleanup, purge jobs, retention policies, trash views, and restore history.
- More than the latest individual deletion Undo opportunity.
- Undo for group deletion or Clear all completed.
- Item history, activity feeds, comments, collaboration locks, and presence indicators.
- Analytics, telemetry, external error monitoring, and export UI.
- Custom install prompts, custom PWA update prompts, and offline-data indicators.
- Desktop-specific multi-column or dashboard layouts.
- Custom swipe-dismiss gestures, a separate animation framework, shared-layout animation, and highly reflective liquid-glass effects.
- A reusable cross-application design-system package created solely for Things.
- A new global client-state library, external server cache, polling, or manual WebSocket layer.
- HeroUI Pro source, private themes, or proprietary dependencies.
- Support for older browsers outside current iOS Safari and current Chromium-based browsers.
- Character limits beyond required non-empty names and cleaned single-line text.
- Automated visual-regression infrastructure, a broad component-unit-test suite, or a separate Convex integration-test framework in v1.
- Changes to the launcher architecture, existing sub-app behavior, or Gateway's one-project deployment model beyond registering and serving Things.

## Further Notes

- The approved handoff is authoritative for product behavior and intentionally accepts catalogue collisions such as symbol-heavy names normalizing to the same key.
- No authentication is an approved v1 simplification, but it means anyone able to reach the production Convex API may read or mutate household data. Deployment should be treated as a private household utility rather than a protected multi-tenant product.
- Concurrent reorders are expected to be rare. Complete-order mutations may use last-write-wins Convex transaction semantics without adding a collaboration layer.
- Soft-deleted data and permanent catalogue records can grow indefinitely. This is an explicit maintenance trade-off, not an omitted background job.
- Early implementation must prove route refreshes, nested overlay behavior, autocomplete keyboard semantics, composite-row interactions, and mobile drag before styling every screen.
- The Art Deco pattern should be noticed gradually rather than immediately. Its supplied opacity is a starting point and may be tuned during browser verification without changing the material concept.
- Comments should explain non-obvious decisions: route-owned drawers, omitted custom swipe, the custom combined add control, sibling row controls, aggressive normalization, permanent catalogue records, absent purge, restrained optimistic state, and container-level glass.
- Generated output is never edited by hand. Production verification must come from the normal Gateway build and preview workflow.
- All specification and issue documentation for this work is committed as Markdown on the active branch. The `to-spec` and `to-issues` publishing steps are intentionally adapted away from an external tracker to honor the user's explicit branch-local requirement.
