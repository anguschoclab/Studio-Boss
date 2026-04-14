'use strict';

const { app, BrowserWindow, protocol, net, shell, Menu, ipcMain, Notification, dialog, Tray } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const DIST = path.join(__dirname, '../dist');
const IS_DEV = process.env.NODE_ENV === 'development';

// Initialize electron-store for configuration persistence
// Use a simple JSON-based store instead of electron-store to avoid ESM/CJS issues
const store = {
  get: (key) => {
    try {
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'config.json');
      if (fs.existsSync(configPath)) {
        const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return data[key];
      }
      return undefined;
    } catch (e) {
      console.error('Store get error:', e);
      return undefined;
    }
  },
  set: (key, value) => {
    try {
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'config.json');
      let data = {};
      if (fs.existsSync(configPath)) {
        data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      }
      data[key] = value;
      fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
      return true;
    } catch (e) {
      console.error('Store set error:', e);
      return false;
    }
  },
  delete: (key) => {
    try {
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'config.json');
      if (fs.existsSync(configPath)) {
        const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        delete data[key];
        fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
      }
      return true;
    } catch (e) {
      console.error('Store delete error:', e);
      return false;
    }
  }
};

// Set up save directory structure
const getSaveDir = () => {
  const userDataPath = app.getPath('userData');
  const saveDir = path.join(userDataPath, 'saves');
  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }
  return saveDir;
};

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

let mainWindow = null;
let tray = null;

function createWindow() {
  // Load saved window bounds if available
  const savedBounds = store.get('windowBounds');
  const width = savedBounds?.width || 1440;
  const height = savedBounds?.height || 900;
  const x = savedBounds?.x;
  const y = savedBounds?.y;

  mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
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
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in the real browser, not inside the app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  if (IS_DEV) {
    // In dev mode load the Vite dev server
    mainWindow.loadURL('http://localhost:8081');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL('app://index.html');
  }

  // Create system tray
  createTray();

  // Save window bounds when window is moved or resized
  mainWindow.on('resize', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  });

  mainWindow.on('move', () => {
    const bounds = mainWindow.getBounds();
    store.set('windowBounds', bounds);
  });
}

function createTray() {
  if (tray) return; // Already created

  // For now, use a simple icon path - in production you'd use a proper icon
  const iconPath = path.join(__dirname, '../public/pwa-512x512.png');
  
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Studio Boss',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore();
          }
          mainWindow.focus();
        }
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Studio Boss');
  tray.setContextMenu(contextMenu);
  
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

// IPC Handlers

// File system operations
ipcMain.handle('save-game', async (event, slot, state) => {
  try {
    const saveDir = getSaveDir();
    const savePath = path.join(saveDir, `slot_${slot}.sb`);
    fs.writeFileSync(savePath, JSON.stringify(state, null, 2));
    return true;
  } catch (error) {
    console.error('Save error:', error);
    return false;
  }
});

ipcMain.handle('load-game', async (event, slot) => {
  try {
    const saveDir = getSaveDir();
    const savePath = path.join(saveDir, `slot_${slot}.sb`);
    if (!fs.existsSync(savePath)) return null;
    const data = fs.readFileSync(savePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Load error:', error);
    return null;
  }
});

ipcMain.handle('list-saves', async () => {
  try {
    const saveDir = getSaveDir();
    if (!fs.existsSync(saveDir)) return [];
    const files = fs.readdirSync(saveDir).filter(f => f.endsWith('.sb'));
    return files.map(f => parseInt(f.replace('slot_', '').replace('.sb', '')));
  } catch (error) {
    console.error('List saves error:', error);
    return [];
  }
});

ipcMain.handle('delete-save', async (event, slot) => {
  try {
    const saveDir = getSaveDir();
    const savePath = path.join(saveDir, `slot_${slot}.sb`);
    if (fs.existsSync(savePath)) {
      fs.unlinkSync(savePath);
    }
    return true;
  } catch (error) {
    console.error('Delete save error:', error);
    return false;
  }
});

ipcMain.handle('export-save', async (event, slot) => {
  try {
    const saveDir = getSaveDir();
    const savePath = path.join(saveDir, `slot_${slot}.sb`);
    if (!fs.existsSync(savePath)) return false;
    
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: `studio-boss-save-slot-${slot}.sb`,
      filters: [{ name: 'Studio Boss Save', extensions: ['sb'] }]
    });
    
    if (canceled || !filePath) return false;
    fs.copyFileSync(savePath, filePath);
    return true;
  } catch (error) {
    console.error('Export save error:', error);
    return false;
  }
});

ipcMain.handle('import-save', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'Studio Boss Save', extensions: ['sb'] }],
      properties: ['openFile']
    });
    
    if (canceled || filePaths.length === 0) return null;
    
    const data = fs.readFileSync(filePaths[0], 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Import save error:', error);
    return null;
  }
});

// electron-store operations
ipcMain.handle('store-get', async (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', async (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('store-delete', async (event, key) => {
  store.delete(key);
  return true;
});

// Native notifications
ipcMain.handle('show-notification', async (event, options) => {
  if (Notification.isSupported()) {
    new Notification(options).show();
  }
  return true;
});

// Window controls
ipcMain.handle('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// Worker operations (simulation engine)
// Import and use the simulation engine functions directly

// Dock badge support for Mac
ipcMain.handle('set-badge', (event, count) => {
  if (process.platform === 'darwin') {
    app.dock.setBadge(count.toString());
  } else if (process.platform === 'win32' && mainWindow) {
    // Windows taskbar badge - use setOverlayBadgeCount (Electron 27+)
    if (mainWindow.setOverlayBadgeCount) {
      mainWindow.setOverlayBadgeCount(count);
    }
    // Fallback for older Electron versions
    if (mainWindow.setOverlayIcon) {
      // For older versions, we would need to create a badge image
      // For now, skip this as it requires image generation
      mainWindow.setOverlayIcon(null, count > 0 ? count.toString() : '');
    }
  }
});

ipcMain.handle('worker-init-game', async (event, studioName, archetype, seed) => {
  try {
    // Import the game initialization function
    // Note: This requires the engine to be transpiled to CommonJS or we need to use dynamic import
    // For now, we'll return a placeholder that the renderer can use
    console.log('[Main Process] init-game called with:', studioName, archetype, seed);
    // In a full implementation, we would call the actual engine functions here
    // For now, we'll let the renderer handle the worker
    return null; // This signals to use the renderer worker fallback
  } catch (error) {
    console.error('Worker init-game error:', error);
    return null;
  }
});

ipcMain.handle('worker-advance-week', async (event, state) => {
  try {
    console.log('[Main Process] advance-week called');
    // In a full implementation, we would call the actual engine functions here
    // For now, we'll let the renderer handle the worker
    return null; // This signals to use the renderer worker fallback
  } catch (error) {
    console.error('Worker advance-week error:', error);
    return null;
  }
});

// App info
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return process.platform;
});

app.whenReady().then(() => {
  // Set file associations for Windows
  if (process.platform === 'win32') {
    app.setAsDefaultProtocolClient('studio-boss');
  }

  // Handle app:// requests by serving files from dist/
  protocol.handle('app', (request) => {
    // Strip scheme, query string, and fragment
    let pathname = request.url.slice('app://'.length);
    pathname = pathname.split('?')[0].split('#')[0];

    try {
      pathname = decodeURIComponent(pathname);
    } catch (e) {
      return net.fetch(pathToFileURL(path.join(DIST, 'index.html')).toString());
    }

    // Remove leading slash produced by standard-scheme resolution
    if (pathname.startsWith('/')) pathname = pathname.slice(1);

    // Resolve path and ensure it's within DIST to prevent path traversal
    const filePath = path.resolve(DIST, pathname);
    const relative = path.relative(DIST, filePath);
    const isSafe = relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));

    // If the file exists and is within DIST, serve it; otherwise fall back to index.html (SPA routing)
    const target =
      isSafe && fs.existsSync(filePath) && fs.statSync(filePath).isFile()
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
