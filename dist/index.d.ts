export { LangChainAdapter } from './src/adapters/langchainAdapter.js';
export { CrewAIAdapter } from './src/adapters/crewAIAdapter.js';
export { SemanticKernelAdapter } from './src/adapters/semanticKernelAdapter.js';
export { getOrchestrationEngine } from './orchestrationEngineSelector.js';
export type { AgentOrchestrationEngine, AgentProfile, AgentTask, AgentContext, AgentResult, AgentLogger, AgentEvent, Plugin, PluginManager } from './src/schemas/AgentOrchestrationEngineSchema.js';
import checkForUpdates from './src/utils/describe/updateNotifier.js';
export { checkForUpdates };
export { BaseAgent } from './src/agents/BaseAgent.js';
export { ContentAgent } from './src/agents/ContentAgent.js';
export { CollectionAgent } from './src/agents/CollectionAgent.js';
export { ReviewAgent } from './src/agents/ReviewAgent.js';
/**
 * Lists all available helpers, adapters, and plugins in nootropic by aggregating describe() from all core modules and plugins.
 * Returns an array of capability objects (see docs/llm-integration.md).
 */
export declare function listCapabilities(): Promise<unknown[]>;
/**
 * Describe a specific module or plugin by name. Returns its describe() output (with schema).
 * 'name' is the module or plugin name.
 * Returns the describe() output or an error object if not found.
 */
type KnownModule = 'utils' | 'orchestrationEngine' | 'quality' | 'context' | 'semanticIndex';
export declare function describeCapability(name: KnownModule | string): Promise<unknown>;
