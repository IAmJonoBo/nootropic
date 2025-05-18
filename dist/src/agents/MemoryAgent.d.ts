import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult } from '../schemas/AgentOrchestrationEngineSchema.js';
/**
 * MemoryAgent: Manages persistent memory, context pruning, and retrieval for agents and plugins.
 * Implements the Capability interface for unified orchestration and registry.
 */
export declare class MemoryAgent extends BaseAgent {
    readonly name: string;
    constructor(options: BaseAgentOptions);
    runTask(task: unknown): Promise<AgentResult>;
    private persistentStorageStub;
    private contextPruningStub;
    static eventSchemas: {
        memoryStored: {
            type: string;
            properties: {
                input: {};
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        contextPruned: {
            type: string;
            properties: {
                input: {};
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        memoryEvent: {
            type: string;
            properties: {
                input: {};
                status: {
                    type: string;
                };
            };
            required: string[];
        };
    };
    /**
     * Initialize the agent (stub).
     */
    init(): Promise<void>;
    /**
     * Shutdown the agent (stub).
     */
    shutdown(): Promise<void>;
    /**
     * Reload the agent (stub).
     */
    reload(): Promise<void>;
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
