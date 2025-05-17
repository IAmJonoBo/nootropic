/**
 * Stub lifecycle hooks for registry compliance.
 */
export async function init() {}
export async function health() { return { status: 'ok' }; }
export async function shutdown() {}
export async function reload() {}
export async function describe() { return { name: 'adapterUtils', description: 'Stub lifecycle hooks for registry compliance.' }; } 