# Development Environment Setup

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://docs.nootropic.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **NOTE:** This project is developed and maintained by a solo developer. All workflows, tools, and recommendations are optimized for local-first development, privacy, and data sovereignty. Cloud-based and distributed features are optional and not required for core development.

This guide provides comprehensive instructions for setting up the development environment for the nootropic project, with a focus on local-first workflows and solo developer needs.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Nx Workspace Setup](#nx-workspace-setup)
- [Development Tools](#development-tools)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Debugging](#debugging)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Nx Commands Reference](#nx-commands-reference)

## Prerequisites

### System Requirements

- **Operating System**: macOS, Linux, or Windows (WSL2)
- **Node.js**: v20 or later
- **pnpm**: v10.11.1 or later
- **Nx**: v21.2.0
- **Git**: Latest stable version
- **Docker**: Latest stable version (optional, for local services)

### Required Tools

1. **Node.js and pnpm**
   ```bash
   # Install Node.js (using nvm)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   nvm install 20
   nvm use 20

   # Install pnpm
   curl -fsSL https://get.pnpm.io/install.sh | sh -

   # Install Nx CLI
   pnpm add -g nx@21.2.0
   ```

2. **Git**
   ```bash
   # macOS
   brew install git

   # Ubuntu/Debian
   sudo apt-get install git

   # Windows (WSL2)
   sudo apt-get install git
   ```

3. **Docker** (optional, for local services)
   ```bash
   # macOS
   brew install --cask docker

   # Ubuntu/Debian
   curl -fsSL https://get.docker.com | sh

   # Windows (WSL2)
   curl -fsSL https://get.docker.com | sh
   ```

## Initial Setup

### Clone Repository

```bash
# Clone the repository
git clone https://github.com/nootropic/nootropic.git
cd nootropic

# Install dependencies
pnpm install
```

### Environment Configuration

1. **Create Environment Files**
   ```bash
   # Copy example environment files
   cp .env.example .env
   cp .env.development.example .env.development
   ```

2. **Configure Environment Variables**
   - Set `NODE_ENV=development` and other local variables as needed.
   - No cloud tokens or remote endpoints are required for local development.

## Nx Workspace Setup

### 1. Workspace Configuration

1. **Initialize Nx Workspace**
   ```bash
   # If starting from scratch
   pnpm dlx create-nx-workspace@21.2.0 nootropic --preset=empty --packageManager=pnpm

   # Or use the existing workspace
   pnpm install
   ```

2. **Configure Nx**
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

3. **Configure Project Tags**
   ```json
   {
     "tags": {
       "scope": {
         "app": "Application projects",
         "lib": "Library projects",
         "tool": "Development tools"
       },
       "type": {
         "ui": "User interface components",
         "feature": "Feature modules",
         "util": "Utility functions"
       }
     }
   }
   ```

### 2. Project Configuration

1. **Application Projects**
   ```json
   {
     "name": "nootropic-cli",
     "$schema": "../../node_modules/nx/schemas/project-schema.json",
     "sourceRoot": "apps/cli/src",
     "projectType": "application",
     "targets": {
       "build": {
         "executor": "@nx/vite:build",
         "outputs": ["{options.outputPath}"],
         "defaultConfiguration": "production",
         "options": {
           "outputPath": "dist/apps/cli"
         },
         "configurations": {
           "development": {
             "mode": "development"
           },
           "production": {
             "mode": "production"
           }
         }
       },
       "serve": {
         "executor": "@nx/vite:dev-server",
         "defaultConfiguration": "development",
         "options": {
           "buildTarget": "nootropic-cli:build"
         },
         "configurations": {
           "development": {
             "buildTarget": "nootropic-cli:build:development",
             "hmr": true
           },
           "production": {
             "buildTarget": "nootropic-cli:build:production",
             "hmr": false
           }
         }
       },
       "test": {
         "executor": "@nx/jest:jest",
         "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
         "options": {
           "jestConfig": "apps/cli/jest.config.ts"
         }
       },
       "lint": {
         "executor": "@nx/eslint:lint",
         "outputs": ["{options.outputFile}"]
       }
     }
   }
   ```

2. **Library Projects**
   ```json
   {
     "name": "shared-utils",
     "$schema": "../../node_modules/nx/schemas/project-schema.json",
     "sourceRoot": "libs/shared-utils/src",
     "projectType": "library",
     "targets": {
       "build": {
         "executor": "@nx/js:tsc",
         "outputs": ["{options.outputPath}"],
         "options": {
           "outputPath": "dist/libs/shared-utils",
           "main": "libs/shared-utils/src/index.ts",
           "tsConfig": "libs/shared-utils/tsconfig.lib.json",
           "assets": ["libs/shared-utils/*.md"]
         }
       },
       "test": {
         "executor": "@nx/jest:jest",
         "outputs": ["{workspaceRoot}/coverage/{projectRoot}"],
         "options": {
           "jestConfig": "libs/shared-utils/jest.config.ts"
         }
       },
       "lint": {
         "executor": "@nx/eslint:lint",
         "outputs": ["{options.outputFile}"]
       }
     }
   }
   ```

## Development Tools

### 1. VS Code Extensions

- **Nx Console**: Nx integration for VS Code
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **GitLens**: Git integration
- **Docker**: Docker integration

### 2. Development Scripts

```json
{
  "scripts": {
    "start": "nx serve",
    "build": "nx build",
    "test": "nx test",
    "lint": "nx lint",
    "e2e": "nx e2e",
    "graph": "nx graph",
    "affected": "nx affected"
  }
}
```

## Development Workflow

### 1. Common Commands

```bash
# Start development server
pnpm nx serve <project>

# Build project
pnpm nx build <project>

# Run tests
pnpm nx test <project>

# Run linting
pnpm nx lint <project>

# Run E2E tests
pnpm nx e2e <project>

# Generate project graph
pnpm nx graph

# Run affected commands
pnpm nx affected:build
pnpm nx affected:test
pnpm nx affected:lint
```

### 2. Project Generation

```bash
# Generate application
pnpm nx g @nx/js:app <name>

# Generate library
pnpm nx g @nx/js:lib <name>

# Generate component
pnpm nx g @nx/react:component <name>

# Generate service
pnpm nx g @nx/js:service <name>
```

## Testing

### 1. Unit Testing

```bash
# Run all tests
pnpm nx run-many --target=test --all

# Run affected tests
pnpm nx affected:test

# Run specific project tests
pnpm nx test <project>
```

### 2. E2E Testing

```bash
# Run all E2E tests
pnpm nx run-many --target=e2e --all

# Run affected E2E tests
pnpm nx affected:e2e

# Run specific project E2E tests
pnpm nx e2e <project>
```

## Debugging

### 1. VS Code Configuration

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current File",
      "program": "${file}",
      "skipFiles": ["<node_internals>/**"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### 2. Chrome DevTools

```bash
# Start with debugging
pnpm nx serve <project> --inspect
```

## Troubleshooting

### 1. Common Issues

- **Build Failures**
  - Check `tsconfig.json` paths
  - Verify project dependencies
  - Check for circular dependencies

- **Test Failures**
  - Verify Jest/Vitest configuration
  - Check test environment setup
  - Validate test dependencies

- **Lint Errors**
  - Update ESLint rules
  - Fix import boundaries
  - Resolve dependency issues

### 2. Getting Help

- Check [Nx Documentation](https://nx.dev)
- Join [Nx Discord](https://nx.dev/community)
- Review [Nx GitHub Issues](https://github.com/nrwl/nx/issues)

## Best Practices

1. **Local Development**
   - Use local cache by default
   - Run services locally
   - Keep data on-premises

2. **Dependency Management**
   - Use strict module boundaries
   - Enforce architectural constraints
   - Prefer implicit dependencies

3. **Build Optimization**
   - Enable parallel builds
   - Use incremental builds
   - Leverage caching

4. **Testing Strategy**
   - Run affected tests
   - Use parallel test execution
   - Maintain test isolation

## Nx Commands Reference

### Project Management

```bash
# Create new project
pnpm nx g @nx/js:app <name>
pnpm nx g @nx/js:lib <name>

# Generate component
pnpm nx g @nx/react:component <name>

# Generate service
pnpm nx g @nx/js:service <name>
```

### Build & Test

```bash
# Build project
pnpm nx build <project>

# Test project
pnpm nx test <project>

# Lint project
pnpm nx lint <project>

# E2E test project
pnpm nx e2e <project>
```

### Development

```bash
# Start development server
pnpm nx serve <project>

# Watch for changes
pnpm nx watch <project>

# Run affected commands
pnpm nx affected:build
pnpm nx affected:test
pnpm nx affected:lint
```

### Analysis

```bash
# Generate project graph
pnpm nx graph

# Generate dependency graph
pnpm nx dep-graph

# List projects
pnpm nx list
```