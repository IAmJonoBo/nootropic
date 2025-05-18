// --- Explicit Named Exports (2025 Best Practices) ---
export { LangChainAdapter } from './src/adapters/langchainAdapter.js';
export { CrewAIAdapter } from './src/adapters/crewAIAdapter.js';
export { SemanticKernelAdapter } from './src/adapters/semanticKernelAdapter.js';
export { getOrchestrationEngine } from './orchestrationEngineSelector.js';
// @ts-ignore
import checkForUpdates from './src/utils/describe/updateNotifier.js';
export { checkForUpdates };
export { BaseAgent } from './src/agents/BaseAgent.js';
export { ContentAgent } from './src/agents/ContentAgent.js';
export { CollectionAgent } from './src/agents/CollectionAgent.js';
export { ReviewAgent } from './src/agents/ReviewAgent.js';
// --- Internal imports for runtime logic (not re-exported) ---
// @ts-ignore
import { getPlugins } from './pluginLoader.js';
// @ts-ignore
import { initTelemetry, shutdownTelemetry } from './telemetry.js';
// @ts-ignore
import { BaseAgent as _BaseAgent } from './src/agents/BaseAgent.js';
// @ts-ignore
import { ContentAgent as _ContentAgent } from './src/agents/ContentAgent.js';
// @ts-ignore
import { CollectionAgent as _CollectionAgent } from './src/agents/CollectionAgent.js';
// @ts-ignore
import { ReviewAgent as _ReviewAgent } from './src/agents/ReviewAgent.js';
// @ts-ignore
import registry from './src/capabilities/registry.js';
// @ts-ignore
import { registerAllAdapters } from './src/adapters/index.js';
import { initEventBusBackends } from './src/adapters/initEventBusBackends.js';
registerAllAdapters(registry);
initEventBusBackends(registry);
// --- Runtime Logic: Capability Listing and Description ---
/**
 * Lists all available helpers, adapters, and plugins in nootropic by aggregating describe() from all core modules and plugins.
 * Returns an array of capability objects (see docs/llm-integration.md).
 */
export async function listCapabilities() {
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
    const results = [];
    for (const modPath of modules) {
        try {
            const mod = await import(modPath);
            if (typeof mod.describe === 'function') {
                results.push(mod.describe());
            }
            else {
                results.push({ name: modPath, description: 'No describe() export found.' });
            }
        }
        catch (e) {
            results.push({ name: modPath, error: String(e) });
        }
    }
    // Add plugins
    const plugins = await getPlugins();
    for (const plugin of plugins) {
        if (typeof plugin.describe === 'function') {
            results.push(plugin.describe());
        }
    }
    return results;
}
export async function describeCapability(name) {
    const modules = {
        utils: './utils.js',
        orchestrationEngine: './orchestrationEngineSelector.js',
        quality: './quality/selfcheck.js',
        context: './contextSnapshotHelper.js',
        semanticIndex: './semanticIndexBuilder.js'
    };
    if (name in modules) {
        const mod = await import(modules[name]);
        if (typeof mod.describe === 'function')
            return mod.describe();
        return { name, error: 'No describe() export found.' };
    }
    if (name === 'BaseAgent')
        return _BaseAgent.describe();
    if (name === 'ContentAgent')
        return _ContentAgent.describe();
    if (name === 'CollectionAgent')
        return _CollectionAgent.describe();
    if (name === 'ReviewAgent')
        return _ReviewAgent.describe();
    // Try plugins
    const plugins = await getPlugins();
    const plugin = plugins.find((p) => p.name === name);
    if (plugin && typeof plugin.describe === 'function')
        return plugin.describe();
    return { name, error: 'Not found.' };
}
// --- CLI Entrypoint for list-capabilities ---
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
