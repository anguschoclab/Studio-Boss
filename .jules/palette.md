## 2024-04-28 - Dynamic Tab ARIA State
**Learning:** In highly interactive dashboards like TalentHub, dynamically generated filter buttons (like roles or quadrants) mapped via arrays can easily miss standard a11y attributes.
**Action:** Always bind `aria-pressed={activeTab === currentTab}` inside `.map()` iterators to ensure screen readers announce which filter is actively controlling the current UI view, and ensure non-form `<button>` tags specify `type="button"`.
