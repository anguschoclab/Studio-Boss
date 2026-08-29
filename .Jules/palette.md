## 2024-08-30 - Decorative icons in Radix Close buttons need aria-hidden
**Learning:** Even when a Close button has a `<span className="sr-only">Close</span>` for screen readers, the internal SVG icon (like `<X>`) still needs `aria-hidden="true"`. Without it, screen readers may announce the icon redundantly or confusingly alongside the screen-reader only text.
**Action:** Always check Radix UI / Shadcn wrapper components (like Dialog, Sheet, Toast) to ensure their close icons explicitly set `aria-hidden="true"`.
