import { z } from 'zod';

export const AgentProfileSchema = z.object({
  name: z.string(),
  // Add more fields as needed
});
export type AgentProfile = z.infer<typeof AgentProfileSchema>;

export const AgentTaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  // Add more fields as needed
});
export type AgentTask = z.infer<typeof AgentTaskSchema>;

export const AgentContextSchema = z.object({
  agentId: z.string(),
  // Add more fields as needed
});
export type AgentContext = z.infer<typeof AgentContextSchema>;

export const AgentResultSchema = z.object({
  output: z.unknown().optional(),
  success: z.boolean(),
  logs: z.array(z.string()).optional(),
  // Add more fields as needed
});
export type AgentResult = z.infer<typeof AgentResultSchema>;

export type AgentLogger = (event: AgentLifecycleEvent) => void;

export type AgentLifecycleEvent = {
  type: 'start' | 'success' | 'error' | 'fallback';
  adapter: string;
  method: string;
  payload?: unknown;
  error?: unknown;
};

export type AgentEvent =
  | { type: 'TaskAssigned'; agentId: string; timestamp: string; payload: { task: AgentTask } }
  | { type: 'DraftFeedback'; agentId: string; timestamp: string; payload: Record<string, unknown> }
  | { type: 'TaskStarted'; agentId: string; timestamp: string; payload: { task: AgentTask } }
  | { type: 'DraftCreated'; agentId: string; timestamp: string; payload: { draftId: string; content: string } }
  | { type: 'TaskCompleted'; agentId: string; timestamp: string; payload: { success: boolean; draftId?: string; result?: unknown } }
  | { type: 'DataCollectionRequested'; agentId: string; timestamp: string; payload: { task: AgentTask } }
  | { type: 'DataCollected'; agentId: string; timestamp: string; payload: { result: unknown } }
  | { type: 'DraftReviewed'; agentId: string; timestamp: string; payload: { result: unknown } }
  | { type: 'ReviewRequested'; agentId: string; timestamp: string; payload: { task: AgentTask } }
  | { type: 'ReviewFeedback'; agentId: string; timestamp: string; payload: { result: unknown } }
  | { type: 'Log'; agentId: string; timestamp: string; payload: { level: 'info' | 'warn' | 'error'; message: string; details?: Record<string, unknown> } }
  | { type: 'DLQ'; agentId: string; timestamp: string; originalEvent: Record<string, unknown>; error: { errorType: string; message: string; stack?: string }; metadata: { topic: string; partition: number; offset: number; originalTimestamp: string; traceContext?: Record<string, unknown> }; traceId?: string; spanId?: string; parentSpanId?: string; version?: string }
  | { type: string; agentId: string; timestamp: string; payload?: Record<string, unknown>; [key: string]: unknown };

export type PluginAppContext = {
  publishEvent: (event: AgentEvent) => Promise<void>;
  subscribeToEvent: (type: string, handler: (event: AgentEvent) => void | Promise<void>) => void;
  config?: Record<string, unknown>;
  [key: string]: unknown;
};

export interface Plugin {
  name: string;
  version?: string;
  initialize: (appContext: PluginAppContext) => void | Promise<void>;
  destroy?: () => void | Promise<void>;
  onEvent?: (event: AgentEvent) => void | Promise<void>;
  describe?: () => unknown;
  meta?: Record<string, unknown>;
  run?: (...args: unknown[]) => Promise<unknown>;
}

export interface PluginManager {
  register: (plugin: Plugin, appContext: PluginAppContext) => void | Promise<void>;
  unregister: (name: string) => void | Promise<void>;
  list: () => Plugin[];
  emitEvent: (event: AgentEvent) => Promise<void>;
  subscribe: (type: string, handler: (event: AgentEvent) => void | Promise<void>) => void;
  loadPluginFromDisk: (entry: string, appContext?: PluginAppContext) => Promise<Plugin | null>;
  unloadPlugin: (name: string) => void;
  reloadPlugin: (name: string, entry: string, appContext?: PluginAppContext) => Promise<void>;
}

export type AgentOrchestrationEngine = {
  runAgentTask: (agentProfile: AgentProfile, task: AgentTask, context?: AgentContext, logger?: AgentLogger) => Promise<AgentResult>;
  getAgentContext: (agentId: string) => Promise<AgentContext>;
  listAgents: () => Promise<AgentProfile[]>;
};

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
export type DLQEvent = z.infer<typeof DLQEventSchema>;

// EventBusAdapter interface (copy from types/AgentOrchestrationEngine.ts if not present)
export interface EventBusAdapter {
  publishEvent(event: unknown, topic?: string): Promise<void>;
  subscribeToTopic(topic: string, handler: (event: unknown) => Promise<void>): Promise<void>;
  shutdown(): Promise<void>;
}

// Add AgentEventSchemas and GenericAgentEventSchema for runtime validation
export const GenericAgentEventSchema = z.object({
  type: z.string(),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.unknown(),
}).catchall(z.unknown());

export const AgentEventSchemas: Record<string, z.ZodTypeAny> = {
  TaskAssigned: TaskAssignedEventSchema,
  DLQ: DLQEventSchema,
  // Add other event schemas as needed
};

export function validateAgentEvent(event: unknown): { success: boolean; data?: unknown; error?: string } {
  if (typeof event !== 'object' || event === null || !('type' in event)) {
    return { success: false, error: 'Event must be an object with a type field.' };
  }
  const type = (typeof event === 'object' && event !== null && 'type' in event) ? (event as Record<string, unknown>)['type'] : undefined;
  const schema = AgentEventSchemas[type as string] ?? GenericAgentEventSchema;
  const parsed = schema.safeParse(event);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  } else {
    return { success: false, error: JSON.stringify(parsed.error.issues) };
  }
}

// ... (other event schemas and runtime functions, interfaces, etc. should be moved here as well) 