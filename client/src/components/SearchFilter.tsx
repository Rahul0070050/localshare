import { h } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import { FileCategory, SortMode, ViewMode } from '../types';
import { SearchIcon, GridIcon, ListIcon, CloseIcon } from './Icons';

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  categoryFilter: FileCategory;
  onCategoryChange: (category: FileCategory) => void;
  sortMode: SortMode;
  onSortChange: (sort: SortMode) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const CATEGORIES: { id: FileCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Images' },
  { id: 'video', label: 'Videos' },
  { id: 'audio', label: 'Audio' },
  { id: 'document', label: 'Documents' },
  { id: 'code', label: 'Code' },
  { id: 'archive', label: 'Archives' },
];

export function SearchFilter({
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  sortMode,
  onSortChange,
  viewMode,
  onViewModeChange,
}: SearchFilterProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' focuses search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div class="toolbar-container">
      {/* Search Bar */}
      <div class="search-field">
        <SearchIcon class="search-icon-svg" size={16} />
        <input
          ref={searchInputRef}
          type="text"
          class="search-input"
          placeholder="Filter files in current folder... (Press / to search)"
          value={searchTerm}
          onInput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
        />
        {searchTerm && (
          <button
            class="btn-toggle"
            style={{ width: '24px', height: '24px', padding: 0 }}
            onClick={() => onSearchChange('')}
            title="Clear search"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {/* Category Chips Bar */}
      <div class="category-chips-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            class={`chip-btn ${categoryFilter === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort & View Mode Switches */}
      <div class="view-sort-group">
        <select
          class="select-dropdown"
          value={sortMode}
          onChange={(e) => onSortChange((e.target as HTMLSelectElement).value as SortMode)}
        >
          <option value="name-asc">Name (A to Z)</option>
          <option value="name-desc">Name (Z to A)</option>
          <option value="size-desc">Size (Largest first)</option>
          <option value="size-asc">Size (Smallest first)</option>
          <option value="date-desc">Modified (Newest)</option>
          <option value="date-asc">Modified (Oldest)</option>
        </select>

        <button
          class={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}
          title="Switch to Grid View"
          onClick={() => onViewModeChange('grid')}
          aria-label="Grid view"
        >
          <GridIcon size={18} />
        </button>

        <button
          class={`btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
          title="Switch to List View"
          onClick={() => onViewModeChange('list')}
          aria-label="List view"
        >
          <ListIcon size={18} />
        </button>
      </div>
    </div>
  );
}
