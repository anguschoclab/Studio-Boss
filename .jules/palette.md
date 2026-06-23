## 2024-05-18 - Missing aria-pressed on toggle buttons
**Learning:** Found that custom filter buttons acting as toggles (e.g., "Perfect Fits" in TalentAttachmentPanel) lacked the `aria-pressed` attribute, preventing screen readers from accurately conveying their active state.
**Action:** Always ensure that buttons functioning as state toggles dynamically bind `aria-pressed={isActive}`.
