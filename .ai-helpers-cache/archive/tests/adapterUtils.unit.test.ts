import { describe, it, expect } from 'vitest';
// @ts-expect-error TS(2614): Module '"../utils/plugin/adapterUtils.js"' has no ... Remove this comment to see the full error message
import { tryDynamicImport, stubResult, formatError } from '../utils/plugin/adapterUtils.js';

// @ts-expect-error TS(2349): This expression is not callable.
describe('adapterUtils', () => {
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  it('stubResult returns expected structure', () => {
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = stubResult('TestAdapter', 'testSDK');
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result).toEqual({
      output: null,
      success: false,
      logs: ['[TestAdapter] testSDK SDK not installed. Returning stub result.'],
    });
  });

  it('formatError returns expected error structure', () => {
    // @ts-expect-error TS(2304): Cannot find name 'err'.
    const err = new Error('fail');
    // @ts-expect-error TS(2304): Cannot find name 'context'.
    const context = { foo: 'bar' };
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = formatError('TestAdapter', 'testMethod', err, context);
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result.success).toBe(false);
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    expect(result.logs).toBeDefined();
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    expect(result.logs && result.logs[0]).toContain('Error in testMethod: fail');
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    expect(result.logs && result.logs[1]).toContain('Context:');
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('tryDynamicImport returns null for missing module', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'mod'.
    const mod = await tryDynamicImport('nonexistent-module-xyz');
    // @ts-expect-error TS(6133): 'mod' is declared but its value is never read.
    expect(mod).toBeNull();
  });
}); 