import type { AgentResult } from '../types/AgentOrchestrationEngine.js';
import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
/**
 * MutationAgent: Handles live patching, mutation testing, and rollback for agents/plugins.
 * Integrates StrykerJS, LLM-driven repair, and event-driven auditability.
 * References: arXiv:2302.03494, LiveCodeBench, StrykerJS.
 */
interface Mutant {
    id: string;
    code: string;
    survived: boolean;
}
export declare class MutationAgent extends BaseAgent {
    readonly name: string;
    constructor(options: BaseAgentOptions & {
        backendName?: string;
    });
    /**
     * LLM-Augmented Mutant Generation: Use LLMs to propose semantically relevant code mutants, guided by real-bug corpora (e.g., Defects4J).
     * Extension: Integrate real-bug corpora and advanced LLM mutation strategies.
     */
    generateMutants(): Promise<Mutant[]>;
    /**
     * Property-Based Fuzzing Integration: Feed mutants into a Hypothesis-style fuzzer for boundary/edge-case validation.
     * Extension: Integrate property-based fuzzing and automate rollback on invariant violations.
     */
    propertyBasedFuzz(_mutant: Mutant): Promise<{
        passed: boolean;
        details?: string;
    }>;
    /**
     * Patch Ensemble & Voting: Generate multiple candidate fixes via LLMs, then apply majority-vote or semantic-equivalence checks.
     * Extension: Integrate LLM ensemble and semantic voting.
     */
    patchEnsembleVoting(candidates: Mutant[]): Promise<Mutant>;
    /**
     * Enhanced mutation/repair cycle: LLM-augmented mutants, property-based fuzzing, ensemble voting, event-driven.
     */
    runTask(task: unknown): Promise<AgentResult>;
    /**
     * Property-Based Fuzzing Integration: Feed mutants into a Hypothesis-style fuzzer for boundary/edge-case validation.
     * Extension: Integrate property-based fuzzing and automate rollback on invariant violations.
     */
    runMutationTest(file: string): Promise<unknown[]>;
    /**
     * Patch Ensemble & Voting: Generate multiple candidate fixes via LLMs, then apply majority-vote or semantic-equivalence checks.
     * Extension: Integrate LLM ensemble and semantic voting.
     */
    applyRepair(): Promise<boolean>;
    /**
     * Patch Ensemble & Voting: Generate multiple candidate fixes via LLMs, then apply majority-vote or semantic-equivalence checks.
     * Extension: Integrate LLM ensemble and semantic voting.
     */
    rollback(): Promise<void>;
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
        eventSchemas: {
            mutationSuggested: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                    code: {
                        type: string;
                    };
                };
                required: string[];
            };
            fuzzingResult: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                    passed: {
                        type: string;
                    };
                    details: {
                        type: string;
                    };
                };
                required: string[];
            };
            repairAttempted: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                };
                required: string[];
            };
            repairSucceeded: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                };
                required: string[];
            };
            repairFailed: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                };
                required: string[];
            };
            rollbackPerformed: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                };
                required: string[];
            };
        };
        references: string[];
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
        eventSchemas: {
            mutationSuggested: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                    code: {
                        type: string;
                    };
                };
                required: string[];
            };
            fuzzingResult: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                    passed: {
                        type: string;
                    };
                    details: {
                        type: string;
                    };
                };
                required: string[];
            };
            repairAttempted: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                };
                required: string[];
            };
            repairSucceeded: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                };
                required: string[];
            };
            repairFailed: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                };
                required: string[];
            };
            rollbackPerformed: {
                type: string;
                properties: {
                    mutantId: {
                        type: string;
                    };
                };
                required: string[];
            };
        };
        references: string[];
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
    promptTemplates: {
        name: string;
        description: string;
        template: string;
        usage: string;
    }[];
}>;
export {};
