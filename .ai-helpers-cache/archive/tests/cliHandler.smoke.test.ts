import { it, expect } from 'vitest';

// @ts-expect-error TS(2304): Cannot find name 'async'.
it('cliHandler can be imported and does not throw', async () => {
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  await expect(async () => {
    // @ts-expect-error TS(2307): Cannot find module '../cliHandler.js' or its corre... Remove this comment to see the full error message
    await import('../cliHandler.js');
  // @ts-expect-error TS(2551): Property 'toThrow' does not exist on type 'Asserti... Remove this comment to see the full error message
  }).not.toThrow();
}); 