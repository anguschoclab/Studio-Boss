## 2024-09-05 - Fix navigation bypass in Electron
**Vulnerability:** Navigation events and open handler were only bound to `mainWindow.webContents`.
**Learning:** This is a bypass via window creation since new windows wouldn't have these handlers. They need to be bound on ALL webContents globally using `app.on("web-contents-created")`.
**Prevention:** Always bind webContents event listeners globally via `app.on("web-contents-created")` to ensure they apply to all instances.
