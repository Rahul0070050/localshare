import { h } from 'preact';
import { BreadcrumbItem } from '../types';
import { HomeIcon, ArrowLeftIcon, RefreshIcon, ChevronRightIcon } from './Icons';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  isRoot: boolean;
  itemCount: number;
  loading: boolean;
  onNavigate: (folderId: string, relPath: string) => void;
  onNavigateUp: () => void;
  onNavigateRoot: () => void;
  onRefresh: () => void;
}

export function Breadcrumbs({
  breadcrumbs,
  isRoot,
  itemCount,
  loading,
  onNavigate,
  onNavigateUp,
  onNavigateRoot,
  onRefresh,
}: BreadcrumbsProps) {
  return (
    <nav class="nav-breadcrumbs" aria-label="Directory Breadcrumbs">
      <div class="crumbs-trail">
        {/* Home / Root */}
        <button
          class={`crumb-item ${isRoot ? 'active' : ''}`}
          onClick={onNavigateRoot}
          title="Shared Root Folders"
        >
          <HomeIcon size={14} />
          <span>Shared Folders</span>
        </button>

        {/* Path segments */}
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <span key={`${crumb.folderId}-${crumb.relativePath}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span class="crumb-separator">
                <ChevronRightIcon size={12} />
              </span>
              <button
                class={`crumb-item ${isLast ? 'active' : ''}`}
                onClick={() => !isLast && onNavigate(crumb.folderId, crumb.relativePath)}
                disabled={isLast}
              >
                <span>{crumb.name}</span>
              </button>
            </span>
          );
        })}
      </div>

      <div class="crumbs-actions">
        {/* Item count badge */}
        <span class="item-count-badge">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>

        {/* Back Button */}
        {!isRoot && (
          <button
            class="btn-toggle"
            title="Go up one folder (Alt+Up)"
            onClick={onNavigateUp}
            aria-label="Back to parent folder"
          >
            <ArrowLeftIcon size={14} />
          </button>
        )}

        {/* Refresh Button */}
        <button
          class="btn-toggle"
          title="Reload contents"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Reload current directory"
        >
          <RefreshIcon size={14} class={loading ? 'spin-icon' : ''} />
        </button>
      </div>
    </nav>
  );
}
