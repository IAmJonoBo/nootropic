/**
 * Dynamically loads all plugins from the plugins/ directory.
 * Returns an array of plugin modules with describe/run exports. All outputs are Zod-validated.
 */
export declare function getPlugins(): Promise<any[]>;
