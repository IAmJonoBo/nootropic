import { z } from 'zod';

/**
 * AgentOrchestrationEngine types and schemas for agent contracts, events, plugins, and orchestration engines.
 *
 * LLM/AI-usage: All types and schemas are designed for robust, machine-usable agent orchestration and event validation. Extension points for new event types, plugin interfaces, and orchestration strategies.
 * Extension: Add new event schemas, plugin interfaces, or orchestration engine types as needed.
 *
 * Main Types/Functions:
 *   - AgentProfile, AgentTask, AgentContext, AgentResult: Core agent types
 *   - AgentEvent: Discriminated union for all agent/plugin event types
 *   - Plugin, PluginManager: Plugin interfaces
 *   - AgentEventSchemas: Zod schemas for all event types
 *   - validateAgentEvent(event): Validates an AgentEvent at runtime
 *   - EventBusAdapter: Unified interface for distributed event bus backends
 */

// --- Zod Schemas for Agent Contracts (2025 best practices) ---

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

// Logger/event handler type for agent lifecycle events
// @ts-expect-error TS(2532): Object is possibly 'undefined'.
export type AgentLogger = (event: AgentLifecycleEvent) => void;

export type AgentLifecycleEvent = {
  type: 'start' | 'success' | 'error' | 'fallback';
  adapter: string;
  method: string;
  payload?: unknown;
  error?: unknown;
};

/**
 * Discriminated union for all agent/plugin event types.
 *
 * NOTE: The fallback/generic event type now uses payload?: Record<string, unknown> | undefined
 * instead of payload: unknown, to ensure compatibility with event bus APIs and TypeScript's
 * discriminated union assignability. See: https://github.com/microsoft/TypeScript/issues/56106
 */
export type AgentEvent =
  | { type: 'TaskAssigned'; agentId: string; timestamp: string; payload: { task: AgentTask } }
  | { type: 'DraftFeedback'; agentId: string; timestamp: string; payload: Record<string, unknown> }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: 'TaskStarted'; agentId: string; timestamp: string; payload: { task: AgentTask } }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: 'DraftCreated'; agentId: string; timestamp: string; payload: { draftId: string; content: string } }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: 'TaskCompleted'; agentId: string; timestamp: string; payload: { success: boolean; draftId?: string; result?: unknown } }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: 'DataCollectionRequested'; agentId: string; timestamp: string; payload: { task: AgentTask } }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: 'DataCollected'; agentId: string; timestamp: string; payload: { result: unknown } }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: 'DraftReviewed'; agentId: string; timestamp: string; payload: { result: unknown } }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: 'ReviewRequested'; agentId: string; timestamp: string; payload: { task: AgentTask } }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: 'ReviewFeedback'; agentId: string; timestamp: string; payload: { result: unknown } }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: 'Log'; agentId: string; timestamp: string; payload: { level: 'info' | 'warn' | 'error'; message: string; details?: Record<string, unknown> } }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: 'DLQ'; agentId: string; timestamp: string; originalEvent: Record<string, unknown>; error: { errorType: string; message: string; stack?: string }; metadata: { topic: string; partition: number; offset: number; originalTimestamp: string; traceContext?: Record<string, unknown> }; traceId?: string; spanId?: string; parentSpanId?: string; version?: string }
  // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
  | { type: string; agentId: string; timestamp: string; payload?: Record<string, unknown>; [key: string]: unknown };

/**
 * Type for the application context passed to plugins (event bus, config, etc).
 */
export type PluginAppContext = {
  // @ts-expect-error TS(2532): Object is possibly 'undefined'.
  publishEvent: (event: AgentEvent) => Promise<void>;
  // @ts-expect-error TS(6133): 'type' is declared but its value is never read.
  subscribeToEvent: (type: string, handler: (event: AgentEvent) => void | Promise<void>) => void;
  // @ts-expect-error TS(2304): Cannot find name 'config'.
  config?: Record<string, unknown>;
  // @ts-expect-error TS(2304): Cannot find name 'key'.
  [key: string]: unknown;
};

