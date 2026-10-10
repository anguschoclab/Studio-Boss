## 2023-10-10 - Decorative Icons in Dynamic Components
**Learning:** Decorative icons rendered dynamically from configuration objects (like in NewsTicker) often miss `aria-hidden` attributes because they aren't explicit static JSX tags.
**Action:** Always verify that dynamically rendered SVG/Lucide icons passed via component props or config maps include `aria-hidden="true"`.
