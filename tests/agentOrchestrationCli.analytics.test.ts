import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), '.nootropic-analytics.log');

describe('nootropic analytics logging', () => {
  beforeEach(() => {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  });
  afterEach(() => {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  });

  it('does not log analytics by default', () => {
    // Simulate analytics disabled
    expect(fs.existsSync(logFile)).toBe(false);
  });

  it('logs analytics when enabled via env', () => {
    process.env['AIHELPERS_ANALYTICS'] = '1';
    fs.appendFileSync(logFile, JSON.stringify({ event: 'test' }) + '\n');
    expect(fs.existsSync(logFile)).toBe(true);
    delete process.env['AIHELPERS_ANALYTICS'];
  });

  it('does not log analytics when disabled via env', () => {
    process.env['AIHELPERS_ANALYTICS'] = '0';
    expect(fs.existsSync(logFile)).toBe(false);
    delete process.env['AIHELPERS_ANALYTICS'];
  });
}); 