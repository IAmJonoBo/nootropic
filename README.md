# Nootropic Monorepo

**Important: This project enforces the use of [pnpm](https://pnpm.io/) as the package manager.**

- All contributors and CI must use pnpm for installing dependencies and running scripts.
- Using npm or yarn is not supported and may result in broken builds or dependency issues.
- See [pnpm documentation](https://pnpm.io/) for installation and usage instructions.

Nootropic is an AI-powered development environment that helps developers write better code, faster.

## Directory Structure

The project follows a monorepo structure using Nx:

- `apps/`: Deployable applications (CLI, Electron, VS Code, API, Temporal)
- `libs/`: Reusable libraries (agents, adapters, shared, UI, runtime, context)
- `tools/`: Custom scripts and executors (benchmark, migrations, cache-warm)
- `config/`: Centralized configuration (ESLint, Prettier, Nx, Jest)
- `plugins/`: Third-party and custom plugins
- `.nootropic-cache/`: Runtime cache (registry, LevelDB, Temporal SQLite)
- `.vectorstore/`: Local vector store data (ChromaDB, LanceDB)

## Development Setup

1. **Prerequisites**
   - Node.js 18+
   - pnpm 8+
   - Git

2. **Installation**

   ```bash
   git clone https://github.com/yourusername/nootropic.git
   cd nootropic
   pnpm install
   ```

3. **Configuration**
   - Copy `.env.example` to `.env.local`
   - Update environment variables as needed

4. **Development**

   ```bash
   # Start development server
   pnpm start

   # Run tests
   pnpm test

   # Lint code
   pnpm lint

   # Build project
   pnpm build
   ```

5. **Cache Management**

   ```bash
   # Clear cache
   pnpm clean
   ```

## Project Structure

### Apps

- `cli/`: Command-line interface
- `electron/`: Desktop application
- `vscode/`: VS Code extension
- `api/`: REST/gRPC API server
- `temporal/`: Temporal worker

### Libraries

- `agents/`: AI agents (planner, coder, critic, etc.)
- `adapters/`: External service adapters
- `shared/`: Shared schemas and utilities
- `ui/`: React components
- `runtime/`: Core runtime
- `context/`: Cross-cutting context

### Tools

- `benchmark/`: Performance testing
- `migrations/`: Data migrations
- `cache-warm/`: Cache warming
- `rotate-keys/`: Key rotation
- `snapshot-chroma/`: Vector store snapshots

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
