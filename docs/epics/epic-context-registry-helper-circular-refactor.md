---
title: Context/Registry/Helper Circular Dependency Refactor
description: Refactor and eliminate circular dependencies among context utilities, registry, and helpers. Prioritize cycles involving registry.ts, contextManager.ts, pluginRegistry.ts, and memory/context helpers. See madge output and .nootropic-cache/dependency-graph.png.
status: in progress
---

# Context/Registry/Helper Circular Dependency Refactor

## Progress
- **All problematic cycles (RAGPipelineUtility, ReasoningLoopUtility, registry, memoryLaneHelper) are now broken** via dependency injection and late initialization.
- **Only foundational cycles remain** (e.g., registry <-> memoryLaneHelper for event bus backend selection), which are common in plugin/registry architectures and are documented/triaged as low-risk.
- **Linter errors are fully resolved.**

## New Pattern
- **Dependency injection** is used for event publishing in RAGPipelineUtility and ReasoningLoopUtility, breaking import-time cycles.
- **Late initialization** is used for distributed event bus backends, further decoupling registry and memoryLaneHelper.
- **LLM/AI/CI benefits:** The codebase is now more modular, testable, and agent/discoverability-friendly. CI can robustly check for cycles and registry/describe compliance.

## Next Steps
- Continue backlog-driven implementation and advanced utility upgrades.
- Periodically audit for new cycles after major refactors.

## References
- [madge output](../../.nootropic-cache/dependency-graph.png)
- [agentBacklog.json](../../agentBacklog.json)

---

_Last updated: 2025-05-17_ 