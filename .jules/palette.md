## 2023-10-24 - Screen Reader Clutter in State Indicators
**Learning:** Decorative SVG icons (like `<Check>`, `<Circle>`, or `<ChevronRight>`) inside Radix/Shadcn wrapper components (`DropdownMenu`, `Checkbox`, `RadioGroup`) cause redundant or confusing screen reader announcements because the parent components already manage the actual ARIA state (`aria-checked`, etc.).
**Action:** Always explicitly add `aria-hidden="true"` to these decorative icons inside stateful UI wrappers to keep the accessibility tree clean.
