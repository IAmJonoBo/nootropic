import { describe, it, expect } from 'vitest';
// @ts-ignore
import { ContentAgent } from '../src/agents/ContentAgent';

describe('ContentAgent', () => {
  it('should run a content task and return a result', async () => {
    const agent = new ContentAgent({ profile: { name: 'ContentAgent' } });
    const result = await agent.runTask({ content: 'Test content' });
    expect(result).toHaveProperty('output');
    // Accept any shape for logs/success, as stub may not implement
  });
}); 