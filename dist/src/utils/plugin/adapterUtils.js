/**
 * tryDynamicImport: Utility for dynamic ESM import with fallback. Implements Capability for registry/discoverability.
 */
const adapterUtilsCapability = {
    name: 'adapterUtils',
    describe() {
        return {
            name: 'adapterUtils',
            description: 'Utility for dynamic ESM import with fallback and error formatting. Useful for plugin/adapter loading.',
            methods: [
                { name: 'tryDynamicImport', signature: '(moduleName: string) => Promise<unknown | null>', description: 'Attempts to dynamically import a module, returns null on failure.' }
            ],
            schema: {
                tryDynamicImport: {
                    input: { type: 'object', properties: { moduleName: { type: 'string' } }, required: ['moduleName'] },
                    output: { type: ['object', 'null'], description: 'Imported module or null on failure' }
                }
            },
            license: 'MIT',
            isOpenSource: true,
            usage: "import adapterUtilsCapability from 'nootropic/utils/plugin/adapterUtils'; await adapterUtilsCapability.tryDynamicImport('module');",
            docsFirst: true,
            aiFriendlyDocs: true,
            promptTemplates: [
                {
                    name: 'Dynamic Import Module',
                    description: 'Prompt for instructing the agent or LLM to dynamically import a module by name, with fallback and error handling.',
                    template: 'Attempt to dynamically import the module named "{{moduleName}}". If the import fails, return null and log the error.',
                    usage: 'Used by tryDynamicImport to load modules at runtime for plugin/adapter loading.'
                }
            ],
            references: [
                'https://nodejs.org/api/esm.html#esm_dynamic_imports'
            ]
        };
    },
    async health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    },
    async init() {
        // No-op for now
    }
};
/**
 * Utility method: Attempts to dynamically import a module, returns null on failure.
 * Not part of the Capability interface, but attached for convenience.
 */
adapterUtilsCapability.tryDynamicImport = async function (moduleName) {
    try {
        return await import(moduleName);
    }
    catch {
        return null;
    }
};
export default adapterUtilsCapability;
export function stubResult(adapter, sdk) {
    return {
        output: { stub: true, adapter, sdk },
        success: false,
        logs: [`[${adapter}] ${sdk} SDK not installed. Returning stub result.`],
    };
}
/**
 * Returns a structured AgentResult for errors, with context and logs.
 * Example: return formatError('LangChainAdapter', 'runAgentTask', err, { agentProfile, task, context });
 */
export function formatError(adapter, method, err, context) {
    return {
        output: null,
        success: false,
        logs: [
            `[${adapter}] Error in ${method}: ${err instanceof Error ? err.message : String(err)}`,
            ...(context ? [`Context: ${JSON.stringify(context)}`] : [])
        ],
    };
}
export async function tryDynamicImport(moduleName) {
    try {
        return await import(moduleName);
    }
    catch {
        return null;
    }
}
