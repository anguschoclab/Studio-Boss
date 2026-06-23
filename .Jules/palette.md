## 2024-05-18 - Missing aria-pressed on toggle buttons
**Learning:** Found that custom filter buttons acting as toggles (e.g., "Perfect Fits" in TalentAttachmentPanel) lacked the `aria-pressed` attribute, preventing screen readers from accurately conveying their active state.
**Action:** Always ensure that buttons functioning as state toggles dynamically bind `aria-pressed={isActive}`.
## 2024-06-23 - Keyboard Focus on Raw Buttons
**Learning:** Raw HTML `<button>` elements in interactive hubs like FranchiseHub often lack `type="button"` and `focus-visible` styles, which degrades keyboard accessibility and can lead to unintended form submissions.
**Action:** Consistently include `type="button"` and comprehensive `focus-visible` utility classes (including `ring-offset-black` for dark interfaces) on custom button elements. Add `aria-hidden="true"` to decorative icons within these buttons.
