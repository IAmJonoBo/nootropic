# PluginLoaderAdapter

## Responsibilities

* Scanning plugins/ directory, validating manifests, dynamically registering capabilities

## Inputs/Outputs

* Input: Plugin modules exporting describe()
* Output: Updated describe-registry.json, in-memory registry of plugins & their commands

## Algorithms

* File system watcher (for hot reloading plugins), Zod schema validation, version conflict checks

## Edge Cases

* Malformed plugin, schema mismatch, duplicate names

## Integration Points

* Used by CLI autocompletion (capabilities) and VS Code extension (slash commands)

## Configuration

* Plugin directory path, Zod schemas, caching strategy for describe-registry.json

# PluginLoaderAdapter

## Summary

The **PluginLoaderAdapter** manages dynamic discovery, validation, and registration of third-party plugins for nootropic. It scans a designated `plugins/` directory (or configured path), loads plugin modules that export a standardized manifest (e.g., via `describe()`), validates them against a schema (using Zod), and maintains both an in-memory registry and a persisted `describe-registry.json`. By enabling hot-reloading through a filesystem watcher, the PluginLoaderAdapter allows new capabilities to be added or updated at runtime without restarting the core application. It also handles version conflicts, duplicate names, and malformed manifests to ensure system stability.

***

## 1. Responsibilities

1. **Plugin Discovery & Scanning**

   * Monitor a configurable directory (default: `<project-root>/plugins/`) for additions, updates, or removals of plugin modules.
   * Detect plugin packages that conform to the expected structure (e.g., a top-level `index.js` exporting a `describe()` function).

2. **Manifest Validation**

   * Use Zod schemas to validate each plugin's `describe()` output, ensuring required fields (e.g., `name`, `version`, `commands`, `capabilities`) are present and correctly typed.
   * Reject or quarantine plugins whose manifests do not match the schema, emitting warnings or errors as needed.

3. **Dynamic Registration & Hot Reloading**

   * Load valid plugins into memory, registering their commands, slash commands (in VS Code), and any UI extensions.
   * On file system changes (add/update/delete), unload removed plugins, reload updated ones, and update the in-memory registry and persisted registry file.

4. **Conflict Detection & Resolution**

   * Detect duplicate plugin names or command overlaps, and apply conflict-resolution policies (e.g., last-write-wins, version precedence, or disable conflicting plugins).
   * Log conflicts to the user and provide fallback behavior to prevent runtime errors.

5. **Registry Persistence**

   * After each successful scan or change, update a JSON file (`describe-registry.json`) under the application data directory, capturing the current set of registered plugins and their capabilities.
   * Provide APIs to query the persisted registry for tooling (e.g., CLI autocompletion, VS Code extension).

6. **Integration Exposure**
   * Expose a structured interface (`getRegisteredPlugins()`, `getPluginCapabilities()`, `onPluginChange(callback)`) for other adapters (CLI, VS Code extension, Electron UI) to retrieve plugin metadata.
   * Support loading of plugin-provided middleware, event hooks, or extra commands at runtime.

***

## 2. Inputs / Outputs

### 2.1 Inputs

1. **Filesystem Events**

   * File addition (`add`), modification (`change`), or deletion (`unlink`) events under the configured plugin directory.
   * May originate from manual file operations, Git checkouts, or package installations.

2. **Plugin Module Files**

   * Each plugin is expected to export a `describe(): PluginManifest` function in its entry point (e.g., `index.js` or `dist/index.js`).
   * The `PluginManifest` should include at minimum:
     * `name` (string, unique identifier)
     * `version` (semver string)
     * `description` (string)
     * `commands` (array of `CommandDescriptor`)
     * `capabilities` (optional object detailing slash commands, UI components, middleware hooks)

3. **Configuration Parameters**
   * `pluginDirectory`: Path to the folder where plugins are located (default: `./plugins`).
   * `registryPath`: Path for the persisted `describe-registry.json` file.
   * `zodSchemaPath`: Path to the Zod schema definition for plugin manifests.
   * `watchDebounceMs`: Milliseconds to debounce rapid filesystem changes (e.g., `200ms`).

