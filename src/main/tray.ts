import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import { LocalSharingServer } from '../server/index';
import { ConfigStore } from './store';

export class TrayManager {
  private tray: Tray | null = null;
  private server: LocalSharingServer;
  private store: ConfigStore;
  private getMainWindow: () => BrowserWindow | null;

  constructor(
    server: LocalSharingServer,
    store: ConfigStore,
    getMainWindow: () => BrowserWindow | null
  ) {
    this.server = server;
    this.store = store;
    this.getMainWindow = getMainWindow;
  }

  public init(): void {
    // 16x16 icon in RGBA format (blue circle with share symbol)
    const size = 16;
    const buf = Buffer.alloc(size * size * 4);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - 7.5;
        const dy = y - 7.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * size + x) * 4;
        if (dist <= 7) {
          buf[idx] = 59;     // R
          buf[idx + 1] = 130; // G
          buf[idx + 2] = 246; // B
          buf[idx + 3] = 255; // A
        } else {
          buf[idx + 3] = 0;   // Transparent
        }
      }
    }

    const icon = nativeImage.createFromBuffer(buf, { width: size, height: size });
    this.tray = new Tray(icon);
    this.tray.setToolTip('LocalShare — Local Wi-Fi File Sharing');

    this.tray.on('click', () => {
      this.toggleWindow();
    });

    this.updateMenu();
  }

  public updateMenu(): void {
    if (!this.tray) return;

    const isRunning = this.server.isRunning();
    const port = this.server.getPort();

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'LocalShare',
        enabled: false,
      },
      {
        label: isRunning ? `Status: Running (Port ${port})` : 'Status: Stopped',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: isRunning ? 'Stop Sharing' : 'Start Sharing',
        click: async () => {
          if (isRunning) {
            await this.server.stop();
          } else {
            const settings = this.store.getSettings();
            await this.server.start(settings.port || 3000);
          }
          this.updateMenu();
          const win = this.getMainWindow();
          if (win && !win.isDestroyed()) {
            win.webContents.send('server:status-changed');
          }
        },
      },
      {
        label: 'Open Dashboard',
        click: () => {
          this.showWindow();
        },
      },
      { type: 'separator' },
      {
        label: 'Quit LocalShare',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  private toggleWindow(): void {
    const win = this.getMainWindow();
    if (!win) return;
    if (win.isVisible()) {
      win.hide();
    } else {
      this.showWindow();
    }
  }

  private showWindow(): void {
    const win = this.getMainWindow();
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
  }

  public destroy(): void {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
