## 2024-04-02 - Icon Button Accessibility
**Learning:** Icon-only buttons used for dismiss/close actions (like the one in `LiveAuctionDashboard.tsx`) often lack descriptive labels, making them invisible or confusing to screen readers.
**Action:** Always verify that buttons containing only an SVG/Icon have an `aria-label` attribute describing their function.
