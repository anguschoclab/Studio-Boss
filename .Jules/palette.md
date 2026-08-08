## 2026-08-08 - Missing focus indicators on custom modal close buttons
**Learning:** Custom bare `<button>` elements used for closing modals frequently lack keyboard focus-visible styling and `aria-hidden` on inner decorative icons.
**Action:** When implementing standalone icon-only buttons outside the primary `Button` component, always ensure `focus-visible:ring-2` classes are applied alongside `aria-label` and `aria-hidden`.
