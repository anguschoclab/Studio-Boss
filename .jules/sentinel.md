## 2024-10-04 - Explicit Electron Sandbox Configuration
**Vulnerability:** Missing explicit sandbox configuration in BrowserWindow webPreferences.
**Learning:** Relying on default Electron framework behavior for security settings (like `sandbox`) can lead to regressions if defaults change in future versions.
**Prevention:** Always explicitly define `sandbox: true` in the `BrowserWindow`'s `webPreferences` configuration to ensure defense-in-depth.
