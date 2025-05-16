// @ts-expect-error TS(6133): 'it' is declared but its value is never read.
import { describe, it, expect } from 'vitest';
// @ts-expect-error TS(2305): Module '"../utils/context/shimiMemory.js"' has no ... Remove this comment to see the full error message
import { ShimiMemory } from '../utils/context/shimiMemory.js';

describe('ShimiMemory', () => {
  // @ts-expect-error TS(2304): Cannot find name 'MockBackend'.
  class MockBackend {
    name = 'mock';
    // @ts-expect-error TS(6133): 'text' is declared but its value is never read.
    async embedText(text: string): Promise<number[]> {
      // Return a deterministic embedding for testing
      // @ts-expect-error TS(2552): Cannot find name 'text'. Did you mean 'Text'?
      return text.split('').map((c) => c.charCodeAt(0) / 100);
    }
    // @ts-expect-error TS(2304): Cannot find name 'async'.
    async similarity(a: string, b: string) {
      // @ts-expect-error TS(6133): 'a' is declared but its value is never read.
      if (a === b) return 1;
      // @ts-expect-error TS(2304): Cannot find name 'a'.
      if (a.includes(b) ?? b.includes(a)) return 0.8;
      return 0.1;
    }
    // @ts-expect-error TS(2304): Cannot find name 'async'.
    async mergeConcepts(a: string, b: string, parent?: string) {
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      return `Merged(${a},${b}${parent ? ',' + parent : ''})`;
    }
  }

  it('inserts entities and builds semantic tree', async () => {
    const shimi = new ShimiMemory({ backend: new MockBackend() });
    await shimi.insertEntity({ concept: 'root', explanation: 'child1' });
    await shimi.insertEntity({ concept: 'root', explanation: 'child2' });
    await shimi.insertEntity({ concept: 'root', explanation: 'child1' });
    const results = await shimi.retrieveEntities('child1');
    expect(results.length).toBeGreaterThan(0);
  });

  it('retrieves entities by semantic query', async () => {
    const shimi = new ShimiMemory({ backend: new MockBackend() });
    await shimi.insertEntity({ concept: 'root', explanation: 'alpha' });
    await shimi.insertEntity({ concept: 'root', explanation: 'beta' });
    const results = await shimi.retrieveEntities('alpha');
    expect(results.some(e => e.explanation === 'alpha')).toBe(true);
  });

  it('merges trees with CRDT logic (idempotence)', async () => {
    const shimiA = new ShimiMemory({ backend: new MockBackend() });
    const shimiB = new ShimiMemory({ backend: new MockBackend() });
    await shimiA.insertEntity({ concept: 'root', explanation: 'x' });
    await shimiB.insertEntity({ concept: 'root', explanation: 'x' });
    await shimiA.crdtMerge(shimiB);
    await shimiB.crdtMerge(shimiA);
    const resultsA = await shimiA.retrieveEntities('x');
    const resultsB = await shimiB.retrieveEntities('x');
    expect(resultsA.length).toEqual(resultsB.length);
  });

  it('merges trees with CRDT logic (commutativity)', async () => {
    const shimiA = new ShimiMemory({ backend: new MockBackend() });
    const shimiB = new ShimiMemory({ backend: new MockBackend() });
    await shimiA.insertEntity({ concept: 'root', explanation: 'a' });
    await shimiB.insertEntity({ concept: 'root', explanation: 'b' });
    await shimiA.crdtMerge(shimiB);
    await shimiB.crdtMerge(shimiA);
    const resultsA = await shimiA.retrieveEntities('a');
    const resultsB = await shimiB.retrieveEntities('a');
    expect(resultsA.length).toEqual(resultsB.length);
  });

  it('merges trees with CRDT logic (associativity)', async () => {
    const shimiA = new ShimiMemory({ backend: new MockBackend() });
    const shimiB = new ShimiMemory({ backend: new MockBackend() });
    const shimiC = new ShimiMemory({ backend: new MockBackend() });
    await shimiA.insertEntity({ concept: 'root', explanation: 'a' });
    await shimiB.insertEntity({ concept: 'root', explanation: 'b' });
    await shimiC.insertEntity({ concept: 'root', explanation: 'c' });
    await shimiA.crdtMerge(shimiB);
    await shimiA.crdtMerge(shimiC);
    await shimiB.crdtMerge(shimiC);
    await shimiB.crdtMerge(shimiA);
    const resultsA = await shimiA.retrieveEntities('c');
    const resultsB = await shimiB.retrieveEntities('c');
    expect(resultsA.length).toEqual(resultsB.length);
  });

  it('supports pluggable backend', async () => {
    const shimi = new ShimiMemory({ backend: new MockBackend() });
    await shimi.insertEntity({ concept: 'foo', explanation: 'bar' });
    const results = await shimi.retrieveEntities('bar');
    expect(results.length).toBeGreaterThan(0);
  });

  it('handles empty and duplicate cases', async () => {
    const shimi = new ShimiMemory({ backend: new MockBackend() });
    const results = await shimi.retrieveEntities('none');
    expect(results.length).toBe(0);
    await shimi.insertEntity({ concept: 'dup', explanation: 'dup' });
    await shimi.insertEntity({ concept: 'dup', explanation: 'dup' });
    const results2 = await shimi.retrieveEntities('dup');
    expect(results2.length).toBeGreaterThan(0);
  });

  it('integrates with FeedbackAgent/ContextManager for distributed aggregation', async () => {
    const shimi = new ShimiMemory({ backend: new MockBackend() });
    // Simulate rationale events
    await shimi.insertEntity({ concept: 'task1', explanation: 'reason step 1', correlationId: 'task1' });
    await shimi.insertEntity({ concept: 'task1', explanation: 'reason step 2', correlationId: 'task1' });
    await shimi.insertEntity({ concept: 'task1', explanation: 'mutation step', correlationId: 'task1' });
    // Simulate context events
    await shimi.insertEntity({ concept: 'pruneContext', explanation: 'pruned old context', timestamp: Date.now() });
    // Query must match concept or explanation. Use 'reason' to match inserted explanations.
    const rationaleResults = await shimi.retrieveEntities('reason');
    const contextResults = await shimi.retrieveEntities('pruned');
    expect(rationaleResults.length).toBeGreaterThan(0);
    expect(contextResults.length).toBeGreaterThan(0);
  });
}); 