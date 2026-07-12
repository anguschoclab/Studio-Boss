## 2024-05-18 - Missing aria-pressed on toggle buttons

**Learning:** Found that custom filter buttons acting as toggles (e.g., "Perfect Fits" in TalentAttachmentPanel) lacked the `aria-pressed` attribute, preventing screen readers from accurately conveying their active state.
**Action:** Always ensure that buttons functioning as state toggles dynamically bind `aria-pressed={isActive}`.

## 2026-06-30 - Adding accessibility attributes to interactive elements

**Learning:** Interactive elements such as custom toggle buttons acting as radios or options in modals require 'aria-pressed' attributes. Ensure decorative or non-meaningful icons have 'aria-hidden=true' to improve screen reader experience.
**Action:** Add 'aria-pressed' when building custom toggle states and explicitly define 'aria-label' and 'aria-hidden' for interactive components.

## 2024-07-03 - Added ARIA labels to Select components

**Learning:** Found an accessibility issue pattern where `SelectTrigger` components often lack `aria-label` attributes if there isn't a corresponding explicit text label.
**Action:** Always ensure `SelectTrigger` elements include an `aria-label` or are correctly linked to a `label` with `id`/`htmlFor` for screen readers.

## 2026-06-28 - Add focus-visible styles and aria-hidden to pipeline bookmark buttons

**Learning:** Bookmark toggle buttons in `PipelineBoard.tsx` and `ProjectCard.tsx` lacked `focus-visible` ring styles, making them invisible to keyboard users when focused. Additionally, the `Bookmark` and `BookmarkCheck` icons lacked `aria-hidden="true"`, causing screen readers to announce them unnecessarily.
**Action:** Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black` classes to bookmark buttons and `aria-hidden="true"` to all bookmark icons in both components.
