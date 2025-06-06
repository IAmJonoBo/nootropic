# Nx Architecture Guide

## Overview

This guide explains how to use Nx to enforce architectural boundaries and maintain a clean, modular codebase in nootropic, focusing on local-first development and code organization best practices.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Architectural Boundaries](#architectural-boundaries)
3. [Dependency Constraints](#dependency-constraints)
4. [Project Tags](#project-tags)
5. [Best Practices](#best-practices)

## Project Structure

### Directory Layout

```
nootropic/
├── apps/
│   ├── cli/              # Command-line interface
│   ├── electron/         # Electron application
│   ├── extension/        # VS Code extension
│   ├── temporal/         # Temporal workflows
│   └── vscode/           # VS Code integration
├── libs/
│   ├── agents/           # AI agents
│   ├── adapters/         # Model adapters
│   ├── context/          # Context management
│   ├── runtime/          # Runtime environment
│   ├── shared/           # Shared functionality
│   ├── tools/            # Development tools
│   ├── ui/               # UI components
│   └── utils/            # Shared utilities
├── tools/
│   ├── generators/       # Custom generators
│   └── executors/        # Custom executors
└── docs/                 # Documentation
```

### Project Organization

```json
{
  "projects": {
    "cli": {
      "tags": ["scope:app", "type:cli"],
      "implicitDependencies": ["shared", "tools"]
    },
    "electron": {
      "tags": ["scope:app", "type:electron"],
      "implicitDependencies": ["shared", "ui"]
    },
    "extension": {
      "tags": ["scope:app", "type:extension"],
      "implicitDependencies": ["shared", "ui"]
    },
    "temporal": {
      "tags": ["scope:app", "type:temporal"],
      "implicitDependencies": ["shared", "runtime"]
    },
    "vscode": {
      "tags": ["scope:app", "type:vscode"],
      "implicitDependencies": ["shared", "ui"]
    },
    "agents": {
      "tags": ["scope:lib", "type:agents"],
      "implicitDependencies": ["shared"]
    },
    "adapters": {
      "tags": ["scope:lib", "type:adapters"],
      "implicitDependencies": ["shared"]
    },
    "context": {
      "tags": ["scope:lib", "type:context"],
      "implicitDependencies": ["shared"]
    },
    "runtime": {
      "tags": ["scope:lib", "type:runtime"],
      "implicitDependencies": ["shared"]
    },
    "shared": {
      "tags": ["scope:lib", "type:shared"]
    },
    "tools": {
      "tags": ["scope:lib", "type:tools"]
    },
    "ui": {
      "tags": ["scope:lib", "type:ui"]
    },
    "utils": {
      "tags": ["scope:lib", "type:utils"]
    }
  }
}
```

## Architectural Boundaries

### Layer Boundaries

1. **Application Layer**
   - CLI, Electron, Extension, Temporal, VS Code apps
   - User interface
   - Application logic
   - No direct model access

2. **Domain Layer**
   - Agents and adapters
   - Context management
   - Runtime environment
   - Business logic
   - Model integration
   - No UI dependencies

3. **Core Layer**
   - Shared functionality
   - Development tools
   - UI components
   - Utilities
   - No external dependencies

### Dependency Rules

```json
{
  "rules": [
    {
      "sourceTag": "type:app",
      "onlyDependOnLibsWithTags": ["type:lib"]
    },
    {
      "sourceTag": "type:agents",
      "onlyDependOnLibsWithTags": ["type:shared"]
    },
    {
      "sourceTag": "type:adapters",
      "onlyDependOnLibsWithTags": ["type:shared"]
    },
    {
      "sourceTag": "type:context",
      "onlyDependOnLibsWithTags": ["type:shared"]
    },
    {
      "sourceTag": "type:runtime",
      "onlyDependOnLibsWithTags": ["type:shared"]
    },
    {
      "sourceTag": "type:ui",
      "onlyDependOnLibsWithTags": ["type:shared"]
    },
    {
      "sourceTag": "type:tools",
      "onlyDependOnLibsWithTags": ["type:shared"]
    }
  ]
}
```

## Dependency Constraints

### Project Dependencies

```json
{
  "dependencies": {
    "cli": {
      "dependencies": ["shared", "tools"],
      "devDependencies": ["utils"]
    },
    "electron": {
      "dependencies": ["shared", "ui"],
      "devDependencies": ["utils"]
    },
    "extension": {
      "dependencies": ["shared", "ui"],
      "devDependencies": ["utils"]
    },
    "temporal": {
      "dependencies": ["shared", "runtime"],
      "devDependencies": ["utils"]
    },
    "vscode": {
      "dependencies": ["shared", "ui"],
      "devDependencies": ["utils"]
    },
    "agents": {
      "dependencies": ["shared"],
      "devDependencies": ["utils"]
    },
    "adapters": {
      "dependencies": ["shared"],
      "devDependencies": ["utils"]
    },
    "context": {
      "dependencies": ["shared"],
      "devDependencies": ["utils"]
    },
    "runtime": {
      "dependencies": ["shared"],
      "devDependencies": ["utils"]
    },
    "shared": {
      "dependencies": [],
      "devDependencies": ["utils"]
    },
    "tools": {
      "dependencies": ["shared"],
      "devDependencies": ["utils"]
    },
    "ui": {
      "dependencies": ["shared"],
      "devDependencies": ["utils"]
    },
    "utils": {
      "dependencies": [],
      "devDependencies": []
    }
  }
}
```

## Project Tags

### Tag Categories

1. **Scope Tags**
   - `scope:app`
   - `scope:lib`

2. **Type Tags**
   - `type:cli`
   - `type:electron`
   - `type:extension`
   - `type:temporal`
   - `type:vscode`
   - `type:agents`
   - `type:adapters`
   - `type:context`
   - `type:runtime`
   - `type:shared`
   - `type:tools`
   - `type:ui`
   - `type:utils`

### Tag Usage

```json
{
  "tags": {
    "cli": ["scope:app", "type:cli"],
    "electron": ["scope:app", "type:electron"],
    "extension": ["scope:app", "type:extension"],
    "temporal": ["scope:app", "type:temporal"],
    "vscode": ["scope:app", "type:vscode"],
    "agents": ["scope:lib", "type:agents"],
    "adapters": ["scope:lib", "type:adapters"],
    "context": ["scope:lib", "type:context"],
    "runtime": ["scope:lib", "type:runtime"],
    "shared": ["scope:lib", "type:shared"],
    "tools": ["scope:lib", "type:tools"],
    "ui": ["scope:lib", "type:ui"],
    "utils": ["scope:lib", "type:utils"]
  }
}
```

## Best Practices

### Code Organization

1. **Module Structure**
   - Clear boundaries
   - Single responsibility
   - Explicit dependencies
   - No circular dependencies

2. **File Organization**
   - Feature-based structure
   - Clear naming
   - Consistent patterns
   - Documentation

3. **Dependency Management**
   - Use tags for scope and type
   - Enforce architectural boundaries
   - Minimize dependencies
   - Document dependencies

4. **Build Configuration**
   - Use Nx-native executors
   - Configure proper outputs
   - Set up caching
   - Enable source maps

5. **Testing Strategy**
   - Unit tests for libraries
   - Integration tests for apps
   - E2E tests where needed
   - Coverage reporting

## See Also

- [Nx Guide](./NX_GUIDE.md): General Nx documentation
- [Project Structure](./PROJECT_STRUCTURE.md): Understanding project organization
- [Development Setup](./DEVELOPMENT_SETUP.md): Setting up for development 