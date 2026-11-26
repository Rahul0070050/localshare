export interface SharedFolder {
  id: string;
  originalPath: string;
  displayName: string;
  enabled: boolean;
  createdAt: number;
  itemCount?: number;
  totalSize?: number;
}

export interface ServerSettings {
  port: number;
  theme: 'dark' | 'light' | 'system';
  passwordProtection: boolean;
  password?: string;
  autoStartSharing: boolean;
  minimizeToTray: boolean;
  launchAtStartup: boolean;
}

export interface NetworkInterfaceInfo {
  name: string;
  address: string;
  family: string;
  internal: boolean;
}

export interface ServerStatus {
  running: boolean;
  port: number;
  localIps: NetworkInterfaceInfo[];
  primaryIp: string;
  sharingUrl: string;
  error?: string;
  startTime?: number;
  totalRequests: number;
  activeVisitorsCount: number;
  totalVisitorsCount: number;
}

export interface ConnectedDevice {
  ip: string;
  userAgent: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  firstSeen: number;
  lastSeen: number;
  requestCount: number;
  isActive: boolean; // active in last 2 mins
}

export type FileCategory =
  | 'folder'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'code'
  | 'archive'
  | 'other';

export interface FileItem {
  name: string;
  relativePath: string;
  folderId: string;
  isDirectory: boolean;
  size: number;
  mtime: number;
  extension: string;
  category: FileCategory;
  mimeType?: string;
}

export interface BrowseResult {
  currentPath: string;
  breadcrumbs: Array<{ label: string; path: string }>;
  isRoot: boolean;
  folderName?: string;
  items: FileItem[];
  totalFolders: number;
  totalFiles: number;
  parentPath?: string;
}

export interface LocalShareAPI {
  // Server controls
  getServerStatus: () => Promise<ServerStatus>;
  startServer: () => Promise<{ success: boolean; error?: string }>;
  stopServer: () => Promise<{ success: boolean; error?: string }>;
  getConnectedDevices: () => Promise<ConnectedDevice[]>;

  // Folder management
  selectFolderDialog: () => Promise<string[] | null>;
  getSharedFolders: () => Promise<SharedFolder[]>;
  addFolder: (folderPath: string, displayName?: string) => Promise<SharedFolder>;
  removeFolder: (id: string) => Promise<boolean>;
  toggleFolder: (id: string, enabled: boolean) => Promise<boolean>;
  renameFolder: (id: string, newDisplayName: string) => Promise<boolean>;

  // Settings
  getSettings: () => Promise<ServerSettings>;
  updateSettings: (settings: Partial<ServerSettings>) => Promise<ServerSettings>;

  // System & Utilities
  getNetworkInterfaces: () => Promise<NetworkInterfaceInfo[]>;
  openFolderInExplorer: (path: string) => Promise<boolean>;
  openExternalUrl: (url: string) => Promise<boolean>;
  generateQRCode: (text: string) => Promise<string>;
  getAppVersion: () => Promise<string>;

  // Window actions
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;

  // Event listeners
  onServerStatusChanged: (callback: (status: ServerStatus) => void) => () => void;
  onDevicesUpdated: (callback: (devices: ConnectedDevice[]) => void) => () => void;
}

declare global {
  interface Window {
    localShare?: LocalShareAPI;
  }
}
