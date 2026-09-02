## 2026-09-02 - Decorative SVG Icons Require Explicit aria-hidden
**Learning:** Decorative SVG icons inside UI buttons (like <X> in close buttons) can still be read by screen readers even if the button has a screen-reader only fallback text, leading to redundant or confusing announcements.
**Action:** Always include aria-hidden="true" on decorative lucide-react icons or other SVGs within interactive elements.
