import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
/**
 * ReasoningLoopUtility: Iterative code generation, explanation, and repair utility for agent workflows.
 * Supports chain-of-thought, self-debugging, and mutation/self-healing integration.
 * Now supports SCoT (Structured Chain-of-Thought), pluggable uncertainty, LLM-driven explanation/repair, robust backtracking, and event-driven feedback.
 */
export declare class ReasoningLoopUtility implements Capability {
    readonly name = "ReasoningLoopUtility";
    private publishEvent;
    constructor(publishEvent: (event: unknown) => Promise<void>);
    static eventSchemas: {
        reasoningStep: {
            type: string;
            properties: {
                step: {
                    type: string;
                };
                confidence: {
                    type: string;
                };
                iteration: {
                    type: string;
                };
            };
            required: string[];
        };
        explanation: {
            type: string;
            properties: {
                step: {
                    type: string;
                };
                explanation: {
                    type: string;
                };
                iteration: {
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
    /**
     * Runs an advanced iterative reasoning loop for code generation and repair.
     * Supports uncertainty-aware CoT, SCoT, backtracking, and feedback integration.
     * 'input' is the initial problem or code to solve/repair.
     * 'options' is an optional config object (see method signature for details).
     * Returns a result object with the final result and log.
     */
    runLoop(input: string, options?: {
        maxSteps?: number;
        allowBacktrack?: boolean;
        uncertaintyThreshold?: number;
        feedback?: (step: string, confidence: number, rationale: string) => Promise<'accept' | 'revise' | 'backtrack'>;
        emitEvent?: (event: {
            type: string;
            payload: unknown;
        }) => Promise<void>;
        structuredReasoning?: boolean;
        uncertaintyFn?: (step: string, history: string[]) => Promise<number> | number;
        llmExplain?: (step: string, context: string[]) => Promise<string>;
        llmRepair?: (step: string, context: string[]) => Promise<string>;
        maxBacktrackSteps?: number;
    }): Promise<{
        result: string;
        log: string[];
    }>;
    /**
     * Generates a structured plan (SCoT) for the input problem using LLM or template.
     * 'input' is the problem or code to solve.
     * 'llmExplain' is an optional LLM function for structure generation.
     * Returns a structured plan string.
     */
    generateStructuredPlan(input: string, llmExplain?: (step: string, context: string[]) => Promise<string>): Promise<string>;
    /**
     * Explains a reasoning step or decision (pluggable LLM or stub).
     * 'step' is the step or action to explain.
     * Returns an explanation string.
     */
    explainStep(step: string): Promise<string>;
    /**
     * Attempts to repair a failed or suboptimal step (pluggable LLM or stub).
     * 'step' is the step or code to repair.
     * Returns a repaired step string.
     */
    repairStep(step: string): Promise<string>;
    health(): Promise<HealthStatus>;
    describe(): CapabilityDescribe;
}
export default ReasoningLoopUtility;
export declare const ReasoningLoopUtilityCapability: {
    name: string;
    describe: () => CapabilityDescribe;
    eventSchemas: {
        reasoningStep: {
            type: string;
            properties: {
                step: {
                    type: string;
                };
                confidence: {
                    type: string;
                };
                iteration: {
                    type: string;
                };
            };
            required: string[];
        };
        explanation: {
            type: string;
            properties: {
                step: {
                    type: string;
                };
                explanation: {
                    type: string;
                };
                iteration: {
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
    schema: unknown;
};
export declare const schema: unknown;
