// --- Explicit Named Exports (2025 Best Practices) ---
export { LangChainAdapter } from './adapters/langchainAdapter.js';
export { CrewAIAdapter } from './adapters/crewAIAdapter.js';
export { SemanticKernelAdapter } from './adapters/semanticKernelAdapter.js';
export { getOrchestrationEngine } from './orchestrationEngineSelector.js';
export type { AgentOrchestrationEngine, AgentProfile, AgentTask, AgentContext, AgentResult, AgentLogger, AgentEvent, Plugin, PluginManager } from './types/AgentOrchestrationEngine.js';
import checkForUpdates from './utils/describe/updateNotifier.js';
export { checkForUpdates };
export { BaseAgent } from './agents/BaseAgent.js';
export { ContentAgent } from './agents/ContentAgent.js';
export { CollectionAgent } from './agents/CollectionAgent.js';
export { ReviewAgent } from './agents/ReviewAgent.js';

// --- Internal imports for runtime logic (not re-exported) ---
import { getPlugins } from './pluginRegistry.js';
import { initTelemetry, shutdownTelemetry } from './telemetry.js';
import { BaseAgent as _BaseAgent } from './agents/BaseAgent.js';
import { ContentAgent as _ContentAgent } from './agents/ContentAgent.js';
import { CollectionAgent as _CollectionAgent } from './agents/CollectionAgent.js';
import { ReviewAgent as _ReviewAgent } from './agents/ReviewAgent.js';
import registry from './capabilities/registry.js';
import { registerAllAdapters } from './adapters/index.js';

registerAllAdapters(registry);

// --- Runtime Logic: Capability Listing and Description ---
/**
 * Lists all available helpers, adapters, and plugins in nootropic by aggregating describe() from all core modules and plugins.
 * Returns an array of capability objects (see docs/llm-integration.md).
 */
export async function listCapabilities(): Promise<unknown[]> {
  // @ts-expect-error TS(2304): Cannot find name 'modules'.
  const modules = [
    './orchestrationEngineSelector.js',
    './utils.js',
    './quality/selfcheck.js',
    './contextSnapshotHelper.js',
    './semanticIndexBuilder.js',
    './agents/BaseAgent.js',
    './agents/ContentAgent.js',
    './agents/CollectionAgent.js',
    './agents/ReviewAgent.js'
  ];
  // @ts-expect-error TS(2304): Cannot find name 'results'.
  const results = [];
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  for (const modPath of modules) {
    try {
      const mod = await import(modPath);
      if (typeof mod.describe === 'function') {
        // @ts-expect-error TS(2304): Cannot find name 'results'.
        results.push(mod.describe());
      } else {
        // @ts-expect-error TS(2304): Cannot find name 'results'.
        results.push({ name: modPath, description: 'No describe() export found.' });
      }
    } catch (e) {
      // @ts-expect-error TS(2304): Cannot find name 'results'.
      results.push({ name: modPath, error: String(e) });
    }
  }
  // Add plugins
  // @ts-expect-error TS(2448): Block-scoped variable 'plugins' used before its de... Remove this comment to see the full error message
  const plugins = await getPlugins();
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  for (const plugin of plugins) {
    if (typeof plugin.describe === 'function') {
      // @ts-expect-error TS(2304): Cannot find name 'results'.
      results.push(plugin.describe());
    }
  }
  // @ts-expect-error TS(2304): Cannot find name 'results'.
  return results;
}

/**
 * Describe a specific module or plugin by name. Returns its describe() output (with schema).
 * 'name' is the module or plugin name.
 * Returns the describe() output or an error object if not found.
 */
type KnownModule = 'utils' | 'orchestrationEngine' | 'quality' | 'context' | 'semanticIndex';
// @ts-expect-error TS(6133): 'name' is declared but its value is never read.
export async function describeCapability(name: KnownModule | string): Promise<unknown> {
  // @ts-expect-error TS(2304): Cannot find name 'modules'.
  const modules: Record<KnownModule, string> = {
    // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
    utils: './utils.js',
    // @ts-expect-error TS(2304): Cannot find name 'orchestrationEngine'.
    orchestrationEngine: './orchestrationEngineSelector.js',
    // @ts-expect-error TS(2304): Cannot find name 'quality'.
    quality: './quality/selfcheck.js',
    // @ts-expect-error TS(2304): Cannot find name 'context'.
    context: './contextSnapshotHelper.js',
    // @ts-expect-error TS(2304): Cannot find name 'semanticIndex'.
    semanticIndex: './semanticIndexBuilder.js'
  };
  // @ts-expect-error TS(2352): Conversion of type 'void' to type 'KnownModule' ma... Remove this comment to see the full error message
  if ((name as KnownModule) in modules) {
    // @ts-expect-error TS(2304): Cannot find name 'modules'.
    const mod = await import(modules[name as KnownModule]);
    if (typeof mod.describe === 'function') return mod.describe();
    return { name, error: 'No describe() export found.' };
  }
  // @ts-expect-error TS(2367): This condition will always return 'false' since th... Remove this comment to see the full error message
  if (name === 'BaseAgent') return _BaseAgent.describe();
  // @ts-expect-error TS(2367): This condition will always return 'false' since th... Remove this comment to see the full error message
  if (name === 'ContentAgent') return _ContentAgent.describe();
  // @ts-expect-error TS(2367): This condition will always return 'false' since th... Remove this comment to see the full error message
  if (name === 'CollectionAgent') return _CollectionAgent.describe();
  // @ts-expect-error TS(2367): This condition will always return 'false' since th... Remove this comment to see the full error message
  if (name === 'ReviewAgent') return _ReviewAgent.describe();
  // Try plugins
  const plugins = await getPlugins();
  // @ts-expect-error TS(2367): This condition will always return 'false' since th... Remove this comment to see the full error message
  const plugin = plugins.find((p: { name?: string }) => p.name === name);
  if (plugin && typeof plugin.describe === 'function') return plugin.describe();
  return { name, error: 'Not found.' };
}

// --- CLI Entrypoint for list-capabilities ---
// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args[0] === 'list-capabilities') {
    (async () => {
      const caps = await listCapabilities();
      console.log(JSON.stringify(caps, null, 2));
      process.exit(0);
    })();
  }
}

// --- Initialize OpenTelemetry (if enabled) ---
initTelemetry('main-index');

// --- Ensure graceful shutdown of telemetry on exit ---
process.on('exit', shutdownTelemetry);
process.on('SIGINT', async () => { await shutdownTelemetry(); process.exit(0); }); 