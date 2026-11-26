/**
 * Generates the standalone, 100% offline responsive Web File Explorer HTML.
 * Includes complete SVG icons, modern dark/light mode UI, breadcrumbs, grid/list view,
 * live search, sorting, media preview modals (images, video with Range seeking, audio, PDF, text),
 * and password protection gate.
 */
export function getWebExplorerHtml(options: {
  title?: string;
  hasPassword?: boolean;
}): string {
  const hasPassword = Boolean(options.hasPassword);

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>LocalShare — Local File Explorer</title>
  <style>
    :root {
      --bg: #090d16;
      --surface: #111827;
      --surface-border: #1f293d;
      --surface-hover: #1e293b;
      --text: #f3f4f6;
      --text-muted: #94a3b8;
      --accent: #3b82f6;
      --accent-hover: #2563eb;
      --accent-glow: rgba(59, 130, 246, 0.25);
      --success: #10b981;
      --danger: #ef4444;
      --radius: 10px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    /* Header */
    header {
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--surface-border);
      position: sticky;
      top: 0;
      z-index: 40;
      padding: 0.75rem 1.25rem;
    }
    .header-content {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 12px var(--accent-glow);
    }
    .brand-name {
      font-weight: 700;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }
    .brand-badge {
      font-size: 0.7rem;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 2px 7px;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .brand-badge::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #34d399;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    /* Controls Bar */
    .controls-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .search-box {
      position: relative;
      min-width: 180px;
      max-width: 300px;
      flex: 1;
    }
    .search-input {
      width: 100%;
      background: #0d131f;
      border: 1px solid var(--surface-border);
      color: var(--text);
      padding: 0.5rem 0.75rem 0.5rem 2.2rem;
      border-radius: 8px;
      font-size: 0.875rem;
      outline: none;
      transition: all 0.2s;
    }
    .search-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--accent-glow);
    }
    .search-icon {
      position: absolute;
      left: 0.7rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.5rem 0.85rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      border: 1px solid var(--surface-border);
      background: var(--surface);
      color: var(--text);
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .btn:hover {
      background: var(--surface-hover);
      border-color: #334155;
    }
    .btn-primary {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }
    .btn-primary:hover {
      background: var(--accent-hover);
      border-color: var(--accent-hover);
    }
    .btn-icon {
      padding: 0.5rem;
      min-width: 36px;
      height: 36px;
    }
    .btn.active {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }

    /* Main Container */
    main {
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 1.25rem;
      flex: 1;
    }

    /* Breadcrumbs */
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
      padding: 0.6rem 1rem;
      background: rgba(17, 24, 39, 0.6);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius);
      font-size: 0.875rem;
    }
    .crumb-item {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: var(--text-muted);
      text-decoration: none;
      cursor: pointer;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      transition: all 0.15s;
    }
    .crumb-item:hover {
      color: var(--text);
      background: var(--surface-hover);
    }
    .crumb-item.active {
      color: var(--text);
      font-weight: 600;
      cursor: default;
    }
    .crumb-sep {
      color: #475569;
    }

    /* Views */
    .grid-view {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
      gap: 1rem;
    }
    .list-view {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--surface-border);
      border-radius: var(--radius);
      background: var(--surface);
      overflow: hidden;
    }

    /* Card Item (Grid) */
    .card-item {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      position: relative;
    }
    .card-item:hover {
      transform: translateY(-2px);
      border-color: #334155;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      background: var(--surface-hover);
    }
    .card-icon-wrapper {
      width: 100%;
      height: 90px;
      border-radius: 8px;
      background: #0d131f;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .card-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .card-name {
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--text);
      word-break: break-word;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.3;
    }
    .card-meta {
      font-size: 0.75rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      margin-top: auto;
    }
    .card-actions {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.25rem;
    }
    .card-actions .btn {
      flex: 1;
      padding: 0.4rem;
      font-size: 0.78rem;
    }

    /* List Item */
    .list-header {
      display: grid;
      grid-template-columns: 2.5rem 1fr 6rem 10rem 7rem;
      align-items: center;
      padding: 0.75rem 1rem;
      background: #0c121d;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--surface-border);
    }
    .list-row {
      display: grid;
      grid-template-columns: 2.5rem 1fr 6rem 10rem 7rem;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid rgba(31, 41, 61, 0.6);
      transition: background 0.15s;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .list-row:last-child {
      border-bottom: none;
    }
    .list-row:hover {
      background: var(--surface-hover);
    }
    .list-name {
      font-weight: 500;
      color: var(--text);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 0.5rem;
    }
    .list-meta {
      color: var(--text-muted);
      font-size: 0.8rem;
    }
    .list-actions {
      display: flex;
      gap: 0.4rem;
      justify-content: flex-end;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 4rem 1rem;
      color: var(--text-muted);
    }
    .empty-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 1rem;
      opacity: 0.4;
    }

    /* Modal / Previews */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
    .modal-overlay.open {
      opacity: 1;
      pointer-events: auto;
    }
    .modal-card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 12px;
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      overflow: hidden;
      transform: scale(0.96);
      transition: transform 0.2s ease;
    }
    .modal-overlay.open .modal-card {
      transform: scale(1);
    }
    .modal-header {
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--surface-border);
    }
    .modal-title {
      font-weight: 600;
      font-size: 1rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 1rem;
    }
    .modal-body {
      padding: 1.25rem;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 250px;
      background: #090e17;
    }
    .preview-img {
      max-width: 100%;
      max-height: 70vh;
      border-radius: 6px;
      object-fit: contain;
    }
    .preview-media {
      width: 100%;
      max-height: 70vh;
      border-radius: 6px;
      outline: none;
    }
    .preview-iframe {
      width: 100%;
      height: 75vh;
      border: none;
      border-radius: 6px;
      background: white;
    }
    .preview-code {
      width: 100%;
      max-height: 70vh;
      background: #0b101b;
      padding: 1rem;
      border-radius: 6px;
      overflow: auto;
      font-family: monospace;
      font-size: 0.85rem;
      line-height: 1.5;
      color: #e2e8f0;
      white-space: pre-wrap;
      word-break: break-all;
    }

    /* Password gate */
    .password-card {
      max-width: 400px;
      margin: 4rem auto;
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      box-shadow: 0 16px 32px rgba(0,0,0,0.4);
    }
    .password-input {
      width: 100%;
      background: #090e17;
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      color: var(--text);
      padding: 0.75rem 1rem;
      font-size: 1rem;
      margin: 1.25rem 0 1rem;
      outline: none;
    }
    .password-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--accent-glow);
    }

    /* Mobile media query */
    @media (max-width: 768px) {
      .header-content { flex-direction: column; align-items: stretch; }
      .search-box { max-width: 100%; }
      .list-header { display: none; }
      .list-row {
        grid-template-columns: 2.2rem 1fr 5rem;
        gap: 0.5rem;
        padding: 0.75rem 0.5rem;
      }
      .list-date { display: none; }
      .list-actions { grid-column: 3; }
      .grid-view { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.75rem; }
      .card-icon-wrapper { height: 70px; }
      .card-item { padding: 0.75rem; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <header>
    <div class="header-content">
      <div class="brand" onclick="navigateRoot()">
        <div class="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </div>
        <div>
          <span class="brand-name">LocalShare</span>
        </div>
        <span class="brand-badge">Wi-Fi Direct</span>
      </div>

      <div class="controls-bar" id="controlsBar">
        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" id="searchInput" class="search-input" placeholder="Search files in folder..." oninput="filterItems()">
        </div>

        <select id="sortSelect" class="btn" onchange="sortItems()">
          <option value="name-asc">Sort: Name (A-Z)</option>
          <option value="name-desc">Sort: Name (Z-A)</option>
          <option value="size-desc">Sort: Size (Large)</option>
          <option value="size-asc">Sort: Size (Small)</option>
          <option value="date-desc">Sort: Date (Newest)</option>
          <option value="date-asc">Sort: Date (Oldest)</option>
        </select>

        <button id="viewGridBtn" class="btn btn-icon active" title="Grid View" onclick="setViewMode('grid')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>

        <button id="viewListBtn" class="btn btn-icon" title="List View" onclick="setViewMode('list')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main>
    <div id="passwordSection" style="display: none;">
      <div class="password-card">
        <div class="brand-icon" style="margin: 0 auto 1rem; width: 48px; height: 48px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>Protected Access</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">
          The host computer has password protected this file share. Enter the password to continue.
        </p>
        <input type="password" id="passwordInput" class="password-input" placeholder="Enter share password" onkeydown="if(event.key==='Enter') submitPassword()">
        <button class="btn btn-primary" style="width: 100%; padding: 0.75rem;" onclick="submitPassword()">
          Unlock Files
        </button>
        <div id="passwordError" style="color: var(--danger); font-size: 0.85rem; margin-top: 0.75rem; display: none;">
          Incorrect password. Please try again.
        </div>
      </div>
    </div>

    <div id="explorerSection">
      <!-- Breadcrumb Bar -->
      <div class="breadcrumb-nav" id="breadcrumbNav">
        <span class="crumb-item active" onclick="navigateRoot()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Shared Folders
        </span>
      </div>

      <!-- File Items Container -->
      <div id="itemsContainer" class="grid-view"></div>
    </div>
  </main>

  <!-- Modal Preview -->
  <div class="modal-overlay" id="previewModal" onclick="if(event.target === this) closePreview()">
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title" id="previewTitle">File Preview</div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <a id="previewDownloadBtn" class="btn btn-primary" download>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download
          </a>
          <button class="btn btn-icon" onclick="closePreview()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      <div class="modal-body" id="previewBody"></div>
    </div>
  </div>

  <script>
    // State
    let currentFolderId = null;
    let currentRelativePath = '';
    let currentItems = [];
    let currentViewMode = 'grid'; // 'grid' or 'list'
    let isRoot = true;

    // SVG icon templates
    const ICONS = {
      folder: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#2563eb" stroke-width="1.5"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>',
      image: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>',
      video: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
      audio: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
      document: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
      code: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
      archive: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>',
      other: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
    };

    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
    }

    function formatDate(ms) {
      if (!ms) return '';
      const d = new Date(ms);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Navigation
    async function loadPath(folderId, relPath = '') {
      currentFolderId = folderId;
      currentRelativePath = relPath;
      isRoot = !folderId;

      const url = new URL('/api/browse', window.location.origin);
      if (folderId) url.searchParams.set('folder', folderId);
      if (relPath) url.searchParams.set('path', relPath);

      try {
        const res = await fetch(url.toString());
        if (res.status === 401) {
          showPasswordScreen();
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to load items: ' + res.statusText);
        }
        const data = await res.json();
        renderBrowseData(data);
      } catch (err) {
        console.error(err);
        document.getElementById('itemsContainer').innerHTML =
          '<div class="empty-state"><h3>Error loading folder</h3><p>' + err.message + '</p></div>';
      }
    }

    function navigateRoot() {
      document.getElementById('searchInput').value = '';
      loadPath(null, '');
    }

    function renderBrowseData(data) {
      currentItems = data.items || [];
      renderBreadcrumbs(data.breadcrumbs || []);
      renderItems(currentItems);
    }

    function renderBreadcrumbs(crumbs) {
      const nav = document.getElementById('breadcrumbNav');
      nav.innerHTML = '';

      const rootItem = document.createElement('span');
      rootItem.className = 'crumb-item' + (isRoot ? ' active' : '');
      rootItem.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Shared Folders';
      rootItem.onclick = navigateRoot;
      nav.appendChild(rootItem);

      crumbs.forEach((crumb, idx) => {
        const sep = document.createElement('span');
        sep.className = 'crumb-sep';
        sep.innerText = '/';
        nav.appendChild(sep);

        const item = document.createElement('span');
        const isLast = idx === crumbs.length - 1;
        item.className = 'crumb-item' + (isLast ? ' active' : '');
        item.innerText = crumb.label;
        if (!isLast) {
          item.onclick = () => loadPath(currentFolderId, crumb.path);
        }
        nav.appendChild(item);
      });
    }

    function renderItems(items) {
      const container = document.getElementById('itemsContainer');
      container.className = currentViewMode === 'grid' ? 'grid-view' : 'list-view';

      if (!items || items.length === 0) {
        container.innerHTML = \`
          <div class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3>No files or folders found</h3>
            <p>This directory is currently empty.</p>
          </div>
        \`;
        return;
      }

      if (currentViewMode === 'grid') {
        renderGridView(items, container);
      } else {
        renderListView(items, container);
      }
    }

    function renderGridView(items, container) {
      let html = '';
      items.forEach((item) => {
        const iconSvg = ICONS[item.category] || ICONS.other;
        const isDir = item.isDirectory;
        const downloadUrl = isDir ? '#' : \`/api/download?folder=\${encodeURIComponent(item.folderId)}&path=\${encodeURIComponent(item.relativePath)}\`;
        const previewUrl = isDir ? '#' : \`/api/preview?folder=\${encodeURIComponent(item.folderId)}&path=\${encodeURIComponent(item.relativePath)}\`;
        const canPreview = !isDir && ['image', 'video', 'audio', 'document', 'code'].includes(item.category);

        html += \`
          <div class="card-item" onclick="handleItemClick('\${item.folderId}', '\${encodeURIComponent(item.relativePath)}', \${isDir}, '\${item.category}', '\${encodeURIComponent(item.name)}')">
            <div class="card-icon-wrapper">
              \${item.category === 'image' && !isDir
                ? \`<img class="card-thumb" src="\${previewUrl}" loading="lazy" alt="\${item.name}" onerror="this.outerHTML='\${iconSvg}'"/>\`
                : iconSvg}
            </div>
            <div class="card-name" title="\${item.name}">\${escapeHtml(item.name)}</div>
            <div class="card-meta">
              <span>\${isDir ? 'Folder' : formatBytes(item.size)}</span>
              <span>\${formatDate(item.mtime)}</span>
            </div>
            <div class="card-actions" onclick="event.stopPropagation()">
              \${isDir ? '' : \`
                \${canPreview ? \`<button class="btn" onclick="openPreview('\${item.folderId}', '\${encodeURIComponent(item.relativePath)}', '\${item.category}', '\${encodeURIComponent(item.name)}')">Preview</button>\` : ''}
                <a href="\${downloadUrl}" class="btn \${canPreview ? '' : 'btn-primary'}" download>Download</a>
              \`}
            </div>
          </div>
        \`;
      });
      container.innerHTML = html;
    }

    function renderListView(items, container) {
      let html = \`
        <div class="list-header">
          <div></div>
          <div>Name</div>
          <div>Size</div>
          <div class="list-date">Modified</div>
          <div style="text-align: right;">Action</div>
        </div>
      \`;

      items.forEach((item) => {
        const iconSvg = ICONS[item.category] || ICONS.other;
        const isDir = item.isDirectory;
        const downloadUrl = isDir ? '#' : \`/api/download?folder=\${encodeURIComponent(item.folderId)}&path=\${encodeURIComponent(item.relativePath)}\`;
        const canPreview = !isDir && ['image', 'video', 'audio', 'document', 'code'].includes(item.category);

        html += \`
          <div class="list-row" onclick="handleItemClick('\${item.folderId}', '\${encodeURIComponent(item.relativePath)}', \${isDir}, '\${item.category}', '\${encodeURIComponent(item.name)}')">
            <div style="display: flex; align-items: center;">\${iconSvg}</div>
            <div class="list-name" title="\${item.name}">\${escapeHtml(item.name)}</div>
            <div class="list-meta">\${isDir ? '—' : formatBytes(item.size)}</div>
            <div class="list-meta list-date">\${formatDate(item.mtime)}</div>
            <div class="list-actions" onclick="event.stopPropagation()">
              \${isDir ? '' : \`
                \${canPreview ? \`<button class="btn" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;" onclick="openPreview('\${item.folderId}', '\${encodeURIComponent(item.relativePath)}', '\${item.category}', '\${encodeURIComponent(item.name)}')">Preview</button>\` : ''}
                <a href="\${downloadUrl}" class="btn" style="padding: 0.35rem 0.6rem; font-size: 0.75rem;" download>Download</a>
              \`}
            </div>
          </div>
        \`;
      });
      container.innerHTML = html;
    }

    function handleItemClick(folderId, encRelPath, isDir, category, encName) {
      const relPath = decodeURIComponent(encRelPath);
      const name = decodeURIComponent(encName);
      if (isDir) {
        if (isRoot) {
          loadPath(folderId, '');
        } else {
          loadPath(currentFolderId, relPath);
        }
      } else {
        openPreview(folderId, encRelPath, category, encName);
      }
    }

    // Live search
    function filterItems() {
      const q = document.getElementById('searchInput').value.trim().toLowerCase();
      if (!q) {
        renderItems(currentItems);
        return;
      }
      const filtered = currentItems.filter((item) => item.name.toLowerCase().includes(q));
      renderItems(filtered);
    }

    // Sort items
    function sortItems() {
      const mode = document.getElementById('sortSelect').value;
      const sorted = [...currentItems];

      sorted.sort((a, b) => {
        // Folders always first
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;

        if (mode === 'name-asc') return a.name.localeCompare(b.name);
        if (mode === 'name-desc') return b.name.localeCompare(a.name);
        if (mode === 'size-desc') return b.size - a.size;
        if (mode === 'size-asc') return a.size - b.size;
        if (mode === 'date-desc') return b.mtime - a.mtime;
        if (mode === 'date-asc') return a.mtime - b.mtime;
        return 0;
      });

      currentItems = sorted;
      filterItems();
    }

    // View toggle
    function setViewMode(mode) {
      currentViewMode = mode;
      document.getElementById('viewGridBtn').classList.toggle('active', mode === 'grid');
      document.getElementById('viewListBtn').classList.toggle('active', mode === 'list');
      renderItems(currentItems);
    }

    // Preview Modal
    function openPreview(folderId, encRelPath, category, encName) {
      const relPath = decodeURIComponent(encRelPath);
      const name = decodeURIComponent(encName);
      const previewUrl = \`/api/preview?folder=\${encodeURIComponent(folderId)}&path=\${encodeURIComponent(relPath)}\`;
      const downloadUrl = \`/api/download?folder=\${encodeURIComponent(folderId)}&path=\${encodeURIComponent(relPath)}\`;

      const titleEl = document.getElementById('previewTitle');
      const bodyEl = document.getElementById('previewBody');
      const dlBtn = document.getElementById('previewDownloadBtn');

      titleEl.innerText = name;
      dlBtn.href = downloadUrl;

      if (category === 'image') {
        bodyEl.innerHTML = \`<img class="preview-img" src="\${previewUrl}" alt="\${name}">\`;
      } else if (category === 'video') {
        bodyEl.innerHTML = \`<video class="preview-media" src="\${previewUrl}" controls autoplay playsinline></video>\`;
      } else if (category === 'audio') {
        bodyEl.innerHTML = \`
          <div style="text-align: center; width: 100%; max-width: 480px; padding: 2rem;">
            \${ICONS.audio}
            <div style="margin: 1.5rem 0 1rem; font-weight: 500;">\${escapeHtml(name)}</div>
            <audio style="width: 100%;" src="\${previewUrl}" controls autoplay></audio>
          </div>
        \`;
      } else if (category === 'document' && name.toLowerCase().endsWith('.pdf')) {
        bodyEl.innerHTML = \`<iframe class="preview-iframe" src="\${previewUrl}#toolbar=1"></iframe>\`;
      } else if (category === 'code' || category === 'document') {
        bodyEl.innerHTML = '<div style="color: var(--text-muted);">Loading file contents...</div>';
        fetch(previewUrl)
          .then(res => res.text())
          .then(text => {
            bodyEl.innerHTML = \`<pre class="preview-code"><code>\${escapeHtml(text.slice(0, 100000))}</code></pre>\`;
          })
          .catch(err => {
            bodyEl.innerHTML = \`<div style="color: var(--danger);">Failed to preview file: \${err.message}</div>\`;
          });
      } else {
        bodyEl.innerHTML = \`
          <div class="empty-state">
            \${ICONS.other}
            <h3>No direct preview available</h3>
            <p style="margin-top: 0.5rem;"><a href="\${downloadUrl}" class="btn btn-primary" download>Download file to view</a></p>
          </div>
        \`;
      }

      document.getElementById('previewModal').classList.add('open');
    }

    function closePreview() {
      const modal = document.getElementById('previewModal');
      modal.classList.remove('open');
      const bodyEl = document.getElementById('previewBody');
      // Stop video/audio
      bodyEl.innerHTML = '';
    }

    // Password auth
    function showPasswordScreen() {
      document.getElementById('passwordSection').style.display = 'block';
      document.getElementById('explorerSection').style.display = 'none';
      document.getElementById('controlsBar').style.display = 'none';
    }

    function hidePasswordScreen() {
      document.getElementById('passwordSection').style.display = 'none';
      document.getElementById('explorerSection').style.display = 'block';
      document.getElementById('controlsBar').style.display = 'flex';
    }

    async function submitPassword() {
      const pwd = document.getElementById('passwordInput').value;
      const errEl = document.getElementById('passwordError');
      errEl.style.display = 'none';

      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pwd })
        });
        const data = await res.json();
        if (data.success) {
          hidePasswordScreen();
          loadPath(null, '');
        } else {
          errEl.innerText = data.error || 'Incorrect password.';
          errEl.style.display = 'block';
        }
      } catch (err) {
        errEl.innerText = 'Network error: ' + err.message;
        errEl.style.display = 'block';
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Initial load
    window.addEventListener('DOMContentLoaded', () => {
      loadPath(null, '');
    });
  </script>
</body>
</html>`;
}