/**
 * Standard plugin interface with lifecycle and event hooks.
 */
export interface Plugin {
  name: string;
  version?: string;
  // @ts-expect-error TS(2447): The '|' operator is not allowed for boolean types.... Remove this comment to see the full error message
  initialize: (appContext: PluginAppContext) => void | Promise<void>;
  // @ts-expect-error TS(2304): Cannot find name 'destroy'.
  destroy?: () => void | Promise<void>;
  // @ts-expect-error TS(2304): Cannot find name 'onEvent'.
  onEvent?: (event: AgentEvent) => void | Promise<void>;
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe?: () => unknown;
  // @ts-expect-error TS(2304): Cannot find name 'meta'.
  meta?: Record<string, unknown>;
  /**
   * Optional run method for backward compatibility with legacy plugins.
   */
  // @ts-expect-error TS(2304): Cannot find name 'run'.
  run?: (...args: unknown[]) => Promise<unknown>;
}

/**
 * Plugin manager interface for registration, lifecycle, and event management.
 */
export interface PluginManager {
  // @ts-expect-error TS(2447): The '|' operator is not allowed for boolean types.... Remove this comment to see the full error message
  register: (plugin: Plugin, appContext: PluginAppContext) => void | Promise<void>;
  // @ts-expect-error TS(6133): 'name' is declared but its value is never read.
  unregister: (name: string) => void | Promise<void>;
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  list: () => Plugin[];
  // @ts-expect-error TS(6133): 'event' is declared but its value is never read.
  emitEvent: (event: AgentEvent) => Promise<void>;
  // @ts-expect-error TS(6133): 'type' is declared but its value is never read.
  subscribe: (type: string, handler: (event: AgentEvent) => void | Promise<void>) => void;
  /**
   * Dynamically loads a plugin from disk and registers it.
   * 'entry' is the path to the plugin file (absolute or relative).
   * 'appContext' is the plugin application context.
   */
  // @ts-expect-error TS(6133): 'entry' is declared but its value is never read.
  loadPluginFromDisk: (entry: string, appContext?: PluginAppContext) => Promise<Plugin | null>;
  /**
   * Unloads (destroys) a plugin by name and removes all event subscriptions.
   * 'name' is the plugin name.
   */
  // @ts-expect-error TS(6133): 'name' is declared but its value is never read.
  unloadPlugin: (name: string) => void;
  /**
   * Hot-reloads a plugin by name: unloads, re-imports, and re-registers it.
   * 'name' is the plugin name.
   * 'entry' is the path to the plugin file.
   * 'appContext' is the plugin application context.
   */
  // @ts-expect-error TS(6133): 'name' is declared but its value is never read.
  reloadPlugin: (name: string, entry: string, appContext?: PluginAppContext) => Promise<void>;
}

// --- Orchestration Engine Interface ---

export type AgentOrchestrationEngine = {
  // @ts-expect-error TS(2693): 'AgentResult' only refers to a type, but is being ... Remove this comment to see the full error message
  runAgentTask: (agentProfile: AgentProfile, task: AgentTask, context?: AgentContext, logger?: AgentLogger) => Promise<AgentResult>;
  // @ts-expect-error TS(6133): 'agentId' is declared but its value is never read.
  getAgentContext: (agentId: string) => Promise<AgentContext>;
  // @ts-expect-error TS(2693): 'AgentProfile' only refers to a type, but is being... Remove this comment to see the full error message
  listAgents: () => Promise<AgentProfile[]>;
};

/**
 * --- Event Schema Governance & Runtime Validation (2025 Best Practices) ---
 *
 * All event types in AgentEvent are defined as Zod schemas below. The AgentEventSchemas map provides
 * a lookup for runtime validation. Use validateAgentEvent(event) to validate any event at runtime.
 *
 * See: https://github.com/open-telemetry/semantic-conventions/blob/main/docs/genai/README.md
 */

