import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ensureDirExists, listFilesInDir } from '../utils';
import { promises as fsp } from 'fs';
describe('utils: ensureDirExists and listFilesInDir', () => {
    let mkdirSpy;
    let readdirSpy;
    beforeEach(() => {
        mkdirSpy = vi.spyOn(fsp, 'mkdir').mockResolvedValue(undefined);
        readdirSpy = vi.spyOn(fsp, 'readdir').mockResolvedValue([]);
    });
    afterEach(() => {
        mkdirSpy.mockRestore();
        readdirSpy.mockRestore();
    });
    it('ensureDirExists calls mkdir with recursive', async () => {
        await ensureDirExists('/tmp/testdir');
        expect(mkdirSpy.mock.calls[0][0]).toBe('/tmp/testdir');
        expect(mkdirSpy.mock.calls[0][1]).toEqual({ recursive: true });
    });
    it('listFilesInDir returns file list', async () => {
        const files = await listFilesInDir('/tmp/testdir');
        expect(Array.isArray(files)).toBe(true);
    });
});
