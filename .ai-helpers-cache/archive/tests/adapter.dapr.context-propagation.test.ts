// @ts-nocheck
// This test expects to be run with Jest or a compatible test runner. Type errors for test globals (describe, it, expect, beforeAll, afterAll) can be ignored if the runner is configured.
import { DaprEventBus } from '../adapters/DaprEventBus.js';
import { randomUUID } from 'crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// NOTE: Skipped due to DaprClient JS SDK limitation (no programmatic subscribe). TODO: Re-enable when DaprServer supports subscriptions in JS SDK.
describe.skip('DaprEventBus Context Propagation', () => {
  const topic = process.env.DAPR_TOPIC ?? 'aihelpers.events';
  let bus;
  let skip = false;

  beforeAll(async () => {
    try {
      bus = new DaprEventBus();
      // Optionally check Dapr sidecar health here
    } catch {
      // Skip tests if Dapr is not available
      console.warn('Dapr not available, skipping Dapr context propagation tests');
      skip = true;
    }
  });

  afterAll(async () => {
    // No shutdown needed for DaprEventBus
  });

  it('should propagate trace context from publisher to subscriber', async () => {
    if (skip) return;
    const traceId = randomUUID().replace(/-/g, '').slice(0, 32);
    const spanId = randomUUID().replace(/-/g, '').slice(0, 16);
    const event = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
      traceId,
      spanId,
    };
    let received;
    const handler = async (e) => {
      received = e;
    };
    await bus.subscribeToTopic(topic, handler);
    await bus.publishEvent(event, topic);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(received).toBeDefined();
    expect(received?.traceId).toBe(traceId);
    expect(received?.spanId).toBe(spanId);
  });

  it('should handle missing/corrupted context gracefully', async () => {
    if (skip) return;
    const event = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
    };
    let received;
    const handler = async (e) => {
      received = e;
    };
    await bus.subscribeToTopic(topic, handler);
    await bus.publishEvent(event, topic);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(received).toBeDefined();
    // Should not throw, but traceId/spanId may be undefined
  });

  it('should propagate custom metadata in trace context', async () => {
    if (skip) return;
    const traceId = randomUUID().replace(/-/g, '').slice(0, 32);
    const spanId = randomUUID().replace(/-/g, '').slice(0, 16);
    const event = {
      type: 'TestEvent',
      agentId: 'test-agent',
      timestamp: new Date().toISOString(),
      payload: { foo: 'bar' },
      traceId,
      spanId,
      userId: 'user-123',
      tenantId: 'tenant-abc',
    };
    let received;
    const handler = async (e) => {
      received = e;
    };
    await bus.subscribeToTopic(topic, handler);
    await bus.publishEvent(event, topic);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    expect(received).toBeDefined();
    expect(received?.userId).toBe('user-123');
    expect(received?.tenantId).toBe('tenant-abc');
  });

  // TODO: Add tests for W3C/B3 interop and custom propagator config
}); 