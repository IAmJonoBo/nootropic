// Node.js globals for CLI context
// Use process and console directly (no need to declare)

// @ts-expect-error TS(2305): Module '"./utils.js"' has no exported member 'aggr... Remove this comment to see the full error message
import { aggregateDescribeRegistry } from './utils.js';

export function parseArgs(argv: string[]): { args: string[] } {
  // Simple CLI arg parser
  return { args: argv.slice(2) };
}

export function printHelp(usage: string, description = ''): void {
  if (description) console.log(description);
  console.log('Usage:', usage);
}

export function handleCliError(e: unknown): void {
  console.error('CLI error:', e);
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  process.exit(1);
}

// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
if (process.argv[2] === 'describe-registry-validate') {
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  (async () => {
    // @ts-expect-error TS(2304): Cannot find name 'registry'.
    const registry = await aggregateDescribeRegistry();
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let valid = true;
    // @ts-expect-error TS(2552): Cannot find name 'names'. Did you mean 'name'?
    const names = new Set();
    // @ts-expect-error TS(2552): Cannot find name 'errors'. Did you mean 'Error'?
    const errors = [];
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    for (const entry of registry) {
      if (typeof entry === "object" && entry !== null && "name" in entry && typeof entry.name === "string") {
        const typedEntry = entry as { name: string; description?: string; schema?: unknown };
        if (!typedEntry.name) {
          // @ts-expect-error TS(2552): Cannot find name 'errors'. Did you mean 'Error'?
          errors.push(`Missing 'name' in entry: ${JSON.stringify(entry)}`);
          valid = false;
        } else if (names.has(typedEntry.name)) {
          // @ts-expect-error TS(2304): Cannot find name 'Duplicate'.
          errors.push(`Duplicate name: ${typedEntry.name}`);
          valid = false;
        } else {
          names.add(typedEntry.name);
        }
        if (!typedEntry.description) {
          // @ts-expect-error TS(2304): Cannot find name 'Missing'.
          errors.push(`Missing 'description' in ${typedEntry.name}`);
          valid = false;
        }
        if (!typedEntry.schema) {
          // @ts-expect-error TS(2304): Cannot find name 'Missing'.
          errors.push(`Missing 'schema' in ${typedEntry.name}`);
          valid = false;
        }
      }
    }
    if (!valid) {
      console.error('Describe registry validation failed:');
      for (const err of errors) console.error('  -', err);
      process.exit(1);
    } else {
      console.log('Describe registry is valid.');
      process.exit(0);
    }
  })();
}

if (process.argv[2] === 'list-capabilities') {
  (async () => {
    try {
      const registry = await aggregateDescribeRegistry();
      console.log('Available nootropic Capabilities:');
      for (const entry of registry) {
        if (typeof entry === "object" && entry !== null && "name" in entry && typeof entry.name === "string") {
          const typedEntry = entry as { name: string; description?: string; schema?: unknown };
          console.log(`- ${typedEntry.name}: ${typedEntry.description || 'No description.'}`);
        }
      }
      process.exit(0);
    } catch (e) {
      handleCliError(e);
    }
  })();
} 