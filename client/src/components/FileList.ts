import { FileItem } from '../../../shared/types';
import { getCategoryIconSvg } from './FileGrid';

export function renderFileList(items: FileItem[], isRoot: boolean): string {
  let html = `
    <div class="file-list-table">
      <div class="list-head-row">
        <div></div>
        <div>Name</div>
        <div>Size</div>
        <div class="list-col-date">Modified</div>
        <div style="text-align: right;">Action</div>
      </div>
  `;

  for (const item of items) {
    const isDir = item.isDirectory;
    const downloadUrl = isDir ? '#' : `/api/download?folder=${encodeURIComponent(item.folderId)}&path=${encodeURIComponent(item.relativePath)}`;
    const canPreview = !isDir && ['image', 'video', 'audio', 'document', 'code'].includes(item.category);

    const safeName = escapeHtml(item.name);
    const encName = encodeURIComponent(item.name);
    const encPath = encodeURIComponent(item.relativePath);
    const encFolder = encodeURIComponent(item.folderId);

    html += `
      <div class="list-item-row" onclick="LocalShareClient.handleItemClick('${encFolder}', '${encPath}', ${isDir}, '${item.category}', '${encName}')">
        <div style="display: flex; align-items: center; justify-content: center;">
          ${getCategoryIconSvg(item.category)}
        </div>
        <div class="list-title-text" title="${safeName}">
          ${safeName}
        </div>
        <div class="list-meta-text">
          ${isDir ? (isRoot ? 'Folder' : '—') : formatBytes(item.size)}
        </div>
        <div class="list-meta-text list-col-date">
          ${formatDate(item.mtime)}
        </div>
        <div class="list-actions-cell" onclick="event.stopPropagation()">
          ${
            isDir
              ? `<button class="action-btn" style="padding: 0.35rem 0.65rem;" onclick="LocalShareClient.handleItemClick('${encFolder}', '${encPath}', true, 'folder', '${encName}')">Open</button>`
              : `
                ${canPreview ? `<button class="action-btn" style="padding: 0.35rem 0.65rem;" onclick="LocalShareClient.openPreviewModal('${encFolder}', '${encPath}', '${item.category}', '${encName}')">Preview</button>` : ''}
                <a href="${downloadUrl}" class="action-btn ${canPreview ? '' : 'primary'}" style="padding: 0.35rem 0.65rem;" download>Download</a>
              `
          }
        </div>
      </div>
    `;
  }

  html += '</div>';
  return html;
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
