import { describe, it, expect } from 'vitest';
// @ts-ignore
import { HumanInTheLoopAgent } from '../agents/HumanInTheLoopAgent.js';

describe('HumanInTheLoopAgent', () => {
  it('should run a HITL task and emit event-driven logs', async () => {
    const agent = new HumanInTheLoopAgent({ profile: { name: 'HumanInTheLoopAgent' } });
    const result = await agent.runTask({ task: 'stub-task' });
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('success', true);
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs && result.logs.some((l: string) => l.includes('event'))).toBe(true);
  });
}); 