export function getClientScript(): string {
  return `
  (function () {
    const state = {
      currentFolderId: null,
      currentRelativePath: '',
      isRoot: true,
      rawItems: [],
      filteredItems: [],
      breadcrumbs: [],
      searchQuery: '',
      categoryFilter: 'all',
      sortMode: 'name-asc',
      viewMode: 'grid',
      theme: localStorage.getItem('localshare_client_theme') || 'dark',
      historyStack: [],
    };

    // Initialize Theme
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcons();

    // Exported Client API
    window.LocalShareClient = {
      state,

      async loadFolder(folderId, relPath = '') {
        state.currentFolderId = folderId || null;
        state.currentRelativePath = relPath || '';
        state.isRoot = !folderId;

        const url = new URL('/api/browse', window.location.origin);
        if (folderId) url.searchParams.set('folder', folderId);
        if (relPath) url.searchParams.set('path', relPath);

        const container = document.getElementById('filesViewport');
        if (container) {
          container.innerHTML = '<div style="text-align: center; padding: 3rem; color: var(--text-muted);"><div class="live-badge-dot" style="margin: 0 auto 0.75rem;"></div>Loading files...</div>';
        }

        try {
          const res = await fetch(url.toString());
          if (res.status === 401) {
            showPasswordGate();
            return;
          }
          if (!res.ok) {
            throw new Error('Server returned ' + res.status + ' (' + res.statusText + ')');
          }

          const data = await res.json();
          hidePasswordGate();

          state.rawItems = data.items || [];
          state.breadcrumbs = data.breadcrumbs || [];

          // Render Breadcrumbs
          renderBreadcrumbsBar();

          // Apply filters and render
          applyFiltersAndSort();
        } catch (err) {
          console.error(err);
          if (container) {
            container.innerHTML = '<div class="empty-placeholder" style="color: var(--danger);"><div class="empty-title">Error Loading Folder</div><p>' + escapeHtml(err.message) + '</p><button class="action-btn" style="margin-top: 1rem;" onclick="LocalShareClient.reloadCurrent()">Retry</button></div>';
          }
        }
      },

      navigateRoot() {
        state.searchQuery = '';
        state.categoryFilter = 'all';
        const sInput = document.getElementById('clientSearchInput');
        if (sInput) sInput.value = '';
        updateCategoryChipsUI();
        this.loadFolder(null, '');
      },

      navigateParent() {
        if (!state.currentFolderId) return;
        if (!state.currentRelativePath) {
          this.navigateRoot();
          return;
        }

        const segments = state.currentRelativePath.split('/').filter(Boolean);
        segments.pop();
        const parentPath = segments.join('/');
        this.loadFolder(state.currentFolderId, parentPath);
      },

      reloadCurrent() {
        this.loadFolder(state.currentFolderId, state.currentRelativePath);
      },

      handleItemClick(encFolder, encPath, isDir, category, encName) {
        const folderId = decodeURIComponent(encFolder);
        const relPath = decodeURIComponent(encPath);
        const name = decodeURIComponent(encName);

        if (isDir) {
          if (state.isRoot) {
            this.loadFolder(folderId, '');
          } else {
            this.loadFolder(state.currentFolderId, relPath);
          }
        } else {
          this.openPreviewModal(folderId, relPath, category, name);
        }
      },

      onSearchInput(query) {
        state.searchQuery = query.trim().toLowerCase();
        applyFiltersAndSort();
      },

      clearSearch() {
        state.searchQuery = '';
        const sInput = document.getElementById('clientSearchInput');
        if (sInput) sInput.value = '';
        applyFiltersAndSort();
      },

      setCategoryFilter(cat) {
        state.categoryFilter = cat;
        updateCategoryChipsUI();
        applyFiltersAndSort();
      },

      onSortChange(mode) {
        state.sortMode = mode;
        applyFiltersAndSort();
      },

      setViewMode(mode) {
        state.viewMode = mode;
        document.getElementById('viewGridBtn').classList.toggle('active', mode === 'grid');
        document.getElementById('viewListBtn').classList.toggle('active', mode === 'list');
        renderItemsContainer();
      },

      openPreviewModal(folderId, relPath, category, name) {
        const modal = document.getElementById('previewModalOverlay');
        const titleEl = document.getElementById('previewModalTitle');
        const bodyEl = document.getElementById('previewModalBody');
        const dlBtn = document.getElementById('previewModalDownloadBtn');

        const previewUrl = '/api/preview?folder=' + encodeURIComponent(folderId) + '&path=' + encodeURIComponent(relPath);
        const downloadUrl = '/api/download?folder=' + encodeURIComponent(folderId) + '&path=' + encodeURIComponent(relPath);

        titleEl.innerText = name;
        dlBtn.href = downloadUrl;

        bodyEl.innerHTML = '';

        if (category === 'image') {
          bodyEl.innerHTML = '<img class="preview-photo" src="' + previewUrl + '" alt="' + escapeHtml(name) + '"/>';
        } else if (category === 'video') {
          bodyEl.innerHTML = '<video class="preview-video-tag" src="' + previewUrl + '" controls autoplay playsinline></video>';
        } else if (category === 'audio') {
          bodyEl.innerHTML = '<div style="text-align: center; width: 100%; max-width: 480px; padding: 2rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-subtle);">' +
            '<div style="width: 56px; height: 56px; margin: 0 auto 1.25rem; border-radius: 50%; background: rgba(245, 158, 11, 0.15); color: #f59e0b; display: flex; align-items: center; justify-content: center;">' +
            '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>' +
            '</div>' +
            '<div style="font-weight: 600; font-size: 1rem; margin-bottom: 1.25rem; word-break: break-all;">' + escapeHtml(name) + '</div>' +
            '<audio style="width: 100%;" src="' + previewUrl + '" controls autoplay></audio>' +
            '</div>';
        } else if (category === 'document' && name.toLowerCase().endsWith('.pdf')) {
          bodyEl.innerHTML = '<iframe class="preview-iframe-doc" src="' + previewUrl + '#toolbar=1"></iframe>';
        } else if (category === 'code' || category === 'document') {
          bodyEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">Loading file content...</div>';
          fetch(previewUrl)
            .then(r => r.text())
            .then(txt => {
              bodyEl.innerHTML = '<pre class="preview-code-block"><code>' + escapeHtml(txt.slice(0, 150000)) + '</code></pre>';
            })
            .catch(e => {
              bodyEl.innerHTML = '<div style="color: var(--danger);">Failed to load preview: ' + escapeHtml(e.message) + '</div>';
            });
        } else {
          bodyEl.innerHTML = '<div class="empty-placeholder" style="border: none;">' +
            '<div class="empty-title">Preview not available</div>' +
            '<p style="margin-top: 0.5rem; color: var(--text-muted);">This file type cannot be previewed directly in the browser.</p>' +
            '<a href="' + downloadUrl + '" class="action-btn primary" style="margin-top: 1rem;" download>Download File to View</a>' +
            '</div>';
        }

        modal.classList.add('open');
      },

      closePreviewModal() {
        const modal = document.getElementById('previewModalOverlay');
        if (modal) modal.classList.remove('open');
        const bodyEl = document.getElementById('previewModalBody');
        if (bodyEl) bodyEl.innerHTML = '';
      },

      async submitPasswordAuth() {
        const input = document.getElementById('passwordGateInput');
        const errorEl = document.getElementById('passwordGateError');
        if (!input) return;

        errorEl.style.display = 'none';
        const password = input.value;

        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
          });
          const data = await res.json();
          if (data.success) {
            hidePasswordGate();
            this.loadFolder(null, '');
          } else {
            errorEl.innerText = data.error || 'Incorrect passcode.';
            errorEl.style.display = 'block';
            input.focus();
          }
        } catch (err) {
          errorEl.innerText = 'Network error: ' + err.message;
          errorEl.style.display = 'block';
        }
      },

      toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        localStorage.setItem('localshare_client_theme', state.theme);
        updateThemeIcons();
      },

      getCategoryIconSvg(category) {
        const svgs = {
          folder: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#2563eb" stroke-width="1.5"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>',
          image: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>',
          video: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
          audio: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>',
          document: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>',
          code: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
          archive: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>',
          other: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'
        };
        return svgs[category] || svgs.other;
      }
    };

    function applyFiltersAndSort() {
      let items = [...state.rawItems];

      // Category filter
      if (state.categoryFilter !== 'all') {
        items = items.filter(i => i.isDirectory || i.category === state.categoryFilter);
      }

      // Search query
      if (state.searchQuery) {
        items = items.filter(i => i.name.toLowerCase().includes(state.searchQuery));
      }

      // Sort
      items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;

        if (state.sortMode === 'name-asc') return a.name.localeCompare(b.name, undefined, { numeric: true });
        if (state.sortMode === 'name-desc') return b.name.localeCompare(a.name, undefined, { numeric: true });
        if (state.sortMode === 'size-desc') return b.size - a.size;
        if (state.sortMode === 'size-asc') return a.size - b.size;
        if (state.sortMode === 'date-desc') return b.mtime - a.mtime;
        if (state.sortMode === 'date-asc') return a.mtime - b.mtime;
        return 0;
      });

      state.filteredItems = items;
      renderItemsContainer();
    }

    function renderBreadcrumbsBar() {
      const container = document.getElementById('breadcrumbsSlot');
      if (!container) return;

      const isRoot = state.isRoot;
      const crumbs = state.breadcrumbs || [];
      const totalItems = state.rawItems.length;

      let trailHtml = '<span class="crumb-node ' + (isRoot ? 'active' : '') + '" onclick="LocalShareClient.navigateRoot()">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> Shared Folders' +
        '</span>';

      crumbs.forEach((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        trailHtml += '<span class="crumb-divider">/</span>' +
          '<span class="crumb-node ' + (isLast ? 'active' : '') + '" ' +
          (isLast ? '' : 'onclick="LocalShareClient.loadFolder(\\'' + state.currentFolderId + '\\', \\'' + encodeURIComponent(crumb.path) + '\\')"') +
          '>' + escapeHtml(crumb.label) + '</span>';
      });

      container.innerHTML = '<div class="breadcrumb-container">' +
        '<div class="breadcrumb-trail">' +
        (!isRoot ? '<button class="btn-toggle" style="width: 28px; height: 28px; margin-right: 0.3rem;" title="Go Back" onclick="LocalShareClient.navigateParent()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>' : '') +
        trailHtml +
        '</div>' +
        '<div class="folder-stats-pill">' +
        '<span>' + totalItems + ' ' + (totalItems === 1 ? 'item' : 'items') + '</span>' +
        '<button class="btn-toggle" style="width: 28px; height: 28px;" title="Reload" onclick="LocalShareClient.reloadCurrent()">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>' +
        '</button>' +
        '</div>' +
        '</div>';
    }

    function renderItemsContainer() {
      const container = document.getElementById('filesViewport');
      if (!container) return;

      const items = state.filteredItems;
      if (items.length === 0) {
        const isSearching = Boolean(state.searchQuery || state.categoryFilter !== 'all');
        container.innerHTML = '<div class="empty-placeholder">' +
          '<div class="empty-icon-wrap">' +
          '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' +
          '</div>' +
          '<div class="empty-title">' + (isSearching ? 'No matching files found' : 'This folder is empty') + '</div>' +
          '<div class="empty-subtitle">' + (isSearching ? 'Try adjusting your search query or clear category filters.' : 'No files or folders are currently shared here.') + '</div>' +
          (isSearching ? '<button class="action-btn" style="margin-top: 1rem;" onclick="LocalShareClient.clearSearch()">Clear Filters</button>' : '') +
          '</div>';
        return;
      }

      if (state.viewMode === 'grid') {
        let html = '<div class="file-grid">';
        items.forEach(item => {
          const isDir = item.isDirectory;
          const downloadUrl = isDir ? '#' : '/api/download?folder=' + encodeURIComponent(item.folderId) + '&path=' + encodeURIComponent(item.relativePath);
          const previewUrl = isDir ? '#' : '/api/preview?folder=' + encodeURIComponent(item.folderId) + '&path=' + encodeURIComponent(item.relativePath);
          const canPreview = !isDir && ['image', 'video', 'audio', 'document', 'code'].includes(item.category);
          const safeName = escapeHtml(item.name);
          const encFolder = encodeURIComponent(item.folderId);
          const encPath = encodeURIComponent(item.relativePath);
          const encName = encodeURIComponent(item.name);

          html += '<div class="grid-card" onclick="LocalShareClient.handleItemClick(\\'' + encFolder + '\\', \\'' + encPath + '\\', ' + isDir + ', \\'' + item.category + '\\', \\'' + encName + '\\')">' +
            '<div class="card-preview-stage">' +
            (item.category === 'image' && !isDir
              ? '<img class="card-img-thumb" src="' + previewUrl + '" loading="lazy" alt="' + safeName + '" onerror="this.outerHTML=LocalShareClient.getCategoryIconSvg(\\'' + item.category + '\\')"/>'
              : '<div style="transform: scale(1.3);">' + window.LocalShareClient.getCategoryIconSvg(item.category) + '</div>') +
            '</div>' +
            '<div class="card-info">' +
            '<div class="card-title" title="' + safeName + '">' + safeName + '</div>' +
            '<div class="card-meta-row">' +
            '<span class="badge-category">' + (isDir ? (state.isRoot ? 'Shared Folder' : 'Folder') : item.category) + '</span>' +
            '<span>' + (isDir ? '—' : formatBytes(item.size)) + '</span>' +
            '</div>' +
            '<div class="card-meta-row" style="margin-top: 0;">' +
            '<span style="font-size: 0.72rem; color: var(--text-dim);">' + formatDate(item.mtime) + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="card-actions-row" onclick="event.stopPropagation()">' +
            (isDir
              ? '<button class="action-btn primary" onclick="LocalShareClient.handleItemClick(\\'' + encFolder + '\\', \\'' + encPath + '\\', true, \\'folder\\', \\'' + encName + '\\')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"></path></svg> Open</button>'
              : (canPreview ? '<button class="action-btn" onclick="LocalShareClient.openPreviewModal(\\'' + encFolder + '\\', \\'' + encPath + '\\', \\'' + item.category + '\\', \\'' + encName + '\\')">Preview</button>' : '') +
                '<a href="' + downloadUrl + '" class="action-btn ' + (canPreview ? '' : 'primary') + '" download><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download</a>') +
            '</div>' +
            '</div>';
        });
        html += '</div>';
        container.innerHTML = html;
      } else {
        let html = '<div class="file-list-table">' +
          '<div class="list-head-row">' +
          '<div></div>' +
          '<div>Name</div>' +
          '<div>Size</div>' +
          '<div class="list-col-date">Modified</div>' +
          '<div style="text-align: right;">Action</div>' +
          '</div>';

        items.forEach(item => {
          const isDir = item.isDirectory;
          const downloadUrl = isDir ? '#' : '/api/download?folder=' + encodeURIComponent(item.folderId) + '&path=' + encodeURIComponent(item.relativePath);
          const canPreview = !isDir && ['image', 'video', 'audio', 'document', 'code'].includes(item.category);
          const safeName = escapeHtml(item.name);
          const encFolder = encodeURIComponent(item.folderId);
          const encPath = encodeURIComponent(item.relativePath);
          const encName = encodeURIComponent(item.name);

          html += '<div class="list-item-row" onclick="LocalShareClient.handleItemClick(\\'' + encFolder + '\\', \\'' + encPath + '\\', ' + isDir + ', \\'' + item.category + '\\', \\'' + encName + '\\')">' +
            '<div style="display: flex; align-items: center; justify-content: center;">' + window.LocalShareClient.getCategoryIconSvg(item.category) + '</div>' +
            '<div class="list-title-text" title="' + safeName + '">' + safeName + '</div>' +
            '<div class="list-meta-text">' + (isDir ? (state.isRoot ? 'Folder' : '—') : formatBytes(item.size)) + '</div>' +
            '<div class="list-meta-text list-col-date">' + formatDate(item.mtime) + '</div>' +
            '<div class="list-actions-cell" onclick="event.stopPropagation()">' +
            (isDir
              ? '<button class="action-btn" style="padding: 0.35rem 0.65rem;" onclick="LocalShareClient.handleItemClick(\\'' + encFolder + '\\', \\'' + encPath + '\\', true, \\'folder\\', \\'' + encName + '\\')">Open</button>'
              : (canPreview ? '<button class="action-btn" style="padding: 0.35rem 0.65rem;" onclick="LocalShareClient.openPreviewModal(\\'' + encFolder + '\\', \\'' + encPath + '\\', \\'' + item.category + '\\', \\'' + encName + '\\')">Preview</button>' : '') +
                '<a href="' + downloadUrl + '" class="action-btn ' + (canPreview ? '' : 'primary') + '" style="padding: 0.35rem 0.65rem;" download>Download</a>') +
            '</div>' +
            '</div>';
        });

        html += '</div>';
        container.innerHTML = html;
      }
    }

    function updateCategoryChipsUI() {
      const chips = document.querySelectorAll('.chip-btn');
      chips.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === state.categoryFilter);
      });
    }

    function updateThemeIcons() {
      const sun = document.getElementById('themeIconSun');
      const moon = document.getElementById('themeIconMoon');
      if (sun && moon) {
        if (state.theme === 'light') {
          sun.style.display = 'none';
          moon.style.display = 'block';
        } else {
          sun.style.display = 'block';
          moon.style.display = 'none';
        }
      }
    }

    function showPasswordGate() {
      document.getElementById('passwordGateSection').style.display = 'block';
      document.getElementById('explorerViewSection').style.display = 'none';
    }

    function hidePasswordGate() {
      document.getElementById('passwordGateSection').style.display = 'none';
      document.getElementById('explorerViewSection').style.display = 'block';
    }

    function formatBytes(bytes) {
      if (!bytes || bytes === 0) return '0 B';
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

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        window.LocalShareClient.closePreviewModal();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const s = document.getElementById('clientSearchInput');
        if (s) {
          s.focus();
          s.select();
        }
      }
    });

    // Auto-boot on load
    window.addEventListener('DOMContentLoaded', () => {
      window.LocalShareClient.loadFolder(null, '');
    });
  })();
  `;
}
