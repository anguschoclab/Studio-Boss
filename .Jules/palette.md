## 2024-05-24 - Screen reader pollution from decorative Button icons
**Learning:** Decorative lucide-react icons placed inside functional buttons without an accessible name override (like in StudioPulse.tsx Quick Actions) must have `aria-hidden="true"` applied to them. Otherwise, screen readers may announce them as unlabelled graphics right before reading the button text, which clutters the audio stream.
**Action:** Always verify that icons used purely for visual flair alongside text labels have `aria-hidden="true"`.
