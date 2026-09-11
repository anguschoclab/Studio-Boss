## 2023-10-25 - Add aria-hidden to decorative SVG icons in wrapper components
**Learning:** Decorative SVG icons (like `<X>` in close buttons) inside Radix/Shadcn wrapper components can cause redundant screen reader announcements if `aria-hidden="true"` is omitted, even when a `sr-only` span is present.
**Action:** Always explicitly set `aria-hidden="true"` on non-informative decorative icons to ensure clean and non-repetitive screen reader experiences.
