import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.spec.ts'],
  },
}); 