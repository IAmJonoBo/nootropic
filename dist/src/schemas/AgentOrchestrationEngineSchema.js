import { z } from 'zod';
export const AgentProfileSchema = z.object({
    name: z.string(),
    // Add more fields as needed
});
export const AgentTaskSchema = z.object({
    id: z.string(),
    description: z.string(),
    // Add more fields as needed
});
export const AgentContextSchema = z.object({
    agentId: z.string(),
    // Add more fields as needed
});
export const AgentResultSchema = z.object({
    output: z.unknown().optional(),
    success: z.boolean(),
    logs: z.array(z.string()).optional(),
    // Add more fields as needed
});
export const TaskAssignedEventSchema = z.object({
    type: z.literal('TaskAssigned'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.object({ task: AgentTaskSchema }),
    traceId: z.string().optional().describe('OpenTelemetry trace ID'),
    spanId: z.string().optional().describe('OpenTelemetry span ID'),
    parentSpanId: z.string().optional().describe('Parent span ID'),
});
// DLQEvent runtime type and schema (copy from types/AgentOrchestrationEngine.ts if not present)
export const DLQEventSchema = z.object({
    type: z.literal('DLQ'),
    agentId: z.string(),
    timestamp: z.string(),
    originalEvent: z.record(z.string(), z.unknown()),
    error: z.object({
        errorType: z.string(),
        message: z.string(),
        stack: z.string().optional(),
    }),
    metadata: z.object({
        topic: z.string(),
        partition: z.number(),
        offset: z.number(),
        originalTimestamp: z.string(),
        traceContext: z.record(z.string(), z.unknown()).optional(),
    }),
    traceId: z.string().optional().describe('OpenTelemetry trace ID'),
    spanId: z.string().optional().describe('OpenTelemetry span ID'),
    parentSpanId: z.string().optional().describe('Parent span ID'),
    version: z.string().default('1.0.0'),
});
// Add AgentEventSchemas and GenericAgentEventSchema for runtime validation
export const GenericAgentEventSchema = z.object({
    type: z.string(),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.unknown(),
}).catchall(z.unknown());
export const AgentEventSchemas = {
    TaskAssigned: TaskAssignedEventSchema,
    DLQ: DLQEventSchema,
    // Add other event schemas as needed
};
export function validateAgentEvent(event) {
    if (typeof event !== 'object' || event === null || !('type' in event)) {
        return { success: false, error: 'Event must be an object with a type field.' };
    }
    const type = (typeof event === 'object' && event !== null && 'type' in event) ? event['type'] : undefined;
    const schema = AgentEventSchemas[type] ?? GenericAgentEventSchema;
    const parsed = schema.safeParse(event);
    if (parsed.success) {
        return { success: true, data: parsed.data };
    }
    else {
        return { success: false, error: JSON.stringify(parsed.error.issues) };
    }
}
// ... (other event schemas and runtime functions, interfaces, etc. should be moved here as well) 
