import { contextBridge, ipcRenderer } from 'electron';
import { LocalShareAPI, ServerStatus, ConnectedDevice, SharedFolder, ServerSettings } from '../shared/types';

const api: LocalShareAPI = {
  // Server controls
  getServerStatus: () => ipcRenderer.invoke('server:get-status'),
  startServer: () => ipcRenderer.invoke('server:start'),
  stopServer: () => ipcRenderer.invoke('server:stop'),
  getConnectedDevices: () => ipcRenderer.invoke('server:get-devices'),

  // Folder management
  selectFolderDialog: () => ipcRenderer.invoke('folders:select-dialog'),
  getSharedFolders: () => ipcRenderer.invoke('folders:get'),
  addFolder: (folderPath: string, displayName?: string) =>
    ipcRenderer.invoke('folders:add', folderPath, displayName),
  removeFolder: (id: string) => ipcRenderer.invoke('folders:remove', id),
  toggleFolder: (id: string, enabled: boolean) =>
    ipcRenderer.invoke('folders:toggle', id, enabled),
  renameFolder: (id: string, newDisplayName: string) =>
    ipcRenderer.invoke('folders:rename', id, newDisplayName),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (settings: Partial<ServerSettings>) =>
    ipcRenderer.invoke('settings:update', settings),

  // System & Utilities
  getNetworkInterfaces: () => ipcRenderer.invoke('network:get-interfaces'),
  openFolderInExplorer: (targetPath: string) =>
    ipcRenderer.invoke('shell:open-folder', targetPath),
  openExternalUrl: (url: string) => ipcRenderer.invoke('shell:open-external', url),
  generateQRCode: (text: string) => ipcRenderer.invoke('util:generate-qr', text),
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),

  // Window management
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // Subscriptions
  onServerStatusChanged: (callback: (status: ServerStatus) => void) => {
    const listener = (_: any, status: ServerStatus) => callback(status);
    ipcRenderer.on('server:status-changed', listener);
    return () => {
      ipcRenderer.removeListener('server:status-changed', listener);
    };
  },
  onDevicesUpdated: (callback: (devices: ConnectedDevice[]) => void) => {
    const listener = (_: any, devices: ConnectedDevice[]) => callback(devices);
    ipcRenderer.on('server:devices-updated', listener);
    return () => {
      ipcRenderer.removeListener('server:devices-updated', listener);
    };
  },
};

contextBridge.exposeInMainWorld('localShare', api);
