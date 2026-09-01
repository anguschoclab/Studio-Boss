## 2025-03-08 - Global Navigation Restriction
**Vulnerability:** Electron allowed arbitrary webContents (e.g. popups or new windows) to navigate to unauthorized URLs because `will-navigate` and `setWindowOpenHandler` were only bound to `mainWindow.webContents`.
**Learning:** Security handlers must be applied globally to all webContents via `app.on("web-contents-created")` rather than instance-specific bindings to prevent navigation bypasses via window creation.
**Prevention:** Always register navigation guards and window open handlers on the global `app.on("web-contents-created")` event.
