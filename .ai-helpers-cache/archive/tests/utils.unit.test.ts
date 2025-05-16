import { describe, it, expect, vi, afterEach } from 'vitest';
// @ts-expect-error TS(2459): Module '"../utils.js"' declares 'readJsonSafe' loc... Remove this comment to see the full error message
import { readJsonSafe, writeJsonSafe, getOrInitJson, errorLogger, esmEntrypointCheck } from '../utils.js';
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import { promises as fsp } from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';

// @ts-expect-error TS(2349): This expression is not callable.
describe('Utils', () => {
  // @ts-expect-error TS(2304): Cannot find name 'tempFile'.
  const tempFile = path.join(__dirname, 'temp.json');

  // @ts-expect-error TS(6133): 'async' is declared but its value is never read.
  afterEach(async () => {
    // @ts-expect-error TS(2304): Cannot find name 'tempFile'.
    try { await fsp.unlink(tempFile); } catch {}
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('writeJsonSafe and readJsonSafe work', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'data'.
    const data = { a: 1 };
    // @ts-expect-error TS(2304): Cannot find name 'tempFile'.
    await writeJsonSafe(tempFile, data);
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = await readJsonSafe(tempFile);
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result).toEqual(data);
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('readJsonSafe returns fallback on missing file', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = await readJsonSafe('notfound.json', { fallback: true });
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result).toEqual({ fallback: true });
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('getOrInitJson returns init on missing file', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = await getOrInitJson('notfound2.json', [1, 2, 3]);
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result).toEqual([1, 2, 3]);
  });

  // @ts-expect-error TS(2349): This expression is not callable.
  it('errorLogger logs error', () => {
    // @ts-expect-error TS(2304): Cannot find name 'spy'.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-expect-error TS(2300): Duplicate identifier '(Missing)'.
    errorLogger('test', new Error('fail'));
    // @ts-expect-error TS(2304): Cannot find name 'spy'.
    expect(spy).toHaveBeenCalled();
    // @ts-expect-error TS(2304): Cannot find name 'spy'.
    spy.mockRestore();
  });

  // @ts-expect-error TS(2349): This expression is not callable.
  it.skip('esmEntrypointCheck returns true for matching url', () => {
    // Skipped: cannot reliably test process.argv and importMetaUrl in this environment
    // @ts-expect-error TS(2304): Cannot find name 'fakeArgv'.
    const fakeArgv = ['/path/to/file.js'];
    // @ts-expect-error TS(2304): Cannot find name 'importMetaUrl'.
    const importMetaUrl = 'file:///path/to/file.js';
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    global.process = { argv: fakeArgv } as unknown as NodeJS.Process;
    // @ts-expect-error TS(6133): 'esmEntrypointCheck' is declared but its value is ... Remove this comment to see the full error message
    expect(esmEntrypointCheck(importMetaUrl)).toBe(true);
  });
}); 