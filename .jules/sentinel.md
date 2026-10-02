## 2024-05-24 - Explicitly enable renderer sandboxing
**Vulnerability:** The Electron renderer process was relying on the default sandbox configuration.
**Learning:** While `sandbox: true` is the default in modern Electron versions, explicitly configuring it ensures the renderer remains sandboxed even if default behaviors change in future Electron versions.
**Prevention:** Always explicitly define security-critical configuration flags in `webPreferences` like `contextIsolation`, `nodeIntegration`, and `sandbox`.