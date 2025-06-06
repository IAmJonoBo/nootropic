# Nx Migration Guide

This guide outlines the process of migrating to Nx-centric tooling and best practices.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Migration Steps](#migration-steps)
3. [Package Replacements](#package-replacements)
4. [Configuration Updates](#configuration-updates)
5. [Testing & Validation](#testing--validation)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+
- PNPM 10.11.1+
- Git
- VS Code (recommended)

## Migration Steps

### 1. Update Core Dependencies

```bash
# Update Nx and related packages
pnpm add -D nx@latest @nx/js@latest @nx/react@latest @nx/vite@latest @nx/workspace@latest

# Add testing packages
pnpm add -D @nx/jest@latest @nx/vitest@latest @nx/playwright@latest @nx/cypress@latest

# Add linting packages
pnpm add -D @nx/lint@latest @nx/eslint@latest

# Add build packages
pnpm add -D @nx-tools/esbuild@latest
```

### 2. Update Project Configuration

1. Update `nx.json`:
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

2. Update `tsconfig.base.json`:
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

### 3. Replace Standalone Tools

1. **Build Tools**:
   - Replace `tsc` with `@nx/js:tsc`
   - Replace custom rollup/esbuild with `@nx/js:rollup` or `@nx-tools/esbuild`
   - Replace ts-node scripts with `@nx/node:execute`

2. **Testing**:
   - Migrate Jest configs to `@nx/jest:jest-project`
   - Update Vitest to use `@nx/vitest:configuration`
   - Configure Playwright with `@nx/playwright:configuration`
   - Set up Cypress with `@nx/cypress:cypress-project`

3. **Linting**:
   - Use `@nx/lint:eslint` for ESLint
   - Integrate Prettier via ESLint plugin
   - Use `@nx/workspace:affected` for smart linting

4. **CLI & Scripting**:
   - Replace commander.js with Nx generators
   - Use `@nx/workspace:run-commands` for scripts
   - Replace inquirer.js with built-in prompts

5. **Documentation**:
   - Use custom Nx generators for docs
   - Integrate TypeDoc with `@nx/js:typedoc`
   - Keep Docusaurus but manage as Nx app

## Package Replacements

| Current Package | Nx Alternative | Migration Notes |
|----------------|----------------|----------------|
| typescript + tsc | @nx/js:tsc | Update build targets |
| rollup/esbuild | @nx/js:rollup or @nx-tools/esbuild | Update bundling config |
| jest | @nx/jest:jest-project | Migrate test configs |
| vitest | @nx/vitest:configuration | Update test setup |
| eslint | @nx/lint:eslint | Use Nx ESLint config |
| prettier | ESLint Prettier plugin | Remove standalone config |
| commander.js | Nx generators | Create custom generators |
| inquirer.js | @nx/workspace:run-commands | Use built-in prompts |

## Configuration Updates

### ESLint Configuration

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

### Jest Configuration

```javascript
module.exports = {
  displayName: 'project-name',
  preset: '@nx/jest/presets/js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: './coverage'
};
```

## Testing & Validation

1. **Build Validation**:
```bash
# Test build process
pnpm nx run-many --target=build --all

# Verify affected builds
pnpm nx affected:build
```

2. **Test Validation**:
```bash
# Run all tests
pnpm nx run-many --target=test --all

# Run affected tests
pnpm nx affected:test
```

3. **Lint Validation**:
```bash
# Run all linting
pnpm nx run-many --target=lint --all

# Run affected linting
pnpm nx affected:lint
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check `tsconfig.json` paths
   - Verify project dependencies
   - Check for circular dependencies

2. **Test Failures**:
   - Verify Jest/Vitest configuration
   - Check test environment setup
   - Validate test dependencies

3. **Lint Errors**:
   - Update ESLint rules
   - Fix import boundaries
   - Resolve dependency issues

### Getting Help

- Check [Nx Documentation](https://nx.dev)
- Join [Nx Discord](https://nx.dev/community)
- Review [Nx GitHub Issues](https://github.com/nrwl/nx/issues)

## Next Steps

1. **Performance Optimization**:
   - Configure distributed caching
   - Set up affected commands
   - Optimize build times

2. **CI/CD Integration**:
   - Set up GitHub Actions
   - Configure caching
   - Add status checks

3. **Documentation**:
   - Update project docs
   - Add migration notes
   - Document new workflows 