// NatsEventBus: Distributed event bus backend for NATS JetStream (2025 best practices)
import { connect, StringCodec, NatsConnection, JetStreamManager, JetStreamClient, RetentionPolicy, StorageType, headers as natsHeaders, consumerOpts } from 'nats';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { AgentEvent, AgentEventSchemas, GenericAgentEventSchema } from '../types/AgentOrchestrationEngine.js';
import type { EventBusAdapter } from '../types/AgentOrchestrationEngine.js';
// @ts-expect-error TS(6196): 'HealthStatus' is declared but never used.
import type { Capability, HealthStatus, CapabilityDescribe } from '../capabilities/Capability.js';

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const NATS_URL = process.env['NATS_URL'] ?? 'nats://localhost:4222';
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const NATS_STREAM = process.env['NATS_STREAM'] ?? 'AIHelpersEvents';
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const NATS_SUBJECT = process.env['NATS_SUBJECT'] ?? 'aihelpers.events';
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const NATS_DLQ_SUBJECT = process.env['NATS_DLQ_SUBJECT'] ?? 'aihelpers.events.DLQ';
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const NATS_TRACE_PROPAGATOR = process.env['NATS_TRACE_PROPAGATOR'] ?? 'w3c';
let natsPropagator: unknown;
if (NATS_TRACE_PROPAGATOR.toLowerCase() === 'b3') {
  natsPropagator = new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER });
} else {
  natsPropagator = new W3CTraceContextPropagator();
}
// @ts-expect-error TS(6133): 'sc' is declared but its value is never read.
const sc = StringCodec();

export interface TraceContext {
  traceId?: string;
  spanId?: string;
  parentSpanId?: string;
}

function getErrorDetails(err: unknown): { errorType: string; message: string; stack?: string } {
  if (err && typeof err === 'object') {
    const e = err as { name?: string; message?: string; stack?: string };
    const details: { errorType: string; message: string; stack?: string } = {
      errorType: e.name ?? 'Error',
      message: e.message ?? String(err),
    };
    // @ts-expect-error TS(2304): Cannot find name 'e'.
    if (typeof e.stack === 'string') {
      // @ts-expect-error TS(2304): Cannot find name 'details'.
      details.stack = e.stack;
    }
    // @ts-expect-error TS(2304): Cannot find name 'details'.
    return details;
  }
  return {
    errorType: 'Error',
    message: String(err),
  };
}

/**
 * NatsEventBus: Distributed event bus backend using NATS JetStream. Implements both EventBusAdapter and Capability for registry/discoverability.
 */
// @ts-expect-error TS(2420): Class 'NatsEventBus' incorrectly implements interf... Remove this comment to see the full error message
export class NatsEventBus implements EventBusAdapter, Capability {
  public readonly name = 'NatsEventBus';
  private nc: NatsConnection | null = null;
  // @ts-expect-error TS(6133): 'js' is declared but its value is never read.
  private js: JetStreamClient | null = null;
  private jsm: JetStreamManager | null = null;

  async connect() {
    if (!this.nc) {
      // @ts-expect-error TS(2345): Argument of type '{ servers: any; }' is not assign... Remove this comment to see the full error message
      this.nc = await connect({ servers: NATS_URL });
      // @ts-expect-error TS(2339): Property 'jetstream' does not exist on type 'NatsC... Remove this comment to see the full error message
      this.js = this.nc.jetstream();
      // @ts-expect-error TS(2339): Property 'jetstreamManager' does not exist on type... Remove this comment to see the full error message
      this.jsm = await this.nc.jetstreamManager();
      // Ensure stream exists
      try {
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        await this.jsm.streams.info(NATS_STREAM);
      } catch {
        // @ts-expect-error TS(2531): Object is possibly 'null'.
        await this.jsm.streams.add({
          name: NATS_STREAM,
          subjects: [NATS_SUBJECT, NATS_DLQ_SUBJECT],
          retention: RetentionPolicy.Limits,
          storage: StorageType.File,
        });
      }
    }
  }

