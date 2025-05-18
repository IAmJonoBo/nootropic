import type { AgentResult } from '../../types/AgentOrchestrationEngine.js';
import type { Capability } from '../../capabilities/Capability.js';
/**
 * tryDynamicImport: Utility for dynamic ESM import with fallback. Implements Capability for registry/discoverability.
 */
declare const adapterUtilsCapability: Capability;
export default adapterUtilsCapability;
export declare function stubResult(adapter: string, sdk: string): AgentResult;
/**
 * Returns a structured AgentResult for errors, with context and logs.
 * Example: return formatError('LangChainAdapter', 'runAgentTask', err, { agentProfile, task, context });
 */
export declare function formatError(adapter: string, method: string, err: unknown, context?: Record<string, unknown>): AgentResult;
export declare function tryDynamicImport(moduleName: string): Promise<unknown | null>;
