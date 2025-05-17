// ESLint 9+ flat config. Plugins must be imported as objects, not strings.
// Ignore patterns are now set via the 'ignores' property, not .eslintignore.
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import tsdoc from 'eslint-plugin-tsdoc';

export default [
  {
    files: [
      '*.ts',
      '*.tsx',
      'utils/**/*.ts',
      'utils/**/*.tsx',
      'web/**/*.ts',
      'web/**/*.tsx',
      'scripts/**/*.ts',
    ],
    ignores: [
      'dist/',
      'node_modules/',
      '.nootropic-cache/archive/',
      '**/*.d.ts',
      'web/src/vite-env.d.ts',
    ],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
        ecmaVersion: 2022,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'tsdoc': tsdoc,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
      'tsdoc/syntax': 'warn',
    },
  },
]; 