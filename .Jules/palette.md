## 2024-05-30 - Decorative Icon Accessibility in Icon-Only Buttons
**Learning:** Icon-only buttons (like the roster bookmark button) that rely on `aria-label` for screen reader announcements must explicitly add `aria-hidden="true"` to their inner SVG icons (like Radix/Lucide icons). Without this, some screen readers may attempt to read the SVG elements themselves, causing confusing or redundant announcements.
**Action:** Always verify that `<Icon className="..." aria-hidden="true" />` is used when the parent button or wrapper already provides the accessible name via `aria-label`.
