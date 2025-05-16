// @ts-expect-error TS(6133): 'it' is declared but its value is never read.
import { describe, it, expect, vi } from 'vitest';

// @ts-expect-error TS(2339): Property 'mock' does not exist on type 'VitestUtil... Remove this comment to see the full error message
vi.mock('update-notifier', () => ({
  // @ts-expect-error TS(2339): Property 'fn' does not exist on type 'VitestUtils'... Remove this comment to see the full error message
  default: () => ({ notify: vi.fn() })
}));

import { checkForUpdates } from '../utils/describe/updateNotifier.js';

// @ts-expect-error TS(2349): This expression is not callable.
describe('updateNotifier', () => {
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  it('calls notifier.notify', () => {
    // The mock above ensures notify is a vi.fn()
    expect(() => checkForUpdates()).not.toThrow();
  });
}); 