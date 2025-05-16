# Pluggable Extensions & Custom Extractors Guide

[//]: # (Rebranding note: This file was updated from 'AI-Helpers' to 'nootropic'. Legacy references are archived in .ai-helpers-cache/archive/ for rollback.)

> **Note:** Plugin health and error status are now aggregated and surfaced in the describe registry, CLI, and docs. The describe registry is the canonical source for all plugin capability, health, and error metadata. Feature tables and documentation are auto-generated from the registry, following 2025 OTel/GenAI SIG best practices. See [agentBacklog.json](../agentBacklog.json#note-latest-best-practices), [docs/ROADMAP.md](../docs/ROADMAP.md#plugin-health-checks--error-reporting), and [README.md](../README.md#otel-observability) for details.

This system allows agents to register, list, and dynamically load custom extractors, analyzers, or output formats as plugins. All data is stored in `nootropic/pluginRegistry.json`.

## 1. Registering a Plugin (CLI)

```sh
pnpm tsx nootropic/pluginRegistry.ts register <name> <type> <entry> '{"metaKey":"metaValue"}'
```

Example:
```sh
pnpm tsx nootropic/pluginRegistry.ts register myExtractor extractor ./myExtractor.js '{"language":"python"}'
```

## 2. Listing Plugins (CLI)

```sh
pnpm tsx nootropic/pluginRegistry.ts list
```

## 3. HTTP API

Register a plugin:
```
POST http://localhost:4000/plugin-register
Content-Type: application/json

{
  "name": "myExtractor",
  "type": "extractor",
  "entry": "./myExtractor.js",
  "meta": {"language": "python"}
}
```

List all plugins:
```
GET http://localhost:4000/plugins
```

## 4. WebSocket API

Register a plugin:
```
{
  "type": "registerPlugin",
  "data": { "name": "myExtractor", "type": "extractor", "entry": "./myExtractor.js", "meta": {"language": "python"} }
}
```

List all plugins:
```
{ "type": "getPlugins" }
```

Response:
```
{ "type": "plugins", "data": [ ... ] }
```

---

- Plugins can be dynamically loaded by agents using the `loadPlugin` function in `pluginRegistry.ts`.
- All plugin metadata is persisted for agent and future use.

# Plugin Registry & Dynamic Plugin Lifecycle (2025 Best Practices)

## Dynamic Plugin Loading, Unloading, and Hot-Reload

- **Dynamic Loading:** Use `loadPluginFromDisk(entry)` to load plugins at runtime. Plugins are validated and initialized, and all event subscriptions are tracked.
- **Unloading:** Use `unloadPlugin(name)` to remove a plugin and all its event handlers. The plugin's `destroy()` method is called if present.
- **Hot-Reload:** Use `reloadPlugin(name, entry)` to unload and reload a plugin in one step, ensuring no stale handlers remain.
- **Event Subscription Tracking:** All event handlers registered by a plugin are tracked and removed on unload/reload, preventing memory leaks and stale state.
- **Extension Points:** Plugins interact with the system via stable extension points (event hooks, run/describe methods). These APIs are documented and versioned for stability.
- **Error Handling & Observability:** All plugin lifecycle events (load, unload, reload, errors) are logged. Errors are caught and reported, ensuring system robustness and easy debugging.

## Example Usage

```ts
const plugin = await pluginManager.loadPluginFromDisk('./plugins/examplePlugin.js', appContext);
pluginManager.unloadPlugin('examplePlugin');
await pluginManager.reloadPlugin('examplePlugin', './plugins/examplePlugin.js', appContext);
```

## Best Practices
- Use explicit types and Zod validation for plugin contracts.
- Document all extension points and plugin APIs.
- Ensure robust error handling and observability (e.g., OTel tracing).
- Reference: https://dev.to/hexshift/designing-a-plugin-system-in-typescript-for-modular-web-applications-4db5, https://eddiewould.com/2024/02/23/sustainable-delivery-core-capabilities-and-plugins-model/

## Plugin Hot-Reload & Dynamic Event Subscription (2025 Best Practices)

- All plugins must use `appContext.subscribeToEvent` (or `pluginManager.subscribe`) with their name for tracking. All event subscriptions are tracked and automatically cleaned up on unload/hot-reload by the PluginManager.
- OTel tracing is required for all plugin lifecycle and event handler logic (enabled by default).
- Plugins should implement `shutdown`, `reload`, and `health` hooks for robust lifecycle management and diagnostics.
- Reference Zod schemas in `describe()` for discoverability and LLM/agent introspection.
- See `plugins/examplePlugin.ts` and `pluginRegistry.ts` for reference implementations.

**Checklist for plugin authors:**
- [x] Use `subscribeToEvent` with your plugin name for all event subscriptions
- [x] Implement `shutdown`, `reload`, and `health` hooks
- [x] Reference Zod schemas in `describe()`
- [x] Ensure all event subscriptions are cleaned up on unload (handled by PluginManager)
- [x] Use OTel tracing for all event-driven logic (enabled by default)

**Troubleshooting:**
- If a plugin does not unload cleanly, check that all event subscriptions are registered with the plugin name and that the PluginManager is used for subscription tracking.
- If event handlers persist after reload, ensure the plugin's `shutdown` is called and that the PluginManager removes all handlers for the plugin.
- For advanced debugging, enable `AIHELPERS_DEBUG=1` to see detailed plugin lifecycle logs.

# Plugin Feedback: Rating, Review, and Social Memory (2025 Best Practices)

The plugin registry now supports community-driven feedback for all plugins, including ratings, reviews, and social memory (usage/aggregate trust). This enables discoverability, trust, and LLM/agent-friendly introspection.

## Submitting Feedback (CLI/HTTP API)

- **CLI:**
  ```sh
  pnpm tsx scripts/submitPluginFeedback.ts <pluginName> <user> <rating> [review]
  # Example:
  pnpm tsx scripts/submitPluginFeedback.ts myPlugin alice 5 "Great plugin!"
  ```
- **HTTP API:**
  - See: `orchestration/examples/pluginFeedbackApi.ts`
  ```
  POST http://localhost:4000/plugin-feedback
  Content-Type: application/json
  {
    "pluginName": "myPlugin",
    "user": "alice",
    "rating": 5,
    "review": "Great plugin!"
  }
  ```

## Listing Feedback & Aggregates

- **Registry API:**
  - When listing plugins (via CLI, HTTP, or WebSocket), each plugin entry now includes a `feedbackAggregate` field:
    - `averageRating`: number (1-5)
    - `reviewCount`: number
    - `ratings`: array of ratings
    - `reviews`: array of { user, review, timestamp }
  - Example:
    ```json
    {
      "name": "myPlugin",
      ...
      "feedbackAggregate": {
        "averageRating": 4.7,
        "reviewCount": 12,
        "ratings": [5,5,4,4,5,5,4,5,5,4,5,5],
        "reviews": [
          { "user": "alice", "review": "Great plugin!", "timestamp": "2025-01-01T12:00:00Z" },
          ...
        ]
      }
    }
    ```
- **HTTP API:**
  - List feedback for a plugin:
    ```sh
    curl http://localhost:4000/plugin-feedback/myPlugin
    ```
  - Get aggregate feedback for a plugin:
    ```sh
    curl http://localhost:4000/plugin-feedback/myPlugin/aggregate
    ```

## Machine-Usable & Registry-Compliant
- All feedback is stored in `.ai-helpers-cache/plugin-feedback.json` and is discoverable via the registry and describe APIs.
- Feedback is structured for LLM/agent consumption and explainability.
- Feedback aggregation is performed automatically and surfaced in all plugin listings.

## Best Practices
- Encourage users to submit honest, constructive feedback.
- Use feedback aggregates for plugin discovery, ranking, and trust.
- All feedback is auditable and explainable for LLM/agent workflows. 