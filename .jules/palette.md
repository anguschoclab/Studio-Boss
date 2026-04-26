2024-04-25: Replaced overflow-x-auto with flex-wrap and enforced rounded-md borders for consistency on interactive toggle arrays to ensure better layout reflow. Enforced explicitly defined touch targets (p-3, m-2) and focus-visible utilities for accessibility compliance.

## 2026-04-26 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Discovered a pattern where custom UI overlays (like panels and full-screen hubs) frequently omit `aria-label` attributes on icon-only `<Button>` components (such as filter or close actions), rendering them invisible to screen readers.
**Action:** Always verify that every icon-only button contains a descriptive `aria-label`, especially when reusing generic button components in complex overlay views.
