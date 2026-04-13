
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

## 2026-04-13
**🎨 Palette: Elevated UI for IP Asset Cards and Franchise Hub**
- **💡 What:** Migrated `IPAssetCard.tsx`, `FranchiseHub.tsx`, and `MerchandiseRevenuePanel.tsx` to utilize premium "SaaS-meets-Hollywood" glass-card styling (using `bg-white/5 border border-white/10 backdrop-blur-sm`). Introduced contextual animations (`hover:-translate-y-1`, `group-hover:rotate-6`, `group-hover:animate-pulse`) and explicit gradient backdrops (`bg-gradient-to-br from-primary/20 via-transparent to-black/40`). Enhanced accessibility across the board.
- **🎯 Why:** The components were functional but lacked the tactile, premium feedback expected of a high-end simulation dashboard. Static borders and missing focus states reduced the immersive quality of the interface.
- **📸 Before/After:** Before, cards used generic utility tokens without explicit hover/active transforms. After, cards react dynamically to user input with shadow-scaling and focus-rings.
- **♿ Accessibility:** Upgraded interactive `<Card>` and `<button>` elements to include strict `focus-visible:ring-2`, `focus-visible:outline-none`, explicit `type="button"`, and semantic `aria-label` attributes where appropriate to satisfy WCAG focus state guidelines.
