/**
 * Shared CLI Helper Utility for nootropic scripts.
 *
 * - Standardizes argument parsing (--help, --json, etc.)
 * - Provides help output
 * - Standardizes error handling and exit codes
 * - Supports human and machine-readable (JSON) output
 *
 * Example:
 *   import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers';
 *   const { args, showHelp } = parseCliArgs({
 *     usage: 'Usage: myscript [options]',
 *     options: { foo: { desc: 'Foo option', type: 'string' } }
 *   });
 *   if (showHelp) printUsage();
 *   try { ... } catch (e) { printError(e); }
 */

// @ts-expect-error TS(2307): Cannot find module 'process' or its corresponding ... Remove this comment to see the full error message
import process from 'process';

// @ts-expect-error TS(7010): 'parseCliArgs', which lacks return-type annotation... Remove this comment to see the full error message
export function parseCliArgs({ options }: { options: Record<string, { desc: string, type: string }> }) {
  const args = process.argv.slice(2);
  const parsed: Record<string, unknown> = {};
  // @ts-expect-error TS(6133): 'showHelp' is declared but its value is never read... Remove this comment to see the full error message
  let showHelp = false;
  // @ts-expect-error TS(6133): 'opt' is declared but its value is never read.
  for (const [key, opt] of Object.entries(options)) {
    // @ts-expect-error TS(2356): An arithmetic operand must be of type 'any', 'numb... Remove this comment to see the full error message
    const idx = args.indexOf(`--${key}`);
    if (idx !== -1) {
      parsed[key] = opt.type === 'boolean' ? true : args[idx + 1];
    }
  }
  if (args.includes('--help') ?? args.includes('-h')) showHelp = true;
  if (args.includes('--json')) parsed['json'] = true;
  return { args: parsed, showHelp };
}

export function printUsage(usage = '', options: Record<string, { desc: string, type: string }> = {}) {
  console.log(usage);
  for (const [key, opt] of Object.entries(options)) {
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    console.log(`  --${key}${opt.type === 'boolean' ? '' : ` <${opt.type}>`}\t${opt.desc}`);
  }
  console.log('  --help\tShow help');
  console.log('  --json\tOutput in JSON format');
}

export function printResult(result: unknown, asJson = false) {
  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result);
  }
}

export function printError(error: unknown, asJson = false) {
  if (asJson) {
    console.error(JSON.stringify({ error: String(error) }, null, 2));
  } else {
    console.error('Error:', error);
  }
  process.exit(1);
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'cliHelpers', description: 'Stub lifecycle hooks for registry compliance.' }; } 