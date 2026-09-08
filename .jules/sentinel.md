## 2024-05-23 - Global Navigation Hardening
**Vulnerability:** Electron navigation security handlers (`will-navigate`, `setWindowOpenHandler`) were only bound to the main window, leaving potential bypasses if other web contents or windows were created.
**Learning:** For Electron security, restricting navigation strictly to internal `app://` or verified local development URLs must apply globally to all `webContents`, not just instance-specific ones.
**Prevention:** Handle `will-navigate` and `setWindowOpenHandler` events on ALL `webContents` globally using `app.on("web-contents-created")`.
