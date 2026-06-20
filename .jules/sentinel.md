## 2024-05-24 - Insecure Sidebar Cookie Assignment
**Vulnerability:** The sidebar state was being persisted in `document.cookie` without the `SameSite` attribute, making the application potentially vulnerable to CSRF if that cookie were used for sensitive state.
**Learning:** Client-side cookie persistence must always use security attributes like `SameSite=Lax` to prevent default insecure browser behavior.
**Prevention:** Always append `; SameSite=Lax` (or `Strict`) when manually assigning to `document.cookie`.
