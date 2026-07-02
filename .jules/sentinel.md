## 2025-03-09 - Strengthened Content Security Policy (CSP)
**Vulnerability:** Weak CSP lacking defense-in-depth directives for object, base-uri, and form-action.
**Learning:** Even static/frontend-only React apps need strict CSP directives to prevent class of attacks like Base Tag Hijacking and Object Injection, regardless of framework escaping.
**Prevention:** Always include `object-src 'none'; base-uri 'self'; form-action 'self';` in baseline CSPs for web applications.
