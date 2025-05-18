import { it, expect } from 'vitest';

it('cliHandler can be imported and does not throw', async () => {
  await expect(async () => {
    await import('../cliHandler');
  }).not.toThrow();
}); 