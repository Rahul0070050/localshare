import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import { FileItem } from '../types';
import { CategoryIcon, DownloadIcon, ChevronRightIcon } from './Icons';
import { formatBytes, formatDate, getPreviewUrl, getDownloadUrl } from '../utils/formatters';

interface FileCardProps {
  item: FileItem;
  isRoot: boolean;
  onOpenFolder: (folderId: string, relPath: string) => void;
  onPreview: (item: FileItem) => void;
}

export function FileCard({ item, isRoot, onOpenFolder, onPreview }: FileCardProps) {
  const [thumbError, setThumbError] = useState(false);
  const isDir = item.isDirectory;
  const canPreview = !isDir && ['image', 'video', 'audio', 'document', 'code'].includes(item.category);

  const handleClick = () => {
    if (isDir) {
      onOpenFolder(item.folderId, item.relativePath);
    } else if (canPreview) {
      onPreview(item);
    }
  };

  const previewUrl = getPreviewUrl(item);
  const downloadUrl = getDownloadUrl(item);

  return (
    <div class="grid-card" onClick={handleClick}>
      {/* Preview Stage / Icon */}
      <div class="card-preview-stage">
        {item.category === 'image' && !isDir && !thumbError ? (
          <img
            class="card-img-thumb"
            src={previewUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setThumbError(true)}
          />
        ) : (
          <div style={{ transform: 'scale(1.3)' }}>
            <CategoryIcon category={isDir ? 'folder' : item.category} size={28} />
          </div>
        )}
      </div>

      {/* Card Info */}
      <div class="card-info">
        <div class="card-title" title={item.name}>
          {item.name}
        </div>
        <div class="card-meta-row">
          <span class="badge-category">
            {isDir ? (isRoot ? 'Shared Folder' : 'Folder') : item.category}
          </span>
          <span style={isDir && isRoot ? { color: 'var(--primary)', fontWeight: 600 } : undefined}>
            {isDir ? (isRoot ? 'Click to open →' : 'Folder') : formatBytes(item.size)}
          </span>
        </div>
        <div class="card-meta-row" style={{ marginTop: '0.15rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            {formatDate(item.mtime)}
          </span>
        </div>
      </div>

      {/* Hover Action Row */}
      <div class="card-actions-row" onClick={(e) => e.stopPropagation()}>
        {isDir ? (
          <button
            class="action-btn primary"
            onClick={() => onOpenFolder(item.folderId, item.relativePath)}
          >
            <ChevronRightIcon size={14} />
            Open
          </button>
        ) : (
          <>
            {canPreview && (
              <button class="action-btn" onClick={() => onPreview(item)}>
                Preview
              </button>
            )}
            <a
              href={downloadUrl}
              class={`action-btn ${canPreview ? '' : 'primary'}`}
              download={item.name}
              title={`Download ${item.name}`}
            >
              <DownloadIcon size={13} />
              Download
            </a>
          </>
        )}
      </div>
    </div>
  );
}
