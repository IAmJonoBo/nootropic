/**
 * Shared CLI Helper Utility for nootropic scripts.
 *
 * - Standardizes argument parsing (--help, --json, etc.)
 * - Provides help output
 * - Standardizes error handling and exit codes
 * - Supports human and machine-readable (JSON) output
 *
 * Example:
 *   import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';
 *   const { args, showHelp } = parseCliArgs({
 *     usage: 'Usage: myscript [options]',
 *     options: { foo: { desc: 'Foo option', type: 'string' } }
 *   });
 *   if (showHelp) printUsage();
 *   try { ... } catch (e) { printError(e); }
 */
export declare function parseCliArgs({ options }: {
    options: Record<string, {
        desc: string;
        type: string;
    }>;
}): {
    args: Record<string, unknown>;
    showHelp: boolean;
};
export declare function printUsage(usage?: string, options?: Record<string, {
    desc: string;
    type: string;
}>): void;
export declare function printResult(result: unknown, asJson?: boolean): void;
export declare function printError(error: unknown, asJson?: boolean): void;
export declare function init(): Promise<void>;
export declare function shutdown(): Promise<void>;
export declare function reload(): Promise<void>;
export declare function health(): Promise<{
    status: string;
    timestamp: string;
}>;
export declare function describe(): Promise<{
    name: string;
    description: string;
}>;
