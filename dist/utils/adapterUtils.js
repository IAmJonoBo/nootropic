export async function tryDynamicImport(moduleName) {
    try {
        return await import(moduleName);
    }
    catch {
        return null;
    }
}
export function stubResult(adapter, sdk) {
    return {
        output: null,
        success: false,
        logs: [`[${adapter}] ${sdk} SDK not installed. Returning stub result.`],
    };
}
/**
 * Returns a structured AgentResult for errors, with context and logs.
 * Usage: return formatError('LangChainAdapter', 'runAgentTask', err, { agentProfile, task, context });
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
