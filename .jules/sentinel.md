## 2026-09-09 - [Electron Security: Global Navigation Handlers]
**Vulnerability:** [Navigation handlers only bound to `mainWindow.webContents`]
**Learning:** [In Electron, binding security event handlers like `will-navigate` and `setWindowOpenHandler` exclusively to a specific window's webContents leaves the app vulnerable to navigation bypasses if new windows or contexts are created (e.g., popups, `<webview>`, child windows).]
**Prevention:** [Bind security-critical navigation handlers globally using `app.on('web-contents-created', (event, contents) => { ... })` so they apply strictly to ALL web contents created throughout the application's lifecycle.]
