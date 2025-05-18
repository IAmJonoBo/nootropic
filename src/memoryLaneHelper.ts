// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper.
/**
 * memoryLaneHelper: Event bus and memory lane for agent event auditing, replay, and registry-driven backend selection.
 *
 * LLM/AI-usage: Designed for robust, machine-usable event auditing and replay in agent-driven workflows. All event validation uses canonical Zod schemas.
 * Extension: Add new event bus backends or event types via the registry.
 */
import { getCacheFilePath, ensureCacheDirExists } from './utils/context/cacheDir.js';
import { promises as fsp } from 'fs';
import type { EventBusAdapter, AgentEvent as ImportedAgentEvent } from './schemas/AgentOrchestrationEngineSchema.js';
import { validateAgentEvent } from './schemas/AgentOrchestrationEngineSchema.js';
import { z } from 'zod';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Zod schema for event payloads and details
const EventPayloadSchema = z.record(z.string(), z.unknown());

// Use canonical Zod-based validation for AgentEvent
function validateEvent(event: AgentEvent): boolean {
  const result = validateAgentEvent(event);
  if (!result.success) {
    throw new Error(`Invalid event schema: ${result.error}`);
  }
  // Validate payload and details if present
  if ('payload' in event && event.payload !== undefined) {
    EventPayloadSchema.parse(event.payload);
  }
  return true;
}

// --- Event Bus & Audit Log: AgentEvent schema (aligned with event-schema.json) ---
// Use the imported AgentEvent type for all event bus logic
// interface AgentEvent {
//   type: string; // e.g., TaskAssigned, TaskCompleted, Error, Log, etc.
//   agentId?: string;
//   timestamp: string;
//   payload?: Record<string, unknown>;
//   correlationId?: string;
//   topic?: string; // Logical topic/queue for advanced patterns
// }
type AgentEvent = ImportedAgentEvent & { [key: string]: unknown };

const EVENT_LOG_PATH = getCacheFilePath('event-log.jsonl');

// --- In-memory subscribers by topic ---
const topicSubscribers: Record<string, ((event: AgentEvent) => void)[]> = {};

// --- Event Bus Backend Interface ---
interface EventBusBackend {
  publishEvent(event: AgentEvent): Promise<void>;
  publishToTopic(event: AgentEvent, topic?: string): Promise<void>;
  getEvents(filter?: Partial<AgentEvent>): Promise<AgentEvent[]>;
  getEventsByTopic(topic: string): Promise<AgentEvent[]>;
  subscribe(callback: (event: AgentEvent) => void): void;
  subscribeToTopic(topic: string, handler: (event: AgentEvent) => Promise<void>): Promise<void>;
  logEvent(level: LogLevel, message: string, details: Record<string, unknown> | undefined, agentId: string, correlationId: string, topic: string): Promise<void>;
  shutdown(): Promise<void>;
}

// --- JSONL Backend ---
class JsonlEventBus implements EventBusBackend {
  async publishEvent(event: AgentEvent): Promise<void> {
    await this.publishToTopic(event, typeof event['topic'] === 'string' ? event['topic'] : event.type);
  }
  async publishToTopic(event: AgentEvent, topic?: string): Promise<void> {
    if (!validateEvent(event)) throw new Error('Invalid event schema');
    const topicName = topic ?? (typeof event['topic'] === 'string' ? event['topic'] : undefined) ?? event.type;
    const eventWithMeta = { ...event, timestamp: event.timestamp ?? new Date().toISOString(), topic: topicName };
    await ensureCacheDirExists();
    await fsp.appendFile(EVENT_LOG_PATH, JSON.stringify(eventWithMeta) + '\n');
    // Notify topic subscribers
    if (typeof topicName === 'string' && topicName) {
      topicSubscribers[topicName] ??= [];
      for (const sub of topicSubscribers[topicName]!) sub(eventWithMeta);
    }
    if (topicSubscribers['all']) {
      topicSubscribers['all'] ??= [];
      for (const sub of topicSubscribers['all']!) sub(eventWithMeta);
    }
  }
  async getEvents(filter: Partial<AgentEvent> = {}): Promise<AgentEvent[]> {
    await ensureCacheDirExists();
    try {
      const lines = (await fsp.readFile(EVENT_LOG_PATH, 'utf-8')).split('\n').filter((l: string) => Boolean(l));
      let events = lines.map((l: string) => JSON.parse(l) as AgentEvent);
      if (filter.type) events = events.filter((e: AgentEvent) => e.type === filter.type);
      if (filter.agentId) events = events.filter((e: AgentEvent) => e.agentId === filter.agentId);
      if ('topic' in filter && filter['topic']) events = events.filter((e: AgentEvent) => typeof e['topic'] === 'string' && e['topic'] === (filter['topic'] ?? ''));
      if ('correlationId' in filter && filter['correlationId']) events = events.filter((e: AgentEvent) => typeof e['correlationId'] === 'string' && e['correlationId'] === (filter['correlationId'] ?? ''));
      return events;
    } catch {
      return [];
    }
  }
  async getEventsByTopic(topic: string): Promise<AgentEvent[]> {
    await ensureCacheDirExists();
    try {
      const lines = (await fsp.readFile(EVENT_LOG_PATH, 'utf-8')).split('\n').filter((l: string) => Boolean(l));
      return lines.map((l: string) => JSON.parse(l) as AgentEvent).filter((e: AgentEvent) => typeof e['topic'] === 'string' && e['topic'] === topic);
    } catch {
      return [];
    }
  }
  subscribe(callback: (event: AgentEvent) => void): void {
    this.subscribeToTopic('all', async (event: AgentEvent) => callback(event));
  }
  async subscribeToTopic(topic: string, handler: (event: AgentEvent) => Promise<void>): Promise<void> {
    topicSubscribers[topic] ??= [];
    topicSubscribers[topic]!.push((event: AgentEvent) => { void handler(event); });
  }
  async logEvent(level: LogLevel, message: string, details: Record<string, unknown> | undefined, agentId: string, correlationId: string, topic: string): Promise<void> {
    await this.publishToTopic({
      type: 'Log',
      agentId,
      timestamp: new Date().toISOString(),
      payload: { level, message, details },
      correlationId,
      topic
    }, topic ?? 'Log');
  }
  async shutdown(): Promise<void> { /* no-op for local */ }
}

