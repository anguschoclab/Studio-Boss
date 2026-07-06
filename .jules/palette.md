## 2024-05-18 - Missing aria-pressed on toggle buttons
**Learning:** Found that custom filter buttons acting as toggles (e.g., "Perfect Fits" in TalentAttachmentPanel) lacked the `aria-pressed` attribute, preventing screen readers from accurately conveying their active state.
**Action:** Always ensure that buttons functioning as state toggles dynamically bind `aria-pressed={isActive}`.

## 2026-06-30 - Adding accessibility attributes to interactive elements
**Learning:** Interactive elements such as custom toggle buttons acting as radios or options in modals require 'aria-pressed' attributes. Ensure decorative or non-meaningful icons have 'aria-hidden=true' to improve screen reader experience.
**Action:** Add 'aria-pressed' when building custom toggle states and explicitly define 'aria-label' and 'aria-hidden' for interactive components.

## 2024-07-03 - Added ARIA labels to Select components
**Learning:** Found an accessibility issue pattern where `SelectTrigger` components often lack `aria-label` attributes if there isn't a corresponding explicit text label.
**Action:** Always ensure `SelectTrigger` elements include an `aria-label` or are correctly linked to a `label` with `id`/`htmlFor` for screen readers.

## 2024-07-06 - Interactive Element Focus States on Dark Themes
**Learning:** Raw `<button>` elements in dark UI segments often lack explicit `focus-visible` states, making keyboard navigation difficult to track. The standard `focus-visible:ring-2` can blend in on ultra-dark backgrounds unless paired with `focus-visible:ring-offset-2 focus-visible:ring-offset-black`.
**Action:** Always apply explicit focus visible styles with appropriate offsets when creating custom interactive elements outside of standard UI components.
