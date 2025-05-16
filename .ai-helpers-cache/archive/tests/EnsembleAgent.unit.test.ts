// @ts-expect-error TS(6133): 'it' is declared but its value is never read.
import { describe, it, expect } from 'vitest';
// @ts-expect-error TS(2305): Module '"../agents/EnsembleAgent.js"' has no expor... Remove this comment to see the full error message
import { EnsembleAgent } from '../agents/EnsembleAgent.js';

// @ts-expect-error TS(2349): This expression is not callable.
describe('EnsembleAgent', () => {
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  it('should run a task and emit event-driven logs', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'agent'.
    const agent = new EnsembleAgent({ profile: { name: 'EnsembleAgent' } });
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = await agent.runTask({ prompt: 'Test input' });
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result).toHaveProperty('output');
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result).toHaveProperty('success', true);
    // @ts-expect-error TS(6133): 'Array' is declared but its value is never read.
    expect(Array.isArray(result.logs)).toBe(true);
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    expect(result.logs && result.logs.some((l: string) => l.includes('event'))).toBe(true);
  });
}); 