## 2024-04-28 - Dynamic Tab ARIA State
**Learning:** In highly interactive dashboards like TalentHub, dynamically generated filter buttons (like roles or quadrants) mapped via arrays can easily miss standard a11y attributes.
**Action:** Always bind `aria-pressed={activeTab === currentTab}` inside `.map()` iterators to ensure screen readers announce which filter is actively controlling the current UI view, and ensure non-form `<button>` tags specify `type="button"`.

## 2024-05-18 - Keyboard Focus Indicators for Custom Interactive Cards
**Learning:** Custom interactive elements (like `div` tags with `role="button"` and `tabIndex={0}`) in grid layouts often lack default browser focus indicators, making it impossible for keyboard users navigating via Tab to see the currently active element.
**Action:** Always add Tailwind's `focus-visible` utility classes (e.g., `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none focus-visible:transition-none`) to these custom button elements to ensure proper keyboard accessibility.
## 2024-05-19 - Missing aria-expanded and type="button" in UI Action Elements
**Learning:** Collapsible sidebars and quick action docks frequently utilize `<button>` or `<motion.button>` elements without explicit `type="button"` attributes, causing potential form submission risks, and often miss `aria-expanded` attributes which are critical for screen readers to understand toggle states.
**Action:** Always verify that functional UI toggle buttons have both explicit `type="button"` and `aria-expanded={booleanState}` properties applied.
