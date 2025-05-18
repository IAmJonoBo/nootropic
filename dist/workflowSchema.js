import { z } from 'zod';
/**
 * JSON Schema for declarative agent workflows (YAML/JSON compatible).
 */
export const workflowJsonSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'AgentWorkflow',
    type: 'object',
    properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        steps: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    agent: { type: 'string' },
                    input: { type: 'object' },
                    output: { type: 'object' },
                    dependsOn: {
                        type: 'array',
                        items: { type: 'string' },
                        default: []
                    },
                    metadata: { type: 'object' },
                    type: { type: 'string', enum: ['task', 'approval', 'parallel', 'loop'], default: 'task' }
                },
                required: ['id', 'agent', 'input']
            }
        },
        metadata: { type: 'object' }
    },
    required: ['name', 'steps']
};
/**
 * Zod schema for agent workflows.
 */
export const workflowZodSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    steps: z.array(z.object({
        id: z.string(),
        agent: z.string(),
        input: z.record(z.any()),
        output: z.record(z.any()).optional(),
        dependsOn: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional(),
        type: z.enum(['task', 'approval', 'parallel', 'loop']).default('task')
    })),
    metadata: z.record(z.any()).optional()
});
/**
 * Returns a description of the workflow schema for registry/discoverability.
 */
export function describe() {
    return {
        name: 'workflowSchema',
        description: 'JSON Schema and Zod schema for declarative agent workflows (YAML/JSON). Supports steps, agents, inputs, outputs, dependencies, and metadata.',
        schema: workflowJsonSchema
    };
}
