// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { readJsonSafe, writeJsonSafe, getOrInitJson, esmEntrypointCheck } from './utils.js';
import { PLUGIN_REGISTRY_PATH } from './paths.js';
import fs from 'fs';
import path from 'path';
// --- Register a plugin (extractor/analyzer/output) ---
async function registerPlugin(name, type, entry, meta = {}) {
    const registry = await getOrInitJson(PLUGIN_REGISTRY_PATH, []);
    registry.push({ name, type, entry, meta, timestamp: new Date().toISOString() });
    await writeJsonSafe(PLUGIN_REGISTRY_PATH, registry);
}
// --- List all registered plugins ---
async function listPlugins() {
    return (await readJsonSafe(PLUGIN_REGISTRY_PATH, []));
}
// --- Dynamically load a plugin (returns the module) ---
async function loadPlugin(entry) {
    return import(entry);
}
// --- ESM-compatible CLI entrypoint ---
if (esmEntrypointCheck(import.meta.url)) {
    const [cmd, ...args] = process.argv.slice(2);
    if (cmd === 'register') {
        const [name, type, entry, ...meta] = args;
        await registerPlugin(name, type, entry, meta.length ? JSON.parse(meta.join(' ')) : {});
        console.log('Plugin registered.');
    }
    else if (cmd === 'list') {
        console.log(JSON.stringify(await listPlugins(), null, 2));
    }
    else {
        console.log('Usage: pnpm tsx nootropic/pluginRegistry.ts register <name> <type> <entry> [metaJson]');
        console.log('       pnpm tsx nootropic/pluginRegistry.ts list');
    }
}
const PLUGIN_DIR = path.resolve(process.cwd(), 'plugins');
/**
 * Dynamically loads all plugins from the plugins/ directory.
 * Returns an array of plugin modules with describe/run exports.
 */
export async function getPlugins() {
    if (!fs.existsSync(PLUGIN_DIR))
        return [];
    const files = fs.readdirSync(PLUGIN_DIR).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
    const plugins = [];
    for (const file of files) {
        try {
            const mod = await import(path.join(PLUGIN_DIR, file));
            if (mod && (mod.describe || mod.run)) {
                plugins.push({
                    name: file.replace(/\.(js|ts)$/, ''),
                    ...mod
                });
            }
        }
        catch (e) {
            // Ignore broken plugins, but log in debug mode
            if (process.env.AIHELPERS_DEBUG) {
                console.error(`[pluginRegistry] Failed to load plugin ${file}:`, e);
            }
        }
    }
    return plugins;
}
export { registerPlugin, listPlugins, loadPlugin };
