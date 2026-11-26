import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import mime from 'mime-types';
import { SharedFolder, ServerSettings, BrowseResult, FileItem } from '../../shared/types';
import { resolveSafePath, getFileCategory, getSafeContentDisposition } from './security';
import { VisitorTracker } from './tracker';
import { getClientApp } from './client-provider';

export class LocalSharingServer {
  private server: http.Server | null = null;
  private isServerRunning = false;
  private currentPort = 3000;
  private startTime: number | null = null;
  private visitorTracker = new VisitorTracker();
  private sessionTokens = new Set<string>();

  // Data access callbacks
  private getFolders: () => SharedFolder[];
  private getSettings: () => ServerSettings;

  constructor(
    getFolders: () => SharedFolder[],
    getSettings: () => ServerSettings
  ) {
    this.getFolders = getFolders;
    this.getSettings = getSettings;
  }

  public getTracker(): VisitorTracker {
    return this.visitorTracker;
  }

  public isRunning(): boolean {
    return this.isServerRunning;
  }

  public getPort(): number {
    return this.currentPort;
  }

  public getStartTime(): number | null {
    return this.startTime;
  }

  public async start(requestedPort = 3000): Promise<{ port: number }> {
    if (this.isServerRunning) {
      return { port: this.currentPort };
    }

    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        this.handleRequest(req, res);
      });

      server.on('error', (err: any) => {
        this.isServerRunning = false;
        reject(err);
      });

      server.listen(requestedPort, '0.0.0.0', () => {
        const address = server.address();
        const actualPort = typeof address === 'object' && address ? address.port : requestedPort;
        this.currentPort = actualPort;
        this.isServerRunning = true;
        this.startTime = Date.now();
        this.server = server;
        resolve({ port: actualPort });
      });
    });
  }

  public async stop(): Promise<void> {
    if (!this.server || !this.isServerRunning) {
      this.isServerRunning = false;
      return;
    }

    return new Promise((resolve) => {
      if (typeof (this.server as any).closeAllConnections === 'function') {
        (this.server as any).closeAllConnections();
      }
      this.server!.close(() => {
        this.server = null;
        this.isServerRunning = false;
        this.startTime = null;
        resolve();
      });
    });
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const rawIp = req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    // Record visitor activity
    this.visitorTracker.recordRequest(rawIp, userAgent);

    // Set standard security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'no-referrer');

    // Parse URL
    const reqUrl = req.url || '/';
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(reqUrl, `http://${req.headers.host || 'localhost'}`);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Malformed URL' }));
      return;
    }

    const pathname = parsedUrl.pathname;
    const method = req.method?.toUpperCase() || 'GET';

    // Route: Authentication POST /api/auth
    if (pathname === '/api/auth' && method === 'POST') {
      this.handleAuth(req, res);
      return;
    }

    // Only allow GET and HEAD for file server routes
    if (method !== 'GET' && method !== 'HEAD') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
      return;
    }

    // Check password protection
    const settings = this.getSettings();
    if (settings.passwordProtection && settings.password) {
      const isAuthed = this.checkAuthentication(req);
      if (!isAuthed && pathname !== '/' && !pathname.startsWith('/api/status')) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized', requiresAuth: true }));
        return;
      }
    }

    // Route: Root / Client Web UI
    if (pathname === '/' || pathname === '/index.html') {
      const html = getClientApp({
        hasPassword: Boolean(settings.passwordProtection && settings.password),
      });
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.end(html);
      return;
    }

    // Route: Server Status GET /api/status
    if (pathname === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          running: true,
          port: this.currentPort,
          hasPassword: Boolean(settings.passwordProtection && settings.password),
        })
      );
      return;
    }

    // Route: Browse Directory GET /api/browse
    if (pathname === '/api/browse') {
      this.handleBrowse(parsedUrl, res);
      return;
    }

    // Route: Download File GET /api/download
    if (pathname === '/api/download') {
      this.handleFileTransfer(parsedUrl, req, res, false);
      return;
    }

    // Route: Preview File GET /api/preview
    if (pathname === '/api/preview') {
      this.handleFileTransfer(parsedUrl, req, res, true);
      return;
    }

    // 404 for unknown endpoints
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }

  private handleAuth(req: http.IncomingMessage, res: http.ServerResponse): void {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 4096) {
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        const settings = this.getSettings();
        if (parsed.password && parsed.password === settings.password) {
          const token = crypto.randomBytes(32).toString('hex');
          this.sessionTokens.add(token);

          // Expire after 24 hours
          setTimeout(() => {
            this.sessionTokens.delete(token);
          }, 24 * 60 * 60 * 1000);

          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Set-Cookie': `localshare_session=${token}; Path=/; HttpOnly; SameSite=Lax`,
          });
          res.end(JSON.stringify({ success: true, token }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Incorrect password' }));
        }
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON request' }));
      }
    });
  }

  private checkAuthentication(req: http.IncomingMessage): boolean {
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/localshare_session=([a-f0-9]+)/);
      if (match && this.sessionTokens.has(match[1])) {
        return true;
      }
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (this.sessionTokens.has(token)) {
        return true;
      }
    }

    return false;
  }

  private async handleBrowse(parsedUrl: URL, res: http.ServerResponse): Promise<void> {
    const folderId = parsedUrl.searchParams.get('folder');
    const relativePath = parsedUrl.searchParams.get('path') || '';

    const enabledFolders = this.getFolders().filter((f) => f.enabled);

    // Root level: return list of enabled shared folders
    if (!folderId) {
      const items: FileItem[] = enabledFolders.map((f) => ({
        name: f.displayName,
        relativePath: '',
        folderId: f.id,
        isDirectory: true,
        size: f.totalSize || 0,
        mtime: f.createdAt,
        extension: '',
        category: 'folder',
      }));

      const result: BrowseResult = {
        currentPath: '',
        breadcrumbs: [],
        isRoot: true,
        items,
        totalFolders: items.length,
        totalFiles: 0,
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    // Inside a specific shared folder
    const targetFolder = enabledFolders.find((f) => f.id === folderId);
    if (!targetFolder) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Folder not found or sharing disabled' }));
      return;
    }

    const safeResult = await resolveSafePath(targetFolder.originalPath, relativePath);
    if (!safeResult) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Access denied or invalid path' }));
      return;
    }

    const { safePath, stat } = safeResult;
    if (!stat.isDirectory()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Requested path is not a directory' }));
      return;
    }

    try {
      const entries = await fs.promises.readdir(safePath, { withFileTypes: true });
      const items: FileItem[] = [];

      for (const entry of entries) {
        // Skip hidden files/directories by default
        if (entry.name.startsWith('.')) continue;

        const entryRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
        const entryFullPath = path.join(safePath, entry.name);

        try {
          const entryStat = await fs.promises.stat(entryFullPath);
          const isDir = entryStat.isDirectory();
          const ext = isDir ? '' : path.extname(entry.name).toLowerCase().replace('.', '');
          const category = isDir ? 'folder' : getFileCategory(entry.name);
          const mimeType = isDir ? undefined : mime.lookup(entry.name) || 'application/octet-stream';

          items.push({
            name: entry.name,
            relativePath: entryRelPath,
            folderId: targetFolder.id,
            isDirectory: isDir,
            size: isDir ? 0 : entryStat.size,
            mtime: entryStat.mtimeMs,
            extension: ext,
            category,
            mimeType,
          });
        } catch {
          // Ignore unreadable entries
        }
      }

      // Sort folders first, then alphabetically
      items.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });

      // Build breadcrumbs
      const breadcrumbs: Array<{ label: string; path: string }> = [
        { label: targetFolder.displayName, path: '' },
      ];

      if (relativePath) {
        const parts = relativePath.split('/').filter(Boolean);
        let accumulated = '';
        for (const part of parts) {
          accumulated = accumulated ? `${accumulated}/${part}` : part;
          breadcrumbs.push({ label: part, path: accumulated });
        }
      }

      const totalFolders = items.filter((i) => i.isDirectory).length;
      const totalFiles = items.filter((i) => !i.isDirectory).length;

      const result: BrowseResult = {
        currentPath: relativePath,
        breadcrumbs,
        isRoot: false,
        folderName: targetFolder.displayName,
        items,
        totalFolders,
        totalFiles,
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read directory: ' + err.message }));
    }
  }

  private async handleFileTransfer(
    parsedUrl: URL,
    req: http.IncomingMessage,
    res: http.ServerResponse,
    inline: boolean
  ): Promise<void> {
    const folderId = parsedUrl.searchParams.get('folder');
    const relativePath = parsedUrl.searchParams.get('path');

    if (!folderId || !relativePath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing folder or path parameter' }));
      return;
    }

    const enabledFolders = this.getFolders().filter((f) => f.enabled);
    const targetFolder = enabledFolders.find((f) => f.id === folderId);
    if (!targetFolder) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Folder not found or disabled' }));
      return;
    }

    const safeResult = await resolveSafePath(targetFolder.originalPath, relativePath);
    if (!safeResult) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Access denied or invalid path' }));
      return;
    }

    const { safePath, stat } = safeResult;
    if (stat.isDirectory()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Requested item is a directory' }));
      return;
    }

    const filename = path.basename(safePath);
    const mimeType = mime.lookup(filename) || 'application/octet-stream';
    const totalSize = stat.size;

    // Check Range header for media streaming (video/audio seeking)
    const rangeHeader = req.headers.range;

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (isNaN(start) || isNaN(end) || start >= totalSize || end >= totalSize || start > end) {
        res.writeHead(416, {
          'Content-Range': `bytes */${totalSize}`,
        });
        res.end();
        return;
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(safePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
        'Content-Disposition': getSafeContentDisposition(filename, inline),
        'Cache-Control': 'public, max-age=3600',
      });

      fileStream.pipe(res);
      fileStream.on('error', () => {
        if (!res.headersSent) {
          res.writeHead(500);
          res.end();
        }
      });
    } else {
      // Full file transfer
      res.writeHead(200, {
        'Content-Length': totalSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
        'Content-Disposition': getSafeContentDisposition(filename, inline),
        'Cache-Control': 'public, max-age=3600',
      });

      const fileStream = fs.createReadStream(safePath);
      fileStream.pipe(res);
      fileStream.on('error', () => {
        if (!res.headersSent) {
          res.writeHead(500);
          res.end();
        }
      });
    }
  }
}
