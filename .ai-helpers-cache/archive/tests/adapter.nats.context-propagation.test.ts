// @ts-expect-error TS(6133): 'beforeAll' is declared but its value is never rea... Remove this comment to see the full error message
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// @ts-nocheck
// This test expects to be run with Jest or a compatible test runner. Type errors for test globals (describe, it, expect, beforeAll, afterAll) can be ignored if the runner is configured.
import { NatsEventBus, TraceContext } from '../adapters/NatsEventBus.js';
// @ts-expect-error TS(2307): Cannot find module 'crypto' or its corresponding t... Remove this comment to see the full error message
import { randomUUID } from 'crypto';
import { AgentEvent } from '../types/AgentOrchestrationEngine.js';

// @ts-expect-error TS(2349): This expression is not callable.
describe('NatsEventBus Context Propagation', () => {
  // @ts-expect-error TS(2304): Cannot find name 'subject'.
  const subject = process.env['NATS_SUBJECT'] ?? 'aihelpers.events';
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let bus: NatsEventBus;
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let skip = false;

  // @ts-expect-error TS(6133): 'async' is declared but its value is never read.
  beforeAll(async () => {
    try {
      bus = new NatsEventBus();
      // @ts-expect-error TS(2304): Cannot find name 'bus'.
      await bus.connect();
    } catch {
      // Skip tests if NATS is not available
      console.warn('NATS not available, skipping NATS context propagation tests');
      skip = true;
    }
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  afterAll(async () => {
    // @ts-expect-error TS(6133): 'bus' is declared but its value is never read.
    if (bus && bus.shutdown) await bus.shutdown();
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('should propagate trace context from publisher to subscriber', async () => {
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
    await bus.subscribeToSubject(subject, handler);
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.publishEvent(event);
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
    await bus.subscribeToSubject(subject, handler);
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.publishEvent(event);
    // @ts-expect-error TS(2304): Cannot find name 'resolve'.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // @ts-expect-error TS(2339): Property 'toBeDefined' does not exist on type 'Ass... Remove this comment to see the full error message
    expect(received).toBeDefined();
    // Should not throw, but traceId/spanId may be undefined
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
    // @ts-expect-error TS(2451): Cannot redeclare block-scoped variable 'handler'.
    const handler = async (e: typeof event) => {
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      received = e;
    };
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.subscribeToSubject(subject, handler);
    // @ts-expect-error TS(2304): Cannot find name 'bus'.
    await bus.publishEvent(event);
    // @ts-expect-error TS(2304): Cannot find name 'resolve'.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // @ts-expect-error TS(2339): Property 'toBeDefined' does not exist on type 'Ass... Remove this comment to see the full error message
    expect(received).toBeDefined();
    // @ts-expect-error TS(2339): Property 'userId' does not exist on type 'AgentEve... Remove this comment to see the full error message
    expect(received?.userId).toBe('user-123');
    // @ts-expect-error TS(2339): Property 'tenantId' does not exist on type 'AgentE... Remove this comment to see the full error message
    expect(received?.tenantId).toBe('tenant-abc');
  });

  // TODO: Add tests for W3C/B3 interop and custom propagator config
}); 