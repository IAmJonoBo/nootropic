// @ts-expect-error TS(6133): 'it' is declared but its value is never read.
import { describe, it, expect } from 'vitest';
import { SupervisorAgent } from '../agents/SupervisorAgent.js';

// @ts-expect-error TS(2349): This expression is not callable.
describe('SupervisorAgent', () => {
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  it('should run a supervision task and emit event-driven logs', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'agent'.
    const agent = new SupervisorAgent({ profile: { name: 'SupervisorAgent' } });
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = await agent.runTask({ subAgents: ['A1', 'A2'], metrics: [0.1, 0.2, 0.3] });
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