import { describe, it, expect } from 'vitest';
// @ts-ignore
import { SupervisorAgent } from '../src/agents/SupervisorAgent';

describe('SupervisorAgent', () => {
  it('should run a supervision task and emit event-driven logs', async () => {
    const agent = new SupervisorAgent({ profile: { name: 'SupervisorAgent' } });
    const result = await agent.runTask({ subAgents: ['A1', 'A2'], metrics: [0.1, 0.2, 0.3] });
    expect(result).toHaveProperty('output');
    expect(result).toHaveProperty('success', true);
    expect(Array.isArray(result.logs)).toBe(true);
    expect(result.logs && result.logs.some((l: string) => l.includes('event'))).toBe(true);
  });
}); 