# Frequently Asked Questions (FAQ)

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://docs.nootropic.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **NOTE**: The canonical source for the technology and tool stack is `docs/TOOLCHAIN.md`. This document provides frequently asked questions and answers.

## Table of Contents

- [General Questions](#general-questions)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [Development](#development)
- [Model Management](#model-management)
- [Troubleshooting](#troubleshooting)
- [Advanced Topics](#advanced-topics)
- [Support and Community](#support-and-community)

## General Questions

### What is nootropic?

Nootropic is an open-source, self-healing, self-teaching AI development environment that runs primarily on users' machines. It combines project planning, code generation, static analysis, continuous integration, deployment, and ongoing learning into a single platform.

> **See Also**: [Architecture Overview](../ARCHITECTURE.md#architecture-overview) for detailed system design.

### What are the key features?

- Local-first inference with optional cloud APIs
- Declarative, agent-driven workflows
- Self-healing and reflexion loops
- Continuous learning through LoRA fine-tuning
- Plugin-based extensibility

> **See Also**: [Features](../README.md#features) for a complete list of capabilities.

### What are the system requirements?

- Node.js v18 or later
- Python v3.9 or later
- Docker (for optional services)
- Git
- Optional: GPU with up-to-date drivers

> **See Also**: [Development Environment](../DEPLOYMENT.md#development-environment) for setup instructions.

## Installation and Setup

### How do I install nootropic?

See our [Installation Guide](INSTALLATION.md) for detailed instructions. The basic steps are:

1. Clone the repository
2. Install dependencies
3. Start local services
4. Run the onboarding wizard

> **See Also**: [Getting Started](../GETTING_STARTED.md) for detailed setup instructions.

### What local services are required?

- Tabby ML (local LLM gateway)
- Temporal Server (workflow engine)
- Chroma Vector Store (automatic after first run)

> **See Also**: [Local Services](../DEPLOYMENT.md#local-services) for service configuration.

### How do I set up the VS Code extension?

1. Install the VSIX from `apps/nootropic-vscode-ext/`
2. Or run in dev mode:

   ```bash
   cd apps/nootropic-vscode-ext
   npm install
   npm run build
   code --extensionDevelopmentPath="${PWD}"
   ```

> **See Also**: [VS Code Extension](../TECH_STACK.md#vs-code-extension) for extension features.

## Usage

### How do I start a new project?

1. Run the onboarding wizard: `npx nootropic wizard`
2. Answer prompts to generate project spec
3. Review and modify the generated task graph
4. Start development using the VS Code extension

> **See Also**: [Project Setup](../SCAFFOLD.md#project-setup) for detailed instructions.

### How do I use the VS Code extension?

- Use slash commands (`/nootropic`) in the chat pane
- Use inline diff previews
- Access the explainability sidebar
- Use the Kanban board and timeline views

> **See Also**: [VS Code Extension](../TECH_STACK.md#vs-code-extension) for extension features.

### How do I configure LLM backends?

See our [LLM Backend Configuration](TUTORIALS/tutorial_llm_backends.md) tutorial for details on:

- Local model configuration
- Cloud API integration
- Model selection and optimization

> **See Also**: [Model Management](../AI_BEST_PRACTICES.md#model-management) for best practices.

## Development

### How do I create custom agents?

See our [Custom Agent Implementation](TUTORIALS/tutorial_custom_agents.md) tutorial for:

- Agent architecture
- Implementation guidelines
- Testing and deployment

> **See Also**: [Agent Development](../AGENTS.md#agent-development) for detailed guidelines.

### How do I optimize performance?

See our [Performance Optimization](TUTORIALS/tutorial_performance.md) tutorial for:

- Model optimization
- Workflow optimization
- System optimization

> **See Also**: [Performance Tuning](../OPERATIONS.md#performance-optimization) for optimization guidelines.

### How do I implement security best practices?

See our [Security Best Practices](TUTORIALS/tutorial_security.md) tutorial for:

- Model security
- Data protection
- System hardening

> **See Also**: [Security Guidelines](../SECURITY.md#security-guidelines) for security best practices.

## Model Management

### How does local-first inference work?

Nootropic prioritizes local model inference for privacy and performance:

- Models are downloaded and cached locally
- Inference runs on your hardware (CPU/GPU)
- Optional cloud fallback for complex tasks
- Automatic model selection based on task
- Resource-aware routing

> **See Also**: [Model Management](../AI_BEST_PRACTICES.md#model-management) for detailed guidelines.

### How is model privacy handled?

We implement several privacy measures:

- Local-first processing
- Data minimization
- Secure model storage
- Access controls
- Audit logging

> **See Also**: [Privacy Guide](../PRIVACY.md) for privacy policies.

### How do I optimize model performance?

Several optimization techniques are available:

- Model quantization (4-bit GGUF)
- Hardware acceleration (MLX, CUDA)
- Dynamic batching
- Resource management
- Performance monitoring

> **See Also**: [Performance Guide](../PERFORMANCE.md) for optimization details.

### How is model security ensured?

Security measures include:

- Model validation
- Input sanitization
- Output filtering
- Access controls
- Security monitoring

> **See Also**: [Security Guide](../SECURITY.md) for security details.

### How is cost tracking implemented?

Cost tracking features include:

- OpenCost integration
- Resource monitoring
- Usage analytics
- Cost attribution
- Budget controls

> **See Also**: [Analytics Guide](../ANALYTICS.md) for monitoring details.

## Troubleshooting

### Common Issues

#### ESM/NodeNext Import Errors

- Ensure all local imports use explicit `.js` extensions
- Check that all `package.json` files set `"type": "module"`
- Verify `tsconfig.json` uses `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`

> **See Also**: [Troubleshooting Guide](../TROUBLESHOOTING.md#development-issues) for more solutions.

#### Test Errors

- Ensure each lib/app has a `vitest.config.ts` with `globals: true`
- Include at least one test suite per file
- Check for missing `describe`/`it` functions

> **See Also**: [Testing Guide](../TECH_STACK.md#testing--quality) for testing best practices.

#### Mac Resource Fork Files

If you see errors about `._*` files or `Unexpected \x00`:

```bash
find . -name '._*' -delete
```

> **See Also**: [Troubleshooting Guide](../TROUBLESHOOTING.md#development-issues) for more solutions.

### Performance Issues

#### Slow Model Inference

- Check GPU drivers and CUDA installation
- Verify model quantization settings
- Monitor system resources
- Consider using a more powerful model

> **See Also**: [Performance Tuning](../OPERATIONS.md#performance-optimization) for optimization guidelines.

#### High Memory Usage

- Enable model quantization
- Use smaller models
- Implement proper memory management
- Monitor and optimize workflow execution

> **See Also**: [Resource Management](../OPERATIONS.md#resource-management) for memory optimization.

#### Slow Workflow Execution

- Check Temporal server status
- Monitor workflow metrics
- Optimize agent configurations
- Review and optimize task DAG

> **See Also**: [Workflow Optimization](../OPERATIONS.md#workflow-optimization) for performance tuning.

## Advanced Topics

### How does the self-healing system work?

The self-healing system uses:

- OpenTelemetry for tracing
- OpenCost for cost tracking
- ReflexionEngine for auto-repair
- Model switching for fallback

> **See Also**: [Self-Healing System](../ARCHITECTURE.md#self-healing-system) for detailed design.

### How does continuous learning work?

- Nightly LoRA fine-tuning on accepted diffs
- Incremental model improvement
- Zero cloud cost for training
- Automatic model selection

> **See Also**: [Continuous Learning](../AI_BEST_PRACTICES.md#continuous-learning) for implementation details.

### How do I extend the system?

- Use the plugin system
- Implement custom adapters
- Create new agents
- Extend the workflow engine

> **See Also**: [Extension Development](../TECH_STACK.md#extension-development) for development guidelines.

## Support and Community

### How do I get help?

- Open an issue in GitHub Issues
- Join our Discord/Slack channel
- Check the [Troubleshooting Guide](TROUBLESHOOTING.md)
- Review the [Documentation](README.md)

> **See Also**: [Support Resources](../CONTRIBUTING.md#support-resources) for community guidelines.

### How do I report bugs?

1. Check existing issues
2. Create a new issue
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - System information
   - Logs and error messages

> **See Also**: [Issue Reporting](../CONTRIBUTING.md#reporting-issues) for detailed guidelines.

### How do I contribute?

See our [Contributing Guide](CONTRIBUTING.md) for:

- Coding standards
- Development workflow
- Testing requirements
- Documentation guidelines

> **See Also**: [Contributing Guidelines](../CONTRIBUTING.md#contributing-guidelines) for detailed instructions.

## Security

### How do I report security vulnerabilities?

Follow our [Security Policy](SECURITY.md) for:

- Confidential reporting
- Response process
- Disclosure guidelines

### How is data protected?

- Local-first architecture
- Optional cloud integration
- Data encryption
- Access control
- Security scanning

## License and Legal

### What license is nootropic under?

Nootropic is released under the Apache 2.0 License. See the [LICENSE](../LICENSE) file for details.

### Can I use nootropic commercially?

Yes, the Apache 2.0 License allows commercial use. However, some components may have different licenses. Check individual component licenses for details.

### How do I attribute nootropic?

Include the Apache 2.0 License notice and any required attributions for third-party components.
