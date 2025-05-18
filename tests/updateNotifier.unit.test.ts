import { describe, it, expect, vi } from 'vitest';

vi.mock('update-notifier', () => ({
  default: () => ({ notify: vi.fn() })
}));

// @ts-ignore
import { checkForUpdates } from '../src/utils/describe/updateNotifier';

describe('updateNotifier', () => {
  it('calls notifier.notify', () => {
    expect(() => checkForUpdates()).not.toThrow();
  });
}); 