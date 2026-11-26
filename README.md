# LocalShare — Cross-Platform Local Wi-Fi File Sharing

**LocalShare** is a fast, lightweight, and modern desktop application built with **Electron**, **Next.js**, **React**, **TypeScript**, and **Tailwind CSS**. It turns your computer into a local file-sharing server, allowing any phone, tablet, or PC on the same Wi-Fi network to browse and download files directly from a web browser—**with 100% offline functionality and zero internet required**.

---

## Key Features

- **Selective Folder Sharing**: Never shares your entire filesystem or home directory. Only explicitly chosen and enabled folders are accessible.
- **100% Offline Wi-Fi LAN Sharing**: Operates entirely over local network (no cloud, no accounts, no telemetry, no internet needed).
- **One-Click Start/Stop**: Instantly starts or shuts down the local HTTP file server on demand.
- **Automatic Network Discovery**: Automatically detects local IPv4 interfaces (Wi-Fi and Ethernet) and generates ready-to-share local network URLs (e.g., `http://192.168.1.100:3000`).
- **QR Code Sharing**: Integrated QR code generator for instant mobile scanning with iOS Camera or Android QR scanner.
- **Responsive Web File Explorer**:
  - Clean, mobile-friendly interface for connecting devices.
  - Browse folder hierarchies with breadcrumb navigation.
  - Live instant search and multi-criteria sorting (Name, Size, Date).
  - Grid and List views.
  - One-click downloads with original filenames and proper MIME types.
  - Rich media previews: Images, HTML5 Video & Audio (with HTTP 206 Range seeking), PDF viewer, and syntax-highlighted code/text.
- **Enterprise-Grade Security Core**:
  - Safe read-only mode by default (no uploads, deletions, or file mutations).
  - Directory traversal prevention (rejection of `..`, encoded `%2e%2e`, and null bytes).
  - Symlink boundary validation (verifies real target path stays strictly inside selected folder root).
  - Optional password protection with cryptographic session tokens.
- **Connected Devices & Visitor Tracking**:
  - Real-time logging of connected device IP addresses, browser User-Agent, device classification (Mobile, Tablet, Desktop), and request counts.
  - Clear distinction between "Active Now" (within last 2 minutes) and "Recent Visitors" (acknowledging HTTP statelessness).
- **Desktop Preferences**:
  - Configurable server port (1024–65535).
  - Dark, Light, and System themes.
  - Auto-start sharing on application launch.
  - Minimize to system tray.
  - Launch at operating system startup.

---

## Project Architecture & Directory Layout

The codebase follows a clean, modular software architecture separating the **Client UI** (web-based file explorer for connected devices), the **Server** (desktop host application & local HTTP sharing engine), and **Shared** contracts:

