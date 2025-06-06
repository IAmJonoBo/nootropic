# Migration Guide

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://docs.nootropic.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **NOTE:** This project is developed and maintained by a solo developer. All migration steps, tools, and recommendations are optimized for local-first development, privacy, and data sovereignty. This guide focuses on simple, reliable migration processes for individual developers.

This guide provides instructions for migrating between different versions of nootropic. Each section covers the changes, deprecations, and breaking changes introduced in each version, along with step-by-step migration instructions for local-first workflows.

## Table of Contents

- [Version 1.0 to 1.1](#version-10-to-11)
  - [Breaking Changes](#breaking-changes)
  - [Deprecated Features](#deprecated-features)
  - [Migration Steps](#migration-steps)
- [Version 0.9 to 1.0](#version-09-to-10)
  - [Breaking Changes](#breaking-changes-1)
  - [Deprecated Features](#deprecated-features-1)
  - [Migration Steps](#migration-steps-1)
- [Version 0.8 to 0.9](#version-08-to-09)
  - [Breaking Changes](#breaking-changes-2)
  - [Deprecated Features](#deprecated-features-2)
  - [Migration Steps](#migration-steps-2)
- [Configuration Changes](#configuration-changes)
- [Plugin Migration](#plugin-migration)
- [Troubleshooting](#troubleshooting)

---

## Local-First Migration Philosophy

- All migration steps are designed for local execution
- Focus on privacy and data sovereignty
- Simple, reliable migration processes
- Local backup and rollback capabilities
- Clear documentation and examples

---

## Version 1.0 to 1.1

### Breaking Changes

* **CLI Command Changes**
  * `nootropic plan` now requires `--delta` flag for incremental planning
  * `nootropic code` syntax updated to support multi-file changes
  * New `nootropic plugin` commands for plugin management
  * New `nootropic model` commands for model management

* **Configuration Format**
  * Updated `~/.nootropic/config.json` format
  * New required fields for model selection
  * Changed plugin configuration structure
  * New model configuration options

* **Model Changes**
  * New model versioning scheme
  * Updated model quantization format
  * Changed model routing logic
  * New model security features

> **See Also**: [CLI Reference](../CLI_REFERENCE.md) for updated command syntax.

### Deprecated Features

* Legacy model configuration format (to be removed in 2.0.0)
* Old API endpoints (migration guide available)
* Deprecated agent interfaces
* Old model routing system

> **See Also**: [API Reference](../API_REFERENCE.md) for API changes.

### Migration Steps

1. **Backup Your Data**

   ```bash
   # Backup current config
   cp ~/.nootropic/config.json ~/.nootropic/config.json.bak

   # Backup project files
   cp -r ./nootropic ./nootropic.bak
   ```

2. **Update Configuration**

   ```bash
   # Update config format
   nootropic config migrate

   # Update model config
   nootropic model config migrate
   ```

3. **Update Models**

   ```bash
   # List installed models
   nootropic model list

   # Update model versions
   nootropic model update --all

   # Verify model integrity
   nootropic model verify --all
   ```

4. **Update Plugins**

   ```bash
   # List installed plugins
   nootropic plugin list

   # Update plugins to latest versions
   nootropic plugin update --all
   ```

5. **Update Project Files**

   ```bash
   # Update project configuration
   nootropic project migrate

   # Verify changes
   nootropic project validate
   ```

> **See Also**: [Configuration Guide](../CONFIGURATION.md) for detailed configuration options.

---

## Model Migration

### Model Version Migration

* **Version Changes**
  * New model versions
  * Updated quantization
  * Changed routing
  * New security features

* **Migration Steps**
  * Update model versions
  * Convert model formats
  * Update model config
  * Verify model integrity
  * Test model performance

### Model Security Migration

* **Security Changes**
  * New security features
  * Updated validation
  * Changed filtering
  * New monitoring

* **Migration Steps**
  * Update security config
  * Enable new features
  * Test validation
  * Verify filtering
  * Set up monitoring

---

## Version 0.9 to 1.0

### Breaking Changes

* **Project Structure**
  * New monorepo layout
  * Updated package naming
  * Changed import paths

* **API Changes**
  * New authentication system
  * Updated endpoint structure
  * Changed response formats

> **See Also**: [API Reference](../API_REFERENCE.md) for API changes.

### Deprecated Features

* Old project structure
* Legacy authentication
* Deprecated API endpoints
* Old configuration format

### Migration Steps

1. **Backup Project**

   ```bash
   # Backup current project
   cp -r ./nootropic ./nootropic.bak
   ```

2. **Update Project Structure**

   ```bash
   # Update project layout
   nootropic project migrate

   # Update dependencies
   nootropic deps update
   ```

3. **Update Configuration**

   ```bash
   # Update config format
   nootropic config migrate

   # Verify configuration
   nootropic config validate
   ```

4. **Test Changes**

   ```bash
   # Run tests
   nootropic test

   # Verify functionality
   nootropic verify
   ```

---

## Configuration Changes

### Configuration Migration

* **Format Changes**
  * New JSON schema
  * Updated validation
  * Changed defaults
  * New options

* **Migration Steps**
  * Backup config
  * Update format
  * Validate changes
  * Test configuration

### Plugin Configuration

* **Plugin Changes**
  * New plugin format
  * Updated API
  * Changed structure
  * New features

* **Migration Steps**
  * Update plugins
  * Convert config
  * Test plugins
  * Verify changes

---

## Plugin Migration

### Plugin Updates

* **Update Process**
  * Check compatibility
  * Update versions
  * Test functionality
  * Verify changes

* **Migration Steps**
  * List plugins
  * Update plugins
  * Test plugins
  * Verify changes

### Plugin Configuration

* **Config Changes**
  * New format
  * Updated options
  * Changed defaults
  * New features

* **Migration Steps**
  * Update config
  * Test settings
  * Verify changes
  * Monitor performance

---

## Troubleshooting

### Common Issues

* **Configuration Issues**
  * Invalid config format
  * Missing fields
  * Invalid values
  * Permission errors

* **Model Issues**
  * Version conflicts
  * Format errors
  * Integrity issues
  * Performance problems

* **Plugin Issues**
  * Compatibility problems
  * Version conflicts
  * Configuration errors
  * Performance issues

### Solutions

* **Configuration Fixes**
  * Validate config
  * Check permissions
  * Update format
  * Test settings

* **Model Fixes**
  * Update versions
  * Convert formats
  * Verify integrity
  * Test performance

* **Plugin Fixes**
  * Update plugins
  * Check compatibility
  * Fix config
  * Test functionality

### Recovery

* **Backup Recovery**
  * Restore config
  * Restore models
  * Restore plugins
  * Verify system

* **Rollback Process**
  * Stop services
  * Restore backup
  * Verify system
  * Test functionality 