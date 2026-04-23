import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    coverage: {
      enabled: true,
      include: ['src/**/*.ts'],
      exclude: ['**/node_modules/**', '**/appwrite-core/**'],
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 100,
        statements: 100,
        functions: 100,
        branches: 100,
      },
    },
  },
});
