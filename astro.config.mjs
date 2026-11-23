import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  i18n: { locales: ['en', 'pt'], defaultLocale: 'en' },
  vite: { plugins: [tailwindcss()] },
});
