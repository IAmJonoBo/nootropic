# Nootropic

<div align="center">

![Nootropic Logo](assets/logo.png)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Documentation](https://img.shields.io/badge/docs-latest-brightgreen.svg)](docs/)

## AI-Powered Development Environment**

[Overview](#overview) • [Quick Start](#quick-start) • [Architecture](#architecture) • [Development](#development)

</div>

## Table of Contents

- [Nootropic](#nootropic)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Key Features](#key-features)
    - [Technology Stack](#technology-stack)
    - [Core Design Principles](#core-design-principles)
  - [Quick Start](#quick-start)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Basic Usage](#basic-usage)
  - [Architecture](#architecture)
    - [Core Components](#core-components)
    - [Registry-Driven Discovery](#registry-driven-discovery)
    - [Durable Orchestration](#durable-orchestration)
    - [Task Graph Planning](#task-graph-planning)
    - [Adaptive Intelligence](#adaptive-intelligence)
  - [Development](#development)
    - [Local Development](#local-development)
    - [Testing](#testing)
    - [Documentation](#documentation)
    - [Performance](#performance)
    - [Error Handling](#error-handling)
    - [Integration](#integration)
  - [License](#license)

## Overview

Nootropic is a free-first, open-source AI development platform that unifies planning, coding, testing, and deployment into a single, self-healing, and self-teaching environment. It prioritizes local inference, durable orchestration, and registry-driven capability discovery while maintaining enterprise-grade security and performance.

### Key Features

- **Local-First Inference**: Run models on your machine using Tabby ML, Ollama, llama.cpp, or vLLM
- **Durable Orchestration**: Single workflow engine (Temporal.io) with reactive event streams (RxJS)
- **Registry-Driven Architecture**: Dynamic capability discovery without hand-coded wiring
- **Hybrid RAG**: Local vector store with optional scale-out capabilities
- **Self-Healing**: OpenTelemetry-driven ReflexionEngine for automatic error recovery
- **Continuous Learning**: Nightly LoRA-based fine-tuning on accepted diffs
- **Unified UX**: VS Code extension + Electron dashboard for seamless development
- **Cost-Aware**: OpenCost integration for budget-aware task scheduling
- **Single Source of Truth**: Everything in Temporal, vector stores, or Git

### Technology Stack

- **Build System**: Nx 21.1.2 + Vite for ultra-fast builds
- **Runtime**: Node.js 20+ with TypeScript
- **Orchestration**: Temporal.io + RxJS
- **Storage**: Chroma/LanceDB/Weaviate
- **Monitoring**: OpenTelemetry + OpenCost
- **Security**: Semgrep + OpenRewrite
- **Testing**: Vitest 1.3.1 + Playwright
- **UI**: VS Code Extension + Electron
- **Package Manager**: pnpm 10.11.1+

### Core Design Principles

1. **Free-First, Local-First Inference**

   - Prioritize local model execution
   - Cloud APIs as opt-in fallbacks
   - Privacy-preserving by default

2. **Minimal Core Orchestration**

   - Single durable workflow engine
   - Reactive event streams
   - Composable agent workflows

3. **Registry-Driven Capability Discovery**

   - Dynamic plugin loading
   - Automatic CLI/UI integration
   - Zero-config capability addition

4. **Hybrid RAG without Heavy Servers**

   - Local vector store by default
   - Optional scale-out capabilities
   - No external dependencies

5. **Self-Healing & Reflexion-In-the-Loop**

   - OpenTelemetry instrumentation
   - Automatic error recovery
   - SLA-driven remediation

6. **Nightly LoRA Fine-Tuning**

   - Incremental model improvement
   - No cloud GPU requirements
   - Continuous learning

7. **Unified UX**

   - VS Code integration
   - Electron dashboard
   - Zero context switching

8. **Cost-Aware Scheduling**

   - Budget enforcement
   - Resource optimization
   - Cost attribution

9. **Single Source of Truth**
   - Unified state management
   - No external dependencies
   - Simplified operations

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 10.11.1+
- Python 3.9+ (for local models)
- VS Code (recommended)
- Git

### Installation

```bash
# Install the CLI
pnpm add -g nootropic

# Initialize a new project
nootropic init

# Start the development server
nootropic dev
```

### Basic Usage

```bash
# Start a coding session
nootropic code

# Run tests
nootropic test

# Deploy changes
nootropic deploy
```

## Architecture

### Core Components

1. **User Interface Layer**

   - VS Code Extension (Continue + Roo Code)
   - CLI Client (`npx nootropic …`)
   - Electron Dashboard

2. **Orchestration & Core Agents**

   - Temporal.io Workflows
   - Core Agent Families
   - Task Graph Service

3. **Utility & Adapter Layer**

   - ModelAdapter & Intelligent Model Matcher
   - StorageAdapter
   - ObservabilityAdapter
   - PluginLoaderAdapter
   - ReflexionAdapter

4. **Inference & Data Layer**

   - Local Quantized Model Integration
   - Hybrid RAG & Sourcegraph-Style Index
   - Vector Store Management

5. **Infrastructure & Operations**
   - Monorepo & Build System
   - Self-Healing & Resilience
   - Security & Compliance
   - Cost Attribution & Scheduling

### Registry-Driven Discovery

The capability registry (`.nootropic-cache/describe-registry.json`) enables:

- Dynamic capability loading
- CLI autocompletion
- UI wizard flows
- AI-driven suggestions

### Durable Orchestration

- **Temporal.io Workflows**

  - Auto-persist state
  - Resume after failures
  - Time-travel debugging

- **RxJS Event Streams**
  - Observable pipelines
  - Backpressure handling
  - Error recovery
  - Dynamic multicasting

### Task Graph Planning

| Component             | Purpose                     | Implementation      |
| --------------------- | --------------------------- | ------------------- |
| TaskGraphService      | Durable DAG management      | Temporal KV + Redis |
| Symbolic Planner      | Goal-to-DAG conversion      | PDDL/HTN solver     |
| LLM Task Idealiser    | Task drafting & estimation  | GPT-4 + validation  |
| CriticalPathGuardRail | DAG enforcement             | OTEL span tagging   |
| Delta-planner         | Impacted subtree replanning | Reactive updates    |

### Adaptive Intelligence

- **Live Re-planning**

  - Dynamic task adjustment
  - Telemetry integration
  - Schema validation

- **Critical-Path Drift Detection**

  - SLA monitoring
  - Micro-replanning
  - Performance optimization

- **Reflexion-Driven Self-Repair**
  - Automatic error recovery
  - Policy-based repair
  - Human escalation

## Development

### Local Development

- **Setup**

  ```bash
  git clone https://github.com/yourusername/nootropic.git
  cd nootropic
  pnpm install
  pnpm nx run-many --target=build --all
  ```

- **Development Server**

  ```bash
  pnpm nx serve cli
  pnpm nx serve electron
  pnpm nx serve vscode
  ```

- **Testing**

  ```bash
  pnpm nx test --all
  pnpm nx e2e --all
  ```

### Testing

- **Unit Tests**

  - Vitest for fast execution
  - Coverage reporting
  - Snapshot testing

- **Integration Tests**

  - Playwright for UI
  - API contract tests
  - End-to-end flows

- **Performance Tests**
  - Load testing
  - Memory profiling
  - CPU profiling

### Documentation

- **Code Documentation**

  - JSDoc comments
  - TypeScript types
  - API documentation

- **User Documentation**

  - Getting started guides
  - Architecture overview
  - API reference

- **Development Guides**
  - Contributing guidelines
  - Development setup
  - Testing strategy

### Performance

- **Build Performance**

  - Nx caching
  - SWC compilation
  - Parallel execution

- **Runtime Performance**

  - Memory management
  - CPU optimization
  - Network efficiency

- **Monitoring**
  - OpenTelemetry
  - Performance metrics
  - Error tracking

### Error Handling

- **Error Types**

  - User errors
  - System errors
  - Network errors

- **Recovery Strategies**

  - Automatic retry
  - Fallback options
  - User notification

- **Logging**
  - Error logging
  - Debug logging
  - Audit logging

### Integration

- **Version Control**

  - Git integration
  - Branch management
  - Commit hooks

- **CI/CD**

  - GitHub Actions
  - Build pipeline
  - Deployment

- **External Services**
  - LLM providers
  - Vector stores
  - Monitoring

## License

MIT License - see [LICENSE](LICENSE) for details.
