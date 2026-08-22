## 2024-08-22 - Add aria-hidden="true" to decorative icons inside icon-only buttons
**Learning:** Decorative icons inside icon-only buttons need `aria-hidden="true"` to prevent screen readers from reading them redundantly, as the button already has an `aria-label`.
**Action:** Always add `aria-hidden="true"` to Lucide icons inside buttons that function as icon-only controls.
