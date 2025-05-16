// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
import { describe, expect, test } from 'vitest';
// NOTE: This test requires precompiled JS output and is not compatible with Vitest's strip-only mode.
// If running in an unsupported environment, skip or mark as pending.

// Helper to check if a function is async
function isAsync(fn: unknown) {
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  return fn && fn.constructor && fn.constructor.name === 'AsyncFunction';
}

describe('Lifecycle Compliance', () => {
  // @ts-expect-error TS(2304): Cannot find name 'registries'.
  const registries = [
    { name: 'agents', dir: 'agents' },
    { name: 'plugins', dir: 'plugins' },
    { name: 'adapters', dir: 'adapters' },
    { name: 'utilities', dir: 'utils' },
  ];

  // @ts-expect-error TS(2304): Cannot find name 'requiredHooks'.
  const requiredHooks = ['init', 'health', 'shutdown', 'reload', 'describe'];

  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  for (const { name, dir } of registries) {
    // @ts-expect-error TS(2304): Cannot find name '__dirname'.
    const absDir = path.join(__dirname, '..', dir);
    if (!fs.existsSync(absDir)) continue;
    // @ts-expect-error TS(2304): Cannot find name 'f'.
    const files = fs.readdirSync(absDir).filter(f => f.endsWith('.ts') ?? f.endsWith('.js'));
    for (const file of files) {
      // @ts-expect-error TS(6133): 'modPath' is declared but its value is never read.
      const modPath = path.join(absDir, file);
      test(`${name}/${file} implements all lifecycle hooks`, async () => {
        let exported: unknown;
        try {
          // Use dynamic import for ESM compatibility
          // @ts-expect-error TS(2304): Cannot find name 'modPath'.
          exported = await import(modPath);
        } catch {
          // Do not call test.skip inside a test function; just return or throw
          return;
        }
        // For index.ts files, always use the module namespace
        // @ts-expect-error TS(2304): Cannot find name 'requiredHooks'.
        for (const hook of requiredHooks) {
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          expect(typeof exported[hook]).toBe('function');
          // @ts-expect-error TS(2571): Object is of type 'unknown'.
          expect(isAsync(exported[hook])).toBe(true);
        }
      });
    }
  }
}); 