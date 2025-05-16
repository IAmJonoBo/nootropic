// @ts-expect-error TS(6133): 'expect' is declared but its value is never read.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const logFile = path.join(process.cwd(), '.nootropic-analytics.log');

// @ts-expect-error TS(2349): This expression is not callable.
describe('nootropic analytics logging', () => {
  beforeEach(() => {
    // @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  });
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
  afterEach(() => {
    // @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  });

  it('does not log analytics by default', () => {
    // Simulate analytics disabled
    // @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
    expect(fs.existsSync(logFile)).toBe(false);
  });

  it('logs analytics when enabled via env', () => {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.AIHELPERS_ANALYTICS = '1';
    fs.appendFileSync(logFile, JSON.stringify({ event: 'test' }) + '\n');
    // @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
    expect(fs.existsSync(logFile)).toBe(true);
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.AIHELPERS_ANALYTICS;
  });

  it('does not log analytics when disabled via env', () => {
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.env.AIHELPERS_ANALYTICS = '0';
    // @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
    expect(fs.existsSync(logFile)).toBe(false);
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    delete process.env.AIHELPERS_ANALYTICS;
  });
}); 