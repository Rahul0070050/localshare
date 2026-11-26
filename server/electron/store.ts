import fs from 'fs';
import path from 'path';
import { SharedFolder, ServerSettings } from '../../shared/types';

interface ConfigData {
  folders: SharedFolder[];
  settings: ServerSettings;
}

const DEFAULT_SETTINGS: ServerSettings = {
  port: 3000,
  theme: 'dark',
  passwordProtection: false,
  autoStartSharing: false,
  minimizeToTray: false,
  launchAtStartup: false,
};

export class ConfigStore {
  private filePath: string;
  private data: ConfigData;

  constructor() {
    try {
      if (typeof process !== 'undefined' && process.versions && (process.versions as any).electron) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { app } = require('electron');
        const userDataDir = app.getPath('userData');
        this.filePath = path.join(userDataDir, 'localshare-config.json');
      } else {
        this.filePath = path.join(process.cwd(), 'localshare-config.json');
      }
    } catch {
      this.filePath = path.join(process.cwd(), 'localshare-config.json');
    }
    this.data = this.load();
  }

  public getFolders(): SharedFolder[] {
    return [...this.data.folders];
  }

  public setFolders(folders: SharedFolder[]): void {
    this.data.folders = folders;
    this.save();
  }

  public addFolder(originalPath: string, displayName?: string): SharedFolder {
    const existing = this.data.folders.find((f) => f.originalPath === originalPath);
    if (existing) {
      existing.enabled = true;
      if (displayName) existing.displayName = displayName;
      this.save();
      return existing;
    }

    const defaultName = path.basename(originalPath) || originalPath;
    const newFolder: SharedFolder = {
      id: 'f_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      originalPath,
      displayName: displayName || defaultName,
      enabled: true,
      createdAt: Date.now(),
    };

    this.data.folders.push(newFolder);
    this.save();
    return newFolder;
  }

  public removeFolder(id: string): boolean {
    const initialLen = this.data.folders.length;
    this.data.folders = this.data.folders.filter((f) => f.id !== id);
    if (this.data.folders.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  public toggleFolder(id: string, enabled: boolean): boolean {
    const folder = this.data.folders.find((f) => f.id === id);
    if (folder) {
      folder.enabled = enabled;
      this.save();
      return true;
    }
    return false;
  }

  public renameFolder(id: string, newDisplayName: string): boolean {
    const folder = this.data.folders.find((f) => f.id === id);
    if (folder) {
      folder.displayName = newDisplayName.trim() || folder.displayName;
      this.save();
      return true;
    }
    return false;
  }

  public getSettings(): ServerSettings {
    return { ...this.data.settings };
  }

  public updateSettings(partial: Partial<ServerSettings>): ServerSettings {
    this.data.settings = {
      ...this.data.settings,
      ...partial,
    };
    this.save();
    return { ...this.data.settings };
  }

  private load(): ConfigData {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          folders: Array.isArray(parsed.folders) ? parsed.folders : [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    } catch (err) {
      console.error('Failed to read config file, using defaults:', err);
    }

    return {
      folders: [],
      settings: { ...DEFAULT_SETTINGS },
    };
  }

  private save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save config file:', err);
    }
  }
}
