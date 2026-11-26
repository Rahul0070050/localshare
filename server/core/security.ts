import path from 'path';
import fs from 'fs';
import { FileCategory } from '../../shared/types';

/**
 * Validate that a relative path stays strictly within the folder root,
 * resolving any symbolic links and checking against directory traversal.
 */
export async function resolveSafePath(
  folderRoot: string,
  relativePath: string
): Promise<{ safePath: string; stat: fs.Stats } | null> {
  try {
    // Clean and validate relative path
    if (relativePath.includes('\0')) {
      return null;
    }

    // Decode URI components
    let decoded = decodeURIComponent(relativePath);

    // Normalize slashes
    decoded = decoded.replace(/\\/g, '/');

    const resolvedRoot = path.resolve(folderRoot);
    const targetPath = path.resolve(resolvedRoot, '.' + path.sep + path.normalize(decoded));

    // Target must start with resolvedRoot path
    const normalizedRoot = path.normalize(resolvedRoot);
    const normalizedTarget = path.normalize(targetPath);

    // Platform-aware prefix comparison (Windows drive letter casing can differ)
    const isWindows = process.platform === 'win32';
    const rootCmp = isWindows ? normalizedRoot.toLowerCase() : normalizedRoot;
    const targetCmp = isWindows ? normalizedTarget.toLowerCase() : normalizedTarget;

    const rootPrefix = rootCmp.endsWith(path.sep) ? rootCmp : rootCmp + path.sep;
    if (targetCmp !== rootCmp && !targetCmp.startsWith(rootPrefix)) {
      return null;
    }

    // Check if path exists
    let stat: fs.Stats;
    try {
      stat = await fs.promises.stat(targetPath);
    } catch {
      return null;
    }

    // Check realpath to prevent symlink traversal outside of root
    try {
      const realRoot = await fs.promises.realpath(resolvedRoot);
      const realTarget = await fs.promises.realpath(targetPath);

      const realRootCmp = isWindows ? realRoot.toLowerCase() : realRoot;
      const realTargetCmp = isWindows ? realTarget.toLowerCase() : realTarget;
      const realRootPrefix = realRootCmp.endsWith(path.sep) ? realRootCmp : realRootCmp + path.sep;

      if (realTargetCmp !== realRootCmp && !realTargetCmp.startsWith(realRootPrefix)) {
        // Symlink escaped folder boundary!
        return null;
      }
    } catch {
      return null;
    }

    return { safePath: targetPath, stat };
  } catch {
    return null;
  }
}

/**
 * Categorize a file by its extension
 */
export function getFileCategory(filename: string): FileCategory {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  
  const categories: Record<string, FileCategory> = {
    // Images
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    webp: 'image',
    svg: 'image',
    bmp: 'image',
    ico: 'image',
    tiff: 'image',
    avif: 'image',

    // Video
    mp4: 'video',
    webm: 'video',
    mkv: 'video',
    avi: 'video',
    mov: 'video',
    wmv: 'video',
    flv: 'video',
    m4v: 'video',

    // Audio
    mp3: 'audio',
    wav: 'audio',
    ogg: 'audio',
    flac: 'audio',
    m4a: 'audio',
    aac: 'audio',
    wma: 'audio',
    opus: 'audio',

    // Documents
    pdf: 'document',
    doc: 'document',
    docx: 'document',
    xls: 'document',
    xlsx: 'document',
    ppt: 'document',
    pptx: 'document',
    txt: 'document',
    md: 'document',
    rtf: 'document',
    odt: 'document',
    csv: 'document',

    // Code
    js: 'code',
    ts: 'code',
    jsx: 'code',
    tsx: 'code',
    html: 'code',
    css: 'code',
    json: 'code',
    py: 'code',
    c: 'code',
    cpp: 'code',
    h: 'code',
    cs: 'code',
    java: 'code',
    go: 'code',
    rs: 'code',
    php: 'code',
    sh: 'code',
    bat: 'code',
    ps1: 'code',
    yml: 'code',
    yaml: 'code',
    xml: 'code',
    sql: 'code',

    // Archives
    zip: 'archive',
    tar: 'archive',
    gz: 'archive',
    rar: 'archive',
    '7z': 'archive',
    bz2: 'archive',
  };

  return categories[ext] || 'other';
}

/**
 * Sanitize filename for Content-Disposition header
 */
export function getSafeContentDisposition(filename: string, inline = false): string {
  const sanitized = filename.replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(filename);
  const disposition = inline ? 'inline' : 'attachment';
  return `${disposition}; filename="${sanitized}"; filename*=UTF-8''${encoded}`;
}
