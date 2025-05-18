import { PluginModule, PluginRegistryEntrySchema, PluginRegistryEntry } from './pluginTypes.js';
/**
 * Registers a plugin in the registry. Validates entry using Zod schema.
 */
declare function registerPlugin(name: string, type: string, entry: string, meta?: Record<string, unknown>): Promise<void>;
/**
 * Lists all registered plugins, attaching feedback aggregate for each.
 * Returns Zod-validated PluginRegistryEntry array.
 */
declare function listPlugins(): Promise<PluginRegistryEntry[]>;
/**
 * Dynamically loads a plugin module by entry path. Validates module using Zod schema.
 */
declare function loadPlugin(entry: string): Promise<PluginModule | null>;
export { registerPlugin, listPlugins, loadPlugin, PluginRegistryEntrySchema as PluginRegistryEntry };
