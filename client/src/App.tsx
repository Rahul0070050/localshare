import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import { useExplorer } from './hooks/useExplorer';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SearchFilter } from './components/SearchFilter';
import { FileCard } from './components/FileCard';
import { FileRow } from './components/FileRow';
import { PreviewModal } from './components/PreviewModal';
import { PasswordGate } from './components/PasswordGate';
import { EmptyState } from './components/EmptyState';
import { FileItem } from './types';

export function App() {
  const { theme, toggleTheme } = useTheme();
  const explorer = useExplorer();
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);

  return (
    <div class="client-app-shell">
      {/* Frosted Glass Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigateHome={explorer.navigateRoot}
      />

      {/* Main Explorer Viewport */}
      <main class="client-main">
        {explorer.passwordRequired ? (
          <PasswordGate onSubmit={explorer.submitPassword} />
        ) : (
          <div>
            {/* Breadcrumbs Navigation Bar */}
            <Breadcrumbs
              breadcrumbs={explorer.breadcrumbs}
              isRoot={explorer.isRoot}
              itemCount={explorer.filteredItems.length}
              loading={explorer.loading}
              onNavigate={explorer.navigateTo}
              onNavigateUp={explorer.navigateUp}
              onNavigateRoot={explorer.navigateRoot}
              onRefresh={explorer.refresh}
            />

            {/* Toolbar: Search, Category Chips, Sort & View Toggles */}
            <SearchFilter
              searchTerm={explorer.searchTerm}
              onSearchChange={explorer.setSearchTerm}
              categoryFilter={explorer.categoryFilter}
              onCategoryChange={explorer.setCategoryFilter}
              sortMode={explorer.sortMode}
              onSortChange={explorer.setSortMode}
              viewMode={explorer.viewMode}
              onViewModeChange={explorer.setViewMode}
            />

            {/* Loading Spinner */}
            {explorer.loading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <div class="spin-icon" style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                  ⏳
                </div>
                <div>Loading directory contents...</div>
              </div>
            )}

            {/* Error Message */}
            {explorer.error && (
              <div style={{ padding: '1.5rem', margin: '1rem 0', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', textAlign: 'center' }}>
                {explorer.error}
              </div>
            )}

            {/* Empty States */}
            {!explorer.loading && !explorer.error && explorer.filteredItems.length === 0 && (
              <EmptyState
                isSearch={Boolean(explorer.searchTerm) || explorer.categoryFilter !== 'all'}
                onClearSearch={() => {
                  explorer.setSearchTerm('');
                  explorer.setCategoryFilter('all');
                }}
              />
            )}

            {/* Content: Grid or List */}
            {!explorer.loading && !explorer.error && explorer.filteredItems.length > 0 && (
              <div>
                {explorer.viewMode === 'grid' ? (
                  <div class="file-grid">
                    {explorer.filteredItems.map((item) => (
                      <FileCard
                        key={`${item.folderId}-${item.relativePath}`}
                        item={item}
                        isRoot={explorer.isRoot}
                        onOpenFolder={(fId, path) => explorer.navigateTo(fId, path)}
                        onPreview={(itm) => setPreviewItem(itm)}
                      />
                    ))}
                  </div>
                ) : (
                  <div class="file-list-table">
                    <div class="list-head-row">
                      <div />
                      <div>Name</div>
                      <div>Size</div>
                      <div class="list-col-date">Modified</div>
                      <div style={{ textAlign: 'right' }}>Action</div>
                    </div>
                    {explorer.filteredItems.map((item) => (
                      <FileRow
                        key={`${item.folderId}-${item.relativePath}`}
                        item={item}
                        isRoot={explorer.isRoot}
                        onOpenFolder={(fId, path) => explorer.navigateTo(fId, path)}
                        onPreview={(itm) => setPreviewItem(itm)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Media Preview Modal */}
      <PreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
}
