import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// @ts-ignore
import * as agentControl from '../agentControl.js';
// @ts-ignore
import * as utils from '../utils';
import { promises as fsp, Stats, Dirent } from 'fs';

// Mock path.join to just concatenate for simplicity
vi.mock('path', () => ({
  default: {
    join: (...args: string[]) => args.join('/'),
    resolve: (...args: string[]) => args.join('/'),
    dirname: (p: string) => p,
  }
}));

describe('agentControl', () => {
  beforeEach(() => {
    // Mock a minimal Stats object
    const fakeStats = {
      isFile: () => true,
      isDirectory: () => false,
      size: 1,
      mtime: new Date(),
    } as unknown as Stats;
    vi.spyOn(fsp, 'stat').mockResolvedValue(fakeStats);
    vi.spyOn(fsp, 'readdir').mockResolvedValue([] as unknown as Array<Dirent<Buffer>>);
    vi.spyOn(fsp, 'unlink').mockResolvedValue(undefined as unknown as void);
    vi.spyOn(fsp, 'access').mockResolvedValue(undefined as unknown as void);
    vi.spyOn(utils, 'readJsonSafe').mockResolvedValue({ field: [{ timestamp: new Date().toISOString() }] });
    vi.spyOn(utils, 'writeJsonSafe').mockResolvedValue(undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('listFiles returns file info', async () => {
    const files = await agentControl.listFiles();
    expect(Array.isArray(files)).toBe(true);
  });

  it('pruneFiles returns deleted files', async () => {
    const deleted = await agentControl.pruneFiles({ maxCount: null });
    expect(Array.isArray(deleted)).toBe(true);
  });

  it('pruneJsonField prunes array field', async () => {
    const result = await agentControl.pruneJsonField('file.json', 'field', { maxItems: null });
    expect(result).toBe(true);
  });

  it('runAgentControl with list does not throw', async () => {
    await expect(agentControl.runAgentControl({ list: true })).resolves.not.toThrow();
  });
}); 