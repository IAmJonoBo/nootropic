import fs from 'fs';
import path from 'path';
import { PluginModuleSchema } from './pluginTypes.js';

// --- Type guard and Zod validation for plugin modules ---
function isValidPluginModule(mod: unknown): boolean {
  const result = PluginModuleSchema.safeParse(mod);
  if (!result.success) {
    if (process.env['NOOTROPIC_DEBUG']) {
      console.warn('[pluginLoader] Plugin failed Zod validation:', result.error);
    }
    return false;
  }
  return true;
}

/**
 * Dynamically loads all plugins from the plugins/ directory.
 * Returns an array of plugin modules with describe/run exports. All outputs are Zod-validated.
 */
export async function getPlugins() {
  const { ensureCacheDirExists } = await import('./src/utils/context/cacheDir.js');
  await ensureCacheDirExists();
  const PLUGIN_DIR = path.resolve(process.cwd(), 'plugins');
  if (!fs.existsSync(PLUGIN_DIR)) return [];
  const files = fs.readdirSync(PLUGIN_DIR).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
  const plugins = [];
  for (const file of files) {
    try {
      const mod = await import(path.join(PLUGIN_DIR, file));
      if (isValidPluginModule(mod) && (typeof mod.describe === "function" || typeof mod.run === "function")) {
        const m = mod as { name?: unknown };
        if (typeof m.name === 'string') {
          plugins.push(mod);
        } else {
          const pluginWithName = { name: file.replace(/\.(js|ts)$/, ''), ...(mod as object) };
          if (isValidPluginModule(pluginWithName)) plugins.push(pluginWithName);
        }
      } else {
        if (process.env['NOOTROPIC_DEBUG']) {
          console.warn(`[pluginLoader] Skipping invalid plugin ${file}: does not conform to PluginModule schema.`);
        }
        continue;
      }
    } catch (e) {
      if (process.env['NOOTROPIC_DEBUG']) {
        console.error(`[pluginLoader] Failed to load plugin ${file}:`, e);
      }
    }
  }
  return plugins;
} 