export function describe() {
    return {
        name: 'examplePlugin',
        description: 'A sample plugin for nootropic. Demonstrates plugin loading and structure.',
        usage: 'nootropic plugins run examplePlugin',
        options: [],
        schema: {
            input: {
                type: 'array',
                items: {},
                description: 'Arguments passed to run()'
            },
            output: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    args: { type: 'array', items: {} }
                },
                required: ['success', 'message', 'args']
            }
        }
    };
}
export async function run(...args) {
    return {
        success: true,
        message: 'Example plugin executed!',
        args
    };
}
