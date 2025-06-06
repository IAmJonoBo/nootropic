# Tutorial: Setting Up Local Development Environment

## Overview

This tutorial guides you through setting up a complete local development environment for nootropic, including all necessary services, tools, and configurations.

## Prerequisites

- Node.js v18+ and pnpm v8+
- Python 3.9+ and pip
- Docker and Docker Compose
- Git
- VS Code (recommended)

## Steps

### 1. Clone and Setup Repository

```bash
# Clone the repository
git clone https://github.com/your-org/nootropic.git
cd nootropic

# Install dependencies
pnpm install

# Install Python dependencies
pip install tabby-ml
```

### 2. Configure Local Services

1. **Start Temporal Server**
   ```bash
   cd infrastructure/temporal
   docker-compose up -d
   ```

2. **Configure Tabby ML**
   Create `tabby.config.json` in the root directory:
   ```json
   {
     "port": 8000,
     "host": "0.0.0.0",
     "backends": [
       {
         "type": "ollama",
         "models": ["starcoder2-3b-4bit", "gemma3-1b-4bit"]
       }
     ]
   }
   ```

3. **Start Tabby ML**
   ```bash
   tabby serve --config tabby.config.json
   ```

### 3. VS Code Setup

1. **Install Extensions**
   - Install the nootropic VS Code extension from `apps/nootropic-vscode-ext/`
   - Install recommended extensions:
     - ESLint
     - Prettier
     - GitLens

2. **Configure Settings**
   Add to `.vscode/settings.json`:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "typescript.tsdk": "node_modules/typescript/lib"
   }
   ```

### 4. Development Workflow

1. **Start Development Server**
   ```bash
   pnpm nx serve nootropic-api
   ```

2. **Run Tests**
   ```bash
   pnpm nx test nootropic-api
   ```

3. **Build for Production**
   ```bash
   pnpm nx build nootropic-api
   ```

### 5. Debugging

1. **VS Code Debugging**
   - Use the built-in debugger with the following configuration in `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug API",
         "program": "${workspaceFolder}/apps/nootropic-api/src/main.ts",
         "outFiles": ["${workspaceFolder}/dist/apps/nootropic-api/**/*.js"]
       }
     ]
   }
   ```

2. **Logging**
   - Use the OpenTelemetry collector for distributed tracing
   - View logs in VS Code's Output panel
   - Check Temporal Web UI for workflow traces

### 6. Common Issues and Solutions

1. **Port Conflicts**
   - If port 8000 is in use, modify `tabby.config.json` to use a different port
   - Check for running Docker containers: `docker ps`

2. **Dependency Issues**
   - Clear pnpm store: `pnpm store prune`
   - Rebuild node_modules: `rm -rf node_modules && pnpm install`

3. **Python Environment**
   - Use virtual environment: `python -m venv .venv`
   - Activate: `source .venv/bin/activate` (Unix) or `.venv\Scripts\activate` (Windows)

## What's Next

- [Tutorial: Working with VS Code Extension](tutorial_vscode.md)
- [Tutorial: Using CLI Tools](tutorial_cli.md)
- [Tutorial: Configuring LLM Backends](tutorial_llm_backends.md)

## Additional Resources

- [Architecture Documentation](../ARCHITECTURE.md)
- [API Reference](../API_REFERENCE.md)
- [CLI Reference](../CLI_REFERENCE.md) 