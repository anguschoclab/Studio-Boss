'use strict';

const { app, BrowserWindow, protocol, net, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const DIST = path.join(__dirname, '../dist');
const IS_DEV = process.env.NODE_ENV === 'development';

// Register app:// as a privileged scheme BEFORE app is ready.
// This gives it the same capabilities as https:// — history API, fetch, localStorage, etc.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#0a0e1a',
    // macOS: hide the title bar but keep the traffic lights
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      // Allow localStorage / IndexedDB to persist between launches
      partition: 'persist:studio-boss',
    },
    // Don't show until the page has painted to avoid a white flash
    show: false,
  });

  // Show once first paint is done
  win.once('ready-to-show', () => {
    win.show();
  });

  // Open external links in the real browser, not inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  if (IS_DEV) {
    // In dev mode load the Vite dev server
    win.loadURL('http://localhost:8081');
    win.webContents.openDevTools();
  } else {
    win.loadURL('app://index.html');
  }
}

app.whenReady().then(() => {
  // Handle app:// requests by serving files from dist/
  protocol.handle('app', (request) => {
    // Strip scheme, query string, and fragment
    let pathname = request.url.slice('app://'.length);
    pathname = pathname.split('?')[0].split('#')[0];

    // Remove leading slash produced by standard-scheme resolution
    if (pathname.startsWith('/')) pathname = pathname.slice(1);

    const filePath = path.join(DIST, pathname);

    // If the file exists, serve it; otherwise fall back to index.html (SPA routing)
    const target =
      fs.existsSync(filePath) && fs.statSync(filePath).isFile()
        ? filePath
        : path.join(DIST, 'index.html');

    return net.fetch(pathToFileURL(target).toString());
  });

  // Minimal Mac menu (keeps Cmd+Q, Cmd+W, Cmd+R working)
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        ...(IS_DEV ? [{ role: 'toggleDevTools' }] : []),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  createWindow();

  // macOS: re-create window when clicking the dock icon if no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
