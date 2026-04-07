
### 2024-05-24
- **TopBar.tsx**: Updated to use `flex-wrap` and `min-h-[4rem]` to prevent horizontal overflow and allow elements to wrap smoothly on smaller screens. Increased the save and advance button hit targets to at least `44px` (`p-3`, `m-2`) and added `aria-label="Save Game"`.
- **TalentCard.tsx**: Wrapped card into an interactive button construct by adding `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler to support keyboard interactions for accessibility. Added `focus-visible` outline rings to clearly indicate focus.
- **NewsTicker.tsx**: Adjusted the padding from `p-2` to `p-3 m-2` to ensure the individual ticker items represent accessible touch targets.
### 2024-05-18
- **UI/UX Upgrade:** Upgraded Dashboard, Pipeline, and SBDB components with "SaaS-meets-Hollywood" premium styling.
- **Accessibility:** Ensured color contrast ratios remain readable and interactive elements have proper focus states using Tailwind's `focus-visible:ring` utilities.
- **Component Structure:** Replaced nested object renders (e.g., `getWeekDisplay(week)`) in React children with explicit property access to prevent infinite update loops and enhance structural integrity.
### 2024-03-24 - Missing aria-labels on Search Inputs
**Learning:** React components frequently rely purely on placeholders and adjacent icons to communicate function for Search Inputs, rendering them inaccessible to screen readers.
**Action:** Always proactively verify `<Input>` elements have explicit `aria-label` attributes to support accessibility, particularly in the talent and pipeline modules.
