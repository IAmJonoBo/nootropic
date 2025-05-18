#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../src/utils/cliHelpers.js';
const options = {
    help: { desc: 'Show help', type: 'boolean' },
    json: { desc: 'Output in JSON format', type: 'boolean' }
};
const OUT_PATH = path.resolve('.nootropic-cache/recent-messages.json');
function getRecentMessages() {
    // TODO: Parse .nootropic-cache/event-log.jsonl for recent agent messages/events
    // For now, return a stub
    return [
        { timestamp: new Date().toISOString(), type: 'Stub', message: 'This is a placeholder. Implement real event log parsing.' }
    ];
}
async function main() {
    const { args, showHelp } = parseCliArgs({ options });
    if (showHelp) {
        printUsage('Usage: pnpm tsx scripts/generateRecentMessages.ts [--help] [--json]', options);
        return;
    }
    try {
        const messages = getRecentMessages();
        if (args['json']) {
            printResult({ messages });
        }
        fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
        await fs.promises.writeFile(OUT_PATH, JSON.stringify({ messages }, null, 2));
        if (!args['json']) {
            console.log(`Recent messages written to ${OUT_PATH}`);
        }
    }
    catch (err) {
        printError(err);
        process.exit(1);
    }
}
main();
