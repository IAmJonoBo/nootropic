# Plugin Architecture

This document describes the plugin architecture for the nootropic project, focusing on LLM/AI-friendliness, automation, and robust schema validation.

## Overview

- **Purpose:**
  - Enable dynamic extension of the system with new capabilities, tools, and adapters via plugins.
  - Ensure all plugins are discoverable, type-safe, and self-describing for LLM/AI workflows.
- **Plugin Directory:**
  - All plugins are placed in the `plugins/` directory and loaded dynamically at runtime.

## Plugin Lifecycle

1. **Registration:**
   - Plugins are registered via the CLI or programmatically using `registerPlugin` in `pluginRegistry.ts`.
2. **Loading:**
   - Plugins are loaded dynamically from the `plugins/` directory using ESM imports.
3. **Validation:**
   - All plugins are validated at runtime using the canonical [PluginModuleSchema](./schema%20validation%20onboarding%20(planned).md#plugin-module-schema) (Zod).
   - Invalid plugins are skipped and logged.
4. **Discovery:**
   - Plugins must export a `describe()` function for LLM/AI and agent discovery.
5. **Execution:**
   - Plugins may export a `run()` function for CLI or programmatic invocation.

## Schema Validation

- See [Schema Validation Onboarding](./schema%20validation%20onboarding%20(planned).md) for details on the Zod-based validation pattern.
- All plugin modules must conform to the canonical schema:

```
ts
export const PluginModuleSchema = z.object({
  name: z.string(),
  describe: z.function().args().returns(z.unknown()),
  run: z.function().args(z.any()).returns(z.any()).optional(),
}).catchall(z.unknown());
```

## Registry Integration

- Plugins are listed and managed via the plugin registry (`pluginRegistry.ts`).
- The registry enforces schema validation and aggregates plugin metadata for LLM/AI workflows.

## Cross-References

- [Schema Validation Onboarding](./schema%20validation%20onboarding%20(planned).md)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [pluginRegistry.ts](../../pluginRegistry.ts)

---

## 🚦 Planned Implementation
- The plugin architecture will document and implement plugin registration, lifecycle, and feedback workflows.
- See [Backlog](../../agentBacklog.json) for current status and planned features.

---

## 📚 Related Docs
- [Onboarding Guide](./onboarding%20guide%20(planned).md)
- [CLI Usage Guide](./CLI%20usage%20(planned).md)
- [Utilities Reference](./utils%20(planned).md)

---

For updates, see the [backlog](../../agentBacklog.json) and [docManifest](../docManifest.json).

