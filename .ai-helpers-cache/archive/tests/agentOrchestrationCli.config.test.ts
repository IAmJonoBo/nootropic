// @ts-expect-error TS(6133): 'beforeEach' is declared but its value is never re... Remove this comment to see the full error message
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// @ts-expect-error TS(2305): Module '"../utils.js"' has no exported member 'loa... Remove this comment to see the full error message
import { loadAiHelpersConfig } from '../utils.js';
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const cwd = process.cwd();
const jsonConfigPath = path.join(cwd, '.nootropicrc');
const tsConfigPath = path.join(cwd, 'nootropic.config.ts');

// @ts-expect-error TS(2349): This expression is not callable.
describe('nootropic config loader', () => {
  beforeEach(() => {
    // @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
    if (fs.existsSync(jsonConfigPath)) fs.renameSync(jsonConfigPath, jsonConfigPath + '.bak');
    if (fs.existsSync(tsConfigPath)) fs.renameSync(tsConfigPath, tsConfigPath + '.bak');
  });
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
  afterEach(() => {
    // @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
    if (fs.existsSync(jsonConfigPath)) fs.unlinkSync(jsonConfigPath);
    if (fs.existsSync(tsConfigPath)) fs.unlinkSync(tsConfigPath);
    if (fs.existsSync(jsonConfigPath + '.bak')) fs.renameSync(jsonConfigPath + '.bak', jsonConfigPath);
    if (fs.existsSync(tsConfigPath + '.bak')) fs.renameSync(tsConfigPath + '.bak', tsConfigPath);
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('loads config from .nootropicrc (JSON)', async () => {
    fs.writeFileSync(jsonConfigPath, JSON.stringify({ analytics: true, foo: 'bar' }));
    // @ts-expect-error TS(2304): Cannot find name 'config'.
    const config = await loadAiHelpersConfig();
    // @ts-expect-error TS(6133): 'config' is declared but its value is never read.
    expect(config.analytics).toBe(true);
    // @ts-expect-error TS(2304): Cannot find name 'config'.
    expect(config.foo).toBe('bar');
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('loads config from nootropic.config.ts (ESM)', async () => {
    fs.writeFileSync(tsConfigPath, "export default { analytics: false, bar: 'baz' };\n");
    // @ts-expect-error TS(2304): Cannot find name 'config'.
    const config = await loadAiHelpersConfig();
    // @ts-expect-error TS(6133): 'config' is declared but its value is never read.
    expect(config.analytics).toBe(false);
    // @ts-expect-error TS(2304): Cannot find name 'config'.
    expect(config.bar).toBe('baz');
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('merges defaults with config file', async () => {
    fs.writeFileSync(jsonConfigPath, JSON.stringify({ foo: 'bar' }));
    // @ts-expect-error TS(2304): Cannot find name 'config'.
    const config = await loadAiHelpersConfig({ analytics: false, foo: 'default', extra: 1 });
    // @ts-expect-error TS(6133): 'config' is declared but its value is never read.
    expect(config.analytics).toBe(false);
    // @ts-expect-error TS(2304): Cannot find name 'config'.
    expect(config.foo).toBe('bar');
    // @ts-expect-error TS(2304): Cannot find name 'config'.
    expect(config.extra).toBe(1);
  });
}); 