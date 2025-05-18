import { describe, it, expect } from 'vitest';
// @ts-ignore
import { MultimodalAgent } from '../src/agents/MultimodalAgent';

describe('MultimodalAgent', () => {
  it('should run a multimodal task and emit event-driven logs', async () => {
    const agent = new MultimodalAgent({ profile: { name: 'MultimodalAgent' } });
    const result = await agent.runTask({ type: 'image', data: 'stub-image-data' });
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('success', true);
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs && result.logs.some((l: string) => l.includes('event'))).toBe(true);
  });
}); 