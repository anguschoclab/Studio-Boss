
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
### 2024-05-20 - Adding Accessible Focus States to Marquee Interactive Elements
**Learning:** Animated, marquee-style components (like `NewsTicker.tsx`) often utilize interactive elements to pause or trigger modals. These elements frequently omit `focus-visible` styling or meaningful `aria-label`s since they are primarily designed as visual, looping displays.
**Action:** When working on animated or non-standard layouts with interactive items, explicitly test keyboard navigation and screen reader output. Always ensure `<button>` elements within these flows have semantic ARIA descriptions that encapsulate the full action (e.g., "Read full story...") and robust `focus-visible` states to aid sighted keyboard users.
### 2024-06-03 - Interactive Framer Motion wrappers accessibility
**Learning:** Using `motion.div` for interactive elements (such as clickable cards) can cause keyboard accessibility issues, as standard `div`s do not natively support standard button behaviors (like focusing or triggering on Enter/Space).
**Action:** When conditionally rendering Framer Motion interactive wrappers (e.g., in `ContentCard.tsx`), always prefer `motion.button` and include `type="button"` alongside `w-full text-left focus-visible:outline-none focus-visible:ring-2` to ensure proper keyboard navigation and prevent standard browser button styles from altering the layout.

### 2024-05-25 - Talent Hub Search and Role Filters Accessibility
**Learning:** Similar to the search inputs, custom role filter buttons often lack proper ARIA labels, `aria-pressed` state to indicate the current selection, and visible focus states, rendering them hard to navigate for keyboard and screen reader users. In addition, standalone search inputs may only rely on their visual placeholder.
**Action:** When implementing custom button groups for filtering or standalone search inputs, ensure the container has `role="group"` and `aria-label`, buttons use `aria-pressed`, and inputs/buttons both implement robust `focus-visible` styling (like `focus-visible:ring-2`) along with `aria-label`s on inputs that lack standard `<label>` elements.
