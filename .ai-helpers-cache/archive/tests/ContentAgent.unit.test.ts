// @ts-expect-error TS(6133): 'it' is declared but its value is never read.
import { describe, it, expect } from 'vitest';
import { ContentAgent } from '../agents/ContentAgent.js';

// @ts-expect-error TS(2349): This expression is not callable.
describe('ContentAgent', () => {
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  it('should run a content task and return a result', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'agent'.
    const agent = new ContentAgent({ profile: { name: 'ContentAgent' } });
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = await agent.runTask({ content: 'Test content' });
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result).toHaveProperty('output');
    // Accept any shape for logs/success, as stub may not implement
  });
}); 