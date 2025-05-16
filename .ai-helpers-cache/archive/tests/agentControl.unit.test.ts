// @ts-expect-error TS(6133): 'beforeEach' is declared but its value is never re... Remove this comment to see the full error message
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as agentControl from '../agentControl.js';
import * as utils from '../utils.js';
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import { promises as fsp, Stats, Dirent } from 'fs';

// Mock path.join to just concatenate for simplicity
// @ts-expect-error TS(2339): Property 'mock' does not exist on type 'VitestUtil... Remove this comment to see the full error message
vi.mock('path', () => ({
  default: {
    // @ts-expect-error TS(6133): 'args' is declared but its value is never read.
    join: (...args: string[]) => args.join('/'),
    // @ts-expect-error TS(6133): 'args' is declared but its value is never read.
    resolve: (...args: string[]) => args.join('/'),
    // @ts-expect-error TS(2304): Cannot find name 'dirname'.
    dirname: (p: string) => p,
  }
}));

// @ts-expect-error TS(2349): This expression is not callable.
describe('agentControl', () => {
  beforeEach(() => {
    // Mock a minimal Stats object
    // @ts-expect-error TS(2304): Cannot find name 'fakeStats'.
    const fakeStats = {
      isFile: () => true,
      isDirectory: () => false,
      // @ts-expect-error TS(2304): Cannot find name 'size'.
      size: 1,
      // @ts-expect-error TS(2552): Cannot find name 'mtime'. Did you mean 'mime'?
      mtime: new Date(),
      // Add any other required properties/methods as needed
    // @ts-expect-error TS(2304): Cannot find name 'as'.
    } as unknown as Stats;
    // @ts-expect-error TS(2339): Property 'spyOn' does not exist on type 'VitestUti... Remove this comment to see the full error message
    vi.spyOn(fsp, 'stat').mockResolvedValue(fakeStats);
    // Mock readdir to return an empty array of Dirent<Buffer> objects
    // @ts-expect-error TS(2339): Property 'spyOn' does not exist on type 'VitestUti... Remove this comment to see the full error message
    vi.spyOn(fsp, 'readdir').mockResolvedValue([] as unknown as Array<Dirent<Buffer>>);
    // @ts-expect-error TS(2339): Property 'spyOn' does not exist on type 'VitestUti... Remove this comment to see the full error message
    vi.spyOn(fsp, 'unlink').mockResolvedValue(undefined as unknown as void);
    // @ts-expect-error TS(2339): Property 'spyOn' does not exist on type 'VitestUti... Remove this comment to see the full error message
    vi.spyOn(fsp, 'access').mockResolvedValue(undefined as unknown as void);
    // @ts-expect-error TS(2339): Property 'spyOn' does not exist on type 'VitestUti... Remove this comment to see the full error message
    vi.spyOn(utils, 'readJsonSafe').mockResolvedValue({ field: [{ timestamp: new Date().toISOString() }] });
    // @ts-expect-error TS(2339): Property 'spyOn' does not exist on type 'VitestUti... Remove this comment to see the full error message
    vi.spyOn(utils, 'writeJsonSafe').mockResolvedValue(undefined);
  });
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('listFiles returns file info', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'files'.
    const files = await agentControl.listFiles();
    // @ts-expect-error TS(6133): 'Array' is declared but its value is never read.
    expect(Array.isArray(files)).toBe(true);
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('pruneFiles returns deleted files', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'deleted'.
    const deleted = await agentControl.pruneFiles({ maxCount: null });
    // @ts-expect-error TS(6133): 'Array' is declared but its value is never read.
    expect(Array.isArray(deleted)).toBe(true);
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('pruneJsonField prunes array field', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'result'.
    const result = await agentControl.pruneJsonField('file.json', 'field', { maxItems: null });
    // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
    expect(result).toBe(true);
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('runAgentControl with list does not throw', async () => {
    // @ts-expect-error TS(2339): Property 'resolves' does not exist on type 'Assert... Remove this comment to see the full error message
    await expect(agentControl.runAgentControl({ list: true })).resolves.not.toThrow();
  });
}); 