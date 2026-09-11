## 2024-09-12 - [Prevent Window Navigation Bypasses]
**Vulnerability:** Restricting navigation only on `mainWindow.webContents` leaves the app vulnerable to navigation bypasses if new windows or webContents are created.
**Learning:** Navigation restrictions (`will-navigate`, `setWindowOpenHandler`) should be applied globally via `app.on('web-contents-created')` to affect all `webContents`.
**Prevention:** Apply security handlers to all web contents, not just the initial main window instance.