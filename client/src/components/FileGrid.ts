import { FileItem } from '../../../shared/types';

export function renderFileGrid(items: FileItem[], isRoot: boolean): string {
  let html = '<div class="file-grid">';

  for (const item of items) {
    const isDir = item.isDirectory;
    const downloadUrl = isDir ? '#' : `/api/download?folder=${encodeURIComponent(item.folderId)}&path=${encodeURIComponent(item.relativePath)}`;
    const previewUrl = isDir ? '#' : `/api/preview?folder=${encodeURIComponent(item.folderId)}&path=${encodeURIComponent(item.relativePath)}`;
    const canPreview = !isDir && ['image', 'video', 'audio', 'document', 'code'].includes(item.category);

    const safeName = escapeHtml(item.name);
    const encName = encodeURIComponent(item.name);
    const encPath = encodeURIComponent(item.relativePath);
    const encFolder = encodeURIComponent(item.folderId);

    html += `
      <div class="grid-card" onclick="LocalShareClient.handleItemClick('${encFolder}', '${encPath}', ${isDir}, '${item.category}', '${encName}')">
        <div class="card-preview-stage">
          ${
            item.category === 'image' && !isDir
              ? `<img class="card-img-thumb" src="${previewUrl}" loading="lazy" alt="${safeName}" onerror="this.outerHTML=LocalShareClient.getCategoryIconSvg('${item.category}')"/>`
              : `<div style="transform: scale(1.3);">${getCategoryIconSvg(item.category)}</div>`
          }
        </div>

        <div class="card-info">
          <div class="card-title" title="${safeName}">${safeName}</div>
          <div class="card-meta-row">
            <span class="badge-category">${isDir ? (isRoot ? 'Shared Folder' : 'Folder') : item.category}</span>
            <span>${isDir ? '—' : formatBytes(item.size)}</span>
          </div>
          <div class="card-meta-row" style="margin-top: 0;">
            <span style="font-size: 0.72rem; color: var(--text-dim);">${formatDate(item.mtime)}</span>
          </div>
        </div>

        <div class="card-actions-row" onclick="event.stopPropagation()">
          ${
            isDir
              ? `<button class="action-btn primary" onclick="LocalShareClient.handleItemClick('${encFolder}', '${encPath}', true, 'folder', '${encName}')">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                     <path d="m9 18 6-6-6-6"></path>
                   </svg>
                   Open
                 </button>`
              : `
                ${canPreview ? `<button class="action-btn" onclick="LocalShareClient.openPreviewModal('${encFolder}', '${encPath}', '${item.category}', '${encName}')">Preview</button>` : ''}
                <a href="${downloadUrl}" class="action-btn ${canPreview ? '' : 'primary'}" download>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </a>
              `
          }
        </div>
      </div>
    `;
  }

  html += '</div>';
  return html;
}

export function getCategoryIconSvg(category: string): string {
  switch (category) {
    case 'folder':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6" stroke="#2563eb" stroke-width="1.5"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>`;
    case 'image':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>`;
    case 'video':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>`;
    case 'audio':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`;
    case 'document':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
    case 'code':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`;
    case 'archive':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>`;
    default:
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

function formatDate(ms: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
