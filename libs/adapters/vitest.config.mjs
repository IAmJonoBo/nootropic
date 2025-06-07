import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.spec.ts'],
    },
  },
  resolve: {
    alias: {
      '@nootropic/shared': resolve(__dirname, '../../libs/shared/src/index.ts'),
      '@nootropic/runtime': resolve(__dirname, '../../libs/runtime/src/index.ts'),
      '@nootropic/adapters/observability-adapter': resolve(__dirname, './observability-adapter/src/index.ts'),
    },
  },
}); 