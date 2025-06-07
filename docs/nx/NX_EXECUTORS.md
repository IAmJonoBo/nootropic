# Nx Executors Guide

## Overview

This guide explains how to use and create custom executors in nootropic, focusing on local-first development and task execution best practices.

## Table of Contents

1. [Available Executors](#available-executors)
2. [Using Executors](#using-executors)
3. [Creating Executors](#creating-executors)
4. [Executor Best Practices](#executor-best-practices)
5. [Executor Examples](#executor-examples)

## Available Executors

### Application Executors

```json
{
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

### Library Executors

```json
{
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

### UI Library Executors

```json
{
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/ui",
        "tsConfig": "libs/ui/tsconfig.lib.json",
        "assets": ["libs/ui/*.md"]
      }
    },
    "test": {
      "executor": "@nx/vite:test",
      "outputs": ["{options.reportsDirectory}"],
      "options": {
        "passWithNoTests": true,
        "reportsDirectory": "../../coverage/libs/ui"
      }
    },
    "lint": {
      "executor": "@nx/eslint:lint",
      "outputs": ["{options.outputFile}"]
    }
  }
}
```

## Using Executors

### Basic Usage

```bash
# Run build executor
nx build my-app

# Run test executor
nx test my-app

# Run lint executor
nx lint my-app

# Run with configuration
nx build my-app --configuration=production
```

### Executor Options

Common options for all executors:

- `--watch`: Watch for changes
- `--verbose`: Show detailed output
- `--skip-nx-cache`: Skip cache
- `--parallel`: Run in parallel

### Project Configuration

```json
{
  "targets": {
    "build": {
      "executor": "@nx/vite:build",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/apps/my-app",
        "watch": false,
        "verbose": false
      },
      "configurations": {
        "production": {
          "mode": "production"
        },
        "development": {
          "mode": "development"
        }
      }
    }
  }
}
```

## Creating Executors

### Executor Structure

```typescript
tools/
  executors/
    my-executor/
      schema.json
      executor.ts
      implementation.ts
```

### Schema Definition

```json
{
  "$schema": "http://json-schema.org/schema",
  "cli": "nx",
  "id": "my-executor",
  "type": "object",
  "properties": {
    "inputPath": {
      "type": "string",
      "description": "Input path"
    },
    "outputPath": {
      "type": "string",
      "description": "Output path"
    },
    "watch": {
      "type": "boolean",
      "description": "Watch for changes",
      "default": false
    }
  },
  "required": ["inputPath", "outputPath"]
}
```

### Executor Implementation

```typescript
import {
  ExecutorContext,
  joinPathFragments,
  logger
} from '@nx/devkit';

interface Schema {
  inputPath: string;
  outputPath: string;
  watch?: boolean;
}

export default async function (
  options: Schema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  const { inputPath, outputPath, watch } = options;
  const { workspaceRoot } = context;

  try {
    // Implementation logic here
    logger.info(`Processing ${inputPath} to ${outputPath}`);
    
    if (watch) {
      // Watch mode implementation
    }

    return { success: true };
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    return { success: false };
  }
}
```

## Executor Best Practices

### Task Execution

1. **Error Handling**
   - Use try-catch blocks
   - Log errors clearly
   - Return success status
   - Handle edge cases

2. **Performance**
   - Use incremental builds
   - Implement caching
   - Optimize I/O
   - Monitor resources

3. **Configuration**
   - Validate options
   - Use sensible defaults
   - Document options
   - Include examples

### Project Organization

1. **Directory Structure**
   - Follow Nx conventions
   - Use clear naming
   - Maintain consistency
   - Document structure

2. **File Organization**
   - Group related files
   - Use clear naming
   - Follow patterns
   - Document purpose

## Executor Examples

### RAG Index Generator

```typescript
// tools/executors/rag-generate-index/schema.json
{
  "$schema": "http://json-schema.org/schema",
  "cli": "nx",
  "id": "rag-generate-index",
  "type": "object",
  "properties": {
    "inputPath": {
      "type": "string",
      "description": "Path to input documents"
    },
    "outputPath": {
      "type": "string",
      "description": "Path to output index"
    }
  },
  "required": ["inputPath", "outputPath"]
}
```

### Implementation

```typescript
// tools/executors/rag-generate-index/executor.ts
import { ExecutorContext, logger } from '@nx/devkit';

export default async function (
  options: Schema,
  context: ExecutorContext
): Promise<{ success: boolean }> {
  try {
    // Implementation
    return { success: true };
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    return { success: false };
  }
}
```

## See Also

- [Nx Guide](./NX_GUIDE.md): General Nx documentation
- [Project Structure](./PROJECT_STRUCTURE.md): Understanding project configuration
- [Development Setup](./DEVELOPMENT_SETUP.md): Setting up for development 