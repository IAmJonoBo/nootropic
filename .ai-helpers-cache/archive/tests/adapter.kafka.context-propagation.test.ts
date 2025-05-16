// @ts-expect-error TS(6133): 'beforeAll' is declared but its value is never rea... Remove this comment to see the full error message
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// This test expects to be run with Jest or a compatible test runner. For type definitions, install @types/jest as a devDependency. Type errors for test globals are expected unless the runner is configured.
// The test is skipped if Kafka is not available on localhost:9092 or as set in KAFKA_BROKERS.
// Suppress unused variable linter errors for 'err' in beforeAll/afterAll.
// Suppress linter errors for missing Jest globals; this file is intentionally written for environments with a test runner.
import { KafkaEventBus, TraceContext } from '../adapters/KafkaEventBus.js';
import { AgentEvent } from '../types/AgentOrchestrationEngine.js';
// @ts-expect-error TS(2307): Cannot find module 'crypto' or its corresponding t... Remove this comment to see the full error message
import { randomUUID } from 'crypto';

// @ts-expect-error TS(2349): This expression is not callable.
describe('KafkaEventBus Context Propagation', () => {
  // @ts-expect-error TS(2304): Cannot find name 'brokers'.
  const brokers = process.env['KAFKA_BROKERS'] ? process.env['KAFKA_BROKERS'].split(',') : ['localhost:9092'];
  // @ts-expect-error TS(2304): Cannot find name 'topic'.
  const topic = 'test-context-propagation';
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let bus: KafkaEventBus;
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let skip = false;

  // @ts-expect-error TS(6133): 'async' is declared but its value is never read.
  beforeAll(async () => {
    // @ts-expect-error TS(2304): Cannot find name 'brokers'.
    bus = new KafkaEventBus(brokers, 'nootropic-test');
    try {
      // @ts-expect-error TS(2304): Cannot find name 'bus'.
      await bus.connectProducer();
    // @ts-expect-error TS(7006): Parameter '_err' implicitly has an 'any' type.
    } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // Skip tests if Kafka is not available
       
      console.warn('Kafka not available, skipping context propagation tests');
      // @ts-expect-error TS(2304): Cannot find name 'skip'.
      skip = true;
    }
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  afterAll(async () => {
    // @ts-expect-error TS(6133): 'bus' is declared but its value is never read.
    if (bus) await bus.shutdown();
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('should propagate trace context from producer to consumer', async () => {
    // @ts-expect-error TS(6133): 'skip' is declared but its value is never read.
    if (skip) return;
    // @ts-expect-error TS(2304): Cannot find name 'traceId'.
    const traceId = randomUUID().replace(/-/g, '').slice(0, 32);
    // @ts-expect-error TS(2304): Cannot find name 'spanId'.
    const spanId = randomUUID().replace(/-/g, '').slice(0, 16);
    // @ts-expect-error TS(2693): 'AgentEvent' only refers to a type, but is being u... Remove this comment to see the full error message
    const event: AgentEvent & TraceContext = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      traceId,
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      spanId,
    };
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'received'.
    let received: AgentEvent & TraceContext | undefined;
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handler'.
    const handler = async (e: AgentEvent & TraceContext) => {
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      received = e;
    };
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.subscribeToTopic(topic, handler);
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.publishToTopic(event, topic);
    // Wait for message to be consumed
    // @ts-expect-error TS(2304): Cannot find name 'resolve'.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // @ts-expect-error TS(2339): Property 'toBeDefined' does not exist on type 'Ass... Remove this comment to see the full error message
    expect(received).toBeDefined();
    // @ts-expect-error TS(2339): Property 'toBe' does not exist on type 'Assertion<... Remove this comment to see the full error message
    expect(received?.traceId).toBe(traceId);
    // @ts-expect-error TS(2339): Property 'toBe' does not exist on type 'Assertion<... Remove this comment to see the full error message
    expect(received?.spanId).toBe(spanId);
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('should handle missing/corrupted context gracefully', async () => {
    // @ts-expect-error TS(6133): 'skip' is declared but its value is never read.
    if (skip) return;
    const event: AgentEvent = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
    };
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let received: AgentEvent | undefined;
    // @ts-expect-error TS(2588): Cannot assign to 'handler' because it is a constan... Remove this comment to see the full error message
    const handler = async (e: AgentEvent) => {
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      received = e;
    };
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.subscribeToTopic(topic, handler);
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.publishToTopic(event, topic);
    // @ts-expect-error TS(2304): Cannot find name 'resolve'.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // @ts-expect-error TS(2339): Property 'toBeDefined' does not exist on type 'Ass... Remove this comment to see the full error message
    expect(received).toBeDefined();
    // Should not throw, but traceId/spanId may be undefined
  });

  // TODO: Add tests for W3C/B3 interop and custom metadata propagation
});

// @ts-expect-error TS(2349): This expression is not callable.
describe('KafkaEventBus W3C/B3 Propagator Interop & Custom Metadata', () => {
  // @ts-expect-error TS(2304): Cannot find name 'brokers'.
  const brokers = process.env['KAFKA_BROKERS'] ? process.env['KAFKA_BROKERS'].split(',') : ['localhost:9092'];
  // @ts-expect-error TS(2304): Cannot find name 'topic'.
  const topic = 'test-b3-w3c-interop';
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let bus: KafkaEventBus;
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let skip = false;

  // @ts-expect-error TS(6133): 'async' is declared but its value is never read.
  beforeAll(async () => {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env['KAFKA_TRACE_PROPAGATOR'] = 'b3';
    try {
      // @ts-expect-error TS(2304): Cannot find name 'brokers'.
      bus = new KafkaEventBus(brokers, 'nootropic-test');
      // @ts-expect-error TS(2304): Cannot find name 'bus'.
      await bus.connectProducer();
    // @ts-expect-error TS(7006): Parameter '_err' implicitly has an 'any' type.
    } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      // Skip tests if Kafka or B3 propagator is not available
       
      console.warn('Kafka or B3 propagator not available, skipping B3 interop tests');
      // @ts-expect-error TS(2304): Cannot find name 'skip'.
      skip = true;
    }
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  afterAll(async () => {
    // @ts-expect-error TS(6133): 'bus' is declared but its value is never read.
    if (bus) await bus.shutdown();
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env['KAFKA_TRACE_PROPAGATOR'];
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('should propagate B3 trace context from producer to consumer', async () => {
    // @ts-expect-error TS(6133): 'skip' is declared but its value is never read.
    if (skip) return;
    // @ts-expect-error TS(2304): Cannot find name 'traceId'.
    const traceId = randomUUID().replace(/-/g, '').slice(0, 32);
    // @ts-expect-error TS(2304): Cannot find name 'spanId'.
    const spanId = randomUUID().replace(/-/g, '').slice(0, 16);
    // @ts-expect-error TS(2693): 'AgentEvent' only refers to a type, but is being u... Remove this comment to see the full error message
    const event: AgentEvent & TraceContext = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      traceId,
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      spanId,
    };
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'received'.
    let received: AgentEvent & TraceContext | undefined;
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handler'.
    const handler = async (e: AgentEvent & TraceContext) => {
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      received = e;
    };
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.subscribeToTopic(topic, handler);
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.publishToTopic(event, topic);
    // @ts-expect-error TS(2304): Cannot find name 'resolve'.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // @ts-expect-error TS(2339): Property 'toBeDefined' does not exist on type 'Ass... Remove this comment to see the full error message
    expect(received).toBeDefined();
    // @ts-expect-error TS(2339): Property 'toBe' does not exist on type 'Assertion<... Remove this comment to see the full error message
    expect(received?.traceId).toBe(traceId);
    // @ts-expect-error TS(2339): Property 'toBe' does not exist on type 'Assertion<... Remove this comment to see the full error message
    expect(received?.spanId).toBe(spanId);
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('should propagate custom metadata in trace context', async () => {
    // @ts-expect-error TS(6133): 'skip' is declared but its value is never read.
    if (skip) return;
    // @ts-expect-error TS(2304): Cannot find name 'traceId'.
    const traceId = randomUUID().replace(/-/g, '').slice(0, 32);
    // @ts-expect-error TS(2304): Cannot find name 'spanId'.
    const spanId = randomUUID().replace(/-/g, '').slice(0, 16);
    // @ts-expect-error TS(2693): 'AgentEvent' only refers to a type, but is being u... Remove this comment to see the full error message
    const event: AgentEvent & TraceContext & { userId?: string; tenantId?: string } = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      traceId,
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      spanId,
      userId: 'user-123',
      tenantId: 'tenant-abc',
    };
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'received'.
    let received: typeof event | undefined;
    // Type assertion to 'any' to bypass type error for test purposes; safe in this context
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handler'.
    const handler = async (e: unknown) => {
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      received = e;
    };
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.subscribeToTopic(topic, handler as (event: AgentEvent) => Promise<void>);
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.publishToTopic(event, topic);
    // @ts-expect-error TS(2304): Cannot find name 'resolve'.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // @ts-expect-error TS(2339): Property 'toBeDefined' does not exist on type 'Ass... Remove this comment to see the full error message
    expect(received).toBeDefined();
    // @ts-expect-error TS(2339): Property 'userId' does not exist on type 'AgentEve... Remove this comment to see the full error message
    expect(received?.userId).toBe('user-123');
    // @ts-expect-error TS(2339): Property 'tenantId' does not exist on type 'AgentE... Remove this comment to see the full error message
    expect(received?.tenantId).toBe('tenant-abc');
  });
}); 