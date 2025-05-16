import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.json',
      '*.md',
      '*.lock',
      '*.log',
      '*.cache',
      '*.snap',
      '*.png',
      '*.jpg',
      '*.jpeg',
      '*.gif',
      '*.svg',
      '*.ico',
      '*.DS_Store',
      '*.test.ts',
      '*.spec.ts',
      '*.contract.test.ts',
    ],
  },
  ...tseslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
]; 