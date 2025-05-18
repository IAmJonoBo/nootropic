import { describe, it, expect } from 'vitest';
// @ts-ignore
import { FormalVerifierAgent } from '../src/agents/FormalVerifierAgent';

describe('FormalVerifierAgent', () => {
  it('should run a formal verification task and emit event-driven logs', async () => {
    const agent = new FormalVerifierAgent({ profile: { name: 'FormalVerifierAgent' } });
    const result = await agent.runTask();
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('success', true);
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs && result.logs.some((l: string) => l.includes('event'))).toBe(true);
  });
}); 