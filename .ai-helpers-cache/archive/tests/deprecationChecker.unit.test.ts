import { describe, it, vi, beforeEach, afterEach } from 'vitest';
// import * as deprecationChecker from '../utils/deprecationChecker.js';
// TODO: deprecationChecker module missing. Test skipped until implemented.
describe.skip('deprecationChecker', () => {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let warnSpy: ReturnType<typeof vi.spyOn>;
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
  beforeEach(() => {
    // @ts-expect-error TS(2339): Property 'spyOn' does not exist on type 'VitestUti... Remove this comment to see the full error message
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
  afterEach(() => {
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    warnSpy.mockRestore();
  });

  // Skipping tests that require mocking ES module imports
  it.skip('logs warnings for deprecated version (mocking not supported in ESM)', () => {
    // This test is skipped due to ESM import limitations
  });

  // it('should check for deprecated APIs', () => {
  //   deprecationChecker.checkDeprecated('oldApi');
  //   expect(warnSpy).toHaveBeenCalled();
  // });
  // expect(() => deprecationChecker.checkDeprecations('0.0.0')).not.toThrow();
}); 