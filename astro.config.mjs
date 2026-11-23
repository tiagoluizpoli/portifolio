import { fileURLToPath } from 'node:url';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const ADAPTER_ENTRY = '@astrojs/node/server.js';
const serverEntry = fileURLToPath(new URL('./src/server.ts', import.meta.url));

/** Routes the adapter's entrypoint through src/server.ts, which boots before re-exporting the adapter. */
const bootBeforeListen = {
  name: 'boot-before-listen',
  enforce: 'pre',
  resolveId(id, importer) {
    if (id === ADAPTER_ENTRY && importer !== serverEntry) return serverEntry;
  },
};

/** Bundles runtime deps into dist/ for the image (no node_modules); dev keeps them external since Vite's dev runner can't run CJS deps like `cookie` inline. */
const bundleDepsOnBuild = {
  name: 'bundle-deps-on-build',
  config: (_, { command }) => (command === 'build' ? { ssr: { noExternal: true } } : undefined),
};

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  i18n: { locales: ['en', 'pt'], defaultLocale: 'en' },
  vite: { plugins: [tailwindcss(), bootBeforeListen, bundleDepsOnBuild] },
});
