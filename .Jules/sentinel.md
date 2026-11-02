## 2024-05-24 - Missing Explicit Sandbox in Electron webPreferences

**Vulnerability:** `BrowserWindow` was created without explicitly setting `sandbox: true` in `webPreferences`.
**Learning:** While `sandbox` might be true by default in modern Electron versions, explicitly defining it provides defense-in-depth and prevents silent regressions if default behaviors change in future versions.
**Prevention:** Always explicitly define `sandbox: true` in `webPreferences` when creating a new `BrowserWindow`.

## 2024-10-24 - Default Permit-All Electron Permissions

**Vulnerability:** Unrestricted Electron permission requests allow web content to potentially access sensitive hardware like camera, microphone, or geolocation.
**Learning:** Even with context isolation and sandbox enabled, unhandled permission requests can be a vector for exploitation or privacy leakage.
**Prevention:** explicitly deny all permissions by default using `setPermissionRequestHandler`, unless specifically required.
