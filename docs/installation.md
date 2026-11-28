# Installation & Troubleshooting Guide

This guide walks through setting up LocalShare from pre-built binary packages or building from source code on Windows and Linux.

---

## 1. Running Pre-Built Binaries

Pre-compiled production binaries are available on the [GitHub Releases](https://github.com/Rahul0070050/localshare/releases) page.

### Windows (x64)
* **Installer (`LocalShare-Setup-x.x.x.exe`)**: Recommended for standard desktop use. Installs the application and creates Desktop and Start Menu shortcuts.
* **Portable (`LocalShare-x.x.x.exe`)**: Single standalone executable. Run without installation or administrative privileges.

### Linux (x64)
* **AppImage (`LocalShare-x.x.x.AppImage`)**:
  ```bash
  chmod +x LocalShare-x.x.x.AppImage
  ./LocalShare-x.x.x.AppImage
  ```
* **Debian / Ubuntu Package (`localshare_x.x.x_amd64.deb`)**:
  ```bash
  sudo dpkg -i localshare_x.x.x_amd64.deb
  sudo apt-get install -f # Fix any missing dependencies if prompted
  ```
* **Portable Tarball (`localshare-x.x.x.tar.gz`)**:
  ```bash
  tar -xzf localshare-x.x.x.tar.gz
  cd localshare-x.x.x
  ./localshare
  ```

---

## 2. Building from Source

### Prerequisites
* **Node.js**: Version 18.x or 20.x LTS ([Download](https://nodejs.org/))
* **npm**: Version 9.x or higher (bundled with Node.js)
* **Git**: Installed and available in your system `PATH`

### Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Rahul0070050/localshare.git
   cd localshare
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Compile all application components**:
   ```bash
   npm run build
   ```
   *This command executes:*
   * `build:client`: Bundles the Preact web client to `client/bundle.js`.
   * `build:renderer`: Compiles the Next.js desktop UI to static export `out/`.
   * `build:electron`: Compiles TypeScript files in `server/` to `dist-electron/`.

4. **Launch the desktop application**:
   ```bash
   npm start
   ```

---

## 3. Running in Development Mode

For rapid code editing, run the renderer and Electron processes in separate terminal sessions:

```bash
# Terminal 1: Next.js dev server with hot reloading
npm run dev:renderer

# Terminal 2: TypeScript watch mode for backend code
npm run dev:electron

# Terminal 3: Launch Electron connected to the dev server
npm start
```

---

## 4. Packaging Release Binaries

Package self-contained binaries using `electron-builder`:

```bash
# Windows Installer (NSIS)
npm run dist:win

# Windows Portable Executable
npm run dist:portable

# Linux Archive (tar.gz - buildable on any host)
npm run dist:linux:tar

# Linux AppImage & Debian package (native Linux host or WSL required)
npm run dist:linux
```

---

## 5. Troubleshooting Common Issues

### Issue 1: "A required privilege is not held by the client" (Windows AppImage build)
* **Cause**: On Windows, creating Linux AppImage packages requires creating symbolic links (`symlinks`), which standard Windows user accounts prohibit.
* **Resolution**:
  * Option A: Enable **Developer Mode** in Windows (`Settings > System > For developers > Developer Mode`).
  * Option B: Run PowerShell or Terminal as **Administrator**.
  * Option C: Build the archive target instead: `npm run dist:linux:tar`.

### Issue 2: "Port already in use" (EADDRINUSE)
* **Cause**: Another service or a lingering LocalShare process is already listening on the configured port (default: 3000).
* **Resolution**:
  * Run `npm run clean:processes` to terminate any orphaned background processes.
  * Alternatively, open LocalShare Settings in the desktop dashboard and change the port number (e.g., 8080 or 4567).

### Issue 3: Devices Cannot Connect to the Local Host
* **Checklist**:
  1. Verify that both the host PC and client devices are connected to the **same local Wi-Fi router / subnet**.
  2. Confirm your OS firewall (Windows Defender Firewall or `ufw` on Linux) allows incoming connections on the configured port for Node/Electron.
  3. Ensure "AP Isolation" / "Client Isolation" is disabled in your Wi-Fi router settings, as this setting prevents connected devices from communicating directly with each other.