### 2.2 Outputs

1. **In-Memory Registry**

   * A dictionary mapping `pluginName` → `RegisteredPlugin` object, containing:
     * `manifest: PluginManifest`
     * `module: any` (the loaded module reference)
     * `commands: CommandDescriptor[]`
     * `capabilities: PluginCapabilities`

2. **Persisted Registry (`describe-registry.json`)**

   * JSON file listing all registered plugins with fields:

     ```jsonc
     {
       "plugins": [
         {
           "name": "plugin-foo",
           "version": "1.2.3",
           "description": "Adds foo commands.",
           "commands": [
             { "id": "foo.doSomething", "description": "Execute foo." },
           ],
           "capabilities": {
             /* ... */
           },
         },
         // ...
       ],
     }
     ```

3. **Events / Callbacks**
   * Emit events such as `pluginLoaded(pluginName)`, `pluginUnloaded(pluginName)`, `pluginFailed(pluginName, error)` to registered listeners.
   * Provide a subscription API (`onPluginChange(callback: PluginChangeEvent)`) so other components can react in real-time.

***

## 3. Data Structures

### 3.1 Plugin Manifest & Descriptors

```ts
/** Minimum manifest fields returned by plugin.describe() */
interface PluginManifest {
  name: string; // Unique identifier (e.g., "plugin-foo")
  version: string; // SemVer string (e.g., "1.0.0")
  description: string; // Human-readable description of the plugin
  commands: CommandDescriptor[]; // List of command descriptors
  capabilities?: PluginCapabilities; // Optional extra features (slash commands, UI, hooks)
}

/** Descriptor for a single CLI or slash command */
interface CommandDescriptor {
  id: string; // Unique command ID (e.g., "foo.doSomething")
  description: string; // Brief explanation of the command
  usage?: string; // Optional usage string or example
  aliases?: string[]; // Alternate command names
}

/** Optional capabilities a plugin may provide */
interface PluginCapabilities {
  slashCommands?: SlashCommandDescriptor[]; // VS Code or chat slash commands
  uiComponents?: UIComponentDescriptor[]; // React/Vue components or Electron views
  middlewareHooks?: MiddlewareHookDescriptor[]; // Hooks into request pipelines
}

/** Descriptor for a slash command (e.g., VS Code chat) */
interface SlashCommandDescriptor {
  name: string; // Slash command name (e.g., "/foo")
  description: string; // Explanation for auto-complete
  handler: string; // Function or module path to handle the slash command
}

/** Descriptor for a UI component provided by the plugin */
interface UIComponentDescriptor {
  id: string; // Unique component ID (e.g., "plugin-foo-settings-panel")
  mountPoint: string; // Where to mount the component (e.g., "settingsView")
  entry: string; // Module path for the component (e.g., "./dist/SettingsPanel.js")
}

/** Descriptor for a middleware hook */
interface MiddlewareHookDescriptor {
  hookName: string; // e.g., "onRequest", "onResponse"
  handler: string; // Module path or function name to invoke
  priority?: number; // Order of execution (lower = earlier)
}
```

### 3.2 Registered Plugin Structure

```ts
/** Represents a plugin loaded into nootropic at runtime */
interface RegisteredPlugin {
  manifest: PluginManifest; // The validated manifest
  module: any; // The loaded CommonJS or ESM module
  commands: CommandDescriptor[]; // Exposed commands for CLI or VS Code
  capabilities: PluginCapabilities; // Any extra capabilities (slash, UI, hooks)
  loadTime: string; // ISO timestamp when plugin was loaded
}
```

### 3.3 Plugin Change Events

```ts
/** Types of plugin change events */
enum PluginChangeType {
  Loaded = "loaded",
  Updated = "updated",
  Unloaded = "unloaded",
  Failed = "failed",
}

/** Payload emitted on plugin changes */
interface PluginChangeEvent {
  type: PluginChangeType;
  pluginName: string;
  version?: string; // New version (for loaded/updated)
  error?: Error; // For failures
  timestamp: string; // ISO timestamp
}
```

