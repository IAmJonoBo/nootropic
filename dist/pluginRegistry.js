// Rebranding note: This file was updated from 'nootropic' to 'nootropic'. Legacy references are archived in .nootropic-cache/archive/ for rollback.
// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
//  TS(2459): Module '"./utils.js"' declares 'readJsonSafe' loca... Remove this comment to see the full error message
import { readJsonSafe, writeJsonSafe, getOrInitJson } from './fileHelpers.js';
// @ts-ignore
import { PLUGIN_REGISTRY_PATH } from './paths.js';
// @ts-ignore
// Removed unused: import type { Plugin, PluginManager, PluginAppContext } from './types/AgentOrchestrationEngine.js';
// @ts-ignore
// Removed unused: import { validateAgentEvent, type AgentEvent } from './types/AgentOrchestrationEngine.js';
// @ts-ignore
// Removed unused: import { getTracer, getMeter } from './telemetry.js';
// @ts-ignore
// Removed unused: import { publishEvent, subscribeToTopic } from './memoryLaneHelper.js';
// @ts-ignore
import { aggregatePluginFeedback } from './src/utils/feedback/pluginFeedback.js';
// Removed unused: function isAgentEvent(event: unknown): event is AgentEvent { ... }
// Removed unused: pluginRegisteredCounter, pluginUnregisteredCounter, pluginErrorCounter
// Removed unused: import { z } from 'zod';
// Removed unused: import { getPlugins } from './pluginLoader.js';
import { esmEntrypointCheck } from './utils.js';
import { PluginModuleSchema, PluginRegistryEntrySchema } from './pluginTypes.js';
// --- Register a plugin (extractor/analyzer/output) ---
/**
 * Registers a plugin in the registry. Validates entry using Zod schema.
 */
async function registerPlugin(name, type, entry, meta = {}) {
    const registry = await getOrInitJson(PLUGIN_REGISTRY_PATH, []);
    const newEntry = { name, type, entry, meta, timestamp: new Date().toISOString() };
    const validated = PluginRegistryEntrySchema.safeParse(newEntry);
    if (!validated.success)
        throw new Error('Invalid plugin registry entry: ' + validated.error);
    registry.push(validated.data);
    await writeJsonSafe(PLUGIN_REGISTRY_PATH, registry);
}
// --- List all registered plugins ---
/**
 * Lists all registered plugins, attaching feedback aggregate for each.
 * Returns Zod-validated PluginRegistryEntry array.
 */
async function listPlugins() {
    const registry = await readJsonSafe(PLUGIN_REGISTRY_PATH, []);
    for (const entry of registry) {
        entry.feedbackAggregate = await aggregatePluginFeedback(entry.name);
    }
    // Validate all entries
    return registry.filter(e => PluginRegistryEntrySchema.safeParse(e).success);
}
// --- Dynamically load a plugin (returns the module) ---
/**
 * Dynamically loads a plugin module by entry path. Validates module using Zod schema.
 */
async function loadPlugin(entry) {
    const mod = await import(entry);
    if (isValidPluginModule(mod))
        return mod;
    return null;
}
// --- ESM-compatible CLI entrypoint ---
//  TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
if (esmEntrypointCheck(import.meta.url)) {
    //  TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    const [cmd, ...args] = process.argv.slice(2);
    if (cmd === 'register') {
        const [name, type, entry, ...meta] = args;
        if (!name || !type || !entry) {
            console.error('Usage: pnpm tsx nootropic/pluginRegistry.ts register <name> <type> <entry> [metaJson]');
            //  TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
            process.exit(1);
        }
        await registerPlugin(name, type, entry, meta.length ? JSON.parse(meta.join(' ')) : {});
        console.log('Plugin registered.');
    }
    else if (cmd === 'list') {
        console.log(JSON.stringify(await listPlugins(), null, 2));
    }
    else {
        console.log('Usage: pnpm tsx nootropic/pluginRegistry.ts register <name> <type> <entry> [metaJson]');
        console.log('       pnpm tsx nootropic/pluginRegistry.ts list');
    }
}
// --- Type guard and Zod validation for plugin modules ---
function isValidPluginModule(mod) {
    const result = PluginModuleSchema.safeParse(mod);
    if (!result.success) {
        if (process.env['NOOTROPIC_DEBUG']) {
            console.warn('[pluginRegistry] Plugin failed Zod validation:', result.error);
        }
        return false;
    }
    return true;
}
export { registerPlugin, listPlugins, loadPlugin, PluginRegistryEntrySchema as PluginRegistryEntry };
// For OTel/metrics, see previous versions or reference the PluginManager pattern in README/CONTRIBUTING.
