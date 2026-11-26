import { FileItem, BrowseResult } from '../../../shared/types';

export interface ClientAppState {
  currentFolderId: string | null;
  currentRelativePath: string;
  isRoot: boolean;
  folderName?: string;
  rawItems: FileItem[];
  filteredItems: FileItem[];
  breadcrumbs: Array<{ label: string; path: string }>;
  searchQuery: string;
  categoryFilter: string;
  sortMode: string;
  viewMode: 'grid' | 'list';
  theme: 'dark' | 'light';
  isLoading: boolean;
}

export const clientState: ClientAppState = {
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
  theme: 'dark',
  isLoading: false,
};
