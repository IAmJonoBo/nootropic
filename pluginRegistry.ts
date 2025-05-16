// Rebranding note: This file was updated from 'AI-Helpers' to 'nootropic'. Legacy references are archived in .ai-helpers-cache/archive/ for rollback.
// AI-Helpers is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
//  TS(2459): Module '"./utils.js"' declares 'readJsonSafe' loca... Remove this comment to see the full error message
import { readJsonSafe, writeJsonSafe, getOrInitJson, esmEntrypointCheck } from './utils.js';
import { PLUGIN_REGISTRY_PATH } from './paths.js';
//  TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
//  TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// Removed unused: import type { Plugin, PluginManager, PluginAppContext } from './types/AgentOrchestrationEngine.js';
// Removed unused: import { validateAgentEvent, type AgentEvent } from './types/AgentOrchestrationEngine.js';
// Removed unused: import { getTracer, getMeter } from './telemetry.js';
// Removed unused: import { publishEvent, subscribeToTopic } from './memoryLaneHelper.js';
import { aggregatePluginFeedback } from './utils/feedback/pluginFeedback.js';
// Removed unused: function isAgentEvent(event: unknown): event is AgentEvent { ... }
// Removed unused: pluginRegisteredCounter, pluginUnregisteredCounter, pluginErrorCounter

interface PluginRegistryEntry {
  name: string;
  type: string;
  entry: string;
  meta?: Record<string, unknown>;
  //  TS(2693): 'string' only refers to a type, but is being used ... Remove this comment to see the full error message
  timestamp: string;
  //  TS(2304): Cannot find name 'feedbackAggregate'.
  feedbackAggregate?: import('./utils/feedback/pluginFeedback.js').PluginFeedbackAggregate;
}

// NOTE: To avoid ESM/circular import issues, never call ensureCacheDirExists() at module scope.
// Always call it inside async functions or entrypoints (see getPlugins). See CONTRIBUTING.md for details.

// --- Register a plugin (extractor/analyzer/output) ---
//  TS(7010): 'registerPlugin', which lacks return-type annotati... Remove this comment to see the full error message
async function registerPlugin(name: string, type: string, entry: string, meta: Record<string, unknown> = {}): Promise<void> {
  //  TS(2304): Cannot find name 'registry'.
  const registry: PluginRegistryEntry[] = await getOrInitJson(PLUGIN_REGISTRY_PATH, []);
  //  TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  registry.push({ name, type, entry, meta, timestamp: new Date().toISOString() });
  //  TS(2304): Cannot find name 'registry'.
  await writeJsonSafe(PLUGIN_REGISTRY_PATH, registry);
}

// --- List all registered plugins ---
async function listPlugins(): Promise<PluginRegistryEntry[]> {
  //  TS(2304): Cannot find name 'registry'.
  const registry: PluginRegistryEntry[] = await readJsonSafe(PLUGIN_REGISTRY_PATH, []);
  // Attach feedback aggregate for each plugin
  //  TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  for (const entry of registry) {
    entry.feedbackAggregate = await aggregatePluginFeedback(entry.name);
  }
  //  TS(2304): Cannot find name 'registry'.
  return registry;
}

// --- Dynamically load a plugin (returns the module) ---
//  TS(6133): 'entry' is declared but its value is never read.
async function loadPlugin(entry: string): Promise<unknown> {
  //  TS(2304): Cannot find name 'entry'.
  return import(entry);
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

//  TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const PLUGIN_DIR = path.resolve(process.cwd(), 'plugins');

export type PluginModule = {
  name: string;
  //  TS(2693): 'unknown' only refers to a type, but is being used... Remove this comment to see the full error message
  describe?: () => unknown;
  //  TS(2304): Cannot find name 'run'.
  run?: (...args: unknown[]) => unknown;
  //  TS(2304): Cannot find name 'key'.
  [key: string]: unknown;
};

// --- Type guard and Zod validation for plugin modules ---
function isValidPluginModule(mod: unknown): mod is PluginModule {
  if (!mod || typeof mod !== 'object') return false;
  const m = mod as PluginModule;
  // Must have a name and a describe function
  if (typeof m.name !== 'string') return false;
  if (typeof m.describe !== 'function') {
    if (process.env['NOOTROPIC_DEBUG']) {
      console.warn('[pluginRegistry] Plugin', m.name, 'is missing a describe() function and will be skipped.');
    }
    return false;
  }
  return true;
}

/**
 * Dynamically loads all plugins from the plugins/ directory.
 * Returns an array of plugin modules with describe/run exports.
 */
export async function getPlugins(): Promise<PluginModule[]> {
  //  TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  const { ensureCacheDirExists } = await import('./utils/context/cacheDir.js');
  //  TS(2304): Cannot find name 'ensureCacheDirExists'.
  await ensureCacheDirExists();
  //  TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  if (!fs.existsSync(PLUGIN_DIR)) return [];
  //  TS(2304): Cannot find name 'files'.
  const files = fs.readdirSync(PLUGIN_DIR).filter(f => f.endsWith('.js') ?? f.endsWith('.ts'));
  //  TS(2304): Cannot find name 'plugins'.
  const plugins: PluginModule[] = [];
  //  TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  for (const file of files) {
    try {
      const mod = await import(path.join(PLUGIN_DIR, file));
      //  TS(2339): Property 'run' does not exist on type 'PluginModul... Remove this comment to see the full error message
      if (isValidPluginModule(mod) && (mod.describe ?? mod.run)) {
        // Avoid duplicate 'name' property if already present in mod
        if (typeof mod === 'object' && mod !== null) {
          const m = mod as { name?: unknown };
          if (typeof m.name === 'string') {
            //  TS(2304): Cannot find name 'mod'.
            const pluginObj: Partial<PluginModule> = { ...(mod as object) };
            //  TS(2304): Cannot find name 'pluginObj'.
            if (typeof pluginObj.name === 'string') {
              //  TS(2304): Cannot find name 'plugins'.
              plugins.push(pluginObj as PluginModule);
            }
          } else {
            const pluginWithName: Partial<PluginModule> = {
              //  TS(2304): Cannot find name 'file'.
              name: file.replace(/\.(js|ts)$/, ''),
              //  TS(2304): Cannot find name 'mod'.
              ...(mod as object)
            };
            //  TS(2454): Variable 'pluginWithName' is used before being ass... Remove this comment to see the full error message
            if (typeof pluginWithName.name === 'string') {
              //  TS(2304): Cannot find name 'plugins'.
              plugins.push(pluginWithName as PluginModule);
            }
            // else skip if name is not string
          }
        }
        // else skip if not an object
      } else {
        //  TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        if (process.env['NOOTROPIC_DEBUG']) {
          //  TS(2304): Cannot find name 'file'.
          console.warn(`[pluginRegistry] Skipping invalid plugin ${file}: does not conform to PluginModule interface or lacks Zod validation.`);
        }
      }
    } catch (e) {
      // Ignore broken plugins, but log in debug mode
      if (process.env['NOOTROPIC_DEBUG']) {
        //  TS(2304): Cannot find name 'pluginRegistry'.
        console.error(`[pluginRegistry] Failed to load plugin ${file}:`, e);
      }
    }
  }
  return plugins;
}

export { registerPlugin, listPlugins, loadPlugin, PluginRegistryEntry };

// For OTel/metrics, see previous versions or reference the PluginManager pattern in README/CONTRIBUTING.
