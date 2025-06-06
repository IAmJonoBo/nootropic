# Local-First Toolchain Specification

## Table of Contents

* [Local-First Toolchain Specification](#local-first-toolchain-specification)
  * [Table of Contents](#table-of-contents)
  * [Summary](#summary)
  * [1. Local Monorepo & Build Tooling](#1-local-monorepo--build-tooling)
    * [1.1 Nx as the Local Monorepo Manager](#11-nx-as-the-local-monorepo-manager)
    * [1.2 Local Compiler & Bundling](#12-local-compiler--bundling)
    * [1.3 Local pnpm Workspaces & Dependency Management](#13-local-pnpm-workspaces--dependency-management)
    * [1.4 Local Linting & Formatting](#14-local-linting--formatting)
  * [2. Local Testing & Coverage](#2-local-testing--coverage)
    * [2.1 Jest as Local Test Runner](#21-jest-as-local-test-runner)
    * [2.2 Playwright for Local E2E Testing](#22-playwright-for-local-e2e-testing)
    * [2.3 LitmusChaos for Local Chaos Engineering](#23-litmuschaos-for-local-chaos-engineering)
  * [3. Local LLM Inference & Model Routing](#3-local-llm-inference--model-routing)
    * [3.1 Local Inference Tier](#31-local-inference-tier)
    * [3.2 Local Model Registry](#32-local-model-registry)
  * [4. Local Vector Databases & Retrieval](#4-local-vector-databases--retrieval)
    * [4.1 LanceDB for Local Storage](#41-lancedb-for-local-storage)
    * [4.2 ChromaDB as Local RAG Store](#42-chromadb-as-local-rag-store)
  * [5. Local Full-Text Search & Document Indexing](#5-local-full-text-search--document-indexing)
    * [5.1 SQLite for Local Search](#51-sqlite-for-local-search)
  * [6. Local Orchestration & Self-Healing](#6-local-orchestration--self-healing)
    * [6.1 Temporal for Local Workflows](#61-temporal-for-local-workflows)
    * [6.2 RxJS & Local ReflexionEngine](#62-rxjs--local-reflexionengine)
  * [7. Local Observability & Logging](#7-local-observability--logging)
    * [7.1 OpenTelemetry for Local Tracing](#71-opentelemetry-for-local-tracing)
    * [7.2 Local Analytics](#72-local-analytics)
    * [7.3 Local Structured Logging](#73-local-structured-logging)
  * [8. Local Security & Compliance](#8-local-security--compliance)
    * [8.1 Local Supply-Chain Protection](#81-local-supply-chain-protection)
    * [8.2 Local Vulnerability Scanning](#82-local-vulnerability-scanning)
  * [9. Local Documentation & Developer Experience](#9-local-documentation--developer-experience)
    * [9.1 Local Documentation Platform](#91-local-documentation-platform)
    * [9.2 Local CLI Framework](#92-local-cli-framework)
    * [9.3 Local Developer Experience](#93-local-developer-experience)
  * [10. Local Registry-Driven Discovery](#10-local-registry-driven-discovery)
    * [10.1 Local `describe()` Interface](#101-local-describe-interface)
    * [10.2 Local Registry JSON](#102-local-registry-json)
  * [11. Local Toolchain Summary](#11-local-toolchain-summary)

***

## Summary

This document provides the definitive local-first toolchain for **nootropic**, focusing on privacy, data sovereignty, and local development. It specifies every tool, library, and package used in development, testing, deployment, and runtime—prioritizing a lean, Nx-powered monorepo; local-first AI/LLM workflows; local retrieval backends; robust local orchestration and self-healing; comprehensive local observability; and strong local security/compliance. Each section cites rationale to demonstrate performance, extensibility, and future-proofing.

***

## 1. Local Monorepo & Build Tooling

### 1.1 Nx as the Local Monorepo Manager

* **Nx (v21.1.2)**: Local monorepo orchestrator offering:
  - AI/LLM-friendly project graphs
  - Local incremental caching
  - Local task execution
  - Built-in generators and executors
  - Local project graph visualization
  - Local performance analytics
  - Local team collaboration features
  - Local CI/CD integration
  - Local resource optimization
  - Local cost tracking
  - Local pnpm integration
  - Local workspace management
  - Local cache management
  - Local build optimization
  - Local parallel execution
  - Local affected detection
  - Local dependency graph
  - Local project tags
  - Local workspace plugins
  - Local custom executors
  - Local custom generators
  - Local workspace linting
  - Local workspace formatting
  - Local workspace testing
  - Local workspace building
  - Local workspace serving
  - Local workspace deployment
  - Local workspace documentation
  - Local workspace security
  - Local workspace compliance
  - Local workspace monitoring
  - Local workspace analytics
  - Local workspace logging
  - Local workspace tracing
  - Local workspace debugging
  - Local workspace profiling
  - Local workspace optimization
  - Local workspace maintenance
  - Local workspace updates
  - Local workspace migration
  - Local workspace backup
  - Local workspace recovery
  - Local workspace validation
  - Local workspace verification

* **Local Nx Configuration**:
  ```json
  // nx.json
  {
    "extends": "@nx/workspace/presets/npm.json",
    "affected": {
      "defaultBase": "main"
    },
    "tasksRunnerOptions": {
      "default": {
        "runner": "@nx/workspace/tasks-runners/default",
        "options": {
          "cacheableOperations": ["build", "test", "lint", "e2e"],
          "parallel": 3,
          "cacheDirectory": ".nx-cache"
        }
      }
    },
    "targetDefaults": {
      "build": {
        "dependsOn": ["^build"],
        "inputs": ["production", "^production"],
        "cache": true,
        "parallel": true
      },
      "test": {
        "inputs": ["default", "^production"],
        "cache": true,
        "parallel": true
      },
      "lint": {
        "inputs": ["default", "{workspaceRoot}/.eslintrc.json"],
        "cache": true,
        "parallel": true
      },
      "e2e": {
        "inputs": ["default", "^production"],
        "cache": true,
        "parallel": true
      },
      "serve": {
        "dependsOn": ["^build"],
        "inputs": ["default", "^production"],
        "cache": true
      },
      "deploy": {
        "dependsOn": ["build"],
        "inputs": ["production", "^production"],
        "cache": true
      }
    },
    "plugins": [
      {
        "plugin": "@nx/js/plugins/js-plugin",
        "options": {
          "buildTargetName": "build",
          "serveTargetName": "serve",
          "testTargetName": "test"
        }
      },
      {
        "plugin": "@nx/playwright/plugin",
        "options": {
          "targetName": "e2e"
        }
      }
    ],
    "namedInputs": {
      "default": ["{projectRoot}/**/*", "sharedGlobals"],
      "production": [
        "default",
        "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
        "!{projectRoot}/tsconfig.spec.json",
        "!{projectRoot}/.eslintrc.json"
      ],
      "sharedGlobals": []
    }
  }
  ```

* **Local Project Structure**:
  - Clear module boundaries
  - Consistent naming conventions
  - Local documentation generation
  - Local code organization
  - Local dependency management
  - Local build optimization
  - Local test configuration
  - Local development tools
  - Local workspace configuration
  - Local project configuration
  - Local target configuration
  - Local cache configuration
  - Local pnpm workspace structure
  - Local package management
  - Local workspace linking
  - Local project tags
  - Local project dependencies
  - Local project targets
  - Local project cache
  - Local project build
  - Local project test
  - Local project lint
  - Local project format
  - Local project serve
  - Local project deploy
  - Local project documentation
  - Local project security
  - Local project compliance
  - Local project monitoring
  - Local project analytics
  - Local project logging
  - Local project tracing
  - Local project debugging
  - Local project profiling
  - Local project optimization
  - Local project maintenance
  - Local project updates
  - Local project migration
  - Local project backup
  - Local project recovery
  - Local project validation
  - Local project verification

* **Local Nx Workspace Architecture**:
  - Project organization
    - Library projects
    - Application projects
    - E2E projects
    - Shared libraries
    - Feature libraries
    - UI libraries
    - API libraries
    - Test libraries
  - Project configuration
    - Project.json
    - Workspace.json
    - Nx.json
    - Package.json
    - Tsconfig.json
    - Jest.config.js
    - ESLint.config.js
    - Prettier.config.js
  - Project dependencies
    - Internal dependencies
    - External dependencies
    - Peer dependencies
    - Dev dependencies
    - Build dependencies
    - Test dependencies
  - Project targets
    - Build targets
    - Test targets
    - Lint targets
    - Format targets
    - Serve targets
    - E2E targets
    - Generate targets
    - Custom targets
  - Project tags
    - Type tags
    - Scope tags
    - Feature tags
    - Platform tags
    - Environment tags
    - Priority tags
  - Project cache
    - Build cache
    - Test cache
    - Lint cache
    - Format cache
    - Generate cache
    - Custom cache

* **Local Nx Build System**:
  - Build executors
    - Webpack executor
    - SWC executor
    - esbuild executor
    - Rollup executor
    - Vite executor
    - Custom executor
  - Build optimization
    - Tree shaking
    - Code splitting
    - Lazy loading
    - Bundle analysis
    - Source maps
    - Minification
    - Compression
  - Build caching
    - Input hashing
    - Output caching
    - Cache invalidation
    - Cache sharing
    - Cache cleanup
  - Build monitoring
    - Build metrics
    - Build analytics
    - Build reporting
    - Build alerts

* **Local Nx Test System**:
  - Test executors
    - Jest executor
    - Vitest executor
    - Playwright executor
    - Cypress executor
    - Custom executor
  - Test optimization
    - Parallel execution
    - Test isolation
    - Test caching
    - Coverage reporting
    - Test analytics
  - Test monitoring
    - Test metrics
    - Test analytics
    - Test reporting
    - Test alerts

* **Local Nx Project Graph**:
  - Graph generation
    - Static analysis
    - Dynamic analysis
    - Dependency tracking
    - Change detection
  - Graph visualization
    - Interactive UI
    - Graph export
    - Graph analysis
    - Graph metrics
  - Graph optimization
    - Dependency pruning
    - Cycle detection
    - Critical path
    - Build order
  - Graph monitoring
    - Graph metrics
    - Graph analytics
    - Graph reporting
    - Graph alerts

* **Local Nx Task Execution**:
  - Task scheduling
    - Parallel execution
    - Sequential execution
    - Task dependencies
    - Task priorities
  - Task monitoring
    - Task metrics
    - Task analytics
    - Task reporting
    - Task alerts
  - Task optimization
    - Resource allocation
    - Cache utilization
    - Performance tuning
    - Error handling

* **Local Nx Workspace Plugins**:
  - Plugin system
    - Generator plugins
    - Executor plugins
    - Builder plugins
    - Custom plugins
  - Plugin development
    - Plugin API
    - Plugin testing
    - Plugin documentation
    - Plugin distribution
  - Plugin management
    - Plugin installation
    - Plugin configuration
    - Plugin versioning
    - Plugin updates

* **Local Nx Workspace Analytics**:
  - Analytics collection
    - Build analytics
    - Test analytics
    - Cache analytics
    - Performance analytics
  - Analytics visualization
    - Build dashboards
    - Test dashboards
    - Cache dashboards
    - Performance dashboards
  - Analytics reporting
    - Build reports
    - Test reports
    - Cache reports
    - Performance reports
  - Analytics alerts
    - Build alerts
    - Test alerts
    - Cache alerts
    - Performance alerts

* **Local ESLint Integration**:
  - Nx extends `plugin:@nx/typescript`
  - `plugin:prettier/recommended`
  - Local strict import hygiene
  - Local style consistency
  - Local performance rules
  - Local security rules
  - Local TypeScript rules
  - Local custom rules
  - Local project-specific rules
  - Local workspace-wide rules
  - Local cache-aware rules
  - Local build-aware rules
  - Local pnpm workspace rules
  - Local package rules
  - Local dependency rules
  - Local project tags
  - Local project dependencies
  - Local project targets
  - Local project cache
  - Local project build
  - Local project test
  - Local project lint
  - Local project format
  - Local project serve
  - Local project deploy
  - Local project documentation
  - Local project security
  - Local project compliance
  - Local project monitoring
  - Local project analytics
  - Local project logging
  - Local project tracing
  - Local project debugging
  - Local project profiling
  - Local project optimization
  - Local project maintenance
  - Local project updates
  - Local project migration
  - Local project backup
  - Local project recovery
  - Local project validation
  - Local project verification

### 1.2 Local Compiler & Bundling

* **TypeScript (v5.4+) with NodeNext/ESM**:
  - All `tsconfig.json` files use:
    - `"module": "NodeNext"`
    - `"moduleResolution": "NodeNext"`
    - Native ESM support
    - Explicit `.js` extensions
    - No TypeScript project references
    - `"composite": false`
    - `"declaration": false`
    - Local project-specific settings

* **SWC (v0.3.x)**:
  - Default TypeScript compiler
  - Sub-50ms compile times
  - Local Nx integration
    - Local build executor
    - Local test executor
    - Local watch mode
    - Local cache support
  - Local performance optimization
  - Local resource management
  - Local development feedback
  - Local build optimization

* **Esbuild (v0.20+)**:
  - Production artifact bundling
  - Fast tree-shaking
  - Local Nx integration
    - Local build executor
    - Local development server
    - Local plugin system
    - Local cache support
  - Local performance optimization
  - Local resource management
  - Local development feedback
  - Local build optimization

### 1.3 Local pnpm Workspaces & Dependency Management

* **pnpm (v9.0.0+)**: Local package manager offering:
  - Local workspace management
    - Local Nx workspace integration
    - Local project dependencies
    - Local shared libraries
    - Local version control
    - Local workspace configuration
    - Local project configuration
    - Local target configuration
    - Local cache configuration
  - Local strict dependency resolution
    - Local hoisting optimization
    - Local peer dependency handling
    - Local version conflicts
    - Local security scanning
    - Local pnpm-lock.yaml
    - Local workspace dependencies
    - Local project dependencies
    - Local development dependencies
    - Local Nx project graph
  - Local efficient disk space usage
    - Local content-addressable storage
    - Local hard linking
    - Local cache management
    - Local cleanup utilities
    - Local fast installation
    - Local disk space efficiency
    - Local strict dependency management
    - Local workspace linking
    - Local Nx cache integration
  - Local monorepo support
    - Local workspace protocol
    - Local project references
    - Local build order
    - Local test execution
    - Local workspace configuration
    - Local project configuration
    - Local target configuration
    - Local cache configuration
    - Local Nx project graph
  - Local lockfile integrity
    - Local deterministic installs
    - Local version pinning
    - Local security validation
    - Local audit support
    - Local Nx cache validation

### 1.4 Local Linting & Formatting

* **ESLint (v8.57+)**: Local linting with:
  - Local TypeScript/JavaScript best practices
  - Local Nx lint executor
  - Local project-specific rules
  - Local performance rules
  - Local security rules
  - Local TypeScript rules
  - Local custom rules
  - Local auto-fix support

* **Prettier (v3.2+)**: Local formatting with:
  - Local code formatting
  - Local markdown formatting
  - Local JSON formatting
  - Local YAML formatting
  - Local Nx format executor
  - Local project-specific configs
  - Local auto-fix support
  - Local cache support

***

## 2. Local Testing & Coverage

### 2.1 Jest as Local Test Runner

* **Jest (v29.7+)**: Local test runner with:
  - Local primary test runner for JS/TS
  - Local Nx test executor integration
  - Local project-specific configurations
  - Local coverage reporting
  - Local snapshot testing
  - Local mock system
  - Local performance optimization
  - Local cache support
  - Local parallel execution
  - Local resource management

* **Local Test Configuration**:
  - Local root `jest.config.ts`
  - Local project-specific configs
  - Local coverage thresholds
  - Local test patterns
  - Local environment setup
  - Local transformers
  - Local reporters
  - Local performance settings

* **Local Test Organization**:
  - Local unit tests
  - Local integration tests
  - Local component tests
  - Local API tests
  - Local performance tests
  - Local security tests
  - Local accessibility tests
  - Local documentation tests

### 2.2 Playwright for Local E2E Testing

* **Playwright (v1.42+)**: Local E2E testing with:
  - Local E2E testing framework
  - Local Nx E2E executor
  - Local cross-browser testing
  - Local visual regression
  - Local network interception
  - Local component testing
  - Local API testing
  - Local performance testing
  - Local accessibility testing
  - Local cache support
  - Local parallel execution

* **Local E2E Configuration**:
  - Local project-specific setup
  - Local browser configurations
  - Local test patterns
  - Local environment variables
  - Local network conditions
  - Local visual thresholds
  - Local performance budgets
  - Local accessibility rules

* **Local Test Scenarios**:
  - Local user workflows
  - Local API integration
  - Local component behavior
  - Local visual consistency
  - Local performance metrics
  - Local security checks
  - Local accessibility compliance
  - Local error handling

### 2.3 LitmusChaos for Local Chaos Engineering

* **LitmusChaos (v2.0+)**: Local chaos engineering with:
  - Local chaos engineering framework
  - Local Nx test executor
  - Local automated experiments
  - Local resilience testing
  - Local recovery validation
  - Local resource monitoring
  - Local performance impact
  - Local security testing
  - Local cache support
  - Local parallel execution

* **Local Chaos Configuration**:
  - Local experiment definitions
  - Local resource constraints
  - Local recovery procedures
  - Local monitoring setup
  - Local performance thresholds
  - Local security boundaries
  - Local test patterns
  - Local environment setup

* **Local Test Scenarios**:
  - Local system resilience
  - Local recovery procedures
  - Local resource limits
  - Local performance impact
  - Local security boundaries
  - Local error handling
  - Local data consistency
  - Local service availability

***

## 3. Local LLM Inference & Model Routing

### 3.1 Local Inference Tier

* **Tabby ML (v2.0+)**: Local LLM gateway with:
  - Local GGUF, MLX, and ONNX model support
  - Local hardware detection
  - Local model optimization
  - Local multi-model orchestration
  - Local-first inference
  - Local cost tracking
  - Local privacy controls
  - Local parallel inference
  - Local model management

* **Ollama (v2.5+)**: Local model runner with:
  - Local Apple Silicon support
  - Local model quantization
  - Local model versioning
  - Local data processing
  - Local cost tracking
  - Local privacy controls
  - Local parallel processing
  - Local model management

* **vLLM (v1.0+)**: Local GPU inference with:
  - Local PagedAttention v2
  - Local multi-GPU support
  - Local streaming inference
  - Local resource tracking
  - Local privacy controls
  - Local security validation
  - Local parallel inference
  - Local model management

### 3.2 Local Model Registry

* **Local Model Registry (Zod v3.22+)**: Local model management with:
  - Local JSON schema validation
  - Local model versioning
  - Local hardware detection
  - Local resource tracking
  - Local privacy controls
  - Local security validation
  - Local parallel inference
  - Local model management

* **Local Routing Logic**:
  - Local hardware detection
  - Local resource optimization
  - Local cost tracking
  - Local privacy controls
  - Local security validation
  - Local parallel inference
  - Local model management

* **Local User Configuration**:
  - Local hardware preferences
  - Local resource limits
  - Local cost thresholds
  - Local privacy settings
  - Local security policies
  - Local model preferences
  - Local inference settings

***

## 4. Local Vector Databases & Retrieval

### 4.1 LanceDB for Local Storage

* **LanceDB (v1.0+)**: Local vector storage with:
  - Local Arrow-based storage
  - Local GPU acceleration
  - Local automatic sharding
  - Local parallel search
  - Local storage management
  - Local resource tracking
  - Local privacy controls
  - Local security validation

### 4.2 ChromaDB as Local RAG Store

* **ChromaDB (v2.0+)**: Local RAG store with:
  - Local SQLite + FAISS backend
  - Local index optimization
  - Local real-time updates
  - Local parallel indexing
  - Local storage management
  - Local resource tracking
  - Local privacy controls
  - Local security validation

***

## 5. Local Full-Text Search & Document Indexing

### 5.1 SQLite for Local Search

* **SQLite (v3.45+)**: Local search with:
  - Local full-text search
  - Local document indexing
  - Local parallel queries
  - Local storage management
  - Local resource tracking
  - Local privacy controls
  - Local security validation

***

## 6. Local Orchestration & Self-Healing

### 6.1 Temporal for Local Workflows

* **Temporal (v2.0+)**: Local workflow engine with:
  - Local time-travel debugging
  - Local tracing integration
  - Local retry handling
  - Local parallel workflows
  - Local workflow management
  - Local resource tracking
  - Local privacy controls
  - Local security validation

### 6.2 RxJS & Local ReflexionEngine

* **RxJS (v8.0+)**: Local event streams with:
  - Local backpressure handling
  - Local error recovery
  - Local real-time processing
  - Local parallel streams
  - Local event management
  - Local resource tracking
  - Local privacy controls
  - Local security validation

***

## 7. Local Observability & Logging

### 7.1 OpenTelemetry for Local Tracing

* **OpenTelemetry (v2.0+)**: Local tracing with:
  - Local instrumentation
  - Local context propagation
  - Local multi-backend support
  - Local Nx integration
  - Local trace analysis
  - Local resource tracking
  - Local privacy controls
  - Local security validation

### 7.2 Local Analytics

* **Local Analytics**: Local metrics with:
  - Local performance metrics
  - Local resource usage
  - Local error rates
  - Local security events
  - Local cost tracking
  - Local privacy controls
  - Local security validation

### 7.3 Local Structured Logging

* **Local Logging**: Local logs with:
  - Local structured format
  - Local log levels
  - Local log rotation
  - Local log analysis
  - Local resource tracking
  - Local privacy controls
  - Local security validation

***

## 8. Local Security & Compliance

### 8.1 Local Supply-Chain Protection

* **Local Supply Chain**: Local security with:
  - Local SLSA Level 3
  - Local keyless signing
  - Local transparency logs
  - Local resource tracking
  - Local privacy controls
  - Local security validation

### 8.2 Local Vulnerability Scanning

* **Local Scanning**: Local security with:
  - Local static analysis
  - Local vulnerability scanning
  - Local secret detection
  - Local resource tracking
  - Local privacy controls
  - Local security validation

***

## 9. Local Documentation & Developer Experience

### 9.1 Local Documentation Platform

* **Local Documentation**: Local docs with:
  - Local markdown support
  - Local code examples
  - Local API reference
  - Local guides
  - Local resource tracking
  - Local privacy controls
  - Local security validation

### 9.2 Local CLI Framework

* **Local CLI**: Local interface with:
  - Local command handling
  - Local interactive mode
  - Local help system
  - Local resource tracking
  - Local privacy controls
  - Local security validation

### 9.3 Local Developer Experience

* **Local DX**: Local development with:
  - Local IDE integration
  - Local debugging tools
  - Local testing tools
  - Local resource tracking
  - Local privacy controls
  - Local security validation

***

## 10. Local Registry-Driven Discovery

### 10.1 Local `describe()` Interface

* **Local Interface**: Local discovery with:
  - Local capability description
  - Local resource tracking
  - Local privacy controls
  - Local security validation

### 10.2 Local Registry JSON

* **Local Registry**: Local configuration with:
  - Local JSON schema
  - Local validation
  - Local resource tracking
  - Local privacy controls
  - Local security validation

***

## 11. Local Toolchain Summary

| Category | Tools | Version | Purpose |
|----------|-------|---------|----------|
| Monorepo | Nx | 21.1.2 | Local monorepo management with AI/LLM-friendly project graphs |
| Build | SWC, Esbuild | 0.3.x, 0.20+ | Local compilation and bundling with performance optimizations |
| Package | pnpm | 9.0.0+ | Local package management with strict dependency resolution |
| Testing | Jest, Playwright | 29.7+, 1.42+ | Local testing with comprehensive coverage |
| LLM | Tabby ML, Ollama | 2.0+, 2.5+ | Local inference with model optimization |
| Vector DB | LanceDB, ChromaDB | 1.0+, 2.0+ | Local storage with efficient indexing |
| Search | SQLite | 3.45+ | Local search with full-text capabilities |
| Workflow | Temporal, RxJS | 2.0+, 8.0+ | Local orchestration with self-healing |
| Observability | OpenTelemetry | 2.0+ | Local tracing with privacy controls |
| Security | Sigstore, Trivy | 2.0+, 1.0+ | Local security with supply chain protection |
| Documentation | Markdown | Latest | Local documentation with code examples |
| CLI | Node.js | 20.x | Local interface with interactive mode |
| Registry | Zod | 3.22+ | Local configuration with validation |

> **See Also**: [Local Testing Guide](../TESTING.md) for local testing practices.