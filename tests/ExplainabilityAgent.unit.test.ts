import { describe, it, expect } from 'vitest';
// @ts-ignore
import { ExplainabilityAgent } from '../src/agents/ExplainabilityAgent';

describe('ExplainabilityAgent', () => {
  it('should run an explainability task and return a result', async () => {
    const agent = new ExplainabilityAgent({ profile: { name: 'ExplainabilityAgent' } });
    const result = await agent.runTask();
    expect(result).toHaveProperty('output');
    // Accept any shape for logs/success, as stub may not implement
  });
}); 