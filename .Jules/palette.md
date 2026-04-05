
### 2024-05-24
- **TopBar.tsx**: Updated to use `flex-wrap` and `min-h-[4rem]` to prevent horizontal overflow and allow elements to wrap smoothly on smaller screens. Increased the save and advance button hit targets to at least `44px` (`p-3`, `m-2`) and added `aria-label="Save Game"`.
- **TalentCard.tsx**: Wrapped card into an interactive button construct by adding `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler to support keyboard interactions for accessibility. Added `focus-visible` outline rings to clearly indicate focus.
- **NewsTicker.tsx**: Adjusted the padding from `p-2` to `p-3 m-2` to ensure the individual ticker items represent accessible touch targets.

### 2025-04-05 - Missing ARIA Labels on Unlabeled Input Elements
**Learning:** Found that multiple search/filter `<Input>` components containing icon placeholders lacked visible text labels and missing `aria-label`s, rendering them completely unannounced for screen readers natively traversing the DOM.
**Action:** Always ensure that `<Input>` fields used as search or filter boxes that lack an explicit adjacent `<label>` or visible text contain an `aria-label` attribute (e.g., `aria-label="Search SBDB"` or `aria-label="Filter property"`) for accessibility.
