# Nx Documentation Integration Guide

## Overview

This guide explains how Nx integrates with nootropic's documentation structure, focusing on local-first development and documentation organization.

## Table of Contents

1. [Documentation Structure](#documentation-structure)
2. [Nx Documentation](#nx-documentation)
3. [Documentation Generation](#documentation-generation)
4. [Best Practices](#best-practices)

## Documentation Structure

### Directory Layout

```
docs/
├── NX_GUIDE.md              # Main Nx guide
├── NX_ARCHITECTURE.md       # Nx architecture
├── NX_CACHING.md           # Nx caching
├── NX_GENERATORS.md        # Nx generators
├── NX_EXECUTORS.md         # Nx executors
├── NX_COMPONENTS.md        # Nx components
├── NX_DOCUMENTATION.md     # This guide
├── COMPONENTS/             # Component documentation
│   ├── ModelAdapter.md
│   ├── SearchAdapter.md
│   └── ...
├── TUTORIALS/             # Tutorials
└── SUBSYSTEMS/            # Subsystem documentation
```

### Documentation Types

1. **Core Documentation**
   - Architecture
   - Development
   - Testing
   - Deployment

2. **Component Documentation**
   - Agents
   - Adapters
   - UI Components

3. **Tutorials**
   - Getting Started
   - Best Practices
   - Examples

4. **Reference**
   - API Reference
   - CLI Reference
   - Configuration

## Nx Documentation

### Core Nx Files

1. **NX_GUIDE.md**
   - Overview
   - Getting Started
   - Core Concepts
   - Best Practices

2. **NX_ARCHITECTURE.md**
   - Project Structure
   - Boundaries
   - Dependencies
   - Tags

3. **NX_CACHING.md**
   - Caching Strategies
   - Configuration
   - Best Practices
   - Troubleshooting

4. **NX_GENERATORS.md**
   - Available Generators
   - Custom Generators
   - Usage
   - Examples

5. **NX_EXECUTORS.md**
   - Available Executors
   - Custom Executors
   - Usage
   - Examples

6. **NX_COMPONENTS.md**
   - Component Structure
   - Integration
   - Testing
   - Best Practices

### Documentation Integration

```typescript
// tools/executors/generate-docs/schema.json
{
  "$schema": "http://json-schema.org/schema",
  "cli": "nx",
  "id": "generate-docs",
  "type": "object",
  "properties": {
    "inputPath": {
      "type": "string",
      "description": "Path to source code"
    },
    "outputPath": {
      "type": "string",
      "description": "Path to output docs"
    },
    "format": {
      "type": "string",
      "enum": ["markdown", "html", "pdf"],
      "description": "Output format",
      "default": "markdown"
    },
    "templates": {
      "type": "string",
      "description": "Path to templates"
    }
  },
  "required": ["inputPath", "outputPath"]
}
```

## Documentation Generation

### Generator Configuration

```json
{
  "targets": {
    "generate-docs": {
      "executor": "@nootropic/docs:generate",
      "options": {
        "inputPath": "libs",
        "outputPath": "docs",
        "format": "markdown",
        "templates": "tools/templates/docs"
      }
    }
  }
}
```

### Template Structure

```
tools/
  templates/
    docs/
      component.md.template
      agent.md.template
      adapter.md.template
      nx-guide.md.template
```

### Generation Process

1. **Source Analysis**
   - Parse source code
   - Extract metadata
   - Generate structure
   - Apply templates

2. **Documentation Types**
   - API Documentation
   - Component Documentation
   - Architecture Documentation
   - Tutorials

3. **Output Formats**
   - Markdown
   - HTML
   - PDF
   - Interactive Docs

## Best Practices

### Documentation Organization

1. **Structure**
   - Clear hierarchy
   - Consistent format
   - Cross-references
   - Version control

2. **Content**
   - Clear language
   - Code examples
   - Diagrams
   - Tutorials

3. **Maintenance**
   - Regular updates
   - Version tracking
   - Change logs
   - Reviews

### Documentation Generation

1. **Automation**
   - CI/CD integration
   - Regular builds
   - Version control
   - Quality checks

2. **Quality**
   - Linting
   - Validation
   - Testing
   - Reviews

3. **Distribution**
   - Versioning
   - Hosting
   - Access control
   - Analytics

### Documentation Tools

1. **Generation**
   - TypeDoc
   - JSDoc
   - Markdown
   - Diagrams

2. **Validation**
   - Markdown lint
   - Link checker
   - Code validator
   - Style guide

3. **Hosting**
   - GitHub Pages
   - Netlify
   - Vercel
   - Custom server

## See Also

- [Nx Guide](./NX_GUIDE.md): General Nx documentation
- [Nx Architecture](./NX_ARCHITECTURE.md): Architectural boundaries
- [Nx Generators](./NX_GENERATORS.md): Custom generators
- [Nx Executors](./NX_EXECUTORS.md): Custom executors
- [Component Documentation](./COMPONENTS/): Detailed component docs 