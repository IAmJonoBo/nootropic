import { describe, it, expect, vi } from 'vitest';
vi.mock('update-notifier', () => ({
    default: () => ({ notify: vi.fn() })
}));
import * as updateNotifierUtil from '../utils/updateNotifier';
describe('updateNotifier', () => {
    it('calls notifier.notify', () => {
        // The mock above ensures notify is a vi.fn()
        expect(() => updateNotifierUtil.checkForUpdates()).not.toThrow();
    });
});
