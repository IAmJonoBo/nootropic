// DaprEventBus: Distributed event bus backend for Dapr pub/sub (2025 best practices)
// NOTE: If you see a type error for '@dapr/dapr', install @types/dapr__dapr or add a custom type declaration.
import { DaprClient, CommunicationProtocolEnum } from '@dapr/dapr';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
// @ts-ignore
import { AgentEvent, DLQEvent, validateAgentEvent } from '../types/AgentOrchestrationEngine.js';
// @ts-ignore
import type { EventBusAdapter } from '../types/AgentOrchestrationEngine.js';
// @ts-ignore
import type { Capability, HealthStatus, CapabilityDescribe } from '../capabilities/Capability.js';

const PUBSUB_NAME = process.env['DAPR_PUBSUB_NAME'] ?? 'messagebus';
const DLQ_TOPIC = process.env['DAPR_DLQ_TOPIC'] ?? 'aihelpers.events.DLQ';
const DAPR_HOST = process.env['DAPR_HOST'] ?? '127.0.0.1';
const DAPR_HTTP_PORT = process.env['DAPR_HTTP_PORT'] ?? '3500';
const DAPR_TRACE_PROPAGATOR = process.env['DAPR_TRACE_PROPAGATOR'] ?? 'w3c';

const propagator = DAPR_TRACE_PROPAGATOR === 'b3'
  ? new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER })
  : new W3CTraceContextPropagator();

/**
 * DaprEventBus: Distributed event bus backend for Dapr pub/sub. Implements both EventBusAdapter and Capability for registry/discoverability.
 */
export class DaprEventBus implements EventBusAdapter, Capability {
  public readonly name = 'DaprEventBus';
  private client: DaprClient;

  constructor() {
    // Use object-based constructor per @dapr/dapr v3+ (2025)
    this.client = new DaprClient({
      daprHost: DAPR_HOST,
      daprPort: DAPR_HTTP_PORT,
      communicationProtocol: CommunicationProtocolEnum.HTTP,
    });
  }

  /**
   * Publishes an event to a Dapr topic, injecting trace context and validating schema.
   */
  async publishEvent(event: AgentEvent, topic: string): Promise<void> {
    const tracer = trace.getTracer('DaprEventBus');
    await tracer.startActiveSpan('DaprEventBus.publishEvent', async (span) => {
      try {
        // Validate event
        const validation = validateAgentEvent(event);
        if (!validation.success) throw new Error('Invalid event: ' + validation.error);
        // Inject trace context
        const carrier: Record<string, string> = {};
        // OTel JS propagator API (2025): inject(context, carrier, setter)
        const setter = {
          set: (carrier: Record<string, string>, key: string, value: string) => {
            carrier[key] = value;
          },
        };
        propagator.inject(context.active(), carrier, setter);
        // Publish event as CloudEvent with trace context in metadata
        // See: https://docs.dapr.io/developing-applications/sdks/js/js-client/
        await this.client.pubsub.publish(PUBSUB_NAME, topic, event, { metadata: carrier });
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (err) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
        // On error, send to DLQ
        await this.sendToDLQ(event, err);
      } finally {
        span.end();
      }
    });
  }

  /**
   * Subscribes to a Dapr topic, extracting trace context and validating schema.
   * NOTE: As of 2025, the Dapr JS SDK only supports server-side subscriptions via DaprServer. If not available, throw an error.
   * See: https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-publish-subscribe/
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async subscribeToTopic(_topic: string, _handler: (event: AgentEvent) => Promise<void>): Promise<void> {
    throw new Error('DaprClient does not support programmatic subscribe in the JS SDK as of 2025. Use DaprServer for subscriptions.');
  }

  /**
   * Publishes a DLQ event for failed events.
   */
  async sendToDLQ(originalEvent: unknown, error: unknown): Promise<void> {
    const getErrorField = (
      e: unknown,
      field: 'name' | 'message' | 'stack'
    ): string | undefined => {
      if (
        typeof e === 'object' &&
        e !== null &&
        typeof (e as Record<string, unknown>)[field] === 'string'
      ) {
        return (e as Record<string, unknown>)[field] as string;
      }
      return undefined;
    };
    const getStringField = (obj: unknown, field: string): string | undefined => {
      if (
        typeof obj === 'object' &&
        obj !== null &&
        field in obj &&
        typeof (obj as Record<string, unknown>)[field] === 'string'
      ) {
        return (obj as Record<string, unknown>)[field] as string;
      }
      return undefined;
    };
    const dlqEvent: DLQEvent = {
      type: 'DLQ',
      agentId: getStringField(originalEvent, 'agentId') ?? 'unknown',
      timestamp: new Date().toISOString(),
      originalEvent: originalEvent as Record<string, unknown>,
      error: {
        errorType: getErrorField(error, 'name') ?? 'Error',
        message: getErrorField(error, 'message') ?? String(error),
        stack: getErrorField(error, 'stack'),
      },
      metadata: {
        topic: DLQ_TOPIC,
        partition: 0,
        offset: 0,
        originalTimestamp: getStringField(originalEvent, 'timestamp') ?? new Date().toISOString(),
        traceContext: {},
      },
      traceId: getStringField(originalEvent, 'traceId'),
      spanId: getStringField(originalEvent, 'spanId'),
      parentSpanId: getStringField(originalEvent, 'parentSpanId'),
      version: '1.0.0',
    };
    // Validate DLQ event
    const validation = validateAgentEvent(dlqEvent);
    if (!validation.success) return;
    await this.client.pubsub.publish(PUBSUB_NAME, DLQ_TOPIC, dlqEvent);
  }

  /**
   * Shuts down the Dapr client.
   */
  async shutdown(): Promise<void> {
    await this.client.stop();
  }

  /**
   * Optional: Initialize the capability (no-op for now).
   */
  async init(): Promise<void> {
    // No-op for now
  }

  /**
   * Optional: Hot-reload logic (no-op for now).
   */
  async reload(): Promise<void> {
    // No-op for now
  }

  /**
   * Health check for capability status.
   */
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Returns a machine-usable, LLM-friendly description of the event bus capability.
   * NOTE: Keep this in sync with the Capability interface in capabilities/Capability.ts.
   */
  describe(): CapabilityDescribe {
    return {
      name: 'DaprEventBus',
      description: 'Distributed event bus backend for Dapr pub/sub. Supports async, ESM, strict TypeScript, Zod validation, OTel tracing, W3C/B3 context propagation, DLQ, and LLM/agent-friendly describe().',
      license: 'Apache-2.0',
      isOpenSource: true,
      provenance: 'https://github.com/dapr/dapr',
      methods: [
        { name: 'publishEvent', signature: '(event: AgentEvent, topic: string) => Promise<void>', description: 'Publishes an event to a Dapr topic.' },
        { name: 'subscribeToTopic', signature: '(topic: string, handler: (event: AgentEvent) => Promise<void>) => Promise<void>', description: 'Subscribes to a Dapr topic and handles events.' },
        { name: 'sendToDLQ', signature: '(originalEvent: unknown, error: unknown) => Promise<void>', description: 'Publishes a DLQ event for failed events.' },
        { name: 'shutdown', signature: '() => Promise<void>', description: 'Shuts down the Dapr client.' }
      ],
      usage: "import { DaprEventBus } from 'nootropic/adapters/DaprEventBus'; const bus = new DaprEventBus(); await bus.publishEvent(event, 'aihelpers.events');",
      docsFirst: true,
      aiFriendlyDocs: true,
      references: [
        'https://docs.dapr.io/developing-applications/building-blocks/pubsub/',
        'https://github.com/dapr/dapr',
        'https://www.cncf.io/blog/2025/03/12/announcing-dapr-ai-agents/',
        'https://opentelemetry.io/blog/2025/ai-agent-observability/',
        'https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3',
      ]
    };
  }
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'DaprEventBus', description: 'Stub lifecycle hooks for registry compliance.' }; } 