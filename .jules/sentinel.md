## 2024-09-03 - [CRITICAL] Prevent unauthorized navigation bypass via global webContents handlers
**Vulnerability:** Navigation and window creation protections were bound only to the specific `mainWindow.webContents`.
**Learning:** Attaching navigation handlers per window creates a bypass vulnerability where any new window/webContents spawned could evade restrictions.
**Prevention:** Always attach `will-navigate` and `setWindowOpenHandler` globally via `app.on("web-contents-created", (event, contents) => { ... })`.