import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
// @ts-ignore
import * as pluginRegistry from '../pluginRegistry.js';
// @ts-ignore
import * as utils from '../utils.js';

describe('pluginRegistry', () => {
  beforeEach(() => {
    vi.spyOn(utils, 'getOrInitJson').mockResolvedValue([]);
    vi.spyOn(utils, 'writeJsonSafe').mockResolvedValue(undefined);
    vi.spyOn(utils, 'readJsonSafe').mockResolvedValue([]);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registerPlugin adds a plugin', async () => {
    await pluginRegistry.registerPlugin('test', 'type', 'entry', { foo: 'bar' });
    expect(utils.writeJsonSafe).toHaveBeenCalled();
  });

  it('listPlugins returns plugins', async () => {
    ((utils.readJsonSafe as unknown) as MockInstance).mockResolvedValueOnce([{ name: 'test', type: 'type', entry: 'entry', timestamp: 'now' }]);
    const plugins = await pluginRegistry.listPlugins();
    expect(plugins[0]?.name).toBe('test');
  });

  it('loadPlugin dynamically imports a module', async () => {
    const fakeModule = { foo: 1 };
    const importSpy = vi.spyOn(pluginRegistry, 'loadPlugin').mockImplementation(async () => fakeModule);
    const mod = await pluginRegistry.loadPlugin('fake-entry');
    expect(mod).toBe(fakeModule);
    importSpy.mockRestore();
  });
}); 