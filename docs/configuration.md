# LocalShare Configuration

This document describes how LocalShare stores configuration, manages state, and enforces security boundaries.

---

## Configuration File (`localshare-config.json`)

LocalShare stores user preferences and shared folder mappings in a JSON file named `localshare-config.json`. 

In development mode, this file is located in the project root directory. In packaged desktop builds, it is managed by Electron's user data directory via [`server/electron/store.ts`](../server/electron/store.ts).

### Example Configuration

```json
{
  "folders": [
    {
      "id": "1732684920100-abc12",
      "originalPath": "C:\\Users\\Username\\Videos\\Movies",
      "displayName": "Family Movies",
      "enabled": true,
      "createdAt": 1732684920100
    }
  ],
  "settings": {
    "port": 3000,
    "theme": "dark",
    "passwordProtection": false,
    "password": "",
    "autoStartSharing": false,
    "minimizeToTray": false,
    "launchAtStartup": false
  }
}
```

---

## Configuration Properties

### `folders` Array
Each object in the `folders` array represents a directory registered with the local server:

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier generated when the folder is added. |
| `originalPath` | `string` | Absolute file system path to the shared folder on the host. |
| `displayName` | `string` | Human-readable alias shown to connected clients. |
| `enabled` | `boolean` | When `false`, the folder is hidden and inaccessible to clients without being deleted from settings. |
| `createdAt` | `number` | Unix timestamp of when the folder was registered. |

### `settings` Object

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `port` | `number` | `3000` | The local TCP port the HTTP sharing server listens on. |
| `theme` | `string` | `"dark"` | UI theme appearance (`"dark"` or `"light"`). |
| `passwordProtection` | `boolean` | `false` | When `true`, clients must enter a password to access files. |
| `password` | `string` | `""` | The plain text password required when password protection is active. |
| `autoStartSharing` | `boolean` | `false` | If enabled, starts the sharing server immediately when LocalShare launches. |
| `minimizeToTray` | `boolean` | `false` | Closes to the system tray rather than terminating the process when closing the window. |
| `launchAtStartup` | `boolean` | `false` | Configures the desktop app to launch on OS boot. |

---

## Security Boundaries & Access Control

1. **Path Traversal Guard**:
   * All requests to `/api/file` or `/api/download` pass through `isPathSafe(targetPath, allowedRoots)` in [`server/core/security.ts`](../server/core/security.ts).
   * Paths with relative navigation attempts (e.g. `../../etc/shadow` or `..\..\Windows\System32`) are canonicalized via `path.resolve` and checked against allowed root prefixes. Unauthorized requests return `403 Forbidden`.

2. **Read-Only Server Operation**:
   * The local sharing engine does not implement write, delete, or upload endpoints by default. Clients have read-only access to browse, stream, and download.

3. **Optional Password Authentication**:
   * If `passwordProtection` is enabled, the client web app displays a password gate. The server validates incoming authorization tokens before returning directory trees or file streams.
