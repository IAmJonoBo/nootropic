# CoderAgent

***

## Table of Contents

- [CoderAgent](#coderagent)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Responsibilities](#responsibilities)
  - [Inputs / Outputs](#inputs--outputs)
    - [Inputs](#inputs)
    - [Outputs](#outputs)
  - [Data Structures](#data-structures)
  - [Algorithms \& Workflow](#algorithms--workflow)
    - [Generation Workflow](#generation-workflow)
    - [Refactoring Workflow](#refactoring-workflow)
  - [Edge Cases \& Failure Modes](#edge-cases--failure-modes)
  - [Integration Points](#integration-points)
  - [Configuration](#configuration)
  - [Metrics \& Instrumentation](#metrics--instrumentation)
  - [Testing \& Validation](#testing--validation)
  - [Future Enhancements](#future-enhancements)
  - [Summary](#summary)

***

## Overview

The **CoderAgent** is responsible for generating new code, applying targeted refactors, and orchestrating AST-safe transformations. It leverages LLMs, integrates with other agents, and ensures code changes are context-aware, style-consistent, and validated before application.

***

## Responsibilities

1. **Code Generation**
   * Given a high-level task or user instruction, produce implementation code snippets, functions, or modules.
   * Leverage local or cloud LLMs (via ModelAdapter) for idiomatic, style-consistent code.
   * Chunk code context to fit model windows and provide relevant examples from MemoryAgent.
2. **Refactoring & AST Transforms**
   * Apply structured, AST-based rewrites using OpenRewrite or similar libraries.
   * Perform operations like renaming, extracting functions, or migrating frameworks.
   * Return unified diff patches for preview and review.
3. **Feature Scaffolding**
   * Create new project skeletons or modules from a project spec.
   * Use Cookiecutter or Yeoman templates for directory structures and boilerplate.
4. **Incremental Code Updates**
   * Address specific failures (e.g., linter errors, failing tests) with precise patches.
   * Handle multi-file updates and produce cohesive diff sets.
5. **Context Management**
   * Integrate SearchAgent results and MemoryAgent episodes into prompts for enriched context.
6. **Collaboration with Other Agents**
   * Send generated diffs to CriticAgent for validation.
   * Cooperate with ReasoningAgent for iterative fix loops if validation fails.

***

## Inputs / Outputs

### Inputs

* **Task Description**: Structured object or string from PlannerAgent or user prompt.

  ```json
  {
    "taskID": "T007",
    "description": "Add user registration endpoint in `users.js` using bcrypt and JWT",
    "filePaths": ["src/routes/users.js", "src/models/userModel.js"],
    "contextChunks": [
      {
        "file": "src/routes/users.js",
        "lines": [1, 200]
      }
    ]
  }
  ```

* **Code Context**: Existing source code, function definitions, imports, comments, and MemoryAgent episodes.

* **Refactor Pattern or Recipe**: Named OpenRewrite recipe or custom refactoring prompt.

* **User Overrides / Flags**: Optional flags (e.g., `--forceCloud`, `--maxTokens`, `--styleGuide`, `--language`).

### Outputs

* **Unified Diff Patch**: Multi-file diff in unified diff format.

  ```diff
  diff --git a/src/routes/users.js b/src/routes/users.js
  index 8c9d7ab..5e4f2f1 100644
  --- a/src/routes/users.js
  +++ b/src/routes/users.js
  @@ -10,6 +10,20 @@ router.get("/users", async (req, res) => {
      try {
        const users = await User.find();
        res.json(users);
  +  } catch (err) {
  +    res.status(500).json({ message: err.message });
  +  }
  +});

  +// NEW: POST /users/register
  +router.post("/users/register", async (req, res) => {
  +  try {
  +    const { username, password } = req.body;
  +    const salt = await bcrypt.genSalt(10);
  +    const hashedPassword = await bcrypt.hash(password, salt);
  +    const newUser = new User({ username, password: hashedPassword });
  +    await newUser.save();
  +    res.status(201).json({ message: "User registered" });
  +  } catch (err) {
  +    res.status(500).json({ message: err.message });
  +  }
  +});
  ```

* **Metadata for Downstream Agents**: JSON payload describing changed files, token usage, and LLM model.

  ```json
  {
    "taskID": "T007",
    "diffFiles": ["src/routes/users.js"],
    "model": "starcoder2-3b-4bit",
    "tokensIn": 120,
    "tokensOut": 240,
    "latencyMs": 320
  }
  ```

* **Promise / Acknowledgment**: Workflow-compatible promise for orchestration.

***

## Data Structures

```typescript
interface CodePatch {
  taskID: string;
  diffs: FileDiff[];
  modelUsed: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  timestamp: string;
}

interface FileDiff {
  filePath: string;
  diffText: string;
}

interface GenerationRequest {
  taskID: string;
  description: string;
  language: string;
  filePaths: string[];
  contextChunks: ContextChunk[];
  recipeName?: string;
  maxTokens?: number;
  forceCloud?: boolean;
  styleGuide?: "airbnb" | "google" | "pep8";
}

interface ContextChunk {
  file: string;
  startLine: number;
  endLine: number;
  codeSnippet?: string;
}
```

* `CodePatch` encapsulates the output patch and metadata.
* `GenerationRequest` bundles all context for a generation or refactor.
* `ContextChunk` allows minimal context pulls for token efficiency.

***

## Algorithms & Workflow

### Generation Workflow

1. **Receive GenerationRequest**
   * Validate required fields.
   * Plan new files if needed.
2. **Fetch & Chunk Code Context**
   * Read specified lines from disk for each context chunk.
   * Concatenate up to model's context window.
3. **Retrieve Memory Examples**
   * Query MemoryAgent for top-k similar episodes.
   * Select up to 2–3 examples for few-shot guidance.
4. **Assemble Prompt Template**
   * Load prompt template and fill with task, context, and examples.
5. **Invoke ModelAdapter**
   * Call ModelAdapter with prompt and options.
   * ModelAdapter selects model based on hardware, tokens, and preferences.
6. **Parse & Post-Process LLM Output**
   * Expect unified diff; post-process if needed.
   * Validate diff applies cleanly to workspace files.
7. **Return CodePatch to Orchestrator**
   * Package diff, metadata, and resolve promise for workflow.

### Refactoring Workflow

1. **Receive Refactor Request**
   * GenerationRequest with `recipeName` set.
2. **Fetch Required Code**
   * Read full files for AST transform.
3. **Execute OpenRewrite Recipe**
   * Apply recipe via OpenRewrite engine or Docker.
   * Fallback to LLM-guided patch if recipe fails.
4. **Validate and Return Patch**
   * Dry-run diffs, run tests, and return CodePatch.

***

## Edge Cases & Failure Modes

1. **Ambiguous or Under-Specified Instructions**
   * Query SearchAgent for hotspots or profiling data.
   * Ask for clarification via ReasoningAgent or emit signal.
   * If no clarification, generate best-effort suggestion and mark as "needs review".
2. **Large Codebases / Context Window Overflow**
   * Prioritize chunks by relevance.
   * Truncate or summarize less relevant code.
   * Emit OTEL warning if context truncated.
3. **Multi-File Dependency Changes**
   * Use SearchAgent to locate all references.
   * Batch refactor in chunks; roll back if any batch fails.
4. **LLM Hallucinations or Invalid Syntax**
   * Run syntax check after patch.
   * If errors, invoke ReasoningAgent for correction.
   * Escalate to ProjectMgrAgent if repeated failures.
5. **Concurrent Edits / Merge Conflicts**
   * Detect via Git status.
   * If conflicts, generate 3-way merge prompt for LLM.
   * Return merged diff for review.

***

## Integration Points

* **ModelAdapter**: Delegates all LLM calls, passes prompt, language, and options. Listens for events via ReflexionAdapter.
* **SearchAgent**: Retrieves relevant code snippets for context.
* **MemoryAgent**: Requests past episodes for few-shot examples; stores prompt + patch pairs after success.
* **CriticAgent**: Receives patch for static analysis and tests; triggers ReasoningAgent if failure.
* **ReasoningAgent**: Used for iterative fixes on failure; constructs "Fix this snippet" prompts.
* **Temporal Workflows**: Implements activities and emits signals for workflow orchestration.

***

## Configuration

All configuration parameters are under `coderAgent` in `~/.nootropic/config.json`:

```json
{
  "coderAgent": {
    "defaultLanguage": "javascript",
    "maxTokenBudget": 2048,
    "fewShotExampleCount": 2,
    "invalidOutputStrategy": "retryPrompt",
    "maxRetriesOnInvalidOutput": 3,
    "openRewriteRecipes": "config/openrewrite/recipes/",
    "createBackupBranch": true
  }
}
```

* `defaultLanguage`: Used if not specified in request.
* `maxTokenBudget`: Hard limit on LLM context + generation tokens.
* `fewShotExampleCount`: Number of past episodes to retrieve.
* `invalidOutputStrategy`: How to recover from invalid LLM output.
* `openRewriteRecipes`: Directory for custom OpenRewrite recipes.
* `createBackupBranch`: If enabled, creates a backup branch before large diffs.

***

## Metrics & Instrumentation

* **Span:** `coder.generate` (taskID, model, tokens, latency, diff size)
* **Counter:** `coder.generate_attempts`
* **Histogram:** `coder.diff_size`
* **Span:** `coder.refactor` (recipe, files, latency, errors)
* **Metric:** `coder.retry_count`

These metrics feed into ReflexionEngine for automated detection and cost-based model adjustments.

***

## Testing & Validation

* **Unit Tests:** Validate prompt templating, mock ModelAdapter, test context-chunking.
* **Integration Tests:** Run sample generateCodeFragment, test multi-file refactors with OpenRewrite.
* **End-to-End Workflow:** Validate CoderAgent → CriticAgent → commit sequence; simulate errors and ensure ReasoningAgent is invoked.

***

## Future Enhancements

1. **Language-Specific Plugins**: Integrate with language servers and support more AST engines.
2. **Interactive Patch Preview**: Embed diffs in VS Code for inline review.
3. **Learning-based Prompt Optimization**: Use FeedbackAgent to optimize prompts.
4. **Batch Generation for Similar Tasks**: Generate code for multiple tasks in a batch.
5. **Enhanced Merge Conflict Resolution**: Integrate a 3-way merge assistant powered by LLM.

***

## Summary

> The CoderAgent is central to nootropic's ability to generate and refactor code in an accurate, context-aware, and self-healing manner. By combining LLM-driven generation, AST-safe refactoring, context retrieval, and tight validation, CoderAgent ensures generated patches meet quality standards and align with project style.
