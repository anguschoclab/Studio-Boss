## 2024-05-24 - Insecure Sidebar Cookie Assignment
**Vulnerability:** The sidebar state was being persisted in `document.cookie` without the `SameSite` attribute, making the application potentially vulnerable to CSRF if that cookie were used for sensitive state.
**Learning:** Client-side cookie persistence must always use security attributes like `SameSite=Lax` to prevent default insecure browser behavior.
**Prevention:** Always append `; SameSite=Lax` (or `Strict`) when manually assigning to `document.cookie`.

## 2024-05-24 - Enhance Content Security Policy by removing unsafe-eval
**Vulnerability:** The application's Content Security Policy allowed 'unsafe-eval', which could potentially allow the execution of malicious scripts via eval() or new Function().
**Learning:** Removing 'unsafe-eval' from the CSP significantly reduces the attack surface for Cross-Site Scripting (XSS) vulnerabilities.
**Prevention:** Always strive for the strictest possible Content Security Policy, avoiding 'unsafe-eval' and 'unsafe-inline' where possible.

## 2025-03-09 - Strengthened Content Security Policy (CSP)
**Vulnerability:** Weak CSP lacking defense-in-depth directives for object, base-uri, and form-action.
**Learning:** Even static/frontend-only React apps need strict CSP directives to prevent class of attacks like Base Tag Hijacking and Object Injection, regardless of framework escaping.
**Prevention:** Always include `object-src 'none'; base-uri 'self'; form-action 'self';` in baseline CSPs for web applications.