```
fileshare/
├── client/                     # Client Web Application (Responsive browser file explorer)
│   ├── src/
│   │   ├── components/         # Modular Client UI components
│   │   │   ├── Header.ts       # Glassmorphism header, brand, live connection badge, theme switch
│   │   │   ├── Breadcrumbs.ts  # Breadcrumb trail, back button, path jump
│   │   │   ├── SearchFilter.ts # Live search, category chips, sort dropdown, view mode toggle
│   │   │   ├── FileGrid.ts     # Grid cards with category badges, thumbnails, actions
│   │   │   ├── FileList.ts     # Compact tabular list view with sortable columns
│   │   │   ├── PreviewModal.ts # Rich media previewer (image zoom, video/audio seek, PDF, code)
│   │   │   ├── PasswordGate.ts # Security gate lock screen with session auth
│   │   │   └── EmptyState.ts   # Empty folder / no search results state
│   │   ├── styles/
│   │   │   ├── theme.ts        # Embedded design tokens, dark/light themes, animations
│   │   │   └── theme.css       # Client UI stylesheet
│   │   ├── state/
│   │   │   └── client-state.ts # Client state management, caching, history, sort/filter logic
│   │   └── app.ts              # Client application runtime & event dispatcher
│   └── builder.ts              # Bundles and optimizes the client app for 100% offline serving
│
├── server/                     # Server Application & Host Infrastructure
│   ├── desktop/                # Desktop Server UI (Next.js / React Linear-style Dashboard)
│   │   ├── app/                # Next.js App Router (Dashboard layout & pages)
│   │   └── components/         # Desktop UI components (ServerCard, FolderManager, Stats, Devices, Settings, QR)
│   ├── electron/               # Electron Main Process & Native Bridges
│   │   ├── main.ts             # Window lifecycle, protocol handler, tray
│   │   ├── preload.ts          # Secure typed IPC bridge
│   │   ├── ipc.ts              # IPC handlers & event broadcasters
│   │   ├── store.ts            # Persistent configuration store
│   │   ├── network.ts          # Multi-adapter local IP detection
│   │   └── tray.ts             # System tray menu and status
│   └── core/                   # Local HTTP File Sharing Server & Security Engine
│       ├── server.ts           # HTTP server, routing & streaming
│       ├── security.ts         # Traversal defense, symlink boundary checks
│       ├── tracker.ts          # Connected device tracking & analytics
│       └── client-provider.ts  # Serves the modular Client UI application
│
├── shared/                     # Shared domain types, contracts & constants
│   └── types.ts                # SharedFolder, ServerSettings, ServerStatus, ConnectedDevice, FileItem, BrowseResult
│
├── test/                       # Automated Test Suites
│   ├── test-server.ts          # Unit & Security tests (10/10 tests)
│   └── test-integration.ts     # End-to-end integration tests
│
└── dist/                       # Packaged Desktop Executables & Installers
    ├── LocalShare 1.0.0.exe    # Standalone portable Windows executable
    ├── LocalShare Setup 1.0.0.exe # Windows NSIS installer
    └── win-unpacked/           # Unpacked binary directory
```

---

## Security Verification

LocalShare includes an automated test suite verifying:
1. **Directory Traversal Defense**: Blocks `../`, `..%2f`, and encoded traversal.
2. **Null-byte Injection Rejection**: Rejects `%00` truncations.
3. **Symlink Boundary Checks**: Ensures symlinks pointing outside the shared folder are denied with `403 Forbidden`.
4. **Disabled Folder Cloaking**: Disabled folders return `404 Not Found` immediately.
5. **Safe Content-Disposition**: Sets attachment filenames with RFC 5987 UTF-8 encoding.
6. **HTTP Range Requests**: Serves `206 Partial Content` with `Content-Range` headers for seekable video/audio streaming.
7. **Password Protection Gate**: Protects browse and download endpoints behind session token authorization.

Run the test suites:
```bash
# Unit & Security suite
npm test

# Full End-to-End Integration suite
node dist-electron/test/test-integration.js
```

---

## Development

### Prerequisites
- Node.js 18+ (tested on Node v20 & v24)
- npm or pnpm

### Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Build TypeScript for main & server
npm run build:electron

# 3. Build Next.js static renderer
npm run build:renderer

# 4. Launch Desktop App
npm start
```

---

## Building Desktop Packages

LocalShare uses `electron-builder` to produce standalone native binaries:

### Windows
```bash
# Generate Windows NSIS Installer (.exe) and Portable executable
npm run dist:win
```
Outputs to `dist/`:
- `LocalShare Setup 1.0.0.exe` (NSIS Installer)
- `LocalShare 1.0.0.exe` (Portable executable)

### Linux
```bash
# Generate Linux AppImage and Debian package (.deb)
npm run dist:linux
```
Outputs to `dist/`:
- `LocalShare-1.0.0.AppImage` (Universal Linux executable)
- `localshare_1.0.0_amd64.deb` (Debian, Ubuntu, Linux Mint, Parrot OS)

---

## License

MIT License. Designed and engineered for private, fast local file sharing.
