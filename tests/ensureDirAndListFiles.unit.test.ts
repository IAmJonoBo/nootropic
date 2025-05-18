import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// @ts-ignore
import { ensureDirExists, listFilesInDir } from '../src/utils/context/contextFileHelpers.js';
import { promises as fsp, Dirent } from 'fs';

describe('utils: ensureDirExists and listFilesInDir', () => {
  let mkdirSpy: unknown;
  let readdirSpy: unknown;

  beforeEach(() => {
    mkdirSpy = vi.spyOn(fsp, 'mkdir').mockResolvedValue(undefined);
    readdirSpy = vi.spyOn(fsp, 'readdir').mockResolvedValue([] as unknown as Array<Dirent<Buffer>>);
  });
  afterEach(() => {
    (mkdirSpy as { mockRestore: () => void }).mockRestore();
    (readdirSpy as { mockRestore: () => void }).mockRestore();
  });

  it('ensureDirExists calls mkdir with recursive', async () => {
    await ensureDirExists('/tmp/testdir');
    expect((mkdirSpy as { mock?: { calls: unknown[][] } })?.mock?.calls?.[0]?.[0]).toBe('/tmp/testdir');
    expect((mkdirSpy as { mock?: { calls: unknown[][] } })?.mock?.calls?.[0]?.[1]).toEqual({ recursive: true });
  });

  it('listFilesInDir returns file list', async () => {
    const files = await listFilesInDir('/tmp/testdir');
    expect(Array.isArray(files)).toBe(true);
  });
}); 