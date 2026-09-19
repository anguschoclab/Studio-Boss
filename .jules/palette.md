## 2026-09-19 - Add aria-hidden to decorative icons in Radix Select and Accordion
**Learning:** Decorative lucide-react icons in Shadcn UI components (like Accordion and Select) must include aria-hidden="true" to prevent redundant screen reader announcements.
**Action:** Ensure all decorative UI elements such as Chevrons or Checkmarks in wrapper components include aria-hidden="true" by default.