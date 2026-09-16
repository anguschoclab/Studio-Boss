## 2024-09-16 - Screen Reader Noise from Decorative Icons
**Learning:** Decorative SVG icons (like lucide-react's Chevron or Check) in UI components can be read by screen readers if they lack `aria-hidden="true"`, causing redundant or confusing announcements even if a screen-reader only (`sr-only`) text alternative is present.
**Action:** Always add `aria-hidden="true"` to decorative icons inside interactive components like Accordion, Select, and Pagination.
