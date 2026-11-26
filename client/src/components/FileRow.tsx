import { h, Fragment } from 'preact';
import { FileItem } from '../types';
import { CategoryIcon, DownloadIcon } from './Icons';
import { formatBytes, formatDate, getDownloadUrl } from '../utils/formatters';

interface FileRowProps {
  item: FileItem;
  isRoot: boolean;
  onOpenFolder: (folderId: string, relPath: string) => void;
  onPreview: (item: FileItem) => void;
}

export function FileRow({ item, isRoot, onOpenFolder, onPreview }: FileRowProps) {
  const isDir = item.isDirectory;
  const canPreview = !isDir && ['image', 'video', 'audio', 'document', 'code'].includes(item.category);

  const handleClick = () => {
    if (isDir) {
      onOpenFolder(item.folderId, item.relativePath);
    } else if (canPreview) {
      onPreview(item);
    }
  };

  const downloadUrl = getDownloadUrl(item);

  return (
    <div class="list-item-row" onClick={handleClick}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CategoryIcon category={isDir ? 'folder' : item.category} size={18} />
      </div>

      <div class="list-title-text" title={item.name}>
        {item.name}
      </div>

      <div class="list-meta-text">
        {isDir ? (isRoot ? 'Click to open →' : 'Folder') : formatBytes(item.size)}
      </div>

      <div class="list-meta-text list-col-date">
        {formatDate(item.mtime)}
      </div>

      <div class="list-actions-cell" onClick={(e) => e.stopPropagation()}>
        {isDir ? (
          <button
            class="action-btn"
            style={{ padding: '0.35rem 0.65rem' }}
            onClick={() => onOpenFolder(item.folderId, item.relativePath)}
          >
            Open
          </button>
        ) : (
          <>
            {canPreview && (
              <button
                class="action-btn"
                style={{ padding: '0.35rem 0.65rem' }}
                onClick={() => onPreview(item)}
              >
                Preview
              </button>
            )}
            <a
              href={downloadUrl}
              class={`action-btn ${canPreview ? '' : 'primary'}`}
              style={{ padding: '0.35rem 0.65rem' }}
              download={item.name}
              title={`Download ${item.name}`}
            >
              <DownloadIcon size={12} />
              Download
            </a>
          </>
        )}
      </div>
    </div>
  );
}
