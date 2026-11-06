## 2024-10-01 - Screen Reader Clutter in Radix Components

**Learning:** Decorative SVG icons (e.g., Check, Circle, ChevronRight) inside Radix UI components (DropdownMenu, ContextMenu, Menubar, Checkbox, RadioGroup) can cause redundant or confusing announcements for screen readers if they lack aria-hidden="true". The parent elements usually manage the ARIA state (like aria-checked or aria-expanded).
**Action:** Always apply `aria-hidden="true"` to decorative lucide-react icons inside functional menu items or interactive elements to prevent screen reader audio clutter.
## 2026-11-06 - Adding aria-hidden to decorative structural elements
**Learning:** Decorative structural elements like visual drag handles in a Drawer or indicator arrows in a Navigation Menu can cause screen readers to announce them as empty groups or blocks. While they don't have text content, explicitly hiding them provides a cleaner auditory experience.
**Action:** Always apply `aria-hidden="true"` to purely decorative `div` elements or structural visuals inside Radix/custom components to prevent screen reader focus and audio clutter.
