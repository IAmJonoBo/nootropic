import { defineConfig } from 'vitest/config';

// Canonical Vitest config for ESM/TypeScript best practices
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
    },
    globals: true, // for describe/it/expect
    // Extend as needed for custom setup, reporters, etc.
  },
}); 