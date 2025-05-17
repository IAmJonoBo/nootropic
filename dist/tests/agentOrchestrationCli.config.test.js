import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadAiHelpersConfig } from '../utils';
import fs from 'fs';
import path from 'path';
const cwd = process.cwd();
const jsonConfigPath = path.join(cwd, '.nootropicrc');
const tsConfigPath = path.join(cwd, 'nootropic.config.ts');
describe('nootropic config loader', () => {
    beforeEach(() => {
        if (fs.existsSync(jsonConfigPath))
            fs.renameSync(jsonConfigPath, jsonConfigPath + '.bak');
        if (fs.existsSync(tsConfigPath))
            fs.renameSync(tsConfigPath, tsConfigPath + '.bak');
    });
    afterEach(() => {
        if (fs.existsSync(jsonConfigPath))
            fs.unlinkSync(jsonConfigPath);
        if (fs.existsSync(tsConfigPath))
            fs.unlinkSync(tsConfigPath);
        if (fs.existsSync(jsonConfigPath + '.bak'))
            fs.renameSync(jsonConfigPath + '.bak', jsonConfigPath);
        if (fs.existsSync(tsConfigPath + '.bak'))
            fs.renameSync(tsConfigPath + '.bak', tsConfigPath);
    });
    it('loads config from .nootropicrc (JSON)', async () => {
        fs.writeFileSync(jsonConfigPath, JSON.stringify({ analytics: true, foo: 'bar' }));
        const config = await loadAiHelpersConfig();
        expect(config.analytics).toBe(true);
        expect(config.foo).toBe('bar');
    });
    it('loads config from nootropic.config.ts (ESM)', async () => {
        fs.writeFileSync(tsConfigPath, "export default { analytics: false, bar: 'baz' };\n");
        const config = await loadAiHelpersConfig();
        expect(config.analytics).toBe(false);
        expect(config.bar).toBe('baz');
    });
    it('merges defaults with config file', async () => {
        fs.writeFileSync(jsonConfigPath, JSON.stringify({ foo: 'bar' }));
        const config = await loadAiHelpersConfig({ analytics: false, foo: 'default', extra: 1 });
        expect(config.analytics).toBe(false);
        expect(config.foo).toBe('bar');
        expect(config.extra).toBe(1);
    });
});
