export * from './adapters/langchainAdapter.js';
export * from './adapters/crewAIAdapter.js';
export * from './adapters/semanticKernelAdapter.js';
export * from './orchestrationEngineSelector.js';
export * from './types/AgentOrchestrationEngine.js';
export * from './utils/updateNotifier.js';
export * from './utils/deprecationChecker.js';
import { getPlugins } from './pluginRegistry.js';
import { BaseAgent } from './agents/BaseAgent.js';
import { DataCollectorAgent } from './agents/DataCollectorAgent.js';
import { WriterAgent } from './agents/WriterAgent.js';
import { ReviewerAgent } from './agents/ReviewerAgent.js';
// CLI is available via the bin entry (see package.json)
// Utilities (updateNotifier, deprecationChecker) will be added soon 
/**
 * Lists all available helpers, adapters, and plugins in nootropic by aggregating describe() from all core modules and plugins.
 * Returns an array of capability objects (see docs/llm-integration.md).
 * @returns {Promise<unknown[]>}
 */
export async function listCapabilities() {
    const modules = [
        './orchestrationEngineSelector.js',
        './utils.js',
        './quality/selfcheck.js',
        './contextSnapshotHelper.js',
        './semanticIndexBuilder.js',
        './agents/BaseAgent.js',
        './agents/DataCollectorAgent.js',
        './agents/WriterAgent.js',
        './agents/ReviewerAgent.js'
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
        return BaseAgent.describe();
    if (name === 'DataCollectorAgent')
        return DataCollectorAgent.describe();
    if (name === 'WriterAgent')
        return WriterAgent.describe();
    if (name === 'ReviewerAgent')
        return ReviewerAgent.describe();
    // Try plugins
    const plugins = await getPlugins();
    const plugin = plugins.find(p => p.name === name);
    if (plugin && typeof plugin.describe === 'function')
        return plugin.describe();
    return { name, error: 'Not found.' };
}
export { BaseAgent, DataCollectorAgent, WriterAgent, ReviewerAgent };
// CLI entrypoint for list-capabilities
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
