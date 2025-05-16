import { describe, it, expect } from 'vitest';
import { tryDynamicImport, stubResult, formatError } from '../utils/adapterUtils';
describe('adapterUtils', () => {
    it('stubResult returns expected structure', () => {
        const result = stubResult('TestAdapter', 'testSDK');
        expect(result).toEqual({
            output: null,
            success: false,
            logs: ['[TestAdapter] testSDK SDK not installed. Returning stub result.'],
        });
    });
    it('formatError returns expected error structure', () => {
        const err = new Error('fail');
        const context = { foo: 'bar' };
        const result = formatError('TestAdapter', 'testMethod', err, context);
        expect(result.success).toBe(false);
        expect(result.logs).toBeDefined();
        expect(result.logs && result.logs[0]).toContain('Error in testMethod: fail');
        expect(result.logs && result.logs[1]).toContain('Context:');
    });
    it('tryDynamicImport returns null for missing module', async () => {
        const mod = await tryDynamicImport('nonexistent-module-xyz');
        expect(mod).toBeNull();
    });
});
