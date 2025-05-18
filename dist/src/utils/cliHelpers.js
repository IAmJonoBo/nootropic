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
import process from 'process';
export function parseCliArgs({ options }) {
    const args = process.argv.slice(2);
    const parsed = {};
    let showHelp = false;
    for (const [key, opt] of Object.entries(options)) {
        const idx = args.indexOf(`--${key}`);
        if (idx !== -1) {
            parsed[key] = opt.type === 'boolean' ? true : args[idx + 1];
        }
    }
    if (args.includes('--help') ?? args.includes('-h'))
        showHelp = true;
    if (args.includes('--json'))
        parsed['json'] = true;
    return { args: parsed, showHelp };
}
export function printUsage(usage = '', options = {}) {
    console.log(usage);
    for (const [key, opt] of Object.entries(options)) {
        console.log(`  --${key}${opt.type === 'boolean' ? '' : ` <${opt.type}>`}\t${opt.desc}`);
    }
    console.log('  --help\tShow help');
    console.log('  --json\tOutput in JSON format');
}
export function printResult(result, asJson = false) {
    if (asJson) {
        console.log(JSON.stringify(result, null, 2));
    }
    else {
        console.log(result);
    }
}
export function printError(error, asJson = false) {
    if (asJson) {
        console.error(JSON.stringify({ error: String(error) }, null, 2));
    }
    else {
        console.error('Error:', error);
    }
    process.exit(1);
}
export async function init() { }
export async function shutdown() { }
export async function reload() { }
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'cliHelpers', description: 'Stub lifecycle hooks for registry compliance.' }; }
