// @ts-expect-error TS(6133): 'it' is declared but its value is never read.
import { describe, it, expect } from 'vitest';
import { ExplainabilityAgent } from '../agents/ExplainabilityAgent.js';

// @ts-expect-error TS(2349): This expression is not callable.
describe('ExplainabilityAgent', () => {
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  it('should run an explainability task and return a result', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'agent'.
    const agent = new ExplainabilityAgent({ profile: { name: 'ExplainabilityAgent' } });
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = await agent.runTask({ input: 'Explain this code' });
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result).toHaveProperty('output');
    // Accept any shape for logs/success, as stub may not implement
  });
}); 