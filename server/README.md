# LocalShare Server Architecture

This directory houses the backend, desktop interface, and Electron application lifecycle code.

---

## Subdirectories

The server architecture is partitioned into three distinct tiers:

### 1. `server/core/` — Local HTTP Sharing Engine
* The native Node.js HTTP server that handles client connections.
* **Key files**:
  * `server.ts`: Starts the HTTP server, handles directory indexing requests, serves file downloads, and handles HTTP 206 Partial Content Range streaming.
  * `security.ts`: Implements directory sandboxing and path traversal validation (`isPathSafe`).
  * `tracker.ts`: Tracks active client IP addresses, parses user agents, and maintains connection heartbeats.
  * `client-provider.ts`: Inlines the Preact client bundle into the root HTML page.

### 2. `server/desktop/` — Host Management Dashboard
* The Next.js 14 application providing the host graphical user interface.
* **Key files**:
  * `app/page.tsx`: Two-column responsive desktop layout (Folder Manager + Device Tracker).
  * `components/FolderManager.tsx`: Interactive folder selection, toggle switches, and inline rename.
  * `components/DevicesList.tsx`: Live monitor of connected client devices.
  * `components/ServerCard.tsx`: Monospace network sharing URL, Copy link, and QR Code trigger.
  * `components/StatsOverview.tsx`: Metric cards showing active folders, files, and clients.
  * `components/SettingsModal.tsx`: Host port, theme, password protection, and boot preferences.

### 3. `server/electron/` — Native Desktop Wrapper & IPC
* Controls native OS operations and bridges Next.js with the Node core server.
* **Key files**:
  * `main.ts`: Electron window lifecycle, tray minimization, and protocol handlers.
  * `preload.ts`: Secure `contextBridge` exposing `window.electronAPI`.
  * `ipc.ts`: Type-safe Inter-Process Communication (IPC) handlers.
  * `network.ts`: Cross-platform local network interface and primary IPv4 discovery.
  * `store.ts`: Configuration persistence (`localshare-config.json`).
  * `tray.ts`: System tray context menu and background execution.

---

## Build Commands

```bash
# Compile desktop renderer (Next.js static export to out/)
npm run build:renderer

# Compile server core and Electron process (TypeScript to dist-electron/)
npm run build:electron
```
