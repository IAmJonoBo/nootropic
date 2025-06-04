# Getting Started with nootropic

This guide will walk you through installing, configuring, and running your first workflow with **nootropic**. By the end, you'll have a functioning local setup, will know how to launch the onboarding wizard, and will be able to verify that key components (LLM server, vector store, workflow engine) are operating correctly.

***

## 1. Prerequisites

Before installing nootropic, ensure your environment meets the following requirements:

### 1.1 Supported Operating Systems

- **macOS*- (10.15 "Catalina" or later)
- **Linux*- (Ubuntu 20.04 LTS or equivalent; tested on Debian 11, Fedora 36)
- **Windows*- (Windows 10/11, WSL2 recommended for full CLI compatibility)

### 1.2 System Requirements

- **CPU**
  - Minimum: 4-core (`x86_64` or `ARM64`)
  - Recommended: 8-core or better, with AVX2 (`x86_64`) or NEON (`ARM`)
- **RAM**
  - Minimum: 8 GB
  - Recommended: 16 GB (especially if you intend to run medium-sized local models)
- **Disk Space**
  - Minimum: 10 GB free (for code, embeddings, and model caches)
  - Recommended: 50 GB free (for storing multiple quantized model files)
- **GPU (Optional)**
  - NVIDIA with CUDA 11.x+ or Apple Silicon / AMD (for higher-throughput inference via `vLLM`/`Ollama`)
  - Ensure that any required drivers (e.g., NVIDIA CUDA Toolkit) are installed and up to date.

### 1.3 Software Dependencies

