export function renderPreviewModal(): string {
  return `
    <div class="modal-overlay" id="previewModalOverlay" onclick="if(event.target === this) LocalShareClient.closePreviewModal()">
      <div class="modal-dialog">
        <div class="modal-head">
          <div class="modal-headline" id="previewModalTitle">File Preview</div>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <a id="previewModalDownloadBtn" class="action-btn primary" download>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download
            </a>
            <button class="btn-toggle" title="Close Preview (Esc)" onclick="LocalShareClient.closePreviewModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="modal-content-area" id="previewModalBody">
          <!-- Dynamic Media Injected Here -->
        </div>
      </div>
    </div>
  `;
}
