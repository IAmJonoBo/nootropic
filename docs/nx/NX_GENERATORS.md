# Nx Generators Guide

## Overview

This guide explains how to use and create custom generators in nootropic, focusing on local-first development and code generation best practices.

## Table of Contents

1. [Available Generators](#available-generators)
2. [Using Generators](#using-generators)
3. [Creating Generators](#creating-generators)
4. [Generator Best Practices](#generator-best-practices)
5. [Generator Examples](#generator-examples)

## Available Generators

### Project Generators

```bash
# Generate a new application
nx g @nx/react:app my-app

# Generate a new library
nx g @nx/js:lib my-lib

# Generate a new tool
nx g @nx/js:lib my-tool --directory=tools
```

### Component Generators

```bash
# Generate a React component
nx g @nx/react:component my-component --project=my-app

# Generate a library component
nx g @nx/react:component my-component --project=my-lib --export
```

### Custom Generators

```bash
# Generate an agent
nx g @nootropic/agents:agent my-agent

# Generate an adapter
nx g @nootropic/adapters:adapter my-adapter

# Generate a UI component
nx g @nootropic/ui:component my-component
```

## Using Generators

### Basic Usage

```bash
# Generate with defaults
nx g @nx/react:app my-app

# Generate with options
nx g @nx/react:app my-app --directory=apps/my-app --tags=scope:my-app,type:app
```

### Generator Options

Common options for all generators:

- `--directory`: Target directory
- `--tags`: Project tags
- `--dry-run`: Show changes without applying
- `--verbose`: Show detailed output

### Project Structure

Generated projects follow this structure:

```
apps/
  my-app/
    src/
      app/
      assets/
      styles/
    project.json
    tsconfig.json
    ...

libs/
  my-lib/
    src/
      lib/
      index.ts
    project.json
    tsconfig.json
    ...
```

## Creating Generators

### Generator Structure

```
tools/
  generators/
    my-generator/
      schema.json
      generator.ts
      files/
        __name__/
          __name__.ts.template
          __name__.spec.ts.template
```

### Schema Definition

```json
{
  "$schema": "http://json-schema.org/schema",
  "cli": "nx",
  "id": "my-generator",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Name of the generated item",
      "$default": {
        "$source": "argv",
        "index": 0
      }
    },
    "directory": {
      "type": "string",
      "description": "Directory where the item is placed"
    },
    "tags": {
      "type": "string",
      "description": "Tags to add to the project"
    }
  },
  "required": ["name"]
}
```

### Generator Implementation

```typescript
import {
  Tree,
  formatFiles,
  generateFiles,
  joinPathFragments,
  names
} from '@nx/devkit';

interface Schema {
  name: string;
  directory?: string;
  tags?: string;
}

export default async function (tree: Tree, schema: Schema) {
  const options = {
    ...schema,
    ...names(schema.name)
  };

  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    options.directory || '.',
    options
  );

  await formatFiles(tree);
}
```

## Generator Best Practices

### Code Generation

1. **Templates**
   - Use clear template syntax
   - Include helpful comments
   - Follow project conventions
   - Include tests

2. **Configuration**
   - Use schema validation
   - Provide sensible defaults
   - Document all options
   - Include examples

3. **Testing**
   - Test generator output
   - Verify file structure
   - Check content generation
   - Validate options

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

## Generator Examples

### Agent Generator

```typescript
// tools/generators/agent/schema.json
{
  "$schema": "http://json-schema.org/schema",
  "cli": "nx",
  "id": "agent",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Agent name",
      "$default": {
        "$source": "argv",
        "index": 0
      }
    },
    "type": {
      "type": "string",
      "enum": ["task", "assistant", "specialist"],
      "description": "Agent type"
    }
  },
  "required": ["name", "type"]
}
```

### Adapter Generator

```typescript
// tools/generators/adapter/schema.json
{
  "$schema": "http://json-schema.org/schema",
  "cli": "nx",
  "id": "adapter",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Adapter name",
      "$default": {
        "$source": "argv",
        "index": 0
      }
    },
    "model": {
      "type": "string",
      "description": "Target model"
    }
  },
  "required": ["name", "model"]
}
```

### UI Component Generator

```typescript
// tools/generators/ui-component/schema.json
{
  "$schema": "http://json-schema.org/schema",
  "cli": "nx",
  "id": "ui-component",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Component name",
      "$default": {
        "$source": "argv",
        "index": 0
      }
    },
    "type": {
      "type": "string",
      "enum": ["atom", "molecule", "organism"],
      "description": "Component type"
    }
  },
  "required": ["name", "type"]
}
```

## See Also

- [Nx Guide](./NX_GUIDE.md): General Nx documentation
- [Project Structure](./PROJECT_STRUCTURE.md): Understanding generated projects
- [Development Setup](./DEVELOPMENT_SETUP.md): Setting up for development 