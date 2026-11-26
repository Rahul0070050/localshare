import { FileCategory } from '../types';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1));
  return `${val} ${sizes[i]}`;
}

export function formatDate(mtime: string | number): string {
  if (!mtime) return '—';
  try {
    const d = new Date(mtime);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function getFileCategory(name: string, isDirectory: boolean): FileCategory {
  if (isDirectory) return 'all';
  const dot = name.lastIndexOf('.');
  if (dot === -1) return 'other';
  const ext = name.slice(dot + 1).toLowerCase();

  const map: Record<string, FileCategory> = {
    // Images
    png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image', svg: 'image',
    bmp: 'image', ico: 'image', tiff: 'image', avif: 'image',
    // Video
    mp4: 'video', mkv: 'video', webm: 'video', avi: 'video', mov: 'video', m4v: 'video',
    // Audio
    mp3: 'audio', wav: 'audio', ogg: 'audio', flac: 'audio', m4a: 'audio', aac: 'audio',
    // Documents
    pdf: 'document', doc: 'document', docx: 'document', txt: 'document', rtf: 'document',
    odt: 'document', xls: 'document', xlsx: 'document', ppt: 'document', pptx: 'document',
    // Code
    js: 'code', ts: 'code', jsx: 'code', tsx: 'code', json: 'code', html: 'code',
    css: 'code', scss: 'code', py: 'code', rs: 'code', go: 'code', c: 'code',
    cpp: 'code', h: 'code', java: 'code', md: 'code', sh: 'code', sql: 'code',
    yml: 'code', yaml: 'code', toml: 'code', xml: 'code',
    // Archives
    zip: 'archive', tar: 'archive', gz: 'archive', '7z': 'archive', rar: 'archive',
  };

  return map[ext] || 'other';
}

export function getPreviewUrl(item: { folderId: string; relativePath: string }): string {
  return `/api/preview?folder=${encodeURIComponent(item.folderId)}&path=${encodeURIComponent(item.relativePath)}`;
}

export function getDownloadUrl(item: { folderId: string; relativePath: string }): string {
  return `/api/download?folder=${encodeURIComponent(item.folderId)}&path=${encodeURIComponent(item.relativePath)}`;
}
