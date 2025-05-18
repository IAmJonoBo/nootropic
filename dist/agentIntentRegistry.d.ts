interface AgentIntent {
    timestamp: string;
    intent: string;
    plan: string[];
    context?: Record<string, unknown>;
}
interface AgentFeedback {
    timestamp: string;
    agent: string;
    feedback: string;
}
declare function registerIntent(agent: string, intent: string, plan: string[], context?: Record<string, unknown>): Promise<void>;
declare function getIntents(): Promise<Record<string, AgentIntent>>;
declare function submitFeedback(agent: string, feedback: string): Promise<void>;
declare function getFeedback(): Promise<AgentFeedback[]>;
/**
 * Returns a description of the agent intent registry plugin/capability.
 */
export declare function describe(): {
    name: string;
    description: string;
    functions: {
        name: string;
        signature: string;
        description: string;
    }[];
    usage: string;
    schema: {
        registerIntent: {
            input: {
                type: string;
                properties: {
                    agent: {
                        type: string;
                    };
                    intent: {
                        type: string;
                    };
                    plan: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    context: {
                        type: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
            };
        };
        submitFeedback: {
            input: {
                type: string;
                properties: {
                    agent: {
                        type: string;
                    };
                    suggestion: {
                        type: string;
                    };
                    rating: {
                        type: string;
                    };
                    comment: {
                        type: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
            };
        };
        getIntents: {
            input: {
                type: string;
            };
            output: {
                type: string;
                items: {
                    type: string;
                };
            };
        };
        getFeedback: {
            input: {
                type: string;
            };
            output: {
                type: string;
                items: {
                    type: string;
                };
            };
        };
    };
};
export { registerIntent, getIntents, submitFeedback, getFeedback };
