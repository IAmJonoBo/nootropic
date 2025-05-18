import { z } from 'zod';
/**
 * JSON Schema for declarative agent workflows (YAML/JSON compatible).
 */
export declare const workflowJsonSchema: {
    $schema: string;
    title: string;
    type: string;
    properties: {
        name: {
            type: string;
        };
        description: {
            type: string;
        };
        steps: {
            type: string;
            items: {
                type: string;
                properties: {
                    id: {
                        type: string;
                    };
                    agent: {
                        type: string;
                    };
                    input: {
                        type: string;
                    };
                    output: {
                        type: string;
                    };
                    dependsOn: {
                        type: string;
                        items: {
                            type: string;
                        };
                        default: never[];
                    };
                    metadata: {
                        type: string;
                    };
                    type: {
                        type: string;
                        enum: string[];
                        default: string;
                    };
                };
                required: string[];
            };
        };
        metadata: {
            type: string;
        };
    };
    required: string[];
};
/**
 * Zod schema for agent workflows.
 */
export declare const workflowZodSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        agent: z.ZodString;
        input: z.ZodRecord<z.ZodString, z.ZodAny>;
        output: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        dependsOn: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        type: z.ZodDefault<z.ZodEnum<["task", "approval", "parallel", "loop"]>>;
    }, "strip", z.ZodTypeAny, {
        type: "task" | "approval" | "parallel" | "loop";
        id: string;
        agent: string;
        input: Record<string, any>;
        metadata?: Record<string, any> | undefined;
        output?: Record<string, any> | undefined;
        dependsOn?: string[] | undefined;
    }, {
        id: string;
        agent: string;
        input: Record<string, any>;
        type?: "task" | "approval" | "parallel" | "loop" | undefined;
        metadata?: Record<string, any> | undefined;
        output?: Record<string, any> | undefined;
        dependsOn?: string[] | undefined;
    }>, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    steps: {
        type: "task" | "approval" | "parallel" | "loop";
        id: string;
        agent: string;
        input: Record<string, any>;
        metadata?: Record<string, any> | undefined;
        output?: Record<string, any> | undefined;
        dependsOn?: string[] | undefined;
    }[];
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    name: string;
    steps: {
        id: string;
        agent: string;
        input: Record<string, any>;
        type?: "task" | "approval" | "parallel" | "loop" | undefined;
        metadata?: Record<string, any> | undefined;
        output?: Record<string, any> | undefined;
        dependsOn?: string[] | undefined;
    }[];
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
/**
 * Returns a description of the workflow schema for registry/discoverability.
 */
export declare function describe(): {
    name: string;
    description: string;
    schema: {
        $schema: string;
        title: string;
        type: string;
        properties: {
            name: {
                type: string;
            };
            description: {
                type: string;
            };
            steps: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        id: {
                            type: string;
                        };
                        agent: {
                            type: string;
                        };
                        input: {
                            type: string;
                        };
                        output: {
                            type: string;
                        };
                        dependsOn: {
                            type: string;
                            items: {
                                type: string;
                            };
                            default: never[];
                        };
                        metadata: {
                            type: string;
                        };
                        type: {
                            type: string;
                            enum: string[];
                            default: string;
                        };
                    };
                    required: string[];
                };
            };
            metadata: {
                type: string;
            };
        };
        required: string[];
    };
};
