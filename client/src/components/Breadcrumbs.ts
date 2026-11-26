export function renderBreadcrumbs(options: {
  isRoot: boolean;
  crumbs: Array<{ label: string; path: string }>;
  totalItems: number;
}): string {
  const { isRoot, crumbs, totalItems } = options;

  let trailHtml = `
    <span class="crumb-node ${isRoot ? 'active' : ''}" onclick="LocalShareClient.navigateRoot()">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      Shared Folders
    </span>
  `;

  crumbs.forEach((crumb, idx) => {
    const isLast = idx === crumbs.length - 1;
    trailHtml += `
      <span class="crumb-divider">/</span>
      <span class="crumb-node ${isLast ? 'active' : ''}" ${
        isLast ? '' : `onclick="LocalShareClient.loadFolder('', '${encodeURIComponent(crumb.path)}')"`
      }>
        ${escapeHtml(crumb.label)}
      </span>
    `;
  });

  return `
    <div class="breadcrumb-container">
      <div class="breadcrumb-trail">
        ${
          !isRoot
            ? `<button class="btn-toggle" style="width: 28px; height: 28px; margin-right: 0.3rem;" title="Go Up / Back" onclick="LocalShareClient.navigateParent()">
                 <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <polyline points="15 18 9 12 15 6"></polyline>
                 </svg>
               </button>`
            : ''
        }
        ${trailHtml}
      </div>

      <div class="folder-stats-pill">
        <span>${totalItems} ${totalItems === 1 ? 'item' : 'items'}</span>
        <button class="btn-toggle" style="width: 28px; height: 28px;" title="Refresh" onclick="LocalShareClient.reloadCurrent()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
