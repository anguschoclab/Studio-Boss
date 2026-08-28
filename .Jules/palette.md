## 2024-08-28 - Add aria-hidden to decorative close icons
**Learning:** Decorative SVG icons (e.g., `<X>` inside close buttons) in Shadcn or Radix UI wrapper components need `aria-hidden="true"`. Even if the button includes a `<span className="sr-only">Close</span>` for screen readers, omitting `aria-hidden` on the icon can cause redundant or confusing announcements.
**Action:** Always verify that decorative icons inside actionable elements (like buttons with `sr-only` text or `aria-label`) explicitly declare `aria-hidden="true"`.
