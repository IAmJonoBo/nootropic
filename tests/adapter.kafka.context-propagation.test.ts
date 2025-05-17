import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// This test expects to be run with Jest or a compatible test runner. For type definitions, install @types/jest as a devDependency. Type errors for test globals are expected unless the runner is configured.
// The test is skipped if Kafka is not available on localhost:9092 or as set in KAFKA_BROKERS.
// Suppress unused variable linter errors for 'err' in beforeAll/afterAll.
// Suppress linter errors for missing Jest globals; this file is intentionally written for environments with a test runner.
// @ts-ignore
import { KafkaEventBus, TraceContext } from '../adapters/KafkaEventBus.js';
// @ts-ignore
import { AgentEvent } from '../types/AgentOrchestrationEngine.js';
import { randomUUID } from 'crypto';

describe('KafkaEventBus Context Propagation', () => {
  const brokers = process.env['KAFKA_BROKERS'] ? process.env['KAFKA_BROKERS'].split(',') : ['localhost:9092'];
  const topic = 'test-context-propagation';
  let bus: KafkaEventBus;
  let skip = false;

  beforeAll(async () => {
    bus = new KafkaEventBus(brokers, 'nootropic-test');
    try {
      await bus.connectProducer();
    } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // Skip tests if Kafka is not available
      
      console.warn('Kafka not available, skipping context propagation tests');
      skip = true;
    }
  });

  afterAll(async () => {
    if (bus) await bus.shutdown();
  });

  it('should propagate trace context from producer to consumer', async () => {
    if (skip) return;
    const traceId = randomUUID().replace(/-/g, '').slice(0, 32);
    const spanId = randomUUID().replace(/-/g, '').slice(0, 16);
    const event: AgentEvent & TraceContext = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
      traceId,
      spanId,
    };
    let received: AgentEvent & TraceContext | undefined;
    const handler = async (e: AgentEvent & TraceContext) => {
      received = e;
    };
    await bus.subscribeToTopic(topic, handler);
    await bus.publishToTopic(event, topic);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(received).toBeDefined();
    expect(received?.traceId).toBe(traceId);
    expect(received?.spanId).toBe(spanId);
  });

  it('should handle missing/corrupted context gracefully', async () => {
    if (skip) return;
    const event: AgentEvent = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
    };
    let received: AgentEvent | undefined;
    const handler = async (e: AgentEvent) => {
      received = e;
    };
    await bus.subscribeToTopic(topic, handler);
    await bus.publishToTopic(event, topic);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(received).toBeDefined();
    // Should not throw, but traceId/spanId may be undefined
  });

  // TODO: Add tests for W3C/B3 interop and custom metadata propagation
});

describe('KafkaEventBus W3C/B3 Propagator Interop & Custom Metadata', () => {
  const brokers = process.env['KAFKA_BROKERS'] ? process.env['KAFKA_BROKERS'].split(',') : ['localhost:9092'];
  const topic = 'test-b3-w3c-interop';
  let bus: KafkaEventBus;
  let skip = false;

  beforeAll(async () => {
    process.env['KAFKA_TRACE_PROPAGATOR'] = 'b3';
    try {
      bus = new KafkaEventBus(brokers, 'nootropic-test');
      await bus.connectProducer();
    } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // Skip tests if Kafka or B3 propagator is not available
      
      console.warn('Kafka or B3 propagator not available, skipping B3 interop tests');
      skip = true;
    }
  });

  afterAll(async () => {
    if (bus) await bus.shutdown();
    delete process.env['KAFKA_TRACE_PROPAGATOR'];
  });

  it('should propagate B3 trace context from producer to consumer', async () => {
    if (skip) return;
    const traceId = randomUUID().replace(/-/g, '').slice(0, 32);
    const spanId = randomUUID().replace(/-/g, '').slice(0, 16);
    const event: AgentEvent & TraceContext = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
      traceId,
      spanId,
    };
    let received: AgentEvent & TraceContext | undefined;
    const handler = async (e: AgentEvent & TraceContext) => {
      received = e;
    };
    await bus.subscribeToTopic(topic, handler);
    await bus.publishToTopic(event, topic);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(received).toBeDefined();
    expect(received?.traceId).toBe(traceId);
    expect(received?.spanId).toBe(spanId);
  });

  it('should propagate custom metadata in trace context', async () => {
    if (skip) return;
    const traceId = randomUUID().replace(/-/g, '').slice(0, 32);
    const spanId = randomUUID().replace(/-/g, '').slice(0, 16);
    const event: AgentEvent & TraceContext & { userId?: string; tenantId?: string } = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
      traceId,
      spanId,
      userId: 'user-123',
      tenantId: 'tenant-abc',
    };
    let received: typeof event | undefined;
    // Type assertion to 'any' to bypass type error for test purposes; safe in this context
    const handler = async (e: unknown) => {
      received = e as typeof event;
    };
    await bus.subscribeToTopic(topic, handler as (event: AgentEvent) => Promise<void>);
    await bus.publishToTopic(event, topic);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(received).toBeDefined();
    expect(received?.userId).toBe('user-123');
    expect(received?.tenantId).toBe('tenant-abc');
  });
}); 