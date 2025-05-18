import type { AgentOrchestrationEngine, AgentProfile, AgentTask, AgentContext, AgentResult } from './src/schemas/AgentOrchestrationEngineSchema.js';
export declare class SemanticKernelAdapter implements AgentOrchestrationEngine {
    runAgentTask(agentProfile: AgentProfile, task: AgentTask, context?: AgentContext): Promise<AgentResult>;
    getAgentContext(agentId: string): Promise<AgentContext>;
    listAgents(): Promise<AgentProfile[]>;
}
