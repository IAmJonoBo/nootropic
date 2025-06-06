# Development Guide

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://docs.nootropic.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

This guide provides comprehensive instructions for developing the nootropic project as a solo developer.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Resource Management](#resource-management)
- [Local Development](#local-development)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git
- VS Code (recommended)
- Local development environment

### Initial Setup

1. **Clone Repository**
   ```bash
   # Clone the repository
   git clone https://github.com/nootropic/nootropic.git
   cd nootropic
   ```

2. **Install Dependencies**
   ```bash
   # Install dependencies
   pnpm install
   ```

3. **Setup Development Environment**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp .env.development.example .env.development
   ```

## Development Workflow

### Branch Management

1. **Create Feature Branch**
   ```bash
   # Create and switch to feature branch
   git checkout -b feature/my-feature
   ```

2. **Keep Branch Updated**
   ```bash
   # Fetch latest changes
   git fetch origin
   git checkout main
   git pull origin main
   git checkout feature/my-feature
   git rebase main
   ```

### Development Process

1. **Start Development Server**
   ```bash
   # Start all applications
   pnpm nx run-many --target=serve --all

   # Start specific application
   pnpm nx serve electron

   # Start with watch mode
   pnpm nx serve electron --watch

   # Start with specific configuration
   pnpm nx serve electron --configuration=development
   ```

2. **Run Tests**
   ```bash
   # Run all tests
   pnpm nx run-many --target=test --all

   # Run specific project tests
   pnpm nx test shared

   # Run tests with coverage
   pnpm nx test shared --coverage

   # Run affected tests
   pnpm nx affected:test

   # Run tests in watch mode
   pnpm nx test shared --watch
   ```

3. **Build Project**
   ```bash
   # Build all projects
   pnpm nx run-many --target=build --all

   # Build specific project
   pnpm nx build shared

   # Build with specific configuration
   pnpm nx build shared --configuration=production

   # Build affected projects
   pnpm nx affected:build

   # Show build graph
   pnpm nx graph
   ```

4. **Lint and Format**
   ```bash
   # Lint all projects
   pnpm nx run-many --target=lint --all

   # Lint specific project
   pnpm nx lint shared

   # Lint affected projects
   pnpm nx affected:lint

   # Format all files
   pnpm nx format:write

   # Check formatting
   pnpm nx format:check
   ```

5. **Cache Management**
   ```bash
   # Clear Nx cache
   pnpm nx reset

   # Show cache status
   pnpm nx show-cache

   # Show build cache
   pnpm nx show-builds

   # Show test cache
   pnpm nx show-tests
   ```

### Local Development

1. **Resource Management**
   ```bash
   # Monitor memory usage
   pnpm nx monitor:memory

   # Monitor CPU usage
   pnpm nx monitor:cpu

   # Monitor storage usage
   pnpm nx monitor:storage
   ```

2. **Performance Optimization**
   ```bash
   # Analyze build performance
   pnpm nx analyze:build

   # Analyze test performance
   pnpm nx analyze:test

   # Analyze runtime performance
   pnpm nx analyze:runtime
   ```

## Code Style

### TypeScript

1. **TypeScript Configuration**
   ```json
   // tsconfig.json
   {
     "extends": "./tsconfig.base.json",
     "compilerOptions": {
       "module": "NodeNext",
       "moduleResolution": "NodeNext",
       "target": "ES2022",
       "strict": true
     }
   }
   ```

2. **ESLint Configuration**
   ```javascript
   // .eslintrc.js
   module.exports = {
     root: true,
     extends: ['@nootropic/eslint-config'],
     parserOptions: {
       project: './tsconfig.json'
     }
   };
   ```

3. **Prettier Configuration**
   ```json
   // .prettierrc
   {
     "singleQuote": true,
     "trailingComma": "none",
     "printWidth": 100
   }
   ```

### Code Organization

1. **Project Structure**
   ```
   nootropic/
   ├── apps/                    # Application projects
   │   ├── cli/                # CLI application
   │   ├── electron/           # Electron application
   │   └── vscode-extension/   # VS Code extension
   ├── libs/                   # Shared libraries
   │   ├── shared/            # Common utilities
   │   ├── runtime/           # Runtime components
   │   └── adapters/          # External service adapters
   ├── tools/                  # Build and development tools
   ├── nx.json                # Nx configuration
   ├── package.json           # Root package.json
   └── tsconfig.base.json    # Base TypeScript configuration
   ```

2. **File Naming**
   - Use kebab-case for file names
   - Use PascalCase for component files
   - Use camelCase for utility files

3. **Import Order**
   - External dependencies
   - Internal modules
   - Relative imports
   - Type imports

## Resource Management

### Memory Management

1. **Memory Limits**
   ```bash
   # Set memory limit
   pnpm nx config:set memory.limit=4GB

   # Monitor memory usage
   pnpm nx monitor:memory
   ```

2. **Memory Optimization**
   ```bash
   # Optimize memory usage
   pnpm nx optimize:memory

   # Clean memory cache
   pnpm nx clean:memory
   ```

### CPU Management

1. **CPU Limits**
   ```bash
   # Set CPU limit
   pnpm nx config:set cpu.limit=4

   # Monitor CPU usage
   pnpm nx monitor:cpu
   ```

2. **CPU Optimization**
   ```bash
   # Optimize CPU usage
   pnpm nx optimize:cpu

   # Clean CPU cache
   pnpm nx clean:cpu
   ```

### Storage Management

1. **Storage Limits**
   ```bash
   # Set storage limit
   pnpm nx config:set storage.limit=10GB

   # Monitor storage usage
   pnpm nx monitor:storage
   ```

2. **Storage Optimization**
   ```bash
   # Optimize storage usage
   pnpm nx optimize:storage

   # Clean storage cache
   pnpm nx clean:storage
   ```

## Local Development

### Development Environment

1. **Environment Setup**
   ```bash
   # Setup development environment
   pnpm nx setup:dev

   # Configure development settings
   pnpm nx config:dev
   ```

2. **Resource Configuration**
   ```bash
   # Configure resource limits
   pnpm nx config:resources

   # Configure performance settings
   pnpm nx config:performance
   ```

### Performance Optimization

1. **Build Optimization**
   ```bash
   # Optimize build process
   pnpm nx optimize:build

   # Analyze build performance
   pnpm nx analyze:build
   ```

2. **Runtime Optimization**
   ```bash
   # Optimize runtime performance
   pnpm nx optimize:runtime

   # Analyze runtime performance
   pnpm nx analyze:runtime
   ```

### Monitoring

1. **Resource Monitoring**
   ```bash
   # Monitor system resources
   pnpm nx monitor:system

   # Monitor application resources
   pnpm nx monitor:app
   ```

2. **Performance Monitoring**
   ```bash
   # Monitor build performance
   pnpm nx monitor:build

   # Monitor runtime performance
   pnpm nx monitor:runtime
   ```

> **See Also**: [Performance Guide](../PERFORMANCE.md) for performance details.
> **See Also**: [Monitoring Guide](../MONITORING.md) for monitoring details.
> **See Also**: [Resource Guide](../RESOURCE.md) for resource management.
