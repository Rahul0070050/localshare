import { h } from 'preact';
import { FolderIcon, SearchIcon } from './Icons';

interface EmptyStateProps {
  isSearch: boolean;
  onClearSearch?: () => void;
}

export function EmptyState({ isSearch, onClearSearch }: EmptyStateProps) {
  if (isSearch) {
    return (
      <div class="empty-state-box">
        <div class="empty-state-icon">
          <SearchIcon size={32} />
        </div>
        <div class="empty-state-headline">No matching files found</div>
        <div class="empty-state-desc">
          Try adjusting your search keywords or clearing the category filter chips.
        </div>
        {onClearSearch && (
          <button class="action-btn primary" onClick={onClearSearch} style={{ marginTop: '0.5rem' }}>
            Clear Search Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div class="empty-state-box">
      <div class="empty-state-icon">
        <FolderIcon size={32} />
      </div>
      <div class="empty-state-headline">This folder is empty</div>
      <div class="empty-state-desc">
        There are no files or subdirectories shared in this folder.
      </div>
    </div>
  );
}
