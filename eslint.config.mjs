import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // Global rules for all TS/TSX files
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      // Add global rules here
      'no-unused-vars': 'off', // Use TS version
      '@typescript-eslint/no-unused-vars': 'warn',
      'semi': ['error', 'always'],
      'prettier/prettier': 'warn',
    },
  },
  // CLI app
  {
    files: ['apps/cli/src/**/*.ts'],
    rules: {
      // Add CLI-specific rules here
    },
  },
  // Electron app (TS and TSX, React)
  {
    files: ['apps/electron/src/**/*.ts', 'apps/electron/src/**/*.tsx'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // Add Electron-specific rules here
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // Extension app
  {
    files: ['apps/extension/src/**/*.ts'],
    rules: {
      // Add Extension-specific rules here
    },
  },
  // E2E tests
  {
    files: ['apps-e2e/src/**/*.ts'],
    rules: {
      // Add E2E-specific rules here
    },
  },
  // Libs: Adapters
  {
    files: ['libs/adapters/model-adapter/src/**/*.ts'],
    rules: {
      // Add model-adapter-specific rules here
    },
  },
  {
    files: ['libs/adapters/plugin-loader-adapter/src/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/adapters/reflexion-adapter/src/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/adapters/observability-adapter/src/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/adapters/search-adapter/src/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/adapters/storage-adapter/src/**/*.ts'],
    rules: {},
  },
  // Libs: Agents
  {
    files: ['libs/agents/coder-agent/src/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/agents/critic-agent/src/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/agents/explainability-agent/src/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/agents/feedback-agent/src/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/agents/memory-agent/src/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/agents/planner-agent/src/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/agents/reasoning-agent/src/**/*.ts'],
    rules: {},
  },
  // Libs: Shared and Utils
  {
    files: ['libs/shared/**/*.ts'],
    rules: {},
  },
  {
    files: ['libs/utils/**/*.ts'],
    rules: {},
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    ignores: [],
    rules: {},
  },
]; 