## 2024-10-01 - Screen Reader Clutter in Radix Components

**Learning:** Decorative SVG icons (e.g., Check, Circle, ChevronRight) inside Radix UI components (DropdownMenu, ContextMenu, Menubar, Checkbox, RadioGroup) can cause redundant or confusing announcements for screen readers if they lack aria-hidden="true". The parent elements usually manage the ARIA state (like aria-checked or aria-expanded).
**Action:** Always apply `aria-hidden="true"` to decorative lucide-react icons inside functional menu items or interactive elements to prevent screen reader audio clutter.

## 2024-10-24 - Unhidden Chevrons in Breadcrumbs and Calendars

**Learning:** Decorative icons like `ChevronRight` in breadcrumbs and `ChevronLeft`/`ChevronRight` in calendars need `aria-hidden="true"`. Without this, screen readers might unnecessarily read out "right arrow" or similar, adding audio clutter when the visual layout already conveys the meaning.
**Action:** Always verify that decorative icons acting as separators or standard navigation controls inside UI components have `aria-hidden="true"`.
