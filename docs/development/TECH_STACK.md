# Local Technology Stack

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://docs.nootropic.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **NOTE**: The canonical source for the technology and tool stack is `docs/TOOLCHAIN.md`. This document provides a comprehensive overview of the local-first technology stack.

## Table of Contents

- [Core Technologies](#core-technologies)
  - [Local Inference & Model Management](#1-local-inference--model-management)
  - [Local Vector Storage & RAG](#2-local-vector-storage--rag)
  - [Local Workflow & Event Processing](#3-local-workflow--event-processing)
  - [Local Development & Build Tools](#4-local-development--build-tools)
  - [Local Observability & Monitoring](#5-local-observability--monitoring)
  - [Local Security & Compliance](#6-local-security--compliance)
  - [Local Testing & Quality](#7-local-testing--quality)
  - [Local Deployment & Infrastructure](#8-local-deployment--infrastructure)
  - [Local Model Security & Privacy](#9-local-model-security--privacy)
  - [Local Cost Tracking & Optimization](#10-local-cost-tracking--optimization)
- [Local Version Requirements](#local-version-requirements)
- [Local Development Tools](#local-development-tools)
- [Local Performance Targets](#local-performance-targets)
- [Local Security Standards](#local-security-standards)
- [Local Monitoring & Alerts](#local-monitoring--alerts)
- [Local Backup & Recovery](#local-backup--recovery)
- [Local Documentation](#local-documentation)
- [Local Integration Patterns](#local-integration-patterns)
- [Local Deployment Considerations](#local-deployment-considerations)
- [Local Scaling Strategies](#local-scaling-strategies)
- [Local Maintenance & Updates](#local-maintenance--updates)

## Core Technologies

### 1. Local Inference & Model Management

- **Tabby ML 2.0**: Local LLM gateway
  - Supports GGUF, MLX, and ONNX model formats
  - Automatic hardware detection and model optimization
  - Multi-model orchestration with dynamic routing
  - Local-first inference
  - Cost-aware model selection
  - Privacy-preserving processing
  - Parallel inference
  - Local model management

> **See Also**: [Model Management](../AI_BEST_PRACTICES.md#model-management--versioning) for details on local model deployment and versioning.

- **Ollama 2.5**: Cross-platform model runner
  - Native Apple Silicon (M3/M4) support
  - Automatic model quantization and optimization
  - Built-in model versioning and rollback
  - Local data processing
  - Cost tracking integration
  - Privacy controls
  - Parallel processing
  - Local model management

- **vLLM 1.0**: High-performance GPU inference
  - PagedAttention v2 for efficient memory usage
  - Multi-GPU support with automatic load balancing
  - Streaming and batched inference optimization
  - Resource cost tracking
  - Privacy-preserving inference
  - Security validation
  - Parallel inference
  - Local model management

### 2. Local Vector Storage & RAG

- **Chroma 2.0**: Primary vector store
  - SQLite + FAISS backend
  - Automatic index optimization
  - Real-time updates and versioning
  - Parallel indexing
  - Local storage management

> **See Also**: [Context Management](../AI_BEST_PRACTICES.md#context-window-management) for details on local RAG implementation.

- **LanceDB 1.0**: Large-scale vector storage
  - Arrow-based columnar storage
  - GPU-accelerated similarity search
  - Automatic sharding and replication
  - Parallel search
  - Local storage management

### 3. Local Workflow & Event Processing

- **Temporal 2.0**: Durable workflow engine
  - Time-travel debugging
  - Local tracing integration
  - Automatic retry and error handling
  - Parallel workflows
  - Local workflow management

> **See Also**: [Agent Architecture](../AGENTS.md#agent-communication) for details on local workflow patterns.

- **RxJS 8.0**: Reactive event streams
  - Backpressure handling
  - Automatic error recovery
  - Real-time event processing
  - Parallel streams
  - Local event management

### 4. Local Development & Build Tools

- **Nx 21.2.0**: Monorepo management
  - Build & Compilation
    - `@nx/js:tsc` executor for TypeScript compilation
    - `@nx/js:rollup` for library bundling
    - `@nx-tools/esbuild` for fast application builds
    - `@nx/node:execute` for script execution
  - Linting & Formatting
    - Built-in ESLint support via `@nx/lint:eslint`
    - Integrated Prettier via ESLint plugin
    - `@nx/workspace:affected` for smart linting
  - Testing Framework
    - `@nx/jest:jest-project` for unit testing
    - `@nx/vitest:configuration` for Vitest integration
    - `@nx/playwright:configuration` for E2E testing
    - `@nx/cypress:cypress-project` for component testing
  - Bundling & Packaging
    - `@nx/js:rollup` for library bundling
    - `@nx-tools/esbuild` for application bundling
    - `@nx/web:webpack-browser-build` for web apps
  - CLI & Scripting
    - Custom Nx generators for scaffolding
    - `@nx/workspace:run-commands` for scripts
    - Built-in prompt support for wizards
  - Dependency Management
    - `@nx/workspace:dep-graph` for visualization
    - ESLint boundaries for import control
    - `nx affected` for smart builds
  - Documentation & Code Gen
    - Custom Nx generators for docs
    - `@nx/js:typedoc` for API docs
    - Docusaurus integration
  - CI/CD & DevOps
    - `@nx/github:workflow-generator` for CI
    - `@nx/workspace:run-commands` for Docker
    - `nx-helm` for Kubernetes
  - Local Development Features
    - Distributed task caching
    - Incremental builds
    - Project graph visualization
    - Smart rebuilds
    - Parallel execution
    - ESM/NodeNext support
    - Integrated testing
    - Build optimization
    - Development server
    - Hot module replacement
    - Debug configuration
    - Environment management
  - Nx Workspace Architecture
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
  - Nx Build System
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
  - Nx Test System
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
  - Nx Project Graph
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
  - Nx Task Execution
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
  - Nx Workspace Plugins
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
  - Nx Workspace Analytics
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

> **See Also**: [Nx Guide](../NX_GUIDE.md) for comprehensive details on local Nx usage.

- **SWC 0.3.x**: TypeScript/JavaScript compiler
  - 20x faster than tsc
  - Rust-based optimization
  - Plugin system for custom transforms
  - ESM output support
  - Source map generation
  - TypeScript path mapping
  - Nx integration
    - Build executor
    - Test executor
    - Watch mode
    - Cache support
    - Project-specific rules
    - Workspace-wide rules
    - Cache-aware rules
    - Build-aware rules
    - pnpm workspace support
    - Local compilation
    - Parallel compilation

- **esbuild 0.20+**: JavaScript bundler
  - Sub-100ms builds
  - Tree shaking and minification
  - Source map generation
  - ESM output support
  - TypeScript integration
  - CSS bundling
  - Nx integration
    - Build executor
    - Development server
    - Plugin system
    - Cache support
    - Project-specific rules
    - Workspace-wide rules
    - Cache-aware rules
    - Build-aware rules
    - pnpm workspace support
    - Local bundling
    - Parallel bundling

- **pnpm 9.0.0+**: Package manager
  - Workspace management
    - Nx workspace integration
    - Project dependencies
    - Shared libraries
    - Version control
    - Workspace configuration
    - Project configuration
    - Target configuration
    - Cache configuration
    - Local workspace
    - Parallel workspace
  - Strict dependency resolution
    - Hoisting optimization
    - Peer dependency handling
    - Version conflicts
    - Security scanning
    - pnpm-lock.yaml
    - Workspace dependencies
    - Cache dependencies
    - Build dependencies
    - Test dependencies
    - Local dependencies

### 5. Local Observability & Monitoring

- **OpenTelemetry 2.0**: Local tracing
  - Automatic instrumentation
  - Context propagation
  - Multi-backend support
  - Nx integration
    - Build tracing
    - Test tracing
    - Cache tracing
    - Performance tracing
  - Trace analysis
    - Build performance
    - Test performance
    - Cache performance
    - Resource usage

- **OpenCost 2.0**: Local cost attribution
  - Per-span cost tracking
  - Resource utilization metrics
  - Budget enforcement
  - Nx integration
    - Build costs
    - Test costs
    - Cache costs
    - Local costs
  - Cost optimization
    - Resource allocation
    - Cache efficiency
    - Build optimization
    - Test optimization

- **Prometheus 3.0**: Local metrics collection
  - Time-series database
  - Alert management
  - Service discovery
  - Nx integration
    - Build metrics
    - Test metrics
    - Cache metrics
    - Performance metrics
  - Metric analysis
    - Build trends
    - Test trends
    - Cache trends
    - Resource trends

- **Grafana 10+**: Local visualization
  - Dashboard creation
  - Alert configuration
  - Data exploration
  - Nx integration
    - Build dashboards
    - Test dashboards
    - Cache dashboards
    - Performance dashboards
  - Custom visualizations
    - Build analytics
    - Test analytics
    - Cache analytics
    - Resource analytics

### 6. Local Security & Compliance

- **Semgrep 2.0**: Static analysis
  - AI-powered autofix
  - Custom rule creation
  - Multi-language support

> **See Also**: [Security Guidelines](../SECURITY.md) for comprehensive local security measures.

- **Trivy 1.0**: Vulnerability scanning
  - Container scanning
  - Infrastructure as Code
  - Secret detection

- **Sigstore**: Local supply chain security
  - SLSA Level 3 compliance
  - Keyless signing
  - Transparency logs

### 7. Local Testing & Quality

- **Jest 29+**: Unit testing
  - Nx test executor
  - Project-specific configs
  - Coverage reporting
  - Snapshot testing
  - Mock system
  - Performance optimization
  - Cache support
  - Parallel execution

- **Playwright 2.0**: E2E testing
  - Nx E2E executor
  - Cross-browser testing
  - Visual regression
  - Network interception
  - Component testing
  - API testing
  - Performance testing
  - Accessibility testing
  - Cache support
  - Parallel execution

- **LitmusChaos 2.0**: Local chaos engineering
  - Automated experiments
  - Resilience testing
  - Recovery validation
  - Nx integration
    - Test executor
    - Report generation
    - Cache support
    - Resource monitoring

- **ESLint 8+**: Code linting
  - Nx lint executor
  - Project-specific rules
  - TypeScript support
  - Performance rules
  - Security rules
  - Cache support
  - Auto-fix support

- **Prettier 3+**: Code formatting
  - Nx format executor
  - Project-specific configs
  - TypeScript support
  - CSS/SCSS support
  - JSON support
  - Cache support
  - Auto-fix support

- **SonarQube 10+**: Local code quality
  - Nx integration
  - Project analysis
  - Security scanning
  - Code coverage
  - Duplication detection
  - Technical debt
  - Quality gates
  - Cache support

### 8. Local Deployment & Infrastructure

- **Docker 25.0**: Local container runtime
  - BuildKit optimization
  - Multi-platform support
  - Security scanning
  - Nx integration
    - Build executor
    - Cache support
    - Layer optimization
    - Multi-stage builds
  - Container optimization
    - Size reduction
    - Security hardening
    - Performance tuning
    - Resource limits

- **GitHub Actions**: Local CI/CD
  - Nx workflow integration
  - Cache optimization
  - Parallel execution
  - Matrix builds
  - Environment management
  - Secret handling
  - Artifact storage
  - Local deployment

### 9. Local Model Security & Privacy

- **ModelGuard 1.0**: Local model security framework
  - Input validation and sanitization
  - Output filtering and safety checks
  - Model watermarking and fingerprinting
  - Privacy-preserving inference
  - Cost-aware security
  - Local-first protection

> **See Also**: [Model Security](../MODEL_SECURITY.md) for comprehensive local security measures.

- **PrivacyShield 1.0**: Local privacy protection
  - Data anonymization
  - Differential privacy
  - Secure multi-party computation
  - Privacy-preserving training
  - Cost-aware privacy
  - Local data protection

- **ComplianceGuard 1.0**: Local compliance management
  - GDPR compliance
  - CCPA compliance
  - AI ethics guidelines
  - Cost compliance
  - Privacy compliance
  - Security compliance

### 10. Local Cost Tracking & Optimization

- **CostGuard 1.0**: Local cost management
  - Per-model cost tracking
  - Resource utilization monitoring
  - Budget enforcement
  - Cost optimization
  - Privacy-aware costing
  - Security cost tracking

> **See Also**: [Cost Tracking](../AI_BEST_PRACTICES.md#cost-tracking--optimization) for local cost management best practices.

- **ResourceOptimizer 1.0**: Local resource optimization
  - Automatic scaling
  - Load balancing
  - Cost-aware scheduling
  - Privacy-preserving optimization
  - Security-aware optimization
  - Local-first optimization

- **BudgetManager 1.0**: Local budget control
  - Budget allocation
  - Cost alerts
  - Resource quotas
  - Privacy budget
  - Security budget
  - Local resource budget

## Local Version Requirements

### Node.js Environment

- Node.js 18.x LTS or later
  - ESM support
  - NodeNext module resolution
  - Native fetch API
  - Performance improvements

- pnpm 8.x or later
  - Workspace protocol
  - Strict dependency resolution
  - Efficient disk space usage

- TypeScript 5.x or later
  - ESM/NodeNext module resolution
  - Path aliases
  - Strict type checking
  - Decorator metadata

### Python Environment

- Python 3.11 or later
  - Type hints
  - Pattern matching
  - Performance improvements

- Poetry 2.0 or later
  - Dependency management
  - Virtual environment support
  - Build system integration

### System Requirements

- CPU: 8+ cores recommended
  - x86_64 or ARM64 architecture
  - AVX2 support recommended
  - Multi-threading support

- RAM: 16GB minimum, 32GB recommended
  - For local model inference
  - For development environment
  - For build processes

- Storage: 50GB+ free space
  - For model storage
  - For development workspace
  - For build artifacts

- GPU: NVIDIA RTX 4000 series or AMD RDNA 3 (optional)
  - For local model inference
  - For development testing
  - For performance optimization

## Local Development Tools

### IDE Support

- VS Code 1.85+ or later
  - Nx Console extension
  - ESLint integration
  - Prettier integration
  - TypeScript support
  - Debug configuration
  - Task running
  - Git integration
  - Local development
  - Project tags
  - Project dependencies
  - Project targets
  - Project cache

- JetBrains IDEs (2023.3+)
  - Nx plugin
  - TypeScript support
  - ESLint integration
  - Debug tools
  - Git integration
  - Task running
  - Local development
  - Project tags
  - Project dependencies
  - Project targets
  - Project cache

- Neovim 0.10+ with LSP support
  - TypeScript LSP
  - ESLint integration
  - Prettier integration
  - Git integration
  - Debug adapter
  - Task running

### Browser Support

- Chrome 120+
  - DevTools integration
  - Performance profiling
  - Network monitoring
  - Debug tools

- Firefox 120+
  - DevTools integration
  - Performance profiling
  - Network monitoring
  - Debug tools

- Safari 18+
  - Web Inspector
  - Performance profiling
  - Network monitoring
  - Debug tools

- Edge 120+
  - DevTools integration
  - Performance profiling
  - Network monitoring
  - Debug tools

### Local Development Environment

- Git 2.40+ or later
  - LFS support
  - Worktree support
  - Partial clone
  - Sparse checkout

- Docker 24+ or later
  - BuildKit support
  - Multi-platform builds
  - Compose V2
  - Volume management

- GitHub CLI 2.40+ or later
  - PR management
  - Issue tracking
  - Workflow management
  - Repository management

## Local Performance Targets

### Inference Latency

- First token: < 100ms
- Generation speed: > 50 tokens/second
- Context window: 128K tokens

### Build Performance

- Cold build: < 30 seconds
- Hot build: < 5 seconds
- Test suite: < 2 minutes
- Nx cache hit rate: > 90%
- Nx affected detection: < 1 second
- Nx project graph: < 2 seconds
- Nx task execution: < 5 seconds
- Nx workspace analysis: < 3 seconds

### Storage Performance

- Vector search: < 10ms
- Index updates: < 100ms
- Batch operations: < 1 second

## Local Security Standards

### Compliance

- Local security standards
- Local privacy standards
- Local data protection
- Local model security

### Authentication

- Local OAuth 2.1
- Local OpenID Connect
- Local WebAuthn
- Local Passkeys

## Local Monitoring & Alerts

### Metrics Collection

- Local performance metrics
- Local resource usage
- Local error rates
- Local security events

### Alert Management

- Local alert thresholds
- Local notification channels
- Local escalation paths
- Local incident response

## Local Backup & Recovery

### Data Protection

- Local data backup
- Local model backup
- Local configuration backup
- Local state backup

### Recovery Procedures

- Local system recovery
- Local data recovery
- Local model recovery
- Local configuration recovery

## Local Documentation

### Technical Documentation

- Local architecture docs
- Local API docs
- Local development guides
- Local deployment guides

### User Documentation

- Local user guides
- Local troubleshooting guides
- Local best practices
- Local security guides

## Local Integration Patterns

### System Integration

- Local API integration
- Local data integration
- Local model integration
- Local tool integration

### Development Patterns

- Local development workflow
- Local testing patterns
- Local deployment patterns
- Local monitoring patterns

## Local Deployment Considerations

### System Requirements

- Local hardware requirements
- Local software requirements
- Local network requirements
- Local security requirements

### Performance Optimization

- Local resource optimization
- Local cache optimization
- Local build optimization
- Local test optimization

## Local Scaling Strategies

### Resource Scaling

- Local CPU scaling
- Local memory scaling
- Local storage scaling
- Local GPU scaling

### Performance Scaling

- Local load balancing
- Local caching
- Local parallelization
- Local optimization

## Local Maintenance & Updates

### System Maintenance

- Local system updates
- Local security patches
- Local dependency updates
- Local configuration updates

### Performance Maintenance

- Local performance monitoring
- Local resource optimization
- Local cache management
- Local build optimization

> **See Also**: [Architecture Guide](../ARCHITECTURE.md) for local architecture details.
