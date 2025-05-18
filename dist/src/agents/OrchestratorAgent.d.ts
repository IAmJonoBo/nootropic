import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult } from '../types/AgentOrchestrationEngine.js';
/**
 * OrchestratorAgent: Coordinates multi-agent workflows, delegates tasks, and manages dependencies between agents.
 * Implements the Capability interface for unified orchestration and registry.
 */
export declare class OrchestratorAgent extends BaseAgent {
    readonly name: string;
    constructor(options: BaseAgentOptions);
    runTask(task: unknown): Promise<AgentResult>;
    static describe(): {
        name: string;
        description: string;
        license: string;
        isOpenSource: boolean;
        provenance: string;
        docsFirst: boolean;
        aiFriendlyDocs: boolean;
        usage: string;
        methods: {
            name: string;
            signature: string;
            description: string;
        }[];
        schema: {};
        references: string[];
        bestPractices: string[];
    };
    describe(): {
        name: string;
        description: string;
        license: string;
        isOpenSource: boolean;
        provenance: string;
        docsFirst: boolean;
        aiFriendlyDocs: boolean;
        usage: string;
        methods: {
            name: string;
            signature: string;
            description: string;
        }[];
        schema: {};
        references: string[];
        bestPractices: string[];
    };
    health(): Promise<{
        status: "ok";
        timestamp: string;
    }>;
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
    promptTemplates: never[];
    schema: {};
}>;
