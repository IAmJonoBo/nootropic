import { describe, it, expect } from 'vitest';
// @ts-ignore
import { ReviewAgent } from '../agents/ReviewAgent.js';

describe('ReviewAgent', () => {
  it('should run a review task and emit event-driven logs', async () => {
    const agent = new ReviewAgent({ profile: { name: 'ReviewAgent' } });
    const result = await agent.runTask({ id: 't1', description: 'Test review', content: 'This is a test content.' });
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('success', true);
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs && result.logs.some((l: string) => l.includes('review'))).toBe(true);
  });
}); 