#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../src/utils/cliHelpers.js';

const options = {
  help: { desc: 'Show help', type: 'boolean' },
  json: { desc: 'Output in JSON format', type: 'boolean' }
};

const OUT_PATH = path.resolve('.nootropic-cache/health-status.json');

function getHealthStatus() {
  // TODO: Aggregate health from pluginRegistry.ts and all registry-compliant capabilities
  // For now, return a stub
  return {
    generatedAt: new Date().toISOString(),
    status: 'stub',
    details: 'Implement real health aggregation from registry and plugins.'
  };
}

async function main() {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) {
    printUsage('Usage: pnpm tsx scripts/generateHealthStatus.ts [--help] [--json]', options);
    return;
  }
  try {
    const health = getHealthStatus();
    if (args['json']) {
      printResult(health);
    }
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    await fs.promises.writeFile(OUT_PATH, JSON.stringify(health, null, 2));
    if (!args['json']) {
      console.log(`Health status written to ${OUT_PATH}`);
    }
  } catch (err) {
    printError(err);
    process.exit(1);
  }
}

/**
 * generateHealthStatus.ts
 *
 * Generates a health status report for all registered capabilities and plugins.
 *
 * Usage:
 *   pnpm tsx scripts/generateHealthStatus.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Writes health status to .nootropic-cache/health-status.json.
 *
 * Troubleshooting:
 *   - Ensure all capabilities and plugins are registered and up to date.
 *   - Use --json for machine-readable output in CI/CD.
 *   - For errors, check for missing or invalid health data in the registry.
 *
 * Example:
 *   pnpm tsx scripts/generateHealthStatus.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for generateHealthStatus script."
 *   - "List all scripts that generate health status."
 *   - "How do I check health status for all capabilities?"
 *   - "What does generateHealthStatus do?"
 */

main(); 