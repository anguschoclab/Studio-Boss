

## 2026-08-26 - Add aria-hidden to decorative close icons
**Learning:** When updating Shadcn or Radix UI wrapper components (like `Dialog`, `Sheet`, or `Toast`), ensure that decorative SVG icons (e.g., `<X>` inside close buttons) explicitly include `aria-hidden="true"`. Even if the button includes a `<span className="sr-only">Close</span>` for screen readers, omitting `aria-hidden` on the icon can cause redundant or confusing announcements.
**Action:** Always verify decorative close icons have `aria-hidden="true"` inside close buttons with screen-reader labels.
