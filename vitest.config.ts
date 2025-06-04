import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'libs/agents/*',
      'libs/adapters/*',
      // Add more globs as needed for other testable libs
    ],
  },
}); 