## 2024-04-02 - Icon Button Accessibility
**Learning:** Icon-only buttons used for dismiss/close actions (like the one in `LiveAuctionDashboard.tsx`) often lack descriptive labels, making them invisible or confusing to screen readers.
**Action:** Always verify that buttons containing only an SVG/Icon have an `aria-label` attribute describing their function.

## 2024-05-24

**Learning:** Using `font-display` combined with `font-black` on major headings and key KPI value displays significantly improves the "SaaS-meets-Hollywood" premium aesthetic without harming readability. Also, creating deeper, more pronounced drop shadows (`shadow-[0_20px_40px_rgba(0,0,0,0.4)]`) on card hover states increases the tactile, elevated feel of the dashboard.
**Action:** Applied these exact Tailwind class upgrades to the `CommandCenter.tsx` executive header and KPI cards.
