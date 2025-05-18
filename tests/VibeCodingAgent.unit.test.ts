import { describe, it, expect } from 'vitest';
// @ts-ignore
import { VibeCodingAgent } from '../src/agents/VibeCodingAgent';

describe('VibeCodingAgent', () => {
  it('should run a voice-to-code task and emit event-driven logs', async () => {
    const agent = new VibeCodingAgent({ profile: { name: 'VibeCodingAgent' } });
    const result = await agent.runTask({ audio: 'stub-audio-data' });
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('success', true);
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs && result.logs.some((l: string) => l.includes('event'))).toBe(true);
  });
}); 