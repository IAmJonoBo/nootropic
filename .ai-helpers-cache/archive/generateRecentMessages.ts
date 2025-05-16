#!/usr/bin/env tsx
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

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
  } catch (err) {
    printError(err);
    process.exit(1);
  }
}

main(); 