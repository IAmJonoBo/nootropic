// @ts-expect-error TS(6133): 'beforeEach' is declared but its value is never re... Remove this comment to see the full error message
import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import * as pluginRegistry from '../pluginRegistry.js';
import * as utils from '../utils.js';

// @ts-expect-error TS(2349): This expression is not callable.
describe('pluginRegistry', () => {
  beforeEach(() => {
    vi.spyOn(utils, 'getOrInitJson').mockResolvedValue([]);
    vi.spyOn(utils, 'writeJsonSafe').mockResolvedValue(undefined);
    vi.spyOn(utils, 'readJsonSafe').mockResolvedValue([]);
  });
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('registerPlugin adds a plugin', async () => {
    // @ts-expect-error TS(2339): Property 'registerPlugin' does not exist on type '... Remove this comment to see the full error message
    await pluginRegistry.registerPlugin('test', 'type', 'entry', { foo: 'bar' });
    // @ts-expect-error TS(6133): 'utils' is declared but its value is never read.
    expect(utils.writeJsonSafe).toHaveBeenCalled();
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('listPlugins returns plugins', async () => {
    // @ts-expect-error TS(2339): Property 'readJsonSafe' does not exist on type 'ty... Remove this comment to see the full error message
    ((utils.readJsonSafe as unknown) as MockInstance).mockResolvedValueOnce([{ name: 'test', type: 'type', entry: 'entry', timestamp: 'now' }]);
    // @ts-expect-error TS(2339): Property 'listPlugins' does not exist on type 'typ... Remove this comment to see the full error message
    const plugins = await pluginRegistry.listPlugins();
    // @ts-expect-error TS(2339): Property 'toBe' does not exist on type 'Assertion<... Remove this comment to see the full error message
    expect(plugins[0].name).toBe('test');
  });

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  it('loadPlugin dynamically imports a module', async () => {
    // @ts-expect-error TS(2304): Cannot find name 'fakeModule'.
    const fakeModule = { foo: 1 };
    // @ts-expect-error TS(2304): Cannot find name 'importSpy'.
    const importSpy = vi.spyOn(pluginRegistry, 'loadPlugin').mockImplementation(async () => fakeModule);
    // @ts-expect-error TS(2304): Cannot find name 'mod'.
    const mod = await pluginRegistry.loadPlugin('fake-entry');
    // @ts-expect-error TS(6133): 'mod' is declared but its value is never read.
    expect(mod).toBe(fakeModule);
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    importSpy.mockRestore();
  });
}); 