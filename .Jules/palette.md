## 2024-05-18 - Missing aria-pressed on toggle buttons
**Learning:** Found that custom filter buttons acting as toggles (e.g., "Perfect Fits" in TalentAttachmentPanel) lacked the `aria-pressed` attribute, preventing screen readers from accurately conveying their active state.
**Action:** Always ensure that buttons functioning as state toggles dynamically bind `aria-pressed={isActive}`.
## 2024-07-03 - Added ARIA labels to Select components
**Learning:** Found an accessibility issue pattern where `SelectTrigger` components often lack `aria-label` attributes if there isn't a corresponding explicit text label.
**Action:** Always ensure `SelectTrigger` elements include an `aria-label` or are correctly linked to a `label` with `id`/`htmlFor` for screen readers.
