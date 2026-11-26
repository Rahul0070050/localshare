import { FileItem, BrowseResult } from '../../shared/types';

export type FileCategory =
  | 'all'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'code'
  | 'archive'
  | 'other';

export type SortField = 'name' | 'size' | 'date';
export type SortDirection = 'asc' | 'desc';
export type SortMode = `${SortField}-${SortDirection}`;
export type ViewMode = 'grid' | 'list';

export interface BreadcrumbItem {
  name: string;
  folderId: string;
  relativePath: string;
}

export interface PreviewState {
  isOpen: boolean;
  item: FileItem | null;
  textContent?: string;
  loadingText?: boolean;
}

export type { FileItem, BrowseResult };
