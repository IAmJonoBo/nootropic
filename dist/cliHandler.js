// Node.js globals for CLI context
// Use process and console directly (no need to declare)
// @ts-ignore
import { aggregateDescribeRegistry } from './utils.js';
export function parseArgs(argv) {
    // Simple CLI arg parser
    return { args: argv.slice(2) };
}
export function printHelp(usage, description = '') {
    if (description)
        console.log(description);
    console.log('Usage:', usage);
}
export function handleCliError(e) {
    console.error('CLI error:', e);
    process.exit(1);
}
if (process.argv[2] === 'describe-registry-validate') {
    (async () => {
        const registry = await aggregateDescribeRegistry();
        let valid = true;
        const names = new Set();
        const errors = [];
        for (const entry of registry) {
            if (typeof entry === "object" && entry !== null && "name" in entry && typeof entry.name === "string") {
                const typedEntry = entry;
                if (!typedEntry.name) {
                    errors.push(`Missing 'name' in entry: ${JSON.stringify(entry)}`);
                    valid = false;
                }
                else if (names.has(typedEntry.name)) {
                    errors.push(`Duplicate name: ${typedEntry.name}`);
                    valid = false;
                }
                else {
                    names.add(typedEntry.name);
                }
                if (!typedEntry.description) {
                    errors.push(`Missing 'description' in ${typedEntry.name}`);
                    valid = false;
                }
                if (!typedEntry.schema) {
                    errors.push(`Missing 'schema' in ${typedEntry.name}`);
                    valid = false;
                }
            }
        }
        if (!valid) {
            console.error('Describe registry validation failed:');
            for (const err of errors)
                console.error('  -', err);
            process.exit(1);
        }
        else {
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
                    const typedEntry = entry;
                    console.log(`- ${typedEntry.name}: ${typedEntry.description || 'No description.'}`);
                }
            }
            process.exit(0);
        }
        catch (e) {
            handleCliError(e);
        }
    })();
}
