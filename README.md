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

## Architecture

LocalShare is architected with strict process isolation and security boundaries:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LocalShare Desktop App                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│      Electron Main Process       │         Next.js Renderer UI         │
│  - App lifecycle & System Tray   │  - Linear/Raycast modern dashboard  │
│  - Persistent ConfigStore        │  - Folder Manager & Stats Cards     │
│  - Network interface detector    │  - QR Code Modal & Settings         │
│  - IPC dispatcher                │  - Safe typed IPC bridge            │
└────────────────┬─────────────────┴──────────────────▲──────────────────┘
                 │                                    │ Preload (contextBridge)
                 ▼                                    │
┌──────────────────────────────────┐                  │
│       Local Sharing Server       │──────────────────┘
│  - Native Node.js HTTP server    │
│  - Path traversal & symlink gate │
│  - Range streaming (HTTP 206)    │
│  - Visitor & device tracker      │
│  - 100% offline Web Explorer SPA │
└────────────────┬─────────────────┘
                 │
                 ▼ Local Wi-Fi Network (0.0.0.0:3000)
┌────────────────────────────────────────────────────────────────────────┐
│                   Connected Devices (Phone, Tablet, PC)                │
│  - Opens http://192.168.x.x:3000 in Chrome / Safari / Firefox          │
│  - Zero installation required on client devices                        │
└────────────────────────────────────────────────────────────────────────┘
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
