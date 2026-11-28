# LocalShare Architecture

This document outlines the architecture, component interaction, and design decisions behind **LocalShare**.

---

## High-Level Overview

LocalShare consists of three distinct, loosely coupled layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                      DESKTOP HOST MACHINE                       │
│                                                                 │
│  ┌───────────────────────────┐    ┌──────────────────────────┐  │
│  │   Desktop UI (Renderer)   │    │ Electron Main & IPC Host │  │
│  │   • Next.js 14 (Exported) │◄──►│ • Window & Tray lifecycle│  │
│  │   • React 18 & Tailwind   │    │ • Network IP detection   │  │
│  │   • Lucide Icons          │    │ • ConfigStore persistence│  │
│  └───────────────────────────┘    └────────────┬─────────────┘  │
│                                                │ IPC Bridge     │
│                                                ▼                │
│                                   ┌──────────────────────────┐  │
│                                   │ Local HTTP Core Server   │  │
│                                   │ • HTTP 206 Range Stream  │  │
│                                   │ • Directory Sandboxing   │  │
│                                   │ • Device Tracker         │  │
│                                   │ • Inlined Web Client     │  │
│                                   └────────────┬─────────────┘  │
└────────────────────────────────────────────────┼────────────────┘
                                                 │ Wi-Fi / Local Area Network
                                                 ▼
                               ┌──────────────────────────────────┐
                               │     CONNECTED CLIENT DEVICE      │
                               │   (Phone, Tablet, Laptop, TV)    │
                               │                                  │
                               │ • Standard Browser (Chrome/Safari│
                               │ • Zero Installation Required     │
                               │ • Preact Single-Page App (~51 KB)│
                               │ • Custom HTML5 Video Player      │
                               └──────────────────────────────────┘
```

---

## 1. Desktop GUI (Renderer Process)
* **Location**: [`server/desktop/`](../server/desktop/) & [`src/app/`](../src/app/)
* **Stack**: Next.js 14 (static export to `out/`), React 18, Tailwind CSS, Lucide React.
* **Responsibilities**:
  * Provides a modern desktop management dashboard.
  * Allows host users to add, remove, rename, and toggle shared directories.
  * Displays active network addresses and renders dynamic QR codes via `qrcode`.
  * Monitors active connections and connected client devices.
  * Adjusts host server settings (port, theme, password protection, launch at startup).

---

## 2. Electron Main Process & IPC Bridge
* **Location**: [`server/electron/`](../server/electron/)
* **Files**:
  * [`main.ts`](../server/electron/main.ts): Controls Electron application lifecycle, window instantiation, and system tray integration.
  * [`preload.ts`](../server/electron/preload.ts): Uses `contextBridge.exposeInMainWorld` to expose secure, typed IPC methods (`window.electronAPI`) to the renderer process without granting Node.js access to the browser window.
  * [`ipc.ts`](../server/electron/ipc.ts): Handles IPC channels (`get-status`, `start-server`, `stop-server`, `add-folder`, `remove-folder`, etc.) and delegates commands to the server core and store.
  * [`store.ts`](../server/electron/store.ts): Manages configuration file persistence (`localshare-config.json`).
  * [`network.ts`](../server/electron/network.ts): Enumerates network interfaces to detect the primary local IPv4 address.
  * [`tray.ts`](../server/electron/tray.ts): Manages the native OS system tray icon and background running behavior.

---

## 3. Local HTTP Sharing Engine (Core)
* **Location**: [`server/core/`](../server/core/)
* **Files**:
  * [`server.ts`](../server/core/server.ts): Lightweight native Node.js HTTP server that handles file indexing, downloads, and streaming.
  * [`security.ts`](../server/core/security.ts): Enforces path traversal defenses (`path.resolve`) to verify that all requested file paths strictly reside within the user's enabled shared folders.
  * [`tracker.ts`](../server/core/tracker.ts): Identifies connected client IP addresses and user agents, tracking live heartbeats and connection states.
  * [`client-provider.ts`](../server/core/client-provider.ts): Inlines the bundled Preact web application directly into initial HTTP responses.

### Media Streaming (HTTP 206 Partial Content)
To support large video and audio playback without exhausting mobile browser memory or waiting for entire file downloads, `server.ts` implements RFC 7233 HTTP Range Requests:
1. Detects `Range: bytes=start-end` request headers.
2. Calculates byte offsets and chunks.
3. Responds with status `206 Partial Content` and `Content-Range: bytes start-end/total`.
4. Streams the requested byte slice using `fs.createReadStream({ start, end })`.

---

## 4. Zero-Install Web Client
* **Location**: [`client/`](../client/)
* **Stack**: Preact 11, TypeScript, bundled with `esbuild`.
* **Output**: Single bundled file (`client/bundle.js`, ~51 KB) with zero external network dependencies.
* **Key Components**:
  * [`App.tsx`](../client/src/App.tsx): Root layout with search filtering, view mode toggles (grid vs. table), and navigation.
  * [`VideoPlayer.tsx`](../client/src/components/VideoPlayer.tsx): Custom HTML5 video player supporting time scrubbing, playback rate control, volume adjustment, and picture-in-picture.
  * [`PreviewModal.tsx`](../client/src/components/PreviewModal.tsx): In-browser preview for images, audio, video, and text files.
  * [`PasswordGate.tsx`](../client/src/components/PasswordGate.tsx): Authentication gate for password-protected sessions.

---

## 5. Shared Type Definitions
* **Location**: [`shared/`](../shared/)
* **File**: [`types.ts`](../shared/types.ts)
* Contains single-source-of-truth TypeScript definitions for `SharedFolder`, `ServerSettings`, `FileItem`, `ConnectedDevice`, and `ServerStatus` shared across Electron, Next.js, and Preact.
