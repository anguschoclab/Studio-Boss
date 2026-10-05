## 2024-10-06 - Hide Decorative Icons from Screen Readers
**Learning:** Found decorative icons like `<Dot>` and `<GripVertical>` in custom UI components without `aria-hidden="true"`, which can cause redundant or confusing announcements for screen reader users.
**Action:** Always ensure that decorative SVG icons (especially from `lucide-react`) within interactive or structural elements explicitly include `aria-hidden="true"`.
