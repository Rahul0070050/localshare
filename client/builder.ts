import path from 'path';
import fs from 'fs';
import { THEME_CSS } from './src/styles/theme';

let cachedBundleJs: string | null = null;

/**
 * Resolves the Preact client JS bundle.
 * Prefers the pre-built bundle.js, falling back to dynamic esbuild.
 */
export function getClientBundleJs(): string {
  // 1. Look for pre-built bundle.js in various resolution paths
  const possibleBundlePaths = [
    path.join(__dirname, 'bundle.js'),
    path.join(__dirname, '../../client/bundle.js'),
    path.join(process.cwd(), 'client/bundle.js'),
    path.join(process.cwd(), 'dist-electron/client/bundle.js'),
  ];

  for (const bPath of possibleBundlePaths) {
    if (fs.existsSync(bPath)) {
      return fs.readFileSync(bPath, 'utf8');
    }
  }

  if (cachedBundleJs) {
    return cachedBundleJs;
  }

  // 2. Fallback: dynamically compile with esbuild if running in dev/test
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const esbuild = require('esbuild');
    const possibleEntryPaths = [
      path.join(__dirname, 'src/index.tsx'),
      path.join(__dirname, '../../client/src/index.tsx'),
      path.join(process.cwd(), 'client/src/index.tsx'),
    ];

    let entryPoint = '';
    for (const ePath of possibleEntryPaths) {
      if (fs.existsSync(ePath)) {
        entryPoint = ePath;
        break;
      }
    }

    if (entryPoint) {
      const result = esbuild.buildSync({
        entryPoints: [entryPoint],
        bundle: true,
        minify: true,
        format: 'iife',
        write: false,
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        target: ['es2020', 'chrome80', 'safari13', 'edge80', 'firefox78'],
      });

      if (result.outputFiles && result.outputFiles.length > 0) {
        cachedBundleJs = result.outputFiles[0].text;
        return cachedBundleJs || '';
      }
    }
  } catch (err) {
    console.warn('[builder] Dynamic esbuild compilation failed, using fallback:', err);
  }

  return cachedBundleJs || '';
}

/**
 * Builds the complete standalone Preact Client Web Application HTML.
 * Fully offline, zero CDN dependencies, responsive mobile & desktop layout.
 */
export function buildClientAppHtml(options: {
  title?: string;
  hasPassword?: boolean;
}): string {
  const title = options.title || 'LocalShare';
  const bundleJs = getClientBundleJs();

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
  <div id="root"></div>
  <script>
${bundleJs}
  </script>
</body>
</html>`;
}
