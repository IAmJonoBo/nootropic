# Nx Guide

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://docs.nootropic.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **NOTE**: This guide is optimized for Nx 21.2.0 and later. For older versions, please refer to the migration guide.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Project Structure](#project-structure)
- [Build System](#build-system)
- [Testing](#testing)
- [Linting](#linting)
- [Development Workflow](#development-workflow)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

Nx is our monorepo management system, providing:

- Distributed task caching
- Incremental builds
- Project graph visualization
- Smart rebuilds
- Parallel execution
- ESM/NodeNext support
- Integrated testing
- Build optimization

## Core Concepts

### 1. Build & Compilation

- `@nx/js:tsc` executor for TypeScript libraries
- `@nx/vite:build` for application and UI library builds
- `@nx/vite:dev-server` for development server
- `@nx/node:execute` for script execution

### 2. Testing Framework

- `@nx/vite:test` for unit and integration testing
- `@nx/playwright:configuration` for E2E testing
- `@nx/cypress:cypress-project` for component testing

### 3. Linting & Formatting

- Built-in ESLint support via `@nx/eslint:lint`
- Integrated Prettier via ESLint plugin
- `@nx/workspace:affected` for smart linting

### 4. CLI & Scripting

- Custom Nx generators for scaffolding
- `@nx/workspace:run-commands` for scripts
- Built-in prompt support for wizards

## Project Structure

### 1. Workspace Configuration

```json
{
  "extends": "@nx/workspace/presets/npm.json",
  "affected": {
    "defaultBase": "main"
  },
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "e2e"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    },
    "test": {
      "inputs": ["default", "^production"]
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/.eslintrc.json"]
    }
  }
}
```

### 2. Application Configuration

```json
{
  "name": "my-app",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/my-app/src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "outputs": ["{options.outputPath}"],
      "defaultConfiguration": "production",
      "options": {
        "outputPath": "dist/apps/my-app"
      },
      "configurations": {
        "development": {
          "mode": "development"
        },
        "production": {
          "mode": "production",
          "sourcemap": true
        }
      }
    },
    "serve": {
      "executor": "@nx/vite:dev-server",
      "defaultConfiguration": "development",
      "options": {
        "buildTarget": "my-app:build"
      },
      "configurations": {
        "development": {
          "buildTarget": "my-app:build:development",
          "hmr": true
        },
        "production": {
          "buildTarget": "my-app:build:production",
          "hmr": false
        }
      }
    },
    "test": {
      "executor": "@nx/vite:test",
      "outputs": ["{options.reportsDirectory}"],
      "options": {
        "passWithNoTests": true,
        "reportsDirectory": "../../coverage/apps/my-app"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": ["{options.outputFile}"]
    }
  }
}
```

### 3. Library Configuration

```json
{
  "name": "my-lib",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "libs/my-lib/src",
  "projectType": "library",
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/my-lib",
        "main": "libs/my-lib/src/index.ts",
        "tsConfig": "libs/my-lib/tsconfig.lib.json",
        "assets": ["libs/my-lib/*.md"]
      }
    },
    "test": {
      "executor": "@nx/vite:test",
      "outputs": ["{options.reportsDirectory}"],
      "options": {
        "passWithNoTests": true,
        "reportsDirectory": "../../coverage/libs/my-lib"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": ["{options.outputFile}"]
    }
  }
}
```

## Build System

### 1. TypeScript Configuration

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "rootDir": ".",
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2015",
    "module": "esnext",
    "lib": ["es2020", "dom"],
    "skipLibCheck": true,
    "skipDefaultLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@nootropic/*": ["libs/*/src/index.ts"]
    }
  },
  "exclude": ["node_modules", "tmp"]
}
```

### 2. ESLint Configuration

```json
{
  "extends": ["@nx/eslint/plugin"],
  "rules": {
    "@nx/enforce-module-boundaries": [
      "error",
      {
        "enforceBuildableLibDependency": true,
        "allow": [],
        "depConstraints": [
          {
            "sourceTag": "*",
            "onlyDependOnLibsWithTags": ["*"]
          }
        ]
      }
    ]
  }
}
```

## Testing

### 1. Vitest Configuration

```typescript
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts"],
    coverage: {
      reporter: ["text", "lcov"],
      exclude: ["**/*.test.ts"],
    },
  },
  resolve: {
    alias: {
      "@nootropic": resolve(__dirname, "../../libs"),
    },
  },
});
```

## Development Workflow

### 1. Common Commands

```bash
# Build all projects
pnpm nx run-many --target=build --all

# Build affected projects
pnpm nx affected:build

# Test all projects
pnpm nx run-many --target=test --all

# Test affected projects
pnpm nx affected:test

# Lint all projects
pnpm nx run-many --target=lint --all

# Lint affected projects
pnpm nx affected:lint
```

### 2. Project Graph

```bash
# Generate project graph
pnpm nx graph

# Generate dependency graph
pnpm nx dep-graph
```

## Performance Optimization

### 1. Caching

- Use `nx.json` to configure cacheable operations
- Enable distributed caching for CI/CD
- Configure cache size limits

### 2. Build Optimization

- Use `@nx/js:tsc` for TypeScript libraries
- Use `@nx/vite:build` for applications and UI libraries
- Enable source maps in production
- Configure HMR for development

### 3. Test Optimization

- Use `@nx/vite:test` for fast test execution
- Configure test coverage reporting
- Enable parallel test execution

## Troubleshooting

### 1. Common Issues

- Build failures
- Test failures
- Lint errors
- Cache issues

### 2. Solutions

- Clear Nx cache
- Update dependencies
- Check configuration
- Review logs
