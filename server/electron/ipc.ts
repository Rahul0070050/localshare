import { ipcMain, dialog, shell, BrowserWindow, app } from 'electron';
import QRCode from 'qrcode';
import { LocalSharingServer } from '../core/server';
import { ConfigStore } from './store';
import { getLocalNetworkInterfaces, getPrimaryLocalIp } from './network';
import { ServerStatus, ConnectedDevice, SharedFolder, ServerSettings } from '../../shared/types';

export function registerIpcHandlers(
  server: LocalSharingServer,
  store: ConfigStore,
  getMainWindow: () => BrowserWindow | null
): void {
  const getStatus = (): ServerStatus => {
    const isRunning = server.isRunning();
    const port = server.getPort();
    const localIps = getLocalNetworkInterfaces();
    const primaryIp = getPrimaryLocalIp();
    const sharingUrl = isRunning ? `http://${primaryIp}:${port}` : '';
    const tracker = server.getTracker();

    return {
      running: isRunning,
      port,
      localIps,
      primaryIp,
      sharingUrl,
      startTime: server.getStartTime() || undefined,
      totalRequests: tracker.getTotalRequests(),
      activeVisitorsCount: tracker.getActiveCount(),
      totalVisitorsCount: tracker.getTotalVisitorsCount(),
    };
  };

  const notifyStatusChanged = () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('server:status-changed', getStatus());
    }
  };

  const notifyDevicesUpdated = () => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('server:devices-updated', server.getTracker().getDevices());
    }
  };

  // Periodic poll to broadcast visitor & device updates when server is running
  setInterval(() => {
    if (server.isRunning()) {
      notifyStatusChanged();
      notifyDevicesUpdated();
    }
  }, 3000);

  // Server management
  ipcMain.handle('server:get-status', async () => {
    return getStatus();
  });

  ipcMain.handle('server:start', async () => {
    try {
      const settings = store.getSettings();
      await server.start(settings.port || 3000);
      notifyStatusChanged();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to start server' };
    }
  });

  ipcMain.handle('server:stop', async () => {
    try {
      await server.stop();
      notifyStatusChanged();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to stop server' };
    }
  });

  ipcMain.handle('server:get-devices', async (): Promise<ConnectedDevice[]> => {
    return server.getTracker().getDevices();
  });

  // Folder selection and management
  ipcMain.handle('folders:select-dialog', async () => {
    const win = getMainWindow();
    const result = await dialog.showOpenDialog(win || undefined as any, {
      title: 'Select Folder to Share with Local Network',
      properties: ['openDirectory', 'multiSelections', 'dontAddToRecent'],
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths;
  });

  ipcMain.handle('folders:get', async (): Promise<SharedFolder[]> => {
    return store.getFolders();
  });

  ipcMain.handle('folders:add', async (_, folderPath: string, displayName?: string) => {
    const added = store.addFolder(folderPath, displayName);
    return added;
  });

  ipcMain.handle('folders:remove', async (_, id: string) => {
    return store.removeFolder(id);
  });

  ipcMain.handle('folders:toggle', async (_, id: string, enabled: boolean) => {
    return store.toggleFolder(id, enabled);
  });

  ipcMain.handle('folders:rename', async (_, id: string, newDisplayName: string) => {
    return store.renameFolder(id, newDisplayName);
  });

  // Settings
  ipcMain.handle('settings:get', async (): Promise<ServerSettings> => {
    return store.getSettings();
  });

  ipcMain.handle('settings:update', async (_, partial: Partial<ServerSettings>) => {
    const updated = store.updateSettings(partial);
    // If port changed while running, restart on new port
    if (partial.port && server.isRunning() && partial.port !== server.getPort()) {
      try {
        await server.stop();
        await server.start(partial.port);
        notifyStatusChanged();
      } catch (err) {
        console.error('Failed to restart server on new port:', err);
      }
    }
    return updated;
  });

  // System & Utilities
  ipcMain.handle('network:get-interfaces', async () => {
    return getLocalNetworkInterfaces();
  });

  ipcMain.handle('shell:open-folder', async (_, targetPath: string) => {
    try {
      const err = await shell.openPath(targetPath);
      return !err;
    } catch {
      return false;
    }
  });

  ipcMain.handle('shell:open-external', async (_, url: string) => {
    try {
      await shell.openExternal(url);
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('util:generate-qr', async (_, text: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      return dataUrl;
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      return '';
    }
  });

  ipcMain.handle('app:get-version', async () => {
    return app.getVersion();
  });

  // Window controls
  ipcMain.on('window:minimize', () => {
    const win = getMainWindow();
    if (win) win.minimize();
  });

  ipcMain.on('window:maximize', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
      } else {
        win.maximize();
      }
    }
  });

  ipcMain.on('window:close', () => {
    const win = getMainWindow();
    if (win) {
      const settings = store.getSettings();
      if (settings.minimizeToTray) {
        win.hide();
      } else {
        win.close();
      }
    }
  });
}
