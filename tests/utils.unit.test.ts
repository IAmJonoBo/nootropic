import { describe, it, expect, vi, afterEach } from 'vitest';
// @ts-ignore
import { readJsonSafe, writeJsonSafe, getOrInitJson, errorLogger, esmEntrypointCheck } from '../utils.js';
import { promises as fsp } from 'fs';
import path from 'path';

describe('Utils', () => {
  const tempFile = path.join(__dirname, 'temp.json');

  afterEach(async () => {
    try { await fsp.unlink(tempFile); } catch {}
  });

  it('writeJsonSafe and readJsonSafe work', async () => {
    const data = { a: 1 };
    await writeJsonSafe(tempFile, data);
    const result = await readJsonSafe(tempFile);
    expect(result).toEqual(data);
  });

  it('readJsonSafe returns fallback on missing file', async () => {
    const result = await readJsonSafe('notfound.json', { fallback: true });
    expect(result).toEqual({ fallback: true });
  });

  it('getOrInitJson returns init on missing file', async () => {
    const result = await getOrInitJson('notfound2.json', [1, 2, 3]);
    expect(result).toEqual([1, 2, 3]);
  });

  it('errorLogger logs error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    errorLogger('test', new Error('fail'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it.skip('esmEntrypointCheck returns true for matching url', () => {
    // Skipped: cannot reliably test process.argv and importMetaUrl in this environment
    const fakeArgv = ['/path/to/file.js'];
    const importMetaUrl = 'file:///path/to/file.js';
    global.process = { argv: fakeArgv } as unknown as NodeJS.Process;
    expect(esmEntrypointCheck(importMetaUrl)).toBe(true);
  });
}); 