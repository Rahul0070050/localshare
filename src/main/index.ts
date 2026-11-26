import { app, BrowserWindow, protocol, net } from 'electron';
import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'fs';
import { ConfigStore } from './store';
import { LocalSharingServer } from '../server/index';
import { registerIpcHandlers } from './ipc';
import { TrayManager } from './tray';

// Register privileged custom scheme for serving Next.js static export
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

let mainWindow: BrowserWindow | null = null;
let store: ConfigStore;
let server: LocalSharingServer;
let trayManager: TrayManager;

// Single instance lock
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    store = new ConfigStore();
    server = new LocalSharingServer(
      () => store.getFolders(),
      () => store.getSettings()
    );

    // Register custom protocol handler 'app://'
    setupAppProtocol();

    // Create main window
    createWindow();

    // Register IPC handlers
    registerIpcHandlers(server, store, () => mainWindow);

    // Initialize System Tray
    trayManager = new TrayManager(server, store, () => mainWindow);
    trayManager.init();

    // Auto-start sharing if configured
    const settings = store.getSettings();
    if (settings.autoStartSharing) {
      try {
        await server.start(settings.port || 3000);
        trayManager.updateMenu();
      } catch (err) {
        console.error('Failed to auto-start sharing:', err);
      }
    }

    // Configure launch at startup
    if (app.isPackaged) {
      app.setLoginItemSettings({
        openAtLogin: Boolean(settings.launchAtStartup),
      });
    }

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('before-quit', async () => {
    if (trayManager) {
      trayManager.destroy();
    }
    if (server) {
      await server.stop();
    }
  });

  app.on('window-all-closed', () => {
    const settings = store?.getSettings();
    if (!settings?.minimizeToTray && process.platform !== 'darwin') {
      app.quit();
    }
  });
}

function setupAppProtocol(): void {
  protocol.handle('app', (request) => {
    const parsed = new URL(request.url);
    let pathname = decodeURIComponent(parsed.pathname);

    // Normalize outDir
    const baseDir = path.join(__dirname, '../../out');

    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }

    let filePath = path.join(baseDir, pathname);

    // If file doesn't exist, try appending .html or index.html
    if (!fs.existsSync(filePath)) {
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      } else {
        filePath = path.join(baseDir, 'index.html');
      }
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1060,
    height: 760,
    minWidth: 840,
    minHeight: 620,
    title: 'LocalShare',
    backgroundColor: '#090d16',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#090d16',
      symbolColor: '#94a3b8',
      height: 38,
    },
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle window close if minimizeToTray is enabled
  mainWindow.on('close', (event) => {
    const settings = store.getSettings();
    if (settings.minimizeToTray && !(app as any).isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Load URL
  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  if (isDev) {
    mainWindow.loadURL('http://localhost:3456');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadURL('app://localhost/index.html');
  }
}
