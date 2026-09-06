## 2024-05-15 - Add aria-hidden to decorative wrapper icons
**Learning:** When updating wrapper components (like `Dialog`, `Sheet`, or `Toast`), decorative SVG icons (e.g., `<X>` inside close buttons) must explicitly include `aria-hidden="true"`. Even if the button includes a `<span className="sr-only">Close</span>` for screen readers, omitting `aria-hidden` on the icon can cause redundant or confusing announcements.
**Action:** Always add `aria-hidden="true"` to decorative icons in UI wrapper components.
