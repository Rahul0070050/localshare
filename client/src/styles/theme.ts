export const THEME_CSS = `
:root {
  --bg-primary: #080c14;
  --bg-surface: #0f172a;
  --bg-surface-elevated: #162036;
  --bg-hover: #1e293b;
  --border-subtle: #1e293b;
  --border-strong: #334155;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-glow: rgba(59, 130, 246, 0.25);
  --success: #10b981;
  --success-glow: rgba(16, 185, 129, 0.2);
  --warning: #f59e0b;
  --danger: #ef4444;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 32px -4px rgba(0, 0, 0, 0.6);
}

[data-theme="light"] {
  --bg-primary: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-elevated: #f1f5f9;
  --bg-hover: #e2e8f0;
  --border-subtle: #e2e8f0;
  --border-strong: #cbd5e1;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --text-dim: #94a3b8;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-glow: rgba(37, 99, 235, 0.15);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 12px 32px -4px rgba(0, 0, 0, 0.15);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-primary);
  color: var(--text-main);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  line-height: 1.5;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.client-app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Glass Header */
.client-header {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  z-index: 40;
  padding: 0.75rem 1.25rem;
}

[data-theme="light"] .client-header {
  background: rgba(255, 255, 255, 0.9);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  user-select: none;
}

.brand-badge-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
  flex-shrink: 0;
}

.brand-title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.live-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  background: rgba(16, 185, 129, 0.12);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.25);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.live-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
  animation: pulse-dot 2s infinite ease-in-out;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.brand-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Common Buttons */
.btn-toggle {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.btn-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-main);
  border-color: var(--border-strong);
}

.btn-toggle.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.btn-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Main Container */
.client-main {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 3rem;
  flex: 1;
}

/* Breadcrumbs Navigation */
.nav-breadcrumbs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0.85rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  margin-bottom: 1.25rem;
  overflow-x: auto;
}

.crumbs-trail {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.crumb-item {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  padding: 0.25rem 0.45rem;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  font-family: inherit;
}

.crumb-item:hover:not(:disabled) {
  color: var(--primary);
  background: var(--bg-hover);
}

.crumb-item.active {
  color: var(--text-main);
  font-weight: 600;
  cursor: default;
}

.crumb-separator {
  color: var(--text-dim);
  display: inline-flex;
  align-items: center;
}

.crumbs-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.item-count-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-full);
  background: var(--bg-primary);
  color: var(--text-muted);
  border: 1px solid var(--border-subtle);
}

/* Toolbar & Search Bar */
.toolbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-field {
  position: relative;
  flex: 1;
  min-width: 240px;
  max-width: 380px;
  display: flex;
  align-items: center;
}

.search-icon-svg {
  position: absolute;
  left: 0.85rem;
  color: var(--text-dim);
  pointer-events: none;
}

.search-input {
  width: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.55rem 2.2rem 0.55rem 2.4rem;
  color: var(--text-main);
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  transition: all 0.15s ease;
}

.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.search-input::placeholder {
  color: var(--text-dim);
}

.category-chips-bar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  overflow-x: auto;
  padding-bottom: 2px;
}

.chip-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  font-family: inherit;
}

.chip-btn:hover {
  background: var(--bg-hover);
  color: var(--text-main);
}

.chip-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
  box-shadow: 0 2px 8px var(--primary-glow);
}

.view-sort-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.select-dropdown {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-size: 0.8rem;
  font-family: inherit;
  font-weight: 500;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.select-dropdown:focus {
  border-color: var(--primary);
}

/* File Grid View */
.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.1rem;
}

.grid-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.grid-card:hover {
  transform: translateY(-3px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
  background: var(--bg-surface-elevated);
}

.card-preview-stage {
  height: 105px;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;
  overflow: hidden;
  position: relative;
}

.card-img-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.grid-card:hover .card-img-thumb {
  transform: scale(1.05);
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0.35rem;
}

.card-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.badge-category {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
  color: var(--text-muted);
}

.card-actions-row {
  margin-top: 0.85rem;
  padding-top: 0.65rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.action-btn {
  flex: 1;
  background: var(--bg-hover);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.45rem 0.65rem;
  border-radius: var(--radius-md);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.action-btn:hover {
  background: var(--border-strong);
  color: #ffffff;
}

.action-btn.primary {
  background: var(--primary);
  border-color: var(--primary);
  color: #ffffff;
}

.action-btn.primary:hover {
  background: var(--primary-hover);
}

/* File List Table */
.file-list-table {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.list-head-row {
  display: grid;
  grid-template-columns: 2.8rem 1fr 7rem 11rem 8rem;
  align-items: center;
  padding: 0.85rem 1.1rem;
  background: var(--bg-primary);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-subtle);
}

.list-item-row {
  display: grid;
  grid-template-columns: 2.8rem 1fr 7rem 11rem 8rem;
  align-items: center;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--border-subtle);
  transition: background 0.15s;
  cursor: pointer;
  font-size: 0.875rem;
}

.list-item-row:last-child {
  border-bottom: none;
}

.list-item-row:hover {
  background: var(--bg-hover);
}

.list-title-text {
  font-weight: 500;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-right: 0.75rem;
}

.list-meta-text {
  color: var(--text-muted);
  font-size: 0.82rem;
}

.list-actions-cell {
  display: flex;
  gap: 0.4rem;
  justify-content: flex-end;
}

/* Empty States */
.empty-state-box {
  text-align: center;
  padding: 4.5rem 1.5rem;
  color: var(--text-muted);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.4);
}

.empty-state-icon {
  width: 68px;
  height: 68px;
  margin: 0 auto 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-dim);
}

.empty-state-headline {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 0.35rem;
}

.empty-state-desc {
  font-size: 0.875rem;
  max-width: 360px;
  margin: 0 auto;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  max-width: 960px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: popIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-dialog.modal-dialog-video {
  max-width: 1100px;
  background: #000000;
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9);
}

@keyframes popIn {
  from { transform: scale(0.96) translateY(8px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-head {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.modal-headline {
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--text-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.modal-content-area {
  padding: 1.5rem;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  background: #060910;
}

.preview-img-full {
  max-width: 100%;
  max-height: 72vh;
  border-radius: var(--radius-sm);
  object-fit: contain;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.preview-video-full {
  width: 100%;
  max-height: 72vh;
  border-radius: var(--radius-sm);
  outline: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.preview-audio-container {
  width: 100%;
  padding: 2.5rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-pdf-frame {
  width: 100%;
  height: 75vh;
  border: none;
  border-radius: var(--radius-sm);
  background: white;
}

.code-preview-wrapper {
  width: 100%;
  max-height: 72vh;
  background: #090e18;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  overflow: auto;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  line-height: 1.6;
  color: #e2e8f0;
  border: 1px solid var(--border-subtle);
}

.code-box {
  margin: 0;
  padding: 0;
  font-family: inherit;
}

.code-line {
  display: flex;
  gap: 1rem;
}

.line-num {
  user-select: none;
  color: var(--text-dim);
  text-align: right;
  min-width: 2.2rem;
  border-right: 1px solid var(--border-subtle);
  padding-right: 0.75rem;
}

.line-text {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Password Gate Card */
.password-card {
  max-width: 420px;
  margin: 4.5rem auto;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lock-icon-badge {
  width: 58px;
  height: 58px;
  border-radius: var(--radius-md);
  background: rgba(59, 130, 246, 0.12);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.password-card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.4rem;
}

.password-card-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 320px;
}

.password-input {
  width: 100%;
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-main);
  padding: 0.75rem 1rem;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}

.password-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.unlock-btn {
  width: 100%;
  background: var(--primary);
  border: 1px solid var(--primary);
  color: #ffffff;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 0.85rem;
  cursor: pointer;
  transition: background 0.15s ease;
  font-family: inherit;
}

.unlock-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.unlock-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-inner {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-container {
    flex-direction: column;
    align-items: stretch;
  }
  .search-field {
    max-width: 100%;
  }
  .view-sort-group {
    justify-content: space-between;
  }
  .list-head-row {
    display: none;
  }
  .list-item-row {
    grid-template-columns: 2.2rem 1fr 5.5rem;
    gap: 0.5rem;
    padding: 0.85rem 0.65rem;
  }
  .list-col-date {
    display: none;
  }
  .list-actions-cell {
    grid-column: 3;
  }
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
    gap: 0.75rem;
  }
  .card-preview-stage {
    height: 85px;
  }
  .grid-card {
    padding: 0.75rem;
  }
}
/* Modal Content Area Video Mode */
.modal-content-area.video-stage-mode {
  padding: 0 !important;
  background: #000000 !important;
  min-height: unset;
  overflow: hidden;
}

/* ==========================================================================
   Modern Polished Video Player Styles
   ========================================================================== */
.vp-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 78vh;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  outline: none;
}

.vp-container.fullscreen {
  max-height: 100vh;
  width: 100vw;
  height: 100vh;
  position: fixed;
  inset: 0;
  z-index: 999999;
}

.vp-container.controls-hidden {
  cursor: none;
}

.vp-video {
  width: 100%;
  height: 100%;
  max-height: 78vh;
  object-fit: contain;
  background: #000000;
}

.vp-container.fullscreen .vp-video {
  max-height: 100vh;
}

/* Subtitle Styling */
.vp-video::cue {
  background: rgba(0, 0, 0, 0.75);
  color: #ffffff;
  font-family: var(--font-sans);
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
}

.vp-video.subtitle-size-small::cue {
  font-size: 80%;
}

.vp-video.subtitle-size-medium::cue {
  font-size: 105%;
}

.vp-video.subtitle-size-large::cue {
  font-size: 135%;
}

/* Center Feedback Ripple */
.vp-center-flash {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 20;
}

.vp-center-icon-wrap {
  width: 76px;
  height: 76px;
  border-radius: var(--radius-full);
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  animation: vpCenterPulse 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes vpCenterPulse {
  0% { transform: scale(0.65); opacity: 0; }
  40% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}

/* Toast Notification (Top Right) */
.vp-toast {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  color: #ffffff;
  padding: 0.45rem 0.9rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: var(--shadow-md);
  z-index: 25;
  pointer-events: none;
  animation: vpToastIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes vpToastIn {
  from { transform: translateY(-8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Badge Overlay (Top Left) */
.vp-badge-overlay {
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  z-index: 25;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.controls-hidden .vp-badge-overlay {
  opacity: 0;
}

.vp-quality-pill {
  background: rgba(37, 99, 235, 0.85);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  backdrop-filter: blur(8px);
}

.vp-title-pill {
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  font-size: 0.78rem;
  font-weight: 500;
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-sm);
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Controls Bar Overlay */
.vp-controls-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.6) 65%, transparent 100%);
  padding: 2.2rem 1.25rem 0.9rem;
  z-index: 30;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.vp-controls-bar.hidden {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
}

.vp-controls-bar.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

/* Interactive Seek Track */
.vp-seek-track {
  position: relative;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: height 0.15s ease;
}

.vp-seek-track:hover {
  height: 10px;
}

.vp-seek-buffered {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.35);
  border-radius: var(--radius-full);
  pointer-events: none;
  transition: width 0.2s ease;
}

.vp-seek-played {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  border-radius: var(--radius-full);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.vp-seek-thumb {
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  background: #ffffff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.8), 0 0 4px #3b82f6;
  margin-right: -7px;
  transform: scale(0);
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.vp-seek-track:hover .vp-seek-thumb {
  transform: scale(1);
}

.vp-seek-tooltip {
  position: absolute;
  bottom: 18px;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid var(--border-subtle);
  color: #ffffff;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  font-family: var(--font-mono);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  white-space: nowrap;
}

/* Controls Buttons Row */
.vp-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.vp-left-group,
.vp-right-group {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.vp-btn {
  background: transparent;
  border: none;
  color: #e2e8f0;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  flex-shrink: 0;
}

.vp-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  transform: scale(1.06);
}

.vp-btn:active {
  transform: scale(0.95);
}

.vp-btn.active {
  color: var(--primary);
  background: rgba(59, 130, 246, 0.2);
}

.vp-speed-btn {
  font-size: 0.8rem;
  font-weight: 700;
  width: auto;
  padding: 0 0.55rem;
  color: #cbd5e1;
}

/* Volume Slider Group */
.vp-volume-wrapper {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.vp-volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 72px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-full);
  outline: none;
  cursor: pointer;
  transition: width 0.2s ease, height 0.15s ease;
}

.vp-volume-slider:hover {
  width: 90px;
  height: 6px;
}

.vp-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background: #ffffff;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

.vp-volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background: #ffffff;
  border: none;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
  cursor: pointer;
}

/* Time Display */
.vp-time-display {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: #94a3b8;
  margin-left: 0.4rem;
  user-select: none;
}

.vp-time-current {
  color: #ffffff;
  font-weight: 600;
}

.vp-time-divider {
  color: #64748b;
}

.vp-time-total {
  color: #94a3b8;
}

/* Settings Popover */
.vp-settings-popover {
  position: absolute;
  bottom: 74px;
  right: 1.25rem;
  width: 290px;
  background: rgba(15, 23, 42, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.75);
  z-index: 40;
  overflow: hidden;
  animation: vpPopUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes vpPopUp {
  from { transform: translateY(10px) scale(0.96); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.vp-settings-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
}

.vp-settings-back-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
  padding: 0 0.3rem;
  font-family: inherit;
}

.vp-settings-back-btn:hover {
  color: #ffffff;
}

.vp-settings-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
}

.vp-settings-body {
  padding: 0.5rem 0;
  max-height: 320px;
  overflow-y: auto;
}

.vp-settings-list {
  display: flex;
  flex-direction: column;
}

.vp-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  background: transparent;
  border: none;
  color: #cbd5e1;
  font-size: 0.8rem;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s ease;
  width: 100%;
  text-align: left;
}

.vp-settings-row:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.vp-settings-row.active {
  color: var(--primary);
  font-weight: 600;
}

.vp-settings-val {
  color: var(--text-dim);
  font-size: 0.75rem;
}

.vp-settings-upload-btn {
  margin: 0.5rem 0.85rem 0.25rem;
  padding: 0.55rem;
  background: rgba(59, 130, 246, 0.15);
  border: 1px dashed var(--primary);
  border-radius: var(--radius-sm);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  font-family: inherit;
}

.vp-settings-upload-btn:hover {
  background: var(--primary);
  color: #ffffff;
}

.vp-subtitle-size-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  border-top: 1px solid var(--border-subtle);
  margin-top: 0.5rem;
}

.vp-size-chip {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-transform: capitalize;
  font-family: inherit;
}

.vp-size-chip.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

/* Info Sheet */
.vp-info-sheet {
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vp-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.vp-info-label {
  color: var(--text-muted);
}

.vp-info-value {
  color: #ffffff;
  font-weight: 600;
  font-family: var(--font-mono);
}

/* Shortcuts Table */
.vp-shortcuts-table {
  padding: 0.4rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.vp-sc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #cbd5e1;
}

.vp-sc-row kbd {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: #ffffff;
}

/* Mobile Adjustments for Video Player */
@media (max-width: 640px) {
  .vp-controls-bar {
    padding: 1.5rem 0.75rem 0.65rem;
  }
  .vp-volume-slider {
    display: none;
  }
  .vp-speed-btn {
    display: none;
  }
  .vp-settings-popover {
    right: 0.5rem;
    left: 0.5rem;
    width: auto;
    bottom: 65px;
  }
  .vp-time-display {
    font-size: 0.72rem;
  }
}
`;
