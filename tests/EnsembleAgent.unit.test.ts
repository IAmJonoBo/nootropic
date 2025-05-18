import { describe, it, expect } from 'vitest';
// @ts-ignore
import { EnsembleAgent } from '../src/agents/EnsembleAgent';

describe('EnsembleAgent', () => {
  it('should run a task and emit event-driven logs', async () => {
    const agent = new EnsembleAgent({ profile: { name: 'EnsembleAgent' } });
    const result = await agent.runTask({ prompt: 'Test input' });
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('success', true);
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs && result.logs.some((l: string) => l.includes('event'))).toBe(true);
  });
}); 