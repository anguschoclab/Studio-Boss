## 2024-10-01 - Screen Reader Clutter in Radix Components

**Learning:** Decorative SVG icons (e.g., Check, Circle, ChevronRight) inside Radix UI components (DropdownMenu, ContextMenu, Menubar, Checkbox, RadioGroup) can cause redundant or confusing announcements for screen readers if they lack aria-hidden="true". The parent elements usually manage the ARIA state (like aria-checked or aria-expanded).
**Action:** Always apply `aria-hidden="true"` to decorative lucide-react icons inside functional menu items or interactive elements to prevent screen reader audio clutter.

## 2026-11-05 - Hide decorative drag handles from screen readers
**Learning:** Decorative non-interactive UI structural indicators like drag handles in Drawers can create confusion if they are parsed by screen readers when they don't have functional meaning.
**Action:** Add `aria-hidden="true"` to visual structural indicators like drag handles in UI components.
