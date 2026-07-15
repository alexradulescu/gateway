# iOS sheet spacing guidance

_Checked 2026-07-15 against Apple Human Interface Guidelines._

## BLUF

- Apple does **not** prescribe a universal 20 pt or 24 pt vertical gap between sections in an iOS/iPadOS sheet.
- Apple does say to separate unrelated controls into logical sections with enough space that people can distinguish them. This directly supports increasing the gaps between the group switcher, group items, and Done area. ([Layout](https://developer.apple.com/design/human-interface-guidelines/layout))
- Use **24 pt between these major zones** as an app-level design choice. It fits Apple's qualitative guidance and the reported confusion, but it is not an Apple-mandated section metric.

## Numeric guidance is about interaction safety

- For iOS and iPadOS, Apple lists 44x44 pt as the default control size and 28x28 pt as the minimum. ([Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility))
- Apple separately recommends considering spacing between controls as important as size. Its general accessibility heuristic is about 12 pt of padding around elements with a visible bezel and about 24 pt around the visible edges of elements without one. ([Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility))
- Those 12 pt and 24 pt figures reduce wrong-target taps. They are **not** a universal content-section spacing scale and should not be confused with the 44x44 pt touch-target guidance.

## Sheet-specific guidance

- Apple's sheet guidance defines system detents and recommends putting Cancel/Close on the leading edge and Done on the trailing edge of the top toolbar for a single-view iOS/iPadOS sheet. It gives no fixed vertical spacing value between a sheet's internal sections. ([Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets))

## Recommendation for Things

- Set 24 pt between the group switcher, group-item area, and Done area.
- Keep spacing inside each related group more compact.
- Preserve at least a 44x44 pt hit region for the interactive controls even when their visible artwork is smaller. ([Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons))
- If the bottom Done area remains visually or behaviorally confused with list items, also distinguish it with a separator, background, or toolbar treatment; Apple explicitly permits negative space, background shapes, materials, color, and separators to communicate grouping. ([Layout](https://developer.apple.com/design/human-interface-guidelines/layout))
