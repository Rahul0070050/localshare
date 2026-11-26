import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import { FileItem, BreadcrumbItem, FileCategory, SortMode, ViewMode, BrowseResult } from '../types';

export function useExplorer() {
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string>(() => sessionStorage.getItem('localshare_auth') || '');

  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<FileCategory>('all');
  const [sortMode, setSortMode] = useState<SortMode>('name-asc');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('localshare_view');
    return saved === 'list' ? 'list' : 'grid';
  });

  const isRoot = !currentFolder;

  // Persist view mode
  const setAndSaveViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('localshare_view', mode);
  }, []);

  // Fetch directory contents
  const fetchDirectory = useCallback(async (folderId: string = '', relPath: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (folderId) params.set('folder', folderId);
      if (relPath) params.set('path', relPath);

      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`/api/browse?${params.toString()}`, { headers });

      if (res.status === 401) {
        setPasswordRequired(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}: Failed to browse folder`);
      }

      const data: BrowseResult = await res.json();
      setPasswordRequired(false);
      setCurrentFolder(folderId);
      setCurrentPath(data.currentPath || '');
      setItems(data.items || []);

      // Build breadcrumbs from server response
      if (data.isRoot || !folderId) {
        setBreadcrumbs([]);
      } else {
        const crumbs: BreadcrumbItem[] = (data.breadcrumbs || []).map((b) => ({
          name: b.label,
          folderId,
          relativePath: b.path,
        }));
        setBreadcrumbs(crumbs);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading files.');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  // Initial load
  useEffect(() => {
    fetchDirectory(currentFolder, currentPath);
  }, [fetchDirectory]);

  // Navigation handlers
  const navigateTo = useCallback((folderId: string, relPath: string) => {
    setSearchTerm('');
    fetchDirectory(folderId, relPath);
  }, [fetchDirectory]);

  const navigateUp = useCallback(() => {
    if (!currentFolder) return;
    if (!currentPath) {
      // Go to root
      navigateTo('', '');
      return;
    }
    const parts = currentPath.split(/[\/\\]+/).filter(Boolean);
    parts.pop();
    navigateTo(currentFolder, parts.join('/'));
  }, [currentFolder, currentPath, navigateTo]);

  const navigateRoot = useCallback(() => {
    navigateTo('', '');
  }, [navigateTo]);

  const refresh = useCallback(() => {
    fetchDirectory(currentFolder, currentPath);
  }, [fetchDirectory, currentFolder, currentPath]);

  // Unlock password
  const submitPassword = useCallback(async (password: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem('localshare_auth', data.token);
        setAuthToken(data.token);
        setPasswordRequired(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filter: at root level, always keep shared folders visible so user can navigate into them
        if (categoryFilter !== 'all') {
          if (isRoot && item.isDirectory) {
            // Keep folder visible
          } else if (item.category !== categoryFilter) {
            return false;
          }
        }
        // Search term filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          return item.name.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        // Always list directories first
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;

        switch (sortMode) {
          case 'name-asc':
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
          case 'name-desc':
            return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
          case 'size-desc':
            return (b.size || 0) - (a.size || 0);
          case 'size-asc':
            return (a.size || 0) - (b.size || 0);
          case 'date-desc':
            return new Date(b.mtime || 0).getTime() - new Date(a.mtime || 0).getTime();
          case 'date-asc':
            return new Date(a.mtime || 0).getTime() - new Date(b.mtime || 0).getTime();
          default:
            return 0;
        }
      });
  }, [items, categoryFilter, searchTerm, sortMode]);

  return {
    currentFolder,
    currentPath,
    breadcrumbs,
    items,
    filteredItems,
    isRoot,
    loading,
    error,
    passwordRequired,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortMode,
    setSortMode,
    viewMode,
    setViewMode: setAndSaveViewMode,
    navigateTo,
    navigateUp,
    navigateRoot,
    refresh,
    submitPassword,
  };
}
