# LocalShare Web Client

This directory contains the zero-install mobile and desktop web client served to connected browsers over the local Wi-Fi network.

---

## Overview

When a client device (phone, tablet, laptop, or smart TV) scans the host's QR code or navigates to the host IP address (e.g. `http://192.168.1.5:3000`), the host server serves this lightweight single-page application.

* **Framework**: [Preact](https://preactjs.com/) 11 (lightweight React alternative)
* **Language**: TypeScript
* **Bundler**: [esbuild](https://esbuild.github.io/)
* **Bundle Size**: ~51 KB (single self-contained `bundle.js`, zero external dependencies)

---

## Directory Structure

```text
client/
├── bundle.js                # Compiled, minified client bundle
├── builder.ts               # Programmatic esbuild compilation helper
└── src/
    ├── index.tsx            # Preact application entry point & root DOM mount
    ├── App.tsx              # Main layout: search bar, filters, grid/table view
    ├── types.ts             # Client-specific UI state types
    ├── components/
    │   ├── Breadcrumbs.tsx  # Nested folder breadcrumb navigation
    │   ├── EmptyState.tsx   # Placeholder state for empty directories
    │   ├── FileCard.tsx     # Visual card component for media and documents
    │   ├── FileRow.tsx      # Compact table row component for list view
    │   ├── Header.tsx       # Web client top navigation and status
    │   ├── Icons.tsx        # File type icons (video, audio, image, archive)
    │   ├── PasswordGate.tsx # Access authentication gate when password is set
    │   ├── PreviewModal.tsx # In-browser preview for media, text, and images
    │   ├── SearchFilter.tsx # Live search input and category filter pills
    │   ├── VideoPlayer.tsx  # Custom HTML5 media player with Range scrubbing
    │   └── VideoIcons.tsx   # Media player control icons
    ├── hooks/
    │   ├── useExplorer.ts   # Directory listing and file navigation state
    │   └── useTheme.ts      # Client theme synchronization
    ├── styles/
    │   └── theme.ts         # Visual tokens and styling constants
    └── utils/
        └── formatters.ts    # Byte size and date formatting utilities
```

---

## Building the Client

The client bundle is generated using `esbuild`:

```bash
# Run from repository root
npm run build:client
```

This compiles `client/src/index.tsx` into `client/bundle.js` and mirrors it into `dist-electron/client/bundle.js` for the Electron server to serve.
