# LocalShare

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/Rahul0070050/localshare?color=green)](https://github.com/Rahul0070050/localshare/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey.svg)](#installation)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-33.2-47848F)](https://www.electronjs.org/)

> Fast, private local Wi-Fi file sharing and in-browser media streaming across all your devices — zero client installation required.

---

## About the Project

**LocalShare** turns your desktop computer into a local sharing hub. Anyone connected to your local Wi-Fi network can browse shared folders, download files, and stream media directly through their standard mobile or desktop web browser. 

Files transfer directly between devices over your local router at maximum local network speed, without consuming internet bandwidth or uploading data to third-party cloud servers.

---

## Screenshots

| Desktop Host Dashboard | Mobile Web Client |
| :---: | :---: |
| ![Desktop Dashboard](public/software-ui.png) | ![Mobile Client View](public/client-view.png) |

---

## Key Features

* **Zero-Install Client**: Any phone, tablet, or secondary PC connects instantly through a standard web browser.
* **Instant QR Code Pairing**: Scan an on-screen QR code with your phone camera to connect in seconds.
* **In-Browser Media Streaming**: Stream compatible video and audio formats smoothly using HTTP 206 Range seeking.
* **Selective Folder Sharing**: Choose specific directories to share; toggle them on/off or rename display labels anytime.
* **Directory Sandboxing**: Enforces strict path traversal defenses so clients cannot access files outside shared roots.
* **Optional Password Protection**: Secure shared sessions with an access password on shared or public Wi-Fi networks.
* **Live Connection Tracking**: Real-time dashboard view of active connected devices.
* **Cross-Platform Host**: Native packages available for Windows and Linux.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Desktop Host Shell** | [Electron 33](https://www.electronjs.org/), TypeScript |
| **Desktop GUI** | [Next.js 14](https://nextjs.org/) (Static Export), [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/) |
| **Local Server Core** | Node.js native HTTP server, RFC 7233 HTTP Range streaming |
| **Browser Web Client** | [Preact 11](https://preactjs.com/), TypeScript, bundled via [esbuild](https://esbuild.github.io/) (~51 KB) |
| **Packaging & CI/CD** | [electron-builder](https://www.electron.build/), GitHub Actions |

---

## Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18.x or 20.x LTS)
* npm (bundled with Node.js)

### 1. Clone & Install
```bash
git clone https://github.com/Rahul0070050/localshare.git
cd localshare
npm install
```

### 2. Build & Launch
```bash
# Compile client bundle, Next.js UI, and Electron backend
npm run build

# Start the desktop application
npm start
```

### 3. Package Binaries (Optional)
```bash
# Package for Windows (.exe installer)
npm run dist:win

# Package for Linux (.tar.gz archive)
npm run dist:linux:tar
```

For detailed platform prerequisites, packaging guides, and troubleshooting, see [docs/installation.md](docs/installation.md).

---

## Basic Usage

1. Launch **LocalShare** on your computer.
2. Click **Add Folder** to select one or more directories you wish to share.
3. Click **Start Sharing** to activate the local HTTP server.
4. Scan the on-screen **QR code** on your smartphone or open the displayed URL (e.g. `http://192.168.1.5:3000`) in any browser on the same Wi-Fi.
5. Browse folders, download files, or stream videos directly in the browser.

---

## Project Structure Overview

```text
localshare/
├── client/           # Preact web client served to connected browsers (~51 KB)
├── server/
│   ├── core/         # Node.js HTTP server, Range streaming, security, device tracker
│   ├── desktop/      # Next.js 14 host management dashboard
│   └── electron/     # Electron main process, preload script, IPC bridge, store
├── shared/           # Single-source-of-truth TypeScript types
├── test/             # Server and integration test suites
├── docs/             # In-depth architectural, installation, and configuration docs
└── package.json      # Dependencies, scripts, and build manifests
```

For an in-depth breakdown of system components, read [docs/architecture.md](docs/architecture.md).

---

## Documentation

* [Installation & Troubleshooting Guide](docs/installation.md)
* [System Architecture](docs/architecture.md)
* [Configuration & Security Options](docs/configuration.md)
* [Web Client Overview](client/README.md)
* [Server Tiers Overview](server/README.md)

---

## Contributing

Contributions make the open-source community thrive! We welcome bug fixes, documentation improvements, UI enhancements, and feature proposals.

Please review our [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting a Pull Request.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Author & Support

* **Author**: Rahul O R
* **GitHub**: [@Rahul0070050](https://github.com/Rahul0070050)
* **LinkedIn**: [Rahul O R](https://www.linkedin.com/in/rahul-or/)
* **Email**: [contact@localshare.app](mailto:contact@localshare.app)
* **Bug Reports**: [Open a GitHub Issue](https://github.com/Rahul0070050/localshare/issues)
