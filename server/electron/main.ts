import { app, BrowserWindow, protocol, net } from 'electron';
import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'fs';
import mime from 'mime-types';
import { ConfigStore } from './store';
import { LocalSharingServer } from '../core/server';
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

function getStaticOutDir(): string {
  // 1. Packaged app: check app.asar.unpacked/out
  try {
    if (process.resourcesPath) {
      const unpacked = path.join(process.resourcesPath, 'app.asar.unpacked', 'out');
      if (fs.existsSync(unpacked)) {
        return unpacked;
      }
    }
  } catch {}

  // 2. Packaged app: inside app.asar/out (via Electron fs virtual asar)
  try {
    const appPath = app.getAppPath();
    const asarOut = path.join(appPath, 'out');
    if (fs.existsSync(asarOut)) {
      return asarOut;
    }
  } catch {}

  // 3. Dev / unpackaged build: 3 levels up from dist-electron/server/electron
  const relPath = path.join(__dirname, '../../../out');
  if (fs.existsSync(relPath)) {
    return relPath;
  }

  // 4. Current working directory fallback
  const cwdOut = path.join(process.cwd(), 'out');
  if (fs.existsSync(cwdOut)) {
    return cwdOut;
  }

  return path.join(app.getAppPath(), 'out');
}

function setupAppProtocol(): void {
  protocol.handle('app', (request) => {
    try {
      const parsed = new URL(request.url);
      let pathname = decodeURIComponent(parsed.pathname);

      // Base directory for static Next.js export
      const baseDir = getStaticOutDir();

      if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
      }

      const cleanPath = pathname.replace(/^\/+/, '');
      let filePath = path.join(baseDir, cleanPath);

      // Fallbacks for HTML routes
      if (!fs.existsSync(filePath) || (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())) {
        if (fs.existsSync(filePath + '.html')) {
          filePath = filePath + '.html';
        } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
          filePath = path.join(filePath, 'index.html');
        } else {
          filePath = path.join(baseDir, 'index.html');
        }
      }

      if (!fs.existsSync(filePath)) {
        console.error('[app://] Resource not found:', filePath, 'request url:', request.url);
        return new Response('Not Found', { status: 404 });
      }

      const data = fs.readFileSync(filePath);
      const mimeType = (mime.lookup(filePath) as string) || 'application/octet-stream';
      const isText = mimeType.startsWith('text/') || mimeType === 'application/javascript' || mimeType === 'application/json';

      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': isText ? `${mimeType}; charset=utf-8` : mimeType,
          'Cache-Control': 'no-cache',
        },
      });
    } catch (err) {
      console.error('[app://] Protocol error:', err, request.url);
      return new Response('Internal Error', { status: 500 });
    }
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
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load page:', errorCode, errorDescription, validatedURL);
  });

  // Enable F12 toggle dev tools for troubleshooting
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow?.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Handle window close if minimizeToTray is enabled
  mainWindow.on('close', (event) => {
    const settings = store.getSettings();
    if (settings.minimizeToTray && !(app as any).isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  // Load URL - use root 'app://localhost/' for Next.js App Router root hydration
  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
  if (isDev) {
    mainWindow.loadURL('http://localhost:3456');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadURL('app://localhost/');
  }
}
