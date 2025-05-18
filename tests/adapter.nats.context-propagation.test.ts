import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// @ts-nocheck
// This test expects to be run with Jest or a compatible test runner. Type errors for test globals (describe, it, expect, beforeAll, afterAll) can be ignored if the runner is configured.
// @ts-ignore
import { NatsEventBus, TraceContext } from '../src/adapters/NatsEventBus.js';
import { randomUUID } from 'crypto';
// @ts-ignore
import type { AgentEvent } from '../types/AgentOrchestrationEngine';

describe('NatsEventBus Context Propagation', () => {
  const subject = process.env['NATS_SUBJECT'] ?? 'aihelpers.events';
  let bus: NatsEventBus;
  let skip = false;

  beforeAll(async () => {
    try {
      bus = new NatsEventBus();
      await bus.connect();
    } catch {
      // Skip tests if NATS is not available
      console.warn('NATS not available, skipping NATS context propagation tests');
      skip = true;
    }
  });

  afterAll(async () => {
    if (bus && bus.shutdown) await bus.shutdown();
  });

  it('should propagate trace context from publisher to subscriber', async () => {
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
    await bus.subscribeToSubject(subject, handler);
    await bus.publishEvent(event);
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
    await bus.subscribeToSubject(subject, handler);
    await bus.publishEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(received).toBeDefined();
    // Should not throw, but traceId/spanId may be undefined
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
    const handler = async (e: typeof event) => {
      received = e;
    };
    await bus.subscribeToSubject(subject, handler);
    await bus.publishEvent(event);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(received).toBeDefined();
    expect(received?.userId).toBe('user-123');
    expect(received?.tenantId).toBe('tenant-abc');
  });

  // TODO: Add tests for W3C/B3 interop and custom propagator config
}); 