/**
 * ExamplePlugin: Demonstrates plugin lifecycle, dynamic event subscription, and hot-reload safety.
 * Implements the Capability interface for unified registry and LLM/agent discovery.
 */
export async function init() { }
export async function shutdown() { }
export async function reload() { }
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() {
    return {
        name: 'examplePlugin',
        description: 'Stub lifecycle hooks for registry compliance.',
        promptTemplates: [],
        schema: {}
    };
}