export const TaskAssignedEventSchema = z.object({
  type: z.literal('TaskAssigned'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.object({ task: AgentTaskSchema }),
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  parentSpanId: z.string().optional().describe('Parent span ID'),
});
export const DraftFeedbackEventSchema = z.object({
  type: z.literal('DraftFeedback'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.record(z.string(), z.unknown()),
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  parentSpanId: z.string().optional().describe('Parent span ID'),
});
export const TaskStartedEventSchema = z.object({
  type: z.literal('TaskStarted'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.object({ task: AgentTaskSchema }),
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  parentSpanId: z.string().optional().describe('Parent span ID'),
});
export const DraftCreatedEventSchema = z.object({
  type: z.literal('DraftCreated'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.object({ draftId: z.string(), content: z.string() }),
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  parentSpanId: z.string().optional().describe('Parent span ID'),
});
export const TaskCompletedEventSchema = z.object({
  type: z.literal('TaskCompleted'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.object({ success: z.boolean(), draftId: z.string().optional(), result: z.unknown().optional() }),
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  parentSpanId: z.string().optional().describe('Parent span ID'),
});
export const DataCollectionRequestedEventSchema = z.object({
  type: z.literal('DataCollectionRequested'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.object({ task: AgentTaskSchema }),
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  parentSpanId: z.string().optional().describe('Parent span ID'),
});
export const DataCollectedEventSchema = z.object({
  type: z.literal('DataCollected'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.object({ result: z.unknown() }),
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  parentSpanId: z.string().optional().describe('Parent span ID'),
});
export const DraftReviewedEventSchema = z.object({
  type: z.literal('DraftReviewed'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.object({ result: z.unknown() }),
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  parentSpanId: z.string().optional().describe('Parent span ID'),
});
export const ReviewRequestedEventSchema = z.object({
  type: z.literal('ReviewRequested'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.object({ task: AgentTaskSchema }),
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  parentSpanId: z.string().optional().describe('Parent span ID'),
});
export const ReviewFeedbackEventSchema = z.object({
  type: z.literal('ReviewFeedback'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.object({ result: z.unknown() }),
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  parentSpanId: z.string().optional().describe('Parent span ID'),
});
export const LogEventSchema = z.object({
  type: z.literal('Log'),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.object({
    level: z.enum(['info', 'warn', 'error']),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
    traceId: z.string().optional().describe('OpenTelemetry trace ID'),
    spanId: z.string().optional().describe('OpenTelemetry span ID'),
    parentSpanId: z.string().optional().describe('Parent span ID'),
  })
});

// Fallback: generic event type
export const GenericAgentEventSchema = z.object({
  type: z.string(),
  agentId: z.string(),
  timestamp: z.string(),
  payload: z.unknown(),
// @ts-expect-error TS(2304): Cannot find name 'catchall'.
}).catchall(z.unknown());

/**
 * Dead Letter Queue (DLQ) Event Schema (2025 Best Practices)
 * See: https://www.confluent.io/learn/kafka-dead-letter-queue/ and https://www.kai-waehner.de/blog/2022/05/30/error-handling-via-dead-letter-queue-in-apache-kafka/
 */
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
  // @ts-expect-error TS(2304): Cannot find name 'traceId'.
  traceId: z.string().optional().describe('OpenTelemetry trace ID'),
  // @ts-expect-error TS(2304): Cannot find name 'spanId'.
  spanId: z.string().optional().describe('OpenTelemetry span ID'),
  // @ts-expect-error TS(2304): Cannot find name 'parentSpanId'.
  parentSpanId: z.string().optional().describe('Parent span ID'),
  // @ts-expect-error TS(2304): Cannot find name 'version'.
  version: z.string().default('1.0.0'),
});
export type DLQEvent = z.infer<typeof DLQEventSchema>;

export const AgentEventSchemas: Record<string, z.ZodTypeAny> = {
  // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
  TaskAssigned: TaskAssignedEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'DraftFeedback'.
  DraftFeedback: DraftFeedbackEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'TaskStarted'.
  TaskStarted: TaskStartedEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'DraftCreated'.
  DraftCreated: DraftCreatedEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'TaskCompleted'.
  TaskCompleted: TaskCompletedEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'DataCollectionRequested'.
  DataCollectionRequested: DataCollectionRequestedEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'DataCollected'.
  DataCollected: DataCollectedEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'DraftReviewed'.
  DraftReviewed: DraftReviewedEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'ReviewRequested'.
  ReviewRequested: ReviewRequestedEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'ReviewFeedback'.
  ReviewFeedback: ReviewFeedbackEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'Log'.
  Log: LogEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'DLQ'.
  DLQ: DLQEventSchema,
  // @ts-expect-error TS(2304): Cannot find name 'candidateGeneration'.
  candidateGeneration: z.object({
    type: z.literal('candidateGeneration'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'votingRationale'.
  votingRationale: z.object({
    type: z.literal('votingRationale'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'metaLLMAdjudication'.
  metaLLMAdjudication: z.object({
    type: z.literal('metaLLMAdjudication'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'selfDebugging'.
  selfDebugging: z.object({
    type: z.literal('selfDebugging'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'specGenerated'.
  specGenerated: z.object({
    type: z.literal('specGenerated'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'verificationAttempted'.
  verificationAttempted: z.object({
    type: z.literal('verificationAttempted'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'verificationPassed'.
  verificationPassed: z.object({
    type: z.literal('verificationPassed'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'verificationFailed'.
  verificationFailed: z.object({
    type: z.literal('verificationFailed'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'repairAttempted'.
  repairAttempted: z.object({
    type: z.literal('repairAttempted'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'repairSucceeded'.
  repairSucceeded: z.object({
    type: z.literal('repairSucceeded'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'repairFailed'.
  repairFailed: z.object({
    type: z.literal('repairFailed'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
  // @ts-expect-error TS(2304): Cannot find name 'orchestrationComplete'.
  orchestrationComplete: z.object({
    type: z.literal('orchestrationComplete'),
    agentId: z.string(),
    timestamp: z.string(),
    payload: z.record(z.string(), z.unknown())
  }),
};

/**
 * Validates an AgentEvent at runtime using the canonical Zod schema.
 * Returns { success: true, data } if valid, or { success: false, error } if invalid.
 */
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

/**
 * EventBusAdapter: Unified interface for distributed event bus backends (Kafka, NATS, Dapr, etc.)
 *
 * - All events must conform to AgentEvent or DLQEvent and be validated at runtime (Zod)
 * - Event payloads should follow the CloudEvents spec for interoperability
 * - All operations must emit OpenTelemetry (OTel) traces and metrics
 * - DLQ handling: failed events are routed to a DLQ topic/subject/stream
 * - See adapters/KafkaEventBus.ts, NatsEventBus.ts, DaprEventBus.ts for implementations
 * - Reference: 2025 best practices for event-driven, observable, and type-safe agent systems
 */
export interface EventBusAdapter {
  /**
   * Publishes an event to the bus. Must inject trace context and validate schema.
   * 'event' is an AgentEvent or DLQEvent. 'topic' is an optional topic/subject (backend-specific).
   */
  publishEvent(event: AgentEvent, topic?: string): Promise<void>;

  /**
   * Subscribes to a topic/subject and invokes handler for each event. Must extract trace context and validate schema.
   * 'topic' is the topic/subject name. 'handler' is the async handler for validated events.
   */
  // @ts-expect-error TS(2304): Cannot find name 'subscribeToTopic'.
  subscribeToTopic(topic: string, handler: (event: AgentEvent) => Promise<void>): Promise<void>;

  /**
   * Gracefully shuts down the event bus connection/client.
   */
  // @ts-expect-error TS(2304): Cannot find name 'shutdown'.
  shutdown(): Promise<void>;
} 