***

## 4. Algorithms & Workflow

### 4.1 Initialization & Startup Scan

1. **Configuration Load**

   * Read `~/.nootropic/config.json` under `pluginLoaderAdapter`:

     ```jsonc
     {
       "pluginLoaderAdapter": {
         "pluginDirectory": "./plugins",
         "registryPath": "~/.nootropic/describe-registry.json",
         "zodSchemaPath": "./schemas/pluginManifest.schema.ts",
         "watchDebounceMs": 200,
       },
     }
     ```

2. **Resolve Paths**

   * Expand any `~` or environment variables in `pluginDirectory` and `registryPath`.
   * Ensure the directories exist, creating them if necessary (e.g., initial `plugins/` folder).

3. **Initial Directory Scan**

   * Recursively enumerate subdirectories under `pluginDirectory` looking for entries containing a valid `package.json` or `index.js`.
   * For each candidate, attempt to `require()` or `import()` the module.

4. **Manifest Retrieval & Validation**

   * Invoke `module.describe()` to retrieve a raw manifest.
   * Use Zod (`z.parse(rawManifest)`) to validate against the schema defined in `zodSchemaPath`.
   * If validation succeeds, register the plugin (see 4.1.5); otherwise, log and skip.

5. **Registration**

   * Construct a `RegisteredPlugin` object, capturing the validated `manifest`, module reference, and capabilities.
   * Insert into the in-memory registry (`Map<string, RegisteredPlugin>`).
   * Emit `pluginLoaded(pluginName)` event.

6. **Persist Registry**

   * Write the validated manifests of all successfully loaded plugins to `describe-registry.json`.
   * Format:

     ```json
     { "plugins": [ { /* pluginManifest */ }, ... ] }
     ```

7. **Start Filesystem Watcher**
   * Using a library like `chokidar`, watch for `add`, `change`, `unlink` events under `pluginDirectory`.
   * Debounce rapid events by `watchDebounceMs` before invoking the change handler (4.2).

### 4.2 Hot Reload & Change Handling

1. **Event Debounce**

   * On receiving any filesystem event (add/change/unlink), wait for `watchDebounceMs` to allow related events to coalesce.
   * After the debounce period, determine the set of changed files and affected plugin directories.

2. **Identify Change Type**

   * For each affected plugin path:
     * If the main file was deleted, treat as `Unloaded`.
     * If the file was modified, treat as `Updated`.
     * If a new directory appeared, attempt to `Load` it as a new plugin.

3. **Unload Removed Plugins**

   * For `Unloaded` or missing modules:
     * Remove from in-memory registry.
     * Delete any cached require/import references to allow a fresh load.
     * Emit `pluginUnloaded(pluginName)` event.

4. **Reload Updated Plugins**

   * For each path marked `Updated`:
     * Unload existing plugin (as above).
     * Attempt re-import and re-validate manifest.
     * If success, re-register and emit `pluginUpdated(pluginName)`; if failure, emit `pluginFailed(pluginName, error)`.

5. **Load New Plugins**

   * For new directory additions:
     * Attempt to import and validate manifest as in initial scan.
     * If successful and no conflicts, register as a new plugin.

6. **Conflict Resolution**

   * If a newly loaded or updated plugin has the same `manifest.name` as an existing plugin but with a different version:
     * Compare versions: if the new version semver > existing, replace it.
     * Otherwise, skip loading and emit a `pluginFailed` event.
   * If two distinct plugins declare the same command `id`:
     * Apply a policy (e.g., keep first‐loaded, disable the later, or rename commands).
     * Log a warning indicating the conflict.

7. **Persist Updated Registry**
   * After processing all changes, overwrite `describe-registry.json` with the current registry state.

### 4.3 Query APIs

