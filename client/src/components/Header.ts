export function renderHeader(): string {
  return `
  <header class="client-header">
    <div class="header-inner">
      <div class="brand-wrapper" onclick="LocalShareClient.navigateRoot()">
        <div class="brand-badge-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
            <polyline points="16 6 12 2 8 6"></polyline>
            <line x1="12" y1="2" x2="12" y2="15"></line>
          </svg>
        </div>
        <div>
          <div class="brand-title">
            <span>LocalShare</span>
            <span class="live-badge">
              <span class="live-badge-dot"></span>
              Local Wi-Fi
            </span>
          </div>
          <div class="brand-subtitle">High-Speed Local Network File Explorer</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <button id="themeToggleBtn" class="btn-toggle" title="Toggle Light / Dark Theme" onclick="LocalShareClient.toggleTheme()">
          <svg id="themeIconSun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg id="themeIconMoon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </div>
  </header>`;
}
