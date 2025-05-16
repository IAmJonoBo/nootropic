// @ts-expect-error TS(6133): 'beforeEach' is declared but its value is never re... Remove this comment to see the full error message
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// @ts-expect-error TS(2305): Module '"../utils/context/contextManager.js"' has ... Remove this comment to see the full error message
import { ensureDirExists, listFilesInDir } from '../utils/context/contextManager.js';
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import { promises as fsp, Dirent } from 'fs';

// @ts-expect-error TS(2349): This expression is not callable.
describe('utils: ensureDirExists and listFilesInDir', () => {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let mkdirSpy: unknown;
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let readdirSpy: unknown;

  beforeEach(() => {
    // @ts-expect-error TS(2339): Property 'spyOn' does not exist on type 'VitestUti... Remove this comment to see the full error message
    mkdirSpy = vi.spyOn(fsp, 'mkdir').mockResolvedValue(undefined);
    // @ts-expect-error TS(2339): Property 'spyOn' does not exist on type 'VitestUti... Remove this comment to see the full error message
    readdirSpy = vi.spyOn(fsp, 'readdir').mockResolvedValue([] as unknown as Array<Dirent<Buffer>>);
  });
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
  afterEach(() => {
    // @ts-expect-error TS(2304): Cannot find name 'mkdirSpy'.
    (mkdirSpy as { mockRestore: () => void }).mockRestore();
    // @ts-expect-error TS(2304): Cannot find name 'readdirSpy'.
    (readdirSpy as { mockRestore: () => void }).mockRestore();
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('ensureDirExists calls mkdir with recursive', async () => {
    await ensureDirExists('/tmp/testdir');
    // @ts-expect-error TS(2304): Cannot find name 'mkdirSpy'.
    expect((mkdirSpy as { mock: { calls: unknown[][] } }).mock.calls[0][0]).toBe('/tmp/testdir');
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    expect((mkdirSpy as { mock: { calls: unknown[][] } }).mock.calls[0][1]).toEqual({ recursive: true });
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('listFilesInDir returns file list', async () => {
    // @ts-expect-error TS(2552): Cannot find name 'files'. Did you mean 'File'?
    const files = await listFilesInDir('/tmp/testdir');
    // @ts-expect-error TS(6133): 'Array' is declared but its value is never read.
    expect(Array.isArray(files)).toBe(true);
  });
}); 