1. **`getRegisteredPlugins(): RegisteredPlugin[]`**

   * Returns an array of all plugins currently loaded in memory, including their manifests and command descriptors.

2. **`getPluginCapabilities(pluginName: string): PluginCapabilities | null`**

   * Looks up a single plugin by name and returns its `capabilities` if present; otherwise, returns `null`.

3. **`onPluginChange(callback: (event: PluginChangeEvent) => void): Unsubscribe`**

   * Registers a listener for plugin change events (`Loaded`, `Updated`, `Unloaded`, `Failed`).
   * Returns a function to unsubscribe the listener.

4. **`reloadAllPlugins(): Promise<void>`**
   * Forcefully unloads every plugin and performs a fresh scan and load of all directories under `pluginDirectory`.
   * Useful for CLI commands like `nootropic plugins:reload`.

***

## 5. Edge Cases & Failure Modes

1. **Malformed or Missing `describe()` Export**

   * If a plugin module does not export a `describe()` function, or `describe()` throws an exception:
     * Record the failure in logs, emit `pluginFailed(pluginName, error)`, and skip registration.
     * The plugin's directory remains under watch so that if fixed, it can be reloaded.

2. **Invalid Manifest Schema**

   * If the output of `describe()` fails Zod validation (e.g., missing `name`, `commands` array):
     * Treat as a failure, emit `pluginFailed`, and do not register.
     * Provide details (validation errors) in the emitted event for debugging.

3. **Duplicate Plugin Names**

   * If two distinct plugin directories specify the same `manifest.name`:
     * On loading the second, compare semver versions; if equal, disable the second and log a warning.
     * If greater, unload and replace the first; otherwise, skip the second.

4. **Command ID Collisions**

   * If two loaded plugins register the same command `id` (e.g., `foo.run`):
     * Apply a configured policy (e.g., prioritize plugin with higher version or alphabetical).
     * Optionally namespace commands by plugin (e.g., `pluginName.commandId`) to avoid collisions.
     * Emit a warning about the collision and affected plugin.

5. **Circular Dependencies Between Plugins**

   * If plugins import each other (directly or indirectly), standard `require()/import()` will succeed or throw at runtime:
     * Catch runtime exceptions during import and mark the plugin as failed.
     * Recommend plugin authors avoid circular imports or use dependency injection.

6. **Hot-Reload Race Conditions**

   * Rapid file edits may trigger multiple change events; debounce to prevent unloading a plugin while it is mid-load.
   * Use a mutex or lock per plugin directory to serialize unload/load cycles, ensuring consistency.

7. **Filesystem Permissions & Errors**
   * If the process lacks read/execute permission on a plugin directory:
     * Catch the error, emit `pluginFailed(pluginName, error)`, and skip it.
     * Continue monitoring in case permissions change.

***

## 6. Integration Points

1. **CLI Auto-Completion & Command Discovery**

   * The CLI adapter queries `getRegisteredPlugins()` and aggregates all `commands` across plugins to populate auto-completion lists and help text.
   * When a user invokes a plugin command (e.g., `nootropic foo:doSomething`), the CLI dispatches to the plugin's handler based on the registry.

2. **VS Code Extension (Slash Commands)**

   * On activation, the extension subscribes to `onPluginChange()` to register or unregister slash commands exposed by plugins.
   * When a plugin's `capabilities.slashCommands` changes, the extension updates its command palette and chat interface accordingly.

3. **Electron Dashboard (UI Components)**

   * The main process or renderer process queries `getPluginCapabilities()` to identify any `uiComponents` that should be mounted (e.g., settings panels).
   * Events like `pluginLoaded` trigger the dynamic injection of new menu items or sidebar sections as defined by plugins.

4. **Middleware Hook Injection**

   * Core request/response pipelines (e.g., in a local server or inter-agent messaging) call into PluginLoaderAdapter to retrieve `middlewareHooks`.
   * Hooks are sorted by `priority` and invoked in sequence, allowing plugins to modify payloads or inject additional behavior.

