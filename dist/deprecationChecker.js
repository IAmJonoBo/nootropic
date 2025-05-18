export async function init() { }
export async function shutdown() { }
export async function reload() { }
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'deprecationChecker', description: 'Stub lifecycle hooks for registry compliance.' }; }
