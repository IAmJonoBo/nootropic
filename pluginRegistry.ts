// Rebranding note: This file was updated from 'nootropic' to 'nootropic'. Legacy references are archived in .nootropic-cache/archive/ for rollback.
// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
//  TS(2459): Module '"./utils.js"' declares 'readJsonSafe' loca... Remove this comment to see the full error message
import { readJsonSafe, writeJsonSafe, getOrInitJson, esmEntrypointCheck } from './utils.js';
// @ts-ignore
import { PLUGIN_REGISTRY_PATH } from './paths.js';
//  TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message // TODO: Install missing module
import fs from 'fs';
//  TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message // TODO: Install missing module
import path from 'path';
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
import { z } from 'zod';

// Zod schema for plugin registry entry
const PluginRegistryEntrySchema = z.object({
  name: z.string(),
  type: z.string(),
  entry: z.string(),
  meta: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string(),
  feedbackAggregate: z.unknown().optional()
});
type PluginRegistryEntry = z.infer<typeof PluginRegistryEntrySchema>;

// Canonical Zod schema for plugin modules
export const PluginModuleSchema = z.object({
  name: z.string(),
  describe: z.function().args().returns(z.unknown()),
  run: z.function().args(z.any()).returns(z.any()).optional(),
  // Allow additional properties
}).catchall(z.unknown());

type PluginModule = z.infer<typeof PluginModuleSchema>;

// --- Register a plugin (extractor/analyzer/output) ---
/**
 * Registers a plugin in the registry. Validates entry using Zod schema.
 */
async function registerPlugin(name: string, type: string, entry: string, meta: Record<string, unknown> = {}): Promise<void> {
  const registry: PluginRegistryEntry[] = await getOrInitJson(PLUGIN_REGISTRY_PATH, []);
  const newEntry = { name, type, entry, meta, timestamp: new Date().toISOString() };
  const validated = PluginRegistryEntrySchema.safeParse(newEntry);
  if (!validated.success) throw new Error('Invalid plugin registry entry: ' + validated.error);
  registry.push(validated.data);
  await writeJsonSafe(PLUGIN_REGISTRY_PATH, registry);
}

// --- List all registered plugins ---
/**
 * Lists all registered plugins, attaching feedback aggregate for each.
 * Returns Zod-validated PluginRegistryEntry array.
 */
async function listPlugins(): Promise<PluginRegistryEntry[]> {
  const registry: PluginRegistryEntry[] = await readJsonSafe(PLUGIN_REGISTRY_PATH, []);
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
async function loadPlugin(entry: string): Promise<PluginModule | null> {
  const mod = await import(entry);
  if (isValidPluginModule(mod)) return mod;
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
  } else if (cmd === 'list') {
    console.log(JSON.stringify(await listPlugins(), null, 2));
  } else {
    console.log('Usage: pnpm tsx nootropic/pluginRegistry.ts register <name> <type> <entry> [metaJson]');
    console.log('       pnpm tsx nootropic/pluginRegistry.ts list');
  }
}

// --- Type guard and Zod validation for plugin modules ---
function isValidPluginModule(mod: unknown): mod is PluginModule {
  const result = PluginModuleSchema.safeParse(mod);
  if (!result.success) {
    if (process.env['NOOTROPIC_DEBUG']) {
      console.warn('[pluginRegistry] Plugin failed Zod validation:', result.error);
    }
    return false;
  }
  return true;
}

/**
 * Dynamically loads all plugins from the plugins/ directory.
 * Returns an array of plugin modules with describe/run exports. All outputs are Zod-validated.
 */
export async function getPlugins(): Promise<PluginModule[]> {
  const { ensureCacheDirExists } = await import('./src/utils/context/cacheDir.js');
  await ensureCacheDirExists();
  const PLUGIN_DIR = path.resolve(process.cwd(), 'plugins');
  if (!fs.existsSync(PLUGIN_DIR)) return [];
  const files = fs.readdirSync(PLUGIN_DIR).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
  const plugins: PluginModule[] = [];
  for (const file of files) {
    try {
      const mod = await import(path.join(PLUGIN_DIR, file));
      if (isValidPluginModule(mod) && (typeof mod.describe === "function" || typeof mod.run === "function")) {
        const m = mod as { name?: unknown };
        if (typeof m.name === 'string') {
          plugins.push(mod);
        } else {
          const pluginWithName = { name: file.replace(/\.(js|ts)$/, ''), ...(mod as object) };
          if (isValidPluginModule(pluginWithName)) plugins.push(pluginWithName as PluginModule);
        }
      } else {
        if (process.env['NOOTROPIC_DEBUG']) {
          console.warn(`[pluginRegistry] Skipping invalid plugin ${file}: does not conform to PluginModule schema.`);
        }
        continue;
      }
    } catch (e) {
      if (process.env['NOOTROPIC_DEBUG']) {
        console.error(`[pluginRegistry] Failed to load plugin ${file}:`, e);
      }
    }
  }
  return plugins;
}

export { registerPlugin, listPlugins, loadPlugin, PluginRegistryEntrySchema as PluginRegistryEntry };

// For OTel/metrics, see previous versions or reference the PluginManager pattern in README/CONTRIBUTING.
