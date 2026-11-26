export function renderSearchFilter(): string {
  return `
    <div class="toolbar-container" id="clientToolbar">
      <!-- Search Input -->
      <div class="search-field">
        <svg class="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          id="clientSearchInput"
          class="search-input"
          placeholder="Filter files in current folder... (Press / to search)"
          oninput="LocalShareClient.onSearchInput(this.value)"
        />
      </div>

      <!-- Category Chips -->
      <div class="category-chips-bar" id="categoryChips">
        <button class="chip-btn active" data-category="all" onclick="LocalShareClient.setCategoryFilter('all')">
          All
        </button>
        <button class="chip-btn" data-category="image" onclick="LocalShareClient.setCategoryFilter('image')">
          Images
        </button>
        <button class="chip-btn" data-category="video" onclick="LocalShareClient.setCategoryFilter('video')">
          Videos
        </button>
        <button class="chip-btn" data-category="audio" onclick="LocalShareClient.setCategoryFilter('audio')">
          Audio
        </button>
        <button class="chip-btn" data-category="document" onclick="LocalShareClient.setCategoryFilter('document')">
          Documents
        </button>
        <button class="chip-btn" data-category="code" onclick="LocalShareClient.setCategoryFilter('code')">
          Code
        </button>
        <button class="chip-btn" data-category="archive" onclick="LocalShareClient.setCategoryFilter('archive')">
          Archives
        </button>
      </div>

      <!-- Sort & View Controls -->
      <div class="view-sort-group">
        <select id="clientSortSelect" class="select-dropdown" onchange="LocalShareClient.onSortChange(this.value)">
          <option value="name-asc">Name (A to Z)</option>
          <option value="name-desc">Name (Z to A)</option>
          <option value="size-desc">Size (Largest first)</option>
          <option value="size-asc">Size (Smallest first)</option>
          <option value="date-desc">Modified (Newest)</option>
          <option value="date-asc">Modified (Oldest)</option>
        </select>

        <button id="viewGridBtn" class="btn-toggle active" title="Switch to Grid View" onclick="LocalShareClient.setViewMode('grid')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>

        <button id="viewListBtn" class="btn-toggle" title="Switch to List View" onclick="LocalShareClient.setViewMode('list')">
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
  `;
}
