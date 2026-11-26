import { renderHeader } from './src/components/Header';
import { renderSearchFilter } from './src/components/SearchFilter';
import { renderPreviewModal } from './src/components/PreviewModal';
import { renderPasswordGate } from './src/components/PasswordGate';
import { THEME_CSS } from './src/styles/theme';
import { getClientScript } from './src/app';

/**
 * Builds the complete standalone Client Web Application HTML.
 * Fully offline, zero CDN dependencies, responsive mobile & desktop layout.
 */
export function buildClientAppHtml(options: {
  title?: string;
  hasPassword?: boolean;
}): string {
  const title = options.title || 'LocalShare';

  const headerHtml = renderHeader();
  const searchFilterHtml = renderSearchFilter();
  const previewModalHtml = renderPreviewModal();
  const passwordGateHtml = renderPasswordGate();
  const clientScript = getClientScript();

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="theme-color" content="#080c14">
  <title>${title} — Local Network File Explorer</title>
  <style>
${THEME_CSS}
  </style>
</head>
<body>
  <!-- Header -->
  ${headerHtml}

  <!-- Main Container -->
  <main class="client-main">
    <!-- Password Protection Gate -->
    ${passwordGateHtml}

    <!-- Main Explorer View -->
    <div id="explorerViewSection">
      <!-- Breadcrumbs Bar -->
      <div id="breadcrumbsSlot"></div>

      <!-- Toolbar: Search, Category Chips, Sort & View Switches -->
      ${searchFilterHtml}

      <!-- Files and Folders Viewport -->
      <div id="filesViewport"></div>
    </div>
  </main>

  <!-- Media Preview Modal -->
  ${previewModalHtml}

  <!-- Client Application Script -->
  <script>
${clientScript}
  </script>
</body>
</html>`;
}
