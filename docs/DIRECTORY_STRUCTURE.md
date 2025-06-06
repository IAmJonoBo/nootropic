# Directory Structure

nootropic/                          # Nx workspace root
├── apps/                          # Deployable applications
│   ├── cli/                       # "nootropic" CLI application
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   └── ...
│   │   ├── public/                # (optional) Static assets for CLI UI
│   │   ├── tsconfig.json          # (optional) TypeScript config for app
│   │   ├── vite.config.ts         # Required: Vite config for app
│   │   ├── project.json           # Required: Nx project configuration
│   │   └── package.json           # Required: CLI dependencies
│   ├── electron/                  # Electron Dashboard application
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── preload.ts
│   │   │   └── ...
│   │   ├── public/                # (optional) Static assets for Electron app
│   │   ├── tsconfig.json          # (optional) TypeScript config for app
│   │   ├── vite.config.ts         # Required: Vite config for app
│   │   ├── project.json           # Required: Nx project configuration
│   │   └── package.json           # Required: Electron dependencies
│   ├── vscode/                    # VS Code extension
│   │   ├── src/
│   │   │   ├── extension.ts
│   │   │   └── ...
│   │   ├── tsconfig.json          # (optional) TypeScript config for extension
│   │   ├── vite.config.ts         # Required: Vite config for extension
│   │   ├── project.json           # Required: Nx project configuration
│   │   └── package.json           # Required: VS Code extension dependencies
│   ├── api/                       # REST/gRPC API server (NestJS)
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   └── controllers/
│   │   ├── tsconfig.json          # (optional) TypeScript config for API
│   │   ├── vite.config.ts         # Required: Vite config for API
│   │   ├── project.json           # Required: Nx project configuration
│   │   └── package.json           # Required: API dependencies
│   └── temporal/                  # Temporal worker application
│       ├── src/
│       │   ├── index.ts
│       │   ├── workers/           # Temporal workflow definitions
│       │   └── activities/
│       ├── tsconfig.json          # (optional) TypeScript config for worker
│       ├── vite.config.ts         # Required: Vite config for worker
│       ├── project.json           # Required: Nx project configuration
│       └── package.json           # Required: Temporal dependencies
│
├── libs/                         # Reusable libraries
│   ├── agents/                   # Each agent as its own library
│   │   ├── planner-agent/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── planner.service.ts
│   │   │   ├── utils/            # (optional) Utility functions for agent
│   │   │   ├── tests/            # (optional) Unit/integration tests
│   │   │   ├── tsconfig.json     # (optional) TypeScript config for agent
│   │   │   ├── project.json      # Required: Nx project configuration
│   │   │   └── package.json      # (optional) Only if published
│   │   ├── coder-agent/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── coder.service.ts
│   │   │   └── project.json     # Required: Nx project configuration
│   │   ├── critic-agent/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── critic.service.ts
│   │   │   └── project.json     # Required: Nx project configuration
│   │   ├── reasoning-agent/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── reasoning.service.ts
│   │   │   └── project.json     # Required: Nx project configuration
│   │   ├── search-agent/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── search.service.ts
│   │   │   └── project.json     # Required: Nx project configuration
│   │   ├── feedback-agent/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── feedback.service.ts
│   │   │   └── project.json     # Required: Nx project configuration
│   │   ├── project-mgr-agent/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── project-mgr.service.ts
│   │   │   ├── migrations/      # SQL or JSON migrations for project specs
│   │   │   └── project.json     # Required: Nx project configuration
│   │   ├── explainability-agent/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── explainability.service.ts
│   │   │   └── project.json     # Required: Nx project configuration
│   │   ├── memory-agent/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   └── memory.service.ts
│   │   │   └── project.json     # Required: Nx project configuration
│   │   └── observability-agent/
│   │       ├── src/
│   │       │   ├── index.ts
│   │       │   └── observability.service.ts
│   │       └── project.json     # Required: Nx project configuration
│   │
│   ├── adapters/                # Each adapter as its own library
│   │   ├── model-adapter/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── model.adapter.ts
│   │   │   │   └── providers/
│   │   │   │       ├── ollama.provider.ts
│   │   │   │       ├── tabby.provider.ts
│   │   │   │       └── openai.provider.ts
│   │   │   ├── utils/            # (optional) Utility functions for adapter
│   │   │   ├── tests/            # (optional) Unit/integration tests
│   │   │   ├── tsconfig.json     # (optional) TypeScript config for adapter
│   │   │   ├── project.json      # Required: Nx project configuration
│   │   │   └── package.json      # Required: Published as @nootropic/model-adapter
│   │   ├── storage-adapter/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── vector.store.ts
│   │   │   │   └── relational.store.ts
│   │   │   ├── project.json    # Required: Nx project configuration
│   │   │   └── package.json    # Required: Published as @nootropic/storage-adapter
│   │   ├── observability-adapter/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── telemetry.ts
│   │   │   │   └── tracer.ts
│   │   │   ├── project.json    # Required: Nx project configuration
│   │   │   └── package.json    # Required: Published as @nootropic/observability-adapter
│   │   ├── plugin-loader-adapter/
│   │   │   ├── src/
│   │   │   │   ├── index.ts
│   │   │   │   ├── plugin.loader.ts
│   │   │   │   └── plugin.schema.ts
│   │   │   ├── project.json    # Required: Nx project configuration
│   │   │   └── package.json    # Required: Published as @nootropic/plugin-loader-adapter
│   │   └── reflexion-adapter/
│   │       ├── src/
│   │       │   ├── index.ts
│   │       │   ├── reflexion.bus.ts
│   │       │   └── reflexion.log.ts
│   │       ├── project.json    # Required: Nx project configuration
│   │       └── package.json    # Required: Published as @nootropic/reflexion-adapter
│   │
│   ├── shared/                  # Shared schemas, types, and utilities
│   │   ├── src/
│   │   │   ├── schemas/        # JSON Schema files
│   │   │   │   ├── project-spec.schema.json
│   │   │   │   ├── capability-registry.schema.json
│   │   │   │   └── agent-state.schema.ts
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts
│   │   │   │   └── constants.ts
│   │   │   ├── types/
│   │   │   │   ├── agent.interface.ts
│   │   │   │   └── adapter.interface.ts
│   │   │   └── index.ts
│   │   ├── tests/              # (optional) Unit/integration tests
│   │   ├── tsconfig.json       # (optional) TypeScript config for shared lib
│   │   ├── project.json        # Required: Nx project configuration
│   │   └── package.json        # Required: Published as @nootropic/shared
│   │
│   ├── ui/                     # Shared React UI components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Timeline.tsx
│   │   │   ├── styles/
│   │   │   │   ├── tailwind.config.js
│   │   │   │   └── theme.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useTelemetry.ts
│   │   │   │   └── usePlugin.ts
│   │   │   └── index.ts
│   │   ├── project.json        # Required: Nx project configuration
│   │   └── package.json        # Required: Published as @nootropic/ui
│   │
│   ├── runtime/                # Core runtime (error classes, common logging)
│   │   ├── src/
│   │   │   ├── errors.ts
│   │   │   ├── logger.ts
│   │   │   └── index.ts
│   │   ├── project.json        # Required: Nx project configuration
│   │   └── package.json        # Required: Published as @nootropic/runtime
│   │
│   └── context/                # Cross-cutting context (user, project, env)
│       ├── src/
│       │   ├── project.context.ts
│       │   ├── user.context.ts
│       │   └── env.context.ts
│       ├── project.json        # Required: Nx project configuration
│       └── package.json        # Required: Published as @nootropic/context
│
├── tools/                      # Custom scripts and executors
│   ├── benchmark/
│   │   ├── src/
│   │   └── project.json        # Required: Nx project configuration
│   ├── migrations/
│   │   ├── src/
│   │   └── project.json        # Required: Nx project configuration
│   ├── cache-warm/
│   │   ├── src/
│   │   └── project.json        # Required: Nx project configuration
│   ├── rotate-keys/
│   │   ├── src/
│   │   └── project.json        # Required: Nx project configuration
│   └── snapshot-chroma/
│       ├── src/
│       └── project.json        # Required: Nx project configuration
│
├── config/                     # Centralized configuration
│   ├── eslint/
│   │   ├── .eslintrc.json
│   │   └── workspace-rules.ts
│   ├── prettier/
│   │   ├── .prettierrc
│   │   └── .prettierignore
│   ├── nx/
│   │   ├── nx-workspace-plugins.json
│   │   └── tsconfig.paths.json
│   └── vitest/
│       ├── vitest.config.ts
│       └── vitest.preset.ts
│
├── plugins/                    # Third-party and custom plugins
│   ├── example-plugin/
│   │   ├── src/
│   │   ├── plugin.json
│   │   ├── project.json        # Required: Nx project configuration
│   │   └── package.json        # Required: Plugin dependencies
│   └── another-plugin/
│       ├── src/
│       ├── plugin.json
│       ├── project.json        # Required: Nx project configuration
│       └── package.json        # Required: Plugin dependencies
│
├── .nootropic-cache/          # Runtime cache (registry, LevelDB, Temporal SQLite)
├── .vectorstore/              # Chroma/LanceDB local data
├── nx.json                    # Nx workspace configuration
├── workspace.json             # Project definitions and targets
├── tsconfig.base.json         # Shared TypeScript configuration
├── pnpm-workspace.yaml        # PNPM workspace configuration
├── .env.local                 # Local environment variables
├── package.json               # Root package (may depend on @nootropic/cli for dev)
└── README.md                  # Project overview and documentation

## Package.json vs Project.json Guidelines

1. **Project.json (Required for all Nx projects)**
   - Every folder under `apps/` and `libs/` must have a `project.json`
   - Defines Nx-specific configuration (build targets, test configs, etc.)
   - Required for Nx to understand and manage the project

2. **Package.json (Required only for specific cases)**
   - **Required for:**
     - All applications under `apps/` (they run independently)
     - Libraries that will be published to npm (e.g., `@nootropic/shared`)
     - Projects with external dependencies not in root `package.json`
   - **Optional for:**
     - Internal libraries (e.g., agents) that are only used within the workspace
     - Tools that don't need external dependencies

3. **Cache Directories**
   - `.nootropic-cache/`: Runtime artifacts (registry, LevelDB, Temporal SQLite)
   - `.vectorstore/`: Local vector store data (ChromaDB, LanceDB)
   - Both directories should be gitignored

# Note: Extra files and directories such as public/, src/, utils/, tests/, vite.config.ts, and tsconfig.json are common in Nx/monorepo setups for development, testing, and build configuration. Their presence is allowed and should be documented for clarity. Only remove them if strict compliance with a minimal structure is required.