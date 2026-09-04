## 2025-02-27 - Global WebContents Security in Electron
**Vulnerability:** Navigation events and window open handlers were only restricted on the primary `mainWindow.webContents`.
**Learning:** Any new windows or child web contents created would bypass these security restrictions, potentially allowing unauthorized navigation or popups.
**Prevention:** Always apply `will-navigate` and `setWindowOpenHandler` security restrictions globally using `app.on("web-contents-created")` to ensure all current and future web contents are secured.
