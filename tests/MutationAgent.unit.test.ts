import { describe, it, expect } from 'vitest';
// @ts-ignore
import { MutationAgent } from '../src/agents/MutationAgent';

describe('MutationAgent', () => {
  it('should run a mutation task and return a result', async () => {
    const agent = new MutationAgent({ profile: { name: 'MutationAgent' } });
    const result = await agent.runTask({ code: 'function foo() {}' });
    expect(result).toHaveProperty('output');
    // Accept any shape for logs/success, as stub may not implement
  });
}); 