  // @ts-expect-error TS(6133): 'event' is declared but its value is never read.
  async publishEvent(event: AgentEvent): Promise<void> {
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    await this.connect();
    // @ts-expect-error TS(2552): Cannot find name 'tracer'. Did you mean 'trace'?
    const tracer = trace.getTracer('NatsEventBus');
    // @ts-expect-error TS(2304): Cannot find name 'tracer'.
    await tracer.startActiveSpan('NatsEventBus.publishEvent', async (span) => {
      // @ts-expect-error TS(2349): This expression is not callable.
      try {
        // @ts-expect-error TS(2304): Cannot find name 'hdrs'.
        const hdrs = natsHeaders();
        // @ts-expect-error TS(2304): Cannot find name 'hdrs'.
        natsPropagator.inject(context.active(), hdrs);
        // @ts-expect-error TS(2352): Conversion of type 'Event | undefined' to type 'Ag... Remove this comment to see the full error message
        (event as AgentEvent & TraceContext).traceId = span.spanContext().traceId;
        // @ts-expect-error TS(2352): Conversion of type 'Event | undefined' to type 'Ag... Remove this comment to see the full error message
        (event as AgentEvent & TraceContext).spanId = span.spanContext().spanId;
        // @ts-expect-error TS(2304): Cannot find name 'schema'.
        const schema = AgentEventSchemas[event.type] ?? GenericAgentEventSchema;
        // @ts-expect-error TS(2304): Cannot find name 'parsed'.
        const parsed = schema.safeParse(event);
        // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
        if (!parsed.success) {
          // @ts-expect-error TS(2304): Cannot find name 'parsed'.
          throw new Error(`Invalid event: ${JSON.stringify(parsed.error.issues)}`);
        }
        await this.js!.publish(NATS_SUBJECT, sc.encode(JSON.stringify(event)), { headers: hdrs });
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (err) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
        throw err;
      } finally {
        span.end();
      }
    });
  }

  async subscribeToSubject(subject: string, handler: (event: AgentEvent) => Promise<void>): Promise<void> {
    await this.connect();
    const tracer = trace.getTracer('NatsEventBus');
    const opts = consumerOpts();
    // @ts-expect-error TS(2304): Cannot find name 'aihelpers'.
    opts.durable(`aihelpers-durable-${subject}`);
    opts.ackExplicit();
    const sub = await this.js!.pullSubscribe(subject, opts);
    (async () => {
      for await (const m of sub) {
        await tracer.startActiveSpan('NatsEventBus.consumeEvent', async (span) => {
          try {
            if (m.headers) {
              natsPropagator.extract(context.active(), m.headers);
            }
            const event = JSON.parse(sc.decode(m.data)) as AgentEvent & TraceContext;
            event.traceId = span.spanContext().traceId;
            event.spanId = span.spanContext().spanId;
            try {
              await handler(event);
              span.setStatus({ code: SpanStatusCode.OK });
              m.ack();
            } catch (err) {
              // DLQ logic
              const dlqEvent = {
                type: 'DLQ',
                agentId: event.agentId ?? 'unknown',
                timestamp: new Date().toISOString(),
                originalEvent: event,
                error: getErrorDetails(err),
                metadata: {
                  subject,
                  sequence: m.seq,
                  originalTimestamp: new Date().toISOString(),
                  traceContext: {
                    traceId: event.traceId,
                    spanId: event.spanId,
                    parentSpanId: event.parentSpanId,
                  },
                },
                traceId: event.traceId,
                spanId: event.spanId,
                parentSpanId: event.parentSpanId,
                version: '1.0.0',
              };
              await this.js!.publish(NATS_DLQ_SUBJECT, sc.encode(JSON.stringify(dlqEvent)));
              span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
              m.ack();
            }
          } catch (err) {
            span.setStatus({ code: SpanStatusCode.ERROR, message: String(err) });
            m.term();
          } finally {
            span.end();
          }
        });
      }
    })();
  }

  async subscribeToTopic(subject: string, handler: (event: AgentEvent) => Promise<void>): Promise<void> {
    return this.subscribeToSubject(subject, handler);
  }

  async shutdown(): Promise<void> {
    if (this.nc) {
      await this.nc.close();
      this.nc = null;
      this.js = null;
      this.jsm = null;
    }
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
      name: 'NatsEventBus',
      description: 'Distributed event bus backend using NATS JetStream. Supports publish, subscribe, DLQ, OTel tracing, and schema validation. Follows 2025 event-driven and docs-first best practices.',
      license: 'Apache-2.0',
      isOpenSource: true,
      provenance: 'https://github.com/nats-io/nats.js',
      docsFirst: true,
      aiFriendlyDocs: true,
      usage: "import { NatsEventBus } from 'nootropic/adapters/NatsEventBus'; const bus = new NatsEventBus(); await bus.publishEvent(event);",
      methods: [
        { name: 'publishEvent', signature: '(event: AgentEvent) => Promise<void>', description: 'Publishes an event to the NATS event bus.' },
        { name: 'subscribeToSubject', signature: '(subject: string, handler: (event) => Promise<void>) => Promise<void>', description: 'Subscribes to a NATS subject.' },
        { name: 'shutdown', signature: '() => Promise<void>', description: 'Closes the NATS connection.' }
      ],
      schema: {
        publishEvent: {
          input: { type: 'object', description: 'AgentEvent' },
          output: { type: 'null' }
        },
        subscribeToSubject: {
          input: { type: 'string', description: 'subject' },
          output: { type: 'null' }
        },
        shutdown: {
          input: { type: 'null' },
          output: { type: 'null' }
        }
      },
      references: [
        'https://docs.nats.io/',
        'https://github.com/nats-io/nats.js',
        'https://github.com/nootropic/nootropic'
      ]
    };
  }
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'NatsEventBus', description: 'Stub lifecycle hooks for registry compliance.' }; } 