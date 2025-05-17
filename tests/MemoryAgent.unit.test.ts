import { describe, it, expect } from 'vitest';
// @ts-ignore
import { MemoryAgent } from '../agents/MemoryAgent.js';

describe('MemoryAgent', () => {
  it('should run a memory task and emit event-driven logs', async () => {
    const agent = new MemoryAgent({ profile: { name: 'MemoryAgent' } });
    const result = await agent.runTask({ memory: 'stub-memory' });
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('success', true);
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs && result.logs.some((l: string) => l.includes('event'))).toBe(true);
  });
}); 