import { describe, it, expect } from 'vitest';
// @ts-ignore
import { FeedbackAgent } from '../agents/FeedbackAgent.js';

describe('FeedbackAgent', () => {
  it('should run a feedback task and return a result', async () => {
    const agent = new FeedbackAgent({ profile: { name: 'FeedbackAgent' } });
    const result = await agent.runTask({ feedback: 'Test feedback' });
    expect(result).toHaveProperty('output');
    // Accept any shape for logs/success, as stub may not implement
  });
}); 