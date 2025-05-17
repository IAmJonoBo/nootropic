# Backlog Policy

[//]: # (Rebranding note: This file was updated from 'nootropic' to 'nootropic'. Legacy references are archived in .nootropic-cache/archive/ for rollback.)

## Overview

This document describes the lifecycle and best practices for managing TODOs and technical debt in the nootropic project. All TODOs/FIXMEs must be actionable, attributed, and resolved promptly, following the 2025 policy.

## Lifecycle

1. **Code Annotation**
   - Developers add actionable TODO/FIXME comments in code, following the format:
     ```
     // TODO(owner): Description of the task
     // FIXME(owner): Description of the fix needed
     ```
   - Generic or stale TODOs are not allowed.

2. **Automated Extraction**
   - The script `scripts/generateBacklogTodos.ts` scans the codebase for all actionable TODO/FIXME comments (excluding vendor, venv, copy, and test directories).
   - Each extracted TODO is appended to `agentBacklog.json` with:
     - `file`, `line`, `text` (traceability)
     - `source: 'auto-extracted'`
     - `triage: 'pending'`

3. **Triage & Hygiene**
   - TODOs must be triaged by maintainers or automation:
     - `triage: 'pending'` (default)
     - `triage: 'resolved'` (completed or no longer relevant)
     - `triage: 'ignored'` (not actionable or deferred)
   - Use the script `scripts/pruneBacklogTodos.ts` to archive resolved/ignored TODOs to `.nootropic-cache/backlog-archive.json` and remove them from the main backlog.

4. **Backlog Summary & CI**
   - The backlog summary (`.nootropic-cache/backlog-summary.json`) excludes resolved/ignored TODOs.
   - CI enforces that all TODOs are actionable, attributed, and triaged.

## Best Practices

- All TODOs must be actionable and attributed (e.g., `TODO(jon): Refactor this for modularity`).
- Resolve or triage TODOs promptly; do not allow stale or generic TODOs to accumulate.
- Use the automation scripts to keep the backlog clean and up to date.
- Review the backlog regularly and update priorities/status as needed.

## References
- `scripts/generateBacklogTodos.ts`: Automated extraction
- `scripts/pruneBacklogTodos.ts`: Automated pruning/archiving
- `agentBacklog.json`: Canonical backlog
- `.nootropic-cache/backlog-archive.json`: Archived TODOs
- `.nootropic-cache/backlog-summary.json`: Machine-usable summary

## 🤖 AI-Driven Triage, Hotspots & Sprint Planning

The project uses AI/LLM-powered automation to:

- Suggest triage and priority for all TODOs (`aiSuggestedTriage`, `aiSuggestedPriority`)
- Identify technical debt hotspots (files with most/oldest TODOs)
- Score staleness (days since TODO was added/modified)
- Output a prioritized list for the next sprint

**Scripts:**
- `scripts/aiTriageBacklogTodos.ts`: Adds AI-driven triage/priority fields to `agentBacklog.json`
- `scripts/backlogInsights.ts`: Outputs `.nootropic-cache/backlog-insights.json` (hotspots, staleness, priorities)

**Usage:**
```sh
pnpm tsx scripts/aiTriageBacklogTodos.ts
pnpm tsx scripts/backlogInsights.ts
```

**Outputs:**
- `aiSuggestedTriage`, `aiSuggestedPriority` in `agentBacklog.json`
- `.nootropic-cache/backlog-insights.json`

See README.md for workflow and integration with CI/CD.

## 🕸️ Dependency-Aware Triage & Sprint Planning

The project uses a code-level dependency graph to enhance triage and sprint planning:

- `scripts/generateCodeDependencyGraph.ts` scans all canonical .ts/.js files and outputs:
  - `.nootropic-cache/code-dependency-graph.json` (machine-usable)
  - `docs/codeDependencyGraph.mmd` (Mermaid diagram)
- AI triage (`scripts/aiTriageBacklogTodos.ts`) uses this graph to:
  - Flag TODOs in files with many dependents (dependency hotspots)
  - Suggest higher priority for TODOs in critical or highly depended-upon files
  - Add `dependencyHotspot` and `dependentCount` fields to backlog items

**Impact:**
- Enables more context-aware, risk-driven sprint planning
- Helps avoid cascading issues by prioritizing changes in core modules
- Surfaces technical debt hotspots for targeted remediation

**Usage:**
```sh
pnpm tsx scripts/generateCodeDependencyGraph.ts
pnpm tsx scripts/aiTriageBacklogTodos.ts
```

See README.md for workflow and integration with CI/CD.

## 🧠 Advanced Context Awareness & Proactive Agentic Reasoning

The project uses deep, multi-layered context graphs and semantic embeddings to maximize agent context awareness and safety:

- `.nootropic-cache/context-graph.json`: Unified code dependency, call, and data flow graph (see `scripts/generateContextGraph.ts`).
- `.nootropic-cache/semantic-embeddings.json`: Semantic embeddings for all functions, classes, and files (see `scripts/generateSemanticEmbeddings.ts`).
- `scripts/simulateImpact.ts`: Simulates the impact of changes, listing all affected modules, tests, and docs.
- `utils/feedback/semgrepMemories.ts`: Provides `contextAwareTriageSemgrepFinding` for context-rich, proactive triage and rationale.

### Agentic Reasoning Loop
- All agent actions require rationale, impact analysis, and mitigation suggestions.
- Agents use the context graph and semantic index to proactively identify risks, dependencies, and downstream effects before acting.
- Event-driven feedback and continuous learning are supported for self-improving agents.

**Best Practice:**
- Always run the context/embedding scripts before major refactors or triage.
- Use the context-aware triage and impact simulation APIs in all agentic workflows.

**Usage:**
```sh
pnpm tsx scripts/generateContextGraph.ts
pnpm tsx scripts/generateSemanticEmbeddings.ts
pnpm tsx scripts/simulateImpact.ts
pnpm tsx utils/feedback/semgrepMemories.ts
```

See README.md for workflow and integration with CI/CD.

## 📋 Backlog Epics & Planned Features

All major features, upgrades, and planned implementations are tracked as epics and subtasks in `agentBacklog.json`. This includes:

- **NV-Embed-v2 Integration:** Canonical embedding model for all semantic/agentic workflows (Python service, Node.js client, quantization, onboarding).
- **Context Graph & Static Analysis:** ts-morph-powered context graph for agentic reasoning and impact simulation.
- **Agentic Reasoning & Proactive Triage:** Rationale/impact/mitigation loop for all agent actions, with proactive risk analysis and feedback aggregation.
- **Doc/Code/Backlog Parity:** All planned and missing features from docManifest and code/doc sync are tracked in the backlog and surfaced in the docs as (planned) or (in progress).
- **CI/CD, Onboarding, and Coding Standards:** Continuous updates for best-practice compliance and discoverability.

> **Note:** All features marked as (planned) or (in progress) in the docs or registry are discoverable in the backlog and will be delivered in future releases. See [docs/docManifest.json](./docManifest.json) for canonical status and discoverability. 