5. **ConfigurationService**

   * Reads global configuration (e.g., `pluginDirectory` path) and passes it to PluginLoaderAdapter on startup.
   * Facilitates reloading or changing the plugin directory dynamically if the user updates settings.

6. **React/Preload Scripts**
   * For Electron renderer processes, a preload script may expose a `window.plugins` API that reads from the in-memory registry.
   * UI components provided by plugins can be loaded directly from the renderer using `import()` and inserted into React component trees.

***

## 7. Configuration

All PluginLoaderAdapter settings reside under `pluginLoaderAdapter` in `~/.nootropic/config.json`:

```jsonc
{
  "pluginLoaderAdapter": {
    // Directory to scan for plugins (absolute or relative)
    "pluginDirectory": "./plugins",

    // Path to persist the manifest registry
    "registryPath": "~/.nootropic/describe-registry.json",

    // Path to Zod schema file for plugin manifests
    "zodSchemaPath": "./schemas/pluginManifest.schema.ts",

    // Debounce interval for rapid filesystem events (ms)
    "watchDebounceMs": 200,

    // Conflict resolution policy: "version" | "first" | "namespace"
    "conflictPolicy": "version",

    // Whether to enable hot-reload of plugins at runtime
    "enableHotReload": true,

    // Maximum allowed number of simultaneously loaded plugins
    "maxPlugins": 50,
  },
}
```

* **`pluginDirectory`**: The folder where plugin subdirectories reside.
* **`registryPath`**: Location to write `describe-registry.json`.
* **`zodSchemaPath`**: File path for the Zod schema used to validate `describe()` output.
* **`watchDebounceMs`**: Milliseconds to wait after a filesystem event before triggering a reload pass.
* **`conflictPolicy`**: Strategy to resolve naming or command id collisions between plugins.
* **`enableHotReload`**: If `false`, disables filesystem watching; plugins only load at startup.
* **`maxPlugins`**: Maximum number of plugins allowed to be loaded concurrently to bound memory usage.

***

## 8. Metrics & Instrumentation

PluginLoaderAdapter integrates with the ObservabilityAdapter to emit telemetry:

1. **Span: `pluginLoader.scan`**

   * Fired during the initial and subsequent directory scans.
   * Attributes:
     * `numCandidates`: number of directories inspected
     * `numValidPlugins`: number of plugins successfully loaded
     * `scanDurationMs`: time taken to complete the scan

2. **Counter: `pluginLoader.plugins_loaded_total`**

   * Incremented each time a plugin is successfully registered.

3. **Counter: `pluginLoader.plugins_unloaded_total`**

   * Incremented each time a plugin is removed or fails validation.

4. **Gauge: `pluginLoader.active_plugins_count`**

   * Reports the current count of loaded plugins.

5. **Span: `pluginLoader.validate_manifest`**

   * Fired for each plugin's `describe()` invocation.
   * Attributes:
     * `pluginName`
     * `validationDurationMs`
     * `validationErrorsCount` (0 if valid)

6. **Counter: `pluginLoader.validation_failures_total`**

   * Incremented each time a manifest fails schema validation.

7. **Counter: `pluginLoader.conflict_detected_total`**

   * Incremented on duplicate name or command id detection.

8. **Gauge: `pluginLoader.bufferedEvents`**
   * Number of filesystem events currently buffered (debounce).

Metrics are tagged with labels such as `plugin_name`, `action` (`load`, `unload`, `validate`), and `status` (`success`, `failure`). These feeds allow the ReflexionEngine or external dashboards to monitor plugin subsystem health and load patterns.

***

## 9. Testing & Validation

### 9.1 Unit Tests

1. **Manifest Validation**

   * Provide a valid `PluginManifest` object and assert that Zod parsing passes.
   * Supply various invalid manifest shapes (missing keys, wrong types) and verify that validation errors are thrown.

2. **Registry Persistence**

   * Mock a set of `RegisteredPlugin` objects, invoke the persistence logic, and compare resulting `describe-registry.json` against expected JSON.

3. **Conflict Policies**

   * Simulate two plugins with the same `name` but different versions; assert correct replacement or skipping per `conflictPolicy`.

4. **Filesystem Watcher Debounce**

   * Mock rapid sequences of `add`/`change`/`unlink` events and verify that only one scan pass occurs after `watchDebounceMs` elapses.

5. **API Query Functions**
   * Insert a few dummy plugins into memory, then call `getRegisteredPlugins()` and `getPluginCapabilities()`, asserting that returned data matches the in-memory state.

### 9.2 Integration Tests

1. **Loading Real Plugin Modules**

   * Create temporary plugin directories under a test folder with valid `index.js` exporting `describe()`.
   * Start the PluginLoaderAdapter pointing to the test folder, and assert that plugins are discovered, validated, and registered.

2. **Hot Reload Behavior**

   * Modify a plugin's version or command list while the adapter is running; verify that the `pluginUpdated` event is emitted and the in-memory registry reflects changes.

3. **Conflict Handling**

   * Place two plugins with the same command ID into the plugin directory; assert that one is disabled or renamed, and appropriate warnings are logged.

4. **Registry File Consistency**
   * After repeated load and unload cycles, open `describe-registry.json` and verify that it always reflects the current in-memory registry exactly.

### 9.3 End-to-End Tests

1. **CLI & VS Code Interaction**

   * Launch nootropic's CLI with PluginLoaderAdapter active; install a test plugin that adds a new command.
   * Run `nootropic <plugin-command>` and assert correct dispatch to the plugin's handler.
   * Open the VS Code extension, type a slash command provided by the plugin, and verify that the extension recognizes and invokes it.

2. **Error Recovery**

   * Introduce a malformed plugin (e.g., missing `describe()` or invalid manifest) and assert that the adapter logs an error, does not register it, but continues to function for other valid plugins.

3. **Performance Under Load**
   * Populate the plugin directory with 100 small dummy plugins; measure scan time and ensure it remains within acceptable limits (e.g., < 500ms on a typical dev machine).

***

## 10. Future Enhancements

1. **Plugin Sandbox & Security**

   * Run untrusted plugin code in an isolated VM or sandbox (e.g., Node.js `vm2`) to prevent malicious or buggy plugins from compromising the main process.

2. **Versioned Registry & Rollbacks**

   * Maintain a history of `describe-registry.json` snapshots, allowing users to roll back to a previous plugin set in case of breaking changes.

3. **Remote Plugin Marketplace Integration**

   * Integrate with a centralized plugin registry (akin to npm or VS Code Marketplace) to allow users to install plugins via CLI (e.g., `nootropic plugin install <plugin-name>`).

4. **Dependency Injection & Lifecycle Hooks**

   * Enable plugins to declare dependencies on other plugins, and orchestrate load order accordingly.

5. **Graphical Plugin Manager UI**

   * Build a React-oriented UI within the Electron dashboard to enable users to enable/disable, configure, or update plugins via a point-and-click interface.

6. **Plugin Version Compatibility Checks**
   * Enforce compatibility ranges in the manifest (e.g., supported nootropic versions) and prevent loading plugins incompatible with the current release.

***

## 11. Summary

The **PluginLoaderAdapter** provides a robust foundation for nootropic's extensibility, enabling third-party and custom plugins to seamlessly integrate with CLI, VS Code, and Electron frontends. By combining Zod-based manifest validation, hot-reloading via a filesystem watcher, and conflict-resolution strategies, the adapter ensures that only valid, non-conflicting plugins are active at runtime. Its in-memory registry and persisted JSON snapshot power auto-completion, dynamic UI injection, and middleware hook registration. With thorough instrumentation and testing, PluginLoaderAdapter maintains high reliability under rapid plugin-change scenarios and scales to hundreds of plugins. Future enhancements—such as sandboxing, a remote marketplace, and a graphical manager—will further solidify its role as the cornerstone of nootropic's plugin ecosystem.
