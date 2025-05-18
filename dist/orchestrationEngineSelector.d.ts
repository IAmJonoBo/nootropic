import type { AgentOrchestrationEngine } from './src/schemas/AgentOrchestrationEngineSchema.js';
export type OrchestrationEngineName = 'langchain' | 'crewAI' | 'semanticKernel';
/**
 * Returns an instance of the requested orchestration engine adapter.
 * Extend this function to support additional engines.
 */
export declare function getOrchestrationEngine(engine: OrchestrationEngineName): AgentOrchestrationEngine;
/**
 * To add a new orchestration engine:
 * 1. Implement the adapter class (e.g., CrewAIAdapter).
 * 2. Add a case to the switch above.
 * 3. Extend the OrchestrationEngineName type.
 */
export declare function describe(): {
    name: string;
    description: string;
    methods: {
        name: string;
        signature: string;
        description: string;
    }[];
    usage: string;
    schema: {
        runAgentTask: {
            input: {
                type: string;
                properties: {
                    profile: {
                        type: string;
                        description: string;
                    };
                    task: {
                        type: string;
                        description: string;
                    };
                    context: {
                        type: string[];
                        description: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
                properties: {
                    output: {};
                    success: {
                        type: string;
                    };
                    logs: {
                        type: string;
                        items: {
                            type: string;
                        };
                        description: string;
                    };
                };
                required: string[];
            };
        };
    };
};