// --- Backend Factory ---
/**
 * Dynamically loads the registry only if a non-default event bus backend is requested.
 * This avoids circular dependencies with registry and RAGPipelineUtility.
 */
async function getEventBusBackend(): Promise<EventBusAdapter> {
  const backend = process.env['EVENT_BUS_BACKEND'] ?? 'jsonl';
  if (backend === 'kafka' || backend === 'nats' || backend === 'dapr') {
    // Dynamically import registry only if needed
    const registry = (await import('./capabilities/registry.js')).default;
    if (backend === 'kafka') {
      const kafka = registry.get('KafkaEventBus');
      if (!kafka) throw new Error('KafkaEventBus is not registered in the registry');
      return kafka as unknown as EventBusAdapter;
    }
    if (backend === 'nats') {
      const nats = registry.get('NatsEventBus');
      if (!nats) throw new Error('NatsEventBus is not registered in the registry');
      return nats as unknown as EventBusAdapter;
    }
    if (backend === 'dapr') {
      const dapr = registry.get('DaprEventBus');
      if (!dapr) throw new Error('DaprEventBus is not registered in the registry');
      return dapr as unknown as EventBusAdapter;
    }
  }
  // Fallback to local JSONL event bus for dev/local
  return new JsonlEventBus();
}

type ExtendedEventBus = EventBusAdapter & {
  publishToTopic?: (event: AgentEvent, topic?: string) => Promise<void>;
  getEvents?: (filter?: Partial<AgentEvent>) => Promise<AgentEvent[]>;
  getEventsByTopic?: (topic: string) => Promise<AgentEvent[]>;
  subscribe?: (callback: (event: AgentEvent) => void) => void;
  logEvent?: (level: LogLevel, message: string, details?: Record<string, unknown>, agentId?: string, correlationId?: string, topic?: string) => Promise<void>;
};
let eventBusPromise: Promise<ExtendedEventBus> | null = null;
function getEventBus(): Promise<ExtendedEventBus> {
  if (!eventBusPromise) {
    eventBusPromise = getEventBusBackend() as Promise<ExtendedEventBus>;
  }
  return eventBusPromise;
}

// --- Public API: delegate to selected backend ---
export async function publishEvent(event: AgentEvent) { return (await getEventBus()).publishEvent(event); }
export async function publishToTopic(event: AgentEvent, topic?: string) { return (await getEventBus()).publishToTopic?.(event, topic); }
export async function getEvents(filter?: Partial<AgentEvent>) { return (await getEventBus()).getEvents?.(filter); }
export async function getEventsByTopic(topic: string) { return (await getEventBus()).getEventsByTopic?.(topic); }
export async function subscribeToTopic(topic: string, callback: (event: AgentEvent) => Promise<void>) {
  return (await getEventBus()).subscribeToTopic?.(topic, (event: unknown) => callback(event as AgentEvent));
}
// ... rest of the file ... 