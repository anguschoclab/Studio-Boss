## 2025-03-31 - Filter and Search Accessibility

**Learning:** Search and filter `<Input>` components that only rely on `placeholder` text (like `Filter property...` or `Search SBDB...`) without accompanying `<label>` elements or `aria-label` attributes are inaccessible to screen reader users, leaving them without context for the input field's purpose.

**Action:** Always add descriptive `aria-label` attributes to these `<Input>` elements to ensure semantic correctness and full keyboard/screen-reader accessibility without compromising the visual design.
