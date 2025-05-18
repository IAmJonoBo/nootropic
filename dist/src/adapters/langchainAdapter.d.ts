import type { AgentOrchestrationEngine, AgentProfile, AgentTask, AgentContext, AgentResult, AgentLogger } from '../schemas/AgentOrchestrationEngineSchema.js';
import type { Capability, HealthStatus, CapabilityDescribe } from '../capabilities/Capability.js';
/**
 * LangChainAdapter: Adapter for LangChain agent orchestration. Implements both AgentOrchestrationEngine and Capability for registry/discoverability.
 */
export declare class LangChainAdapter implements AgentOrchestrationEngine, Capability {
    readonly name = "LangChainAdapter";
    runAgentTask(agentProfile: AgentProfile, task: AgentTask, context?: AgentContext, logger?: AgentLogger): Promise<AgentResult>;
    getAgentContext(agentId: string): Promise<AgentContext>;
    listAgents(): Promise<AgentProfile[]>;
    /**
     * Optional: Initialize the capability (no-op for now).
     */
    init(): Promise<void>;
    /**
     * Optional: Hot-reload logic (no-op for now).
     */
    reload(): Promise<void>;
    /**
     * Health check for capability status.
     */
    health(): Promise<HealthStatus>;
    /**
     * Returns a machine-usable, LLM-friendly description of the adapter capability.
     * NOTE: Keep this in sync with the Capability interface in capabilities/Capability.ts.
     */
    describe(): CapabilityDescribe;
}
export declare function init(): Promise<void>;
export declare function shutdown(): Promise<void>;
export declare function reload(): Promise<void>;
export declare function health(): Promise<{
    status: string;
    timestamp: string;
}>;
export declare function describe(): Promise<{
    name: string;
    description: string;
}>;
