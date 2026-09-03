## 2024-09-03 - Add aria-hidden to decorative close icons
**Learning:** Decorative SVG icons inside Radix UI close buttons (like Dialog, Sheet, Toast) can cause redundant or confusing announcements if they don't explicitly include `aria-hidden="true"`, even when a `sr-only` fallback is provided.
**Action:** Always ensure decorative `lucide-react` icons within interactive elements have `aria-hidden="true"` to prevent screen readers from reading them.
