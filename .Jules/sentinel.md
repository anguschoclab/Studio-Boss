## 2024-05-24 - Missing Explicit Sandbox in Electron webPreferences

**Vulnerability:** `BrowserWindow` was created without explicitly setting `sandbox: true` in `webPreferences`.
**Learning:** While `sandbox` might be true by default in modern Electron versions, explicitly defining it provides defense-in-depth and prevents silent regressions if default behaviors change in future versions.
**Prevention:** Always explicitly define `sandbox: true` in `webPreferences` when creating a new `BrowserWindow`.

## 2026-11-03 - Missing Permission Restrictions in Electron

**Vulnerability:** Electron permitted unhandled permission requests (e.g., media, geolocation) by default.
**Learning:** Even with context isolation and sandboxing, missing permission request handlers can allow unauthorized access to sensitive hardware like cameras or microphones if a renderer is compromised.
**Prevention:** Explicitly deny unhandled permission requests by default using `session.defaultSession.setPermissionRequestHandler` (and for any custom partitions).