- `Node.js` v18 LTS or later (we recommend installing via [nvm](https://github.com/nvm-sh/nvm))
- `pnpm` (v8+) is required for all dependency management. Do not use yarn or npm directly.
- All TypeScript code uses ESM/NodeNext: `tsconfig.json` files use `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`; all `package.json` files set `"type": "module"`; all local imports must use explicit `.js` extensions.
- `npm` (or `yarn`) for JavaScript package management
- `Python` 3.9 or later (used by Tabby ML)
- `pip` (Python package manager)
- `Git` (v2.30+ recommended)
- `Docker` (v20.10+; used for Temporal server and optional Weaviate/Chroma containers)
- `Docker Compose` (v1.29+; for launching containerized services)
- Optional: `CUDA Toolkit` (if using NVIDIA GPU for `vLLM` or other GPU-backed inference)

***

## 2. Installation

These steps will clone the nootropic repository, install dependencies, and build the code so you can begin using nootropic locally.

### 2.1 Clone the Repository

Open a terminal (or Git Bash on Windows) and run:

```bash
git clone https://github.com/your-org/nootropic.git
cd nootropic
```

This creates a local copy in the `nootropic/` directory.

### 2.2 Install JavaScript/TypeScript Dependencies

From the repository root:

```bash
pnpm install
```

> **Note:*- pnpm is the canonical package manager for this monorepo. Do not use yarn or npm directly. All code uses ESM/NodeNext and explicit `.js` import extensions.

This command installs all required packages for the Nx monorepo (CLI, VS Code extension, Electron app, shared libraries, etc.).

### 2.3 Install Python Dependencies for Tabby ML

Tabby ML (the local LLM gateway) is implemented in Python. To install:

```bash
pip install tabby-ml
```

- On Windows, ensure you have Python 3.9+ installed and that `pip` is on your PATH.
- If you prefer using a virtual environment:

```bash
python3 -m venv ~/.nootropic-venv
source ~/.nootropic-venv/bin/activate   # On Linux/macOS
# Or on Windows PowerShell:
# .\.nootropic-venv\Scripts\Activate.ps1
pip install tabby-ml
```

### 2.4 Build, Lint, Test, and Type-Check the Monorepo

nootropic uses Nx for all build, lint, test, and type-check operations. Common commands:

```bash
pnpm nx run-many --target=lint --all
pnpm nx run-many --target=type-check --all
pnpm nx run-many --target=test --all
pnpm nx run-many --target=build --all
pnpm nx run-many --target=e2e --all
```

- Uses Vitest (v3.x+) as the primary test runner. Root `vitest.config.ts` defines a `projects` array for all testable libs/apps. Each lib/app has its own `vitest.config.ts` using `defineProject` and `globals: true`. All test files must contain at least one test suite (placeholder if needed). Mac resource fork files (`._*`) should be deleted from test directories if present.
- Use `nx affected --target=<target>` for PRs to only run tasks on changed projects.
- Nx Cloud is enabled for distributed caching and fast CI.

### 2.5 Build the Monorepo

nootropic uses Nx 16 and SWC for fast builds. To compile all TypeScript code and bundle applications:

```bash
npx nx build
```

- This runs SWC behind the scenes and produces build artifacts for:
  - `libs/` packages
  - `apps/nootropic-cli/` (Node CLI)
  - `apps/nootropic-vscode-ext/` (VS Code extension)
  - `apps/nootropic-electron/` (Electron dashboard)

> **Note:*- A first build may take a minute. Subsequent builds are incremental and much faster.

***

## 3. Basic Configuration

Certain configuration files allow you to customize nootropic's behavior—specifying model preferences, API keys, and optional settings.

### 3.1 User Configuration File

Create (or edit) `~/.nootropic/config.json`. If the file does not exist, create it manually:

```bash
mkdir -p ~/.nootropic
nano ~/.nootropic/config.json
```

Populate it with at least the following fields:

```json
{
  "localFirst": true,
  "modelPreference": ["starcoder2-3b-4bit", "llama2-7b-4bit", "gemma3-1b-4bit"],
  "allowCloudFallback": false,
  "openaiApiKey": "",
  "anthropicApiKey": "",
  "useGPU": true,
  "maxModelSizeGB": 4.0
}
```

- `modelPreference`: an array of local model IDs (as recognized by Tabby ML or Ollama).
- `allowCloudFallback`: set to `true` if you're comfortable routing failed/local inference to a cloud API.
- `openaiApiKey` / `anthropicApiKey`: if empty, cloud fallback is disabled.
- `useGPU`: if `false`, local inference will never attempt GPU backends (`vLLM`/`Ollama`).
- `maxModelSizeGB`: keeps nootropic from downloading models larger than available RAM.

Save and close (`Ctrl+O`, `Enter`, `Ctrl+X` in nano).

### 3.2 Tabby ML Configuration

Tabby ML serves as an OpenAI-compatible REST gateway for local LLM inference. Create (or edit) `tabby.config.json` at the repository root:

```json
{
  "port": 8000,
  "host": "0.0.0.0",
  "backends": [
    {
      "type": "ollama",
      "models": ["starcoder2-3b-4bit", "gemma3-1b-4bit", "llama2-7b-4bit"]
    },
    {
      "type": "vllm",
      "models": ["starcoder2-3b-4bit", "llama2-7b-4bit"]
    },
    {
      "type": "llama.cpp",
      "models": ["llama2-7b-4bit"]
    }
  ]
}
```

- `port` / `host`: network settings for Tabby ML.
- `backends`: a prioritized list of local inference backends and the model IDs you have downloaded or intend to download.

> **Ensure you've actually downloaded or pulled those models (e.g., via `ollama pull starcoder2:gguf`) before starting Tabby ML.**

### 3.3 Docker Compose for Temporal & (Optional) Weaviate

nootropic uses Temporal for durable workflows. By default, we provide a simple Docker Compose file under `infrastructure/temporal/docker-compose.yml`. To start Temporal locally:

```bash
cd infrastructure/temporal
docker-compose up -d
```

- Verify Temporal is running by visiting <http://localhost:8088> in your browser. You should see the Temporal Web UI.

Optionally, if you plan to use Weaviate for hybrid search (dense + BM25) instead of—or alongside—Chroma:

```bash
cd infrastructure/weaviate
docker-compose up -d
```

- Confirm Weaviate is available at <http://localhost:8080/v1>.

***

## 4. First Run

Now that nootropic is installed and configured, let's launch the onboarding wizard, which generates your initial project specification and scaffolds a starter codebase.

### 4.1 Launch the Onboarding Wizard

From the repository root:

```bash
npx nootropic wizard
```

The wizard will prompt you for:

1. Project Name (e.g., "expense-tracker")
2. Primary Language / Framework (e.g., "Python + Flask")
3. Database Choice (e.g., "PostgreSQL" or "SQLite" for local dev)
4. Describe High-Level Goal (e.g., "A personal expense tracker with user authentication and CSV export")
5. Estimated Timeline (e.g., "Remote MVP in 2 weeks")

Once complete, the wizard:

- Generates `project-spec.md` in the repository root, containing YAML/Markdown that outlines epics, stories, and tasks.
- Commits `project-spec.md` to a new Git branch (`wizard-init`) and pushes it to your local main branch.
- Creates an initial project scaffold (via Cookiecutter) under `apps/<project-name>/`. For example, if you chose "Flask," you'll see a minimal Flask project structure.
- Generates an initial Temporal DAG and stores it under `.nootropic-cache/task-graph.json`.

You should see console output similar to:

```
✔ Created project-spec.md and committed to git (branch: wizard-init)
✔ Scaffolded Flask project under apps/expense-tracker/
✔ Generated initial task graph with 12 tasks (epics: 3, stories: 7)
```

### 4.2 Open Generated Project in VS Code (Optional)

If you use VS Code, open both the nootropic monorepo and your newly scaffolded project:

1. Launch VS Code at the monorepo root:

```bash
code .
```

2. You should see two folders in the VS Code Explorer:
   - `nootropic/` (core agents, CLI, extensions)
   - `apps/expense-tracker/` (your new project scaffold)
3. Install the nootropic VS Code extension by going to the Extensions pane (`Ctrl+Shift+X`), clicking the "…" menu, choosing "Install from VSIX…," and selecting `apps/nootropic-vscode-ext/nootropic-vscode-ext-<version>.vsix`.

Once installed, open a file under `apps/expense-tracker/`. You can now invoke slash commands in the chat pane (e.g., `/nootropic code -f routes.py -instruct "Add endpoint for /expenses"`) or use inline refactor commands.

***

## 5. Verifying Installation

To confirm that the core components are functioning correctly, perform these sanity checks:

### 5.1 Verify Tabby ML Is Running

In a new terminal:

```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"starcoder2-3b-4bit","messages":[{"role":"user","content":"print(\"Hello, world!\")"}]}'
```

You should receive a JSON response containing a model-generated completion. For example:

```json
{
  "id": "chatcmpl-XYZ",
  "model": "starcoder2-3b-4bit",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "print(\"Hello, world!\")  # Python code to display Hello, world!"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 5,
    "completion_tokens": 10,
    "total_tokens": 15
  }
}
```

If you see a valid "assistant" response, Tabby ML is serving local models correctly.

### 5.2 Verify Temporal Server

Visit <http://localhost:8088> in your browser. You should see the Temporal Web UI. If it fails to load:

- Run `docker ps` to confirm the Temporal containers are running (look for `temporalio/auto-setup-dev` images).
- If missing, revisit "3.3 Docker Compose for Temporal" and re-run `docker-compose up -d`.

### 5.3 Verify Chroma Vector Store (RAG)

By default, Chroma is used as the local vector database (no Docker required). To sanity-check:

1. In a Node REPL (or a quick script), run:

```js
import { ChromaClient } from "@chromadb/client";
const chroma = new ChromaClient({ persistDirectory: "./.vectorstore" });
(async () => {
  const exists = await chroma.listCollections();
  console.log("Chroma collections:", exists);
})();
```

2. If no exception is thrown and you see an empty array or collection names, Chroma is accessible.

To test ingestion and query:

```js
import { ChromaClient } from "@chromadb/client";
import { OpenAIEmbeddings } from "langchain/embeddings"; // or Tabby-style embedder
(async () => {
  const chroma = new ChromaClient({ persistDirectory: "./.vectorstore" });
  const embedder = new OpenAIEmbeddings({
    modelName: "text-embedding-ada-002",
  });
  // 1. Add a simple document
  const text = "How do I connect to a PostgreSQL database in Node.js?";
  const embedding = await embedder.embedDocuments([text]);
  await chroma.addDocuments([
    { id: "test-doc-1", vector: embedding[0], metadata: { source: "example" } },
  ]);
  // 2. Query with a similar question
  const qEmb = await embedder.embedQuery("Postgres connection Node.js");
  const results = await chroma.query({ queryEmbeddings: [qEmb], nResults: 1 });
  console.log("Top result:", results);
})();
```

If you see the added document returned, Chroma ingestion and retrieval are working.

### 5.4 Verify CLI Functionality

Run a basic CLI command to confirm everything is wired up:

```bash
npx nootropic --version
```

Expected output: something like

```
nootropic/1.0.0 darwin-x64 node-v18.16.0
```

Then try:

```bash
npx nootropic plan --brief "Build a TODO list app with React and Express"
```

You should see a generated JSON (or YAML) structure representing a high-level task graph (epics → stories → tasks). This confirms the `PlannerAgent` and `CoderAgent` are reachable.

***

## 6. Next Steps

Once you've verified installation, you can explore these areas:

1. **Comprehensive Tutorials**
   - `TUTORIALS/tutorial_new_project.md`
   - `TUTORIALS/tutorial_flask.md`
   - `TUTORIALS/tutorial_refactor.md`
2. **Architecture Deep Dive**
   - Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for high-level design, service boundaries, and data flows.
3. **Component Reference**
   - Browse `COMPONENTS/PlannerAgent.md`, `COMPONENTS/ModelAdapter.md`, and others to understand internal responsibilities and configuration.
4. **Deploy to Production**
   - Follow [`DEPLOYMENT.md`](DEPLOYMENT.md) to spin up nootropic in a production-like environment (Docker images, Kubernetes manifests, Helm charts).
5. **Customize Model Matching**
   - Tweak `~/.nootropic/config.json` to adjust model scoring weights, modify inference timeouts, or add new local models.
6. **Install Plugins**
   - View available plugins with `npx nootropic plugin:list`.
   - Install a plugin by copying its directory into `plugins/` and rerunning `npx nootropic plugin:refresh`.

***

## Troubleshooting Tips

- **Tabby ML Fails to Start**

  - Ensure Python 3.9+ is on your PATH. Run `python3 --version` to confirm.
  - Check for port conflicts: if port 8000 is in use, modify `tabby.config.json` to a free port and re-run `tabby serve`.

- **Temporal Web UI Doesn't Load**

  - Use `docker logs <temporal_container_name>` to inspect errors.
  - Confirm ports 7233 (gRPC) and 8088 (Web) are not blocked by a firewall.

- **Chroma Errors on Ingestion**

  - Ensure the directory `./.vectorstore` is writable.
  - Delete `./.vectorstore` and retry; corruption can occur if Chroma was terminated mid-write.

- **VS Code Extension "No Commands Found"**

  - Rebuild the extension:

    ```bash
    cd apps/nootropic-vscode-ext
    npm install
    npm run build
    code --extensionDevelopmentPath="${PWD}"
    ```

  - Double-check that `describe-registry.json` exists under `~/.nootropic-cache/describe-registry.json`. If missing, run `npx nootropic plugin:refresh`.

- **"Model Not Found" Errors**

  - Confirm that the model IDs listed in `~/.nootropic/config.json` match those available in Tabby ML (check `ollama list` or `llama.cpp` folder names).
  - If using Ollama, verify you've run `ollama pull <model>:gguf` for each model.

- **"Permission Denied" Installing Dependencies**

  - On macOS/Linux, prefix `pnpm install` or `pip install` with `sudo` only if absolutely necessary.
  - Prefer setting up a Node version manager (`nvm`) and Python virtual environment to avoid global permissions issues.

- \*\*If you see errors about missing `describe`/`it` in tests, ensure each lib/app has a `vitest.config.ts` with `globals: true` and at least one test suite per file.

- \*\*If you see ESM/NodeNext import errors, check that all local imports use explicit `.js` extensions and all `package.json` files set `"type": "module"`.

- \*\_If you see errors about `.\__`files or`Unexpected \x00`, delete Mac resource fork files from your test directories: `find . -name '.\_\*' -delete`.

- **If you see markdownlint errors in CI or pre-commit:**
  - Run `pnpm lint:md` locally to see and fix Markdown style issues.
  - Edit `.markdownlint.jsonc` at the repo root to customize rules if needed.

***

## Markdown Linting and Formatting

All documentation in the `docs/` directory is subject to a two-phase linting and formatting process:

1. **Automated Cleanup:**
   - Run `pnpm run clean:md` to automatically format, fix, and lint all Markdown files. This script runs Prettier, remark-lint, and markdownlint-cli2 in sequence.
   - Most issues (formatting, list numbering, spacing, etc.) will be fixed automatically.
2. **Manual Review:**
   - If any issues remain after running `clean:md`, review the output and fix manually (e.g., duplicate headings, broken links, missing alt text).

**Commands:**

```bash
pnpm run clean:md   # Full automated cleanup and lint
```

This process runs automatically on commit (via lint-staged) and in CI. For more details, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

***

## Summary

- You have now installed nootropic's core dependencies.
- You have configured key files: \`
