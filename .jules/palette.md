## 2024-04-28 - Dynamic Tab ARIA State
**Learning:** In highly interactive dashboards like TalentHub, dynamically generated filter buttons (like roles or quadrants) mapped via arrays can easily miss standard a11y attributes.
**Action:** Always bind aria-pressed={activeTab === currentTab} inside .map() iterators to ensure screen readers announce which filter is actively controlling the current UI view, and ensure non-form <button> tags specify type="button".

## 2024-05-06 - Accessible Icon Buttons and Inputs
**Learning:** Decorative lucide-react icons placed inside buttons without text labels are read aloud by screen readers as meaningless SVG elements. Using aria-hidden="true" on the icon itself and adding aria-label to the wrapping button significantly improves the auditory experience. Additionally, inputs lacking explicit <label> tags should utilize aria-label to describe their intent.
**Action:** When adding size="icon" buttons or Search inputs in future components, always apply an aria-label to the container and aria-hidden="true" to any decorative SVGs.

## 2024-05-18 - Keyboard Focus Indicators for Custom Interactive Cards
**Learning:** Custom interactive elements (like div tags with role="button" and tabIndex={0}) in grid layouts often lack default browser focus indicators, making it impossible for keyboard users navigating via Tab to see the currently active element.
**Action:** Always add Tailwind's focus-visible utility classes (e.g., focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary focus-visible:outline-none focus-visible:transition-none) to these custom button elements to ensure proper keyboard accessibility.
