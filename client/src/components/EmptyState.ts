export function renderEmptyState(isSearchActive = false): string {
  return `
    <div class="empty-placeholder">
      <div class="empty-icon-wrap">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          ${
            isSearchActive
              ? `<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line>`
              : `<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line>`
          }
        </svg>
      </div>
      <div class="empty-title">
        ${isSearchActive ? 'No matching files found' : 'This folder is empty'}
      </div>
      <div class="empty-subtitle">
        ${
          isSearchActive
            ? 'Try adjusting your search query or clear the category filters.'
            : 'No files or subdirectories are currently present in this location.'
        }
      </div>
      ${
        isSearchActive
          ? `<button class="action-btn" style="margin-top: 1rem;" onclick="LocalShareClient.clearSearch()">Clear Search Filter</button>`
          : ''
      }
    </div>
  `;
}
