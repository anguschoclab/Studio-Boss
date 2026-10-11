## 2024-11-09 - Add aria-hidden to decorative icons in Resizable component
**Learning:** When using visual structural indicators like `GripVertical` in Radix UI wrappers, ensure they include `aria-hidden="true"` to avoid screen reader clutter since the drag handler structure manages the true ARIA state.
**Action:** Always verify that icons used purely for visual cues in container wrappers have `aria-hidden="true"`.
