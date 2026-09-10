## 2024-05-18 - Globally Restrict Electron Navigation
**Vulnerability:** Unauthorized main frame navigation bypass possible when restrictions are only bound to specific `webContents` instances (e.g. `mainWindow.webContents`).
**Learning:** Instance-specific bindings do not cover windows/web contents created dynamically by the application or by exploits, allowing navigation policies to be bypassed.
**Prevention:** Always enforce `setWindowOpenHandler` and `will-navigate` globally within `app.on("web-contents-created", ...)` to ensure all `webContents` are secured.