## 2024-05-24 - Missing Explicit Sandbox in Electron webPreferences

**Vulnerability:** `BrowserWindow` was created without explicitly setting `sandbox: true` in `webPreferences`.
**Learning:** While `sandbox` might be true by default in modern Electron versions, explicitly defining it provides defense-in-depth and prevents silent regressions if default behaviors change in future versions.
**Prevention:** Always explicitly define `sandbox: true` in `webPreferences` when creating a new `BrowserWindow`.
