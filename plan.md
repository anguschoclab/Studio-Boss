1. **Add `aria-hidden="true"` to `ChevronRight` in `AwardsCeremonyModal.tsx`**
   - The decorative `ChevronRight` icon inside the "Next Category" / "Discard the Envelope" button lacks `aria-hidden="true"`, causing screen reader clutter.
2. **Add `aria-hidden="true"` to `ChevronRight` in `PostProductionModal.tsx`**
   - The decorative `ChevronRight` icon inside the "Confirm" button lacks `aria-hidden="true"`.
3. **Add `aria-hidden="true"` to `ChevronRight` in `CastingFeedback.tsx`**
   - The decorative `ChevronRight` icon used as a bullet point lacks `aria-hidden="true"`.
4. **Add `aria-hidden="true"` to `ChevronDown` in `ProjectMarketingTab.tsx`**
   - The decorative `ChevronDown` icons inside the select buttons lack `aria-hidden="true"`.
5. **Run tests and linting**
   - Execute `bun run lint` and `bun run test` to verify changes.
6. **Pre-commit checks**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
7. **Submit PR**
   - Create a PR titled "🎨 Palette: Add aria-hidden to decorative chevron icons" with the appropriate description.
