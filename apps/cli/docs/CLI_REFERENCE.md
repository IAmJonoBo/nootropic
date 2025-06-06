# CLI Reference

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://docs.nootropic.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **NOTE**: The canonical source for the technology and tool stack is `docs/TOOLCHAIN.md`. This document provides CLI reference and examples.

This document provides a comprehensive reference for the nootropic Command Line Interface (CLI), focusing on local-first operations and solo developer needs.

## Table of Contents

- [CLI Reference](#cli-reference)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Local Installation](#local-installation)
    - [System Requirements](#system-requirements)
  - [Usage Syntax](#usage-syntax)
  - [Global Options](#global-options)
  - [Commands](#commands)
    - [Project Commands](#project-commands)
    - [Model Commands](#model-commands)
    - [Inference Commands](#inference-commands)
    - [Resource Commands](#resource-commands)
    - [Security Commands](#security-commands)
  - [Examples](#examples)
    - [Initialize a New Project](#initialize-a-new-project)
    - [Generate or Update Plan](#generate-or-update-plan)
    - [Scaffold from Spec](#scaffold-from-spec)
    - [Generate Code Patch for Task](#generate-code-patch-for-task)
    - [Perform a Contextual Search](#perform-a-contextual-search)
    - [Fix Failing Tests](#fix-failing-tests)
    - [Install a Plugin](#install-a-plugin)
    - [Configure Environment](#configure-environment)
    - [Update CLI](#update-cli)
  - [Troubleshooting](#troubleshooting)
    - [Common Errors](#common-errors)
    - [Performance Issues](#performance-issues)
    - [Resource Issues](#resource-issues)
    - [Plugin Issues](#plugin-issues)
  - [Best Practices](#best-practices)
    - [Configuration Management](#configuration-management)
    - [Plugin Usage](#plugin-usage)
    - [Workflow Optimization](#workflow-optimization)
    - [Security Considerations](#security-considerations)

---

## Installation

### Local Installation

```sh
npm install --save-dev nootropic
```

> **See Also**: [Development Tools](../TECH_STACK.md#development--build-tools) for development environment setup.

### System Requirements

- Node.js >= 18.0.0
- npm >= 9.0.0
- 4GB RAM minimum
- 2GB free disk space
- Local storage for models and data

---

## Usage Syntax

```sh
npx nootropic <command> [options]
```

- `npx nootropic`: Invokes the nootropic CLI
- `<command>`: One of the commands listed in the Commands section below
- `[options]`: Optional flags or parameters to modify command behavior

---

## Global Options

These options can be applied to any command:

- `-h, --help` Show help information for a command
- `-V, --version` Display the current version of nootropic
- `--json` Output results in JSON format
- `--yaml` Output results in YAML format
- `--config <path>` Specify a custom path to the configuration file (default: `~/.nootropic/config.json`)
- `--verbose` Enable verbose logging for debugging
- `--memory-limit <size>` Set memory limit for operations (e.g., `4GB`)
- `--cpu-limit <cores>` Set CPU core limit for operations (e.g., `2`)

> **See Also**: [Configuration Management](../OPERATIONS.md#configuration-management) for configuration details

---

## Commands

### Project Commands

#### `wizard`

Guide the user through an interactive project setup wizard.

- **Syntax:** `npx nootropic wizard [options]`
- **Options:**
  - `--template <name>` Use a specific project template (e.g., `nodejs`, `python`)
  - `--skip-prompts` Run with default values without prompting
  - `--memory-limit <size>` Set memory limit for the project
  - `--cpu-limit <cores>` Set CPU core limit for the project

> **See Also**: [Getting Started](../GETTING_STARTED.md) for project setup guide

#### `plan`

Generate or update the project plan based on the current `project-spec.md`.

- **Syntax:** `npx nootropic plan [options]`
- **Options:**
  - `--output <file>` Write the generated TaskGraph JSON to a custom file
  - `--delta` Perform a delta replan, updating only changed tasks
  - `--timeout <secs>` Override the default PDDL solver timeout (default: 60)
  - `--memory-limit <size>` Set memory limit for planning
  - `--cpu-limit <cores>` Set CPU core limit for planning

> **See Also**: [Project Planning](../PROJECT_PLAN.md) for planning details

#### `scaffold`

Create initial project scaffolding based on a spec or template.

- **Syntax:** `npx nootropic scaffold <spec-file> [options]`
- **Arguments:**
  - `<spec-file>` Path to the `project-spec.yaml` or `.md` file
- **Options:**
  - `--language <lang>` Override language choice (e.g., `js`, `ts`, `python`)
  - `--memory-limit <size>` Set memory limit for scaffolding
  - `--cpu-limit <cores>` Set CPU core limit for scaffolding

> **See Also**: [Project Scaffolding](../SCAFFOLD.md) for scaffolding details

#### `code`

Invoke the CoderAgent to generate or modify code based on a task or issue.

- **Syntax:** `npx nootropic code <task-id> [options]`
- **Arguments:**
  - `<task-id>` Identifier of the task to implement (e.g., `T001`)
- **Options:**
  - `--model <model>` Specify the local LLM model to use (default: local StarCoder-2)
  - `--dry-run` Display the proposed changes without applying them
  - `--apply` Automatically apply the generated patch
  - `--memory-limit <size>` Set memory limit for code generation
  - `--cpu-limit <cores>` Set CPU core limit for code generation

> **See Also**: [AI Best Practices](../AI_BEST_PRACTICES.md) for code generation guidelines

#### `search`

Search project code, documentation, or memory using the SearchAgent.

- **Syntax:** `npx nootropic search [query] [options]`
- **Arguments:**
  - `[query]` Text to search for (e.g., function name, keyword)
- **Options:**
  - `--lang <language>` Restrict search to a specific language (e.g., `javascript`)
  - `--limit <n>` Return a maximum of `n` results (default: 10)
  - `--json` Output results in JSON format
  - `--memory-limit <size>` Set memory limit for search
  - `--cpu-limit <cores>` Set CPU core limit for search

> **See Also**: [Agent Architecture](../AGENTS.md) for agent capabilities

#### `fix-tests`

Automatically detect and fix failing tests using the ReasoningAgent.

- **Syntax:** `npx nootropic fix-tests [options]`
- **Options:**
  - `--model <model>` Specify the local LLM model to use for reasoning (default: local StarCoder-2)
  - `--dry-run` Show proposed fixes without applying
  - `--memory-limit <size>` Set memory limit for test fixing
  - `--cpu-limit <cores>` Set CPU core limit for test fixing

> **See Also**: [Testing & Quality](../TECH_STACK.md#testing--quality) for testing guidelines

#### `run-workflow`

Trigger a named workflow within the project (e.g., build, test).

- **Syntax:** `npx nootropic run-workflow <workflow-name> [options]`
- **Arguments:**
  - `<workflow-name>` Name of the workflow to run (as defined in `workflows/`)
- **Options:**
  - `--env <environment>` Specify environment variables file to load
  - `--watch` Stream real-time logs of the workflow execution
  - `--memory-limit <size>` Set memory limit for workflow
  - `--cpu-limit <cores>` Set CPU core limit for workflow

> **See Also**: [Workflow Processing](../TECH_STACK.md#workflow--event-processing) for workflow details

#### `plugin:list`

List all installed CLI plugins and their versions.

- **Syntax:** `npx nootropic plugin:list`

#### `plugin:install`

Install a plugin from the local path.

- **Syntax:** `npx nootropic plugin:install <plugin-path> [options]`
- **Arguments:**
  - `<plugin-path>` Path to the local plugin to install
- **Options:**
  - `--memory-limit <size>` Set memory limit for plugin
  - `--cpu-limit <cores>` Set CPU core limit for plugin

> **See Also**: [Plugin Development](../TECH_STACK.md#development--build-tools) for plugin development

#### `plugin:remove`

Uninstall a previously installed plugin.

- **Syntax:** `npx nootropic plugin:remove <plugin-name>`
- **Arguments:**
  - `<plugin-name>` Name of the plugin to remove

#### `monitor`

Monitor project health, workflows, and resource usage.

- **Syntax:** `npx nootropic monitor [options]`
- **Options:**
  - `--dashboard` Open the monitoring dashboard in a browser
  - `--poll-interval <sec>` Refresh interval in seconds (default: 30)
  - `--memory` Show memory usage statistics
  - `--cpu` Show CPU usage statistics
  - `--cache` Show cache usage statistics

#### `config`

Manage local configuration settings.

- **Syntax:** `npx nootropic config <command> [options]`
- **Commands:**
  - `get <key>` Get a configuration value
  - `set <key> <value>` Set a configuration value
  - `list` List all configuration values
  - `reset` Reset configuration to defaults
- **Options:**
  - `--file <path>` Use a specific configuration file

---

## Examples

### Initialize a New Project

```sh
# Start the project wizard
npx nootropic wizard

# Create a project with specific template
npx nootropic wizard --template nodejs

# Create a project with resource limits
npx nootropic wizard --memory-limit 4GB --cpu-limit 2
```

### Generate or Update Plan

```sh
# Generate a new project plan
npx nootropic plan

# Update plan with resource limits
npx nootropic plan --memory-limit 4GB --cpu-limit 2

# Generate plan with custom output
npx nootropic plan --output custom-plan.json
```

### Scaffold from Spec

```sh
# Scaffold from a spec file
npx nootropic scaffold project-spec.yaml

# Scaffold with resource limits
npx nootropic scaffold project-spec.yaml --memory-limit 4GB --cpu-limit 2

# Scaffold with specific language
npx nootropic scaffold project-spec.yaml --language typescript
```

### Generate Code Patch for Task

```sh
# Generate code for a task
npx nootropic code T001

# Generate code with resource limits
npx nootropic code T001 --memory-limit 4GB --cpu-limit 2

# Preview changes without applying
npx nootropic code T001 --dry-run
```

### Perform a Contextual Search

```sh
# Search for a function
npx nootropic search "functionName"

# Search with resource limits
npx nootropic search "functionName" --memory-limit 4GB --cpu-limit 2

# Search in specific language
npx nootropic search "functionName" --lang typescript
```

### Fix Failing Tests

```sh
# Fix failing tests
npx nootropic fix-tests

# Fix tests with resource limits
npx nootropic fix-tests --memory-limit 4GB --cpu-limit 2

# Preview fixes without applying
npx nootropic fix-tests --dry-run
```

### Install a Plugin

```sh
# Install a local plugin
npx nootropic plugin:install ./my-plugin

# Install plugin with resource limits
npx nootropic plugin:install ./my-plugin --memory-limit 4GB --cpu-limit 2
```

### Configure Environment

```sh
# Set configuration value
npx nootropic config set memory.limit 4GB

# Get configuration value
npx nootropic config get memory.limit

# List all configuration
npx nootropic config list
```

### Update CLI

```sh
# Update to latest version
npm update nootropic

# Update to specific version
npm install nootropic@1.0.0
```

---

## Troubleshooting

### Common Errors

1. **Memory Issues**
   - Error: "Memory limit exceeded"
   - Solution: Increase memory limit or optimize resource usage

2. **CPU Issues**
   - Error: "CPU limit exceeded"
   - Solution: Increase CPU limit or optimize resource usage

3. **Plugin Issues**
   - Error: "Plugin not found"
   - Solution: Check plugin path and installation

### Performance Issues

1. **Slow Operations**
   - Check resource limits
   - Monitor memory usage
   - Monitor CPU usage
   - Check cache usage

2. **High Resource Usage**
   - Adjust memory limits
   - Adjust CPU limits
   - Optimize workflows
   - Clear cache

### Resource Issues

1. **Memory Management**
   - Monitor memory usage
   - Set appropriate limits
   - Clear unused resources
   - Optimize operations

2. **CPU Management**
   - Monitor CPU usage
   - Set appropriate limits
   - Optimize operations
   - Manage threads

### Plugin Issues

1. **Installation Problems**
   - Check plugin path
   - Verify permissions
   - Check dependencies
   - Validate configuration

2. **Runtime Problems**
   - Check resource limits
   - Monitor performance
   - Check logs
   - Verify compatibility

---

## Best Practices

### Configuration Management

1. **Resource Limits**
   - Set appropriate memory limits
   - Set appropriate CPU limits
   - Monitor resource usage
   - Optimize configurations

2. **Local Storage**
   - Manage local cache
   - Clean up unused data
   - Monitor disk usage
   - Backup important data

### Plugin Usage

1. **Resource Management**
   - Set plugin limits
   - Monitor plugin usage
   - Optimize plugin operations
   - Clean up plugin data

2. **Security**
   - Validate plugin sources
   - Check plugin permissions
   - Monitor plugin behavior
   - Update plugins regularly

### Workflow Optimization

1. **Resource Usage**
   - Optimize memory usage
   - Optimize CPU usage
   - Manage cache effectively
   - Monitor performance

2. **Local Operations**
   - Use local resources
   - Optimize local storage
   - Manage local cache
   - Monitor local performance

### Security Considerations

1. **Local Security**
   - Secure local storage
   - Manage local permissions
   - Monitor local access
   - Protect local data

2. **Resource Security**
   - Secure memory access
   - Secure CPU access
   - Secure cache access
   - Monitor resource usage

For more information, see:

- [Architecture Documentation](ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)
- [Security Guidelines](SECURITY.md)
- [Contributing Guide](CONTRIBUTING.md)
