## 2024-10-01 - Screen Reader Clutter in Radix Components

**Learning:** Decorative SVG icons (e.g., Check, Circle, ChevronRight) inside Radix UI components (DropdownMenu, ContextMenu, Menubar, Checkbox, RadioGroup) can cause redundant or confusing announcements for screen readers if they lack aria-hidden="true". The parent elements usually manage the ARIA state (like aria-checked or aria-expanded).
**Action:** Always apply `aria-hidden="true"` to decorative lucide-react icons inside functional menu items or interactive elements to prevent screen reader audio clutter.

## 2024-10-02 - Decorative Visual Indicators in Wrappers
**Learning:** Visual structural indicators, such as the `div`-based drag handles inside Drawer components, can cause confusing screen reader announcements because they are empty elements. Since the parent element handles the actual interaction state, these decorative items should be explicitly hidden.
**Action:** Always apply `aria-hidden="true"` to purely decorative visual structural elements (like `div` drag handles in Drawers) to prevent screen reader noise.
