// Node.js globals for CLI context
// Use process and console directly (no need to declare)
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
