import type { AgentResult } from '../types/AgentOrchestrationEngine.js';
import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
import { z } from 'zod';
/**
 * FormalVerifierAgent: Integrates LLM-driven spec generation and formal verification (TLA+, Coq, Lean).
 * Implements Capability interface for registry compliance.
 * Reference: https://lamport.azurewebsites.net/tla/tla.html
 */
export declare class FormalVerifierAgent extends BaseAgent implements Capability {
    readonly name: string;
    constructor(options: BaseAgentOptions & {
        backendName?: string;
    });
    /**
     * Runs LLM-driven spec generation, formal verification, and repair.
     * Emits events for each step. Integrate real TLA+/Coq/Lean and LLM logic as needed.
     * Returns AgentResult.
     */
    runTask(): Promise<AgentResult>;
    /**
     * Generates a formal spec (TLA+, Coq, Lean) from code.
     * '_code' is the source code to generate spec from.
     * Returns a formal spec string.
     */
    generateSpec(_code: string): Promise<string>;
    /**
     * Runs formal verification on a spec.
     * '_spec' is the formal spec string.
     * Returns true if verification passes, false otherwise.
     */
    runVerification(_spec: string): Promise<boolean>;
    /**
     * Health check for FormalVerifierAgent.
     * Returns a HealthStatus object.
     */
    health(): Promise<HealthStatus>;
    static eventSchemas: {
        specGenerated: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        verificationAttempted: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        verificationPassed: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        verificationFailed: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        repairAttempted: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        repairSucceeded: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        repairFailed: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
    };
    static schema: z.ZodObject<{
        code: z.ZodString;
        rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        rules?: string[] | undefined;
    }, {
        code: string;
        rules?: string[] | undefined;
    }>;
    /**
     * Returns a machine-usable, LLM-friendly description of the agent.
     * Returns a CapabilityDescribe object.
     */
    static describe(): CapabilityDescribe;
}
declare const FormalVerifierAgentCapability: {
    name: string;
    describe: () => {
        schema: z.ZodObject<{
            code: z.ZodString;
            rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            rules?: string[] | undefined;
        }, {
            code: string;
            rules?: string[] | undefined;
        }>;
        name: string;
        description: string;
        license: string;
        isOpenSource: boolean;
        provenance?: string;
        cloudOnly?: boolean;
        optInRequired?: boolean;
        cost?: string;
        usage?: string;
        methods?: {
            name: string;
            signature: string;
            description?: string;
        }[];
        references?: string[];
        docsFirst?: boolean;
        aiFriendlyDocs?: boolean;
        promptTemplates?: {
            name: string;
            description: string;
            template: string;
            usage?: string;
        }[];
        supportedEventPatterns?: string[];
        eventSubscriptions?: string[];
        eventEmissions?: string[];
    };
    eventSchemas: {
        specGenerated: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        verificationAttempted: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        verificationPassed: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        verificationFailed: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        repairAttempted: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        repairSucceeded: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
        repairFailed: {
            type: string;
            properties: {
                spec: {
                    type: string;
                };
            };
            required: string[];
        };
    };
    schema: z.ZodObject<{
        code: z.ZodString;
        rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        rules?: string[] | undefined;
    }, {
        code: string;
        rules?: string[] | undefined;
    }>;
};
declare const schema: z.ZodObject<{
    code: z.ZodString;
    rules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    rules?: string[] | undefined;
}, {
    code: string;
    rules?: string[] | undefined;
}>;
export { FormalVerifierAgentCapability, schema };
/**
 * Stub lifecycle hooks for registry compliance.
 */
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
