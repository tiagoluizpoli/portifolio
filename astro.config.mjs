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

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  i18n: { locales: ['en', 'pt'], defaultLocale: 'en' },
  // Bundle runtime deps so the image ships dist/ without node_modules.
  vite: { plugins: [tailwindcss(), bootBeforeListen], ssr: { noExternal: true } },
});
