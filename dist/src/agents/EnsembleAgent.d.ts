import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult } from '../schemas/AgentOrchestrationEngineSchema.js';
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
/**
 * EnsembleAgent: Orchestrates multi-LLM code generation, output voting, and self-debugging.
 * Implements Capability interface for registry compliance.
 * Reference: arXiv:2503.15838v1
 */
export interface VotingStrategy {
    name: string;
    vote(candidates: string[], context?: unknown): Promise<{
        winner: string;
        rationale: string;
        details?: unknown;
    }>;
}
export declare class MajorityVotingStrategy implements VotingStrategy {
    name: string;
    vote(candidates: string[]): Promise<{
        winner: string;
        rationale: string;
        details?: unknown;
    }>;
}
export declare class SemanticVotingStrategy implements VotingStrategy {
    name: string;
    private backend;
    constructor(backendName?: string);
    vote(candidates: string[], context?: {
        query?: string;
    }): Promise<{
        winner: string;
        rationale: string;
        details?: unknown;
    }>;
    private cosineSimilarity;
}
export declare class WeightedVotingStrategy implements VotingStrategy {
    name: string;
    private weights;
    constructor(weights: number[]);
    vote(candidates: string[]): Promise<{
        winner: string;
        rationale: string;
        details?: unknown;
    }>;
}
export declare class SyntacticVotingStrategy implements VotingStrategy {
    name: string;
    vote(candidates: string[]): Promise<{
        winner: string;
        rationale: string;
        details?: unknown;
    }>;
}
export declare class EnsembleAgent extends BaseAgent implements Capability {
    readonly name: string;
    private votingStrategy;
    private backendName;
    constructor(options?: Omit<BaseAgentOptions, 'profile'> & {
        profile?: {
            name?: string;
        };
        votingStrategy?: VotingStrategy;
        backendName?: string;
    });
    runTask(task: unknown): Promise<AgentResult>;
    health(): Promise<HealthStatus>;
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
    static eventSchemas: {
        candidateGeneration: {
            type: string;
            properties: {
                candidates: {
                    type: string;
                };
                method: {
                    type: string;
                };
            };
            required: string[];
        };
        votingRationale: {
            type: string;
            properties: {
                rationale: {
                    type: string;
                };
                details: {
                    type: string;
                };
                candidates: {
                    type: string;
                };
                winner: {
                    type: string;
                };
            };
            required: string[];
        };
        metaLLMAdjudication: {
            type: string;
            properties: {
                candidates: {
                    type: string;
                };
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        selfDebugging: {
            type: string;
            properties: {
                candidates: {
                    type: string;
                };
                status: {
                    type: string;
                };
                log: {
                    type: string;
                };
            };
            required: string[];
        };
        rationale: {
            type: string;
            properties: {
                rationale: {
                    type: string;
                };
            };
            required: string[];
        };
        explanation: {
            type: string;
            properties: {
                explanation: {
                    type: string;
                };
            };
            required: string[];
        };
        repair: {
            type: string;
            properties: {
                step: {
                    type: string;
                };
                repaired: {
                    type: string;
                };
                iteration: {
                    type: string;
                };
            };
            required: string[];
        };
    };
    static describe(): CapabilityDescribe;
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
    promptTemplates: never[];
    schema: {};
}>;
