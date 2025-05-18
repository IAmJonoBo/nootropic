import { describe, it, expect, vi } from 'vitest';

vi.mock('update-notifier', () => ({
  default: () => ({ notify: vi.fn() })
}));

// @ts-ignore
import { checkForUpdates } from '../utils/describe/updateNotifier.js';

describe('updateNotifier', () => {
  it('calls notifier.notify', () => {
    expect(() => checkForUpdates()).not.toThrow();
  });
}); 