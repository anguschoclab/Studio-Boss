## 2024-09-02 - Electron Global Navigation Security
**Vulnerability:** Navigation events and window open handlers were only bound to `mainWindow.webContents`, leaving other created webContents potentially vulnerable to unauthorized navigation or window creation.
**Learning:** In Electron applications, it is insufficient to apply navigation restrictions only to specific `BrowserWindow` instances. Other windows or web contents created dynamically may bypass these protections.
**Prevention:** Always apply `will-navigate` and `setWindowOpenHandler` security restrictions globally using `app.on("web-contents-created", (event, contents) => { ... })` to ensure all main frames and web views are protected.
