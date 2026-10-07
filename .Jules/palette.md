## 2024-10-01 - Screen Reader Clutter in Radix Components

**Learning:** Decorative SVG icons (e.g., Check, Circle, ChevronRight) inside Radix UI components (DropdownMenu, ContextMenu, Menubar, Checkbox, RadioGroup) can cause redundant or confusing announcements for screen readers if they lack aria-hidden="true". The parent elements usually manage the ARIA state (like aria-checked or aria-expanded).
**Action:** Always apply `aria-hidden="true"` to decorative lucide-react icons inside functional menu items or interactive elements to prevent screen reader audio clutter.

## 2024-10-07 - Screen Reader Clutter from Visual Navigation Icons
**Learning:** Purely decorative icons acting as separators or visual-only navigation controls (e.g., `<ChevronRight>` in Breadcrumbs, `<ChevronLeft>` in Calendars) must include `aria-hidden="true"` to prevent redundant screen reader announcements when the visual layout or parent element already conveys the meaning.
**Action:** Ensure visual-only navigation icons and separators explicitly include `aria-hidden="true"`.
