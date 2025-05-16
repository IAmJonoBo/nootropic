#!/usr/bin/env tsx
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';
// @ts-expect-error TS(2305): Module '"../utils/automationHelpers.js"' has no ex... Remove this comment to see the full error message
import { readJsonFile, handleError } from '../utils/automationHelpers.js';

const usage = 'Usage: pnpm tsx scripts/docs-check-sync.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

/**
 * docs-check-sync.ts
 *
 * Checks that documentation and code are in sync for all implemented modules.
 *
 * Usage:
 *   pnpm tsx scripts/docs-check-sync.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Fails if docs/code are out of sync.
 *
 * Troubleshooting:
 *   - Ensure all implemented modules are listed in the doc manifest.
 *   - Use --json for machine-readable output in CI/CD.
 *   - For errors, check for missing or extra modules in the manifest or registry.
 *
 * Example:
 *   pnpm tsx scripts/docs-check-sync.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for docs-check-sync script."
 *   - "List all scripts that check doc/code sync."
 *   - "How do I verify docs and code are in sync?"
 *   - "What does docs-check-sync do?"
 */

async function main() {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    const manifestPath = 'docs/docManifest.json';
    const describePath = '.ai-helpers-cache/describe-registry.json';
    const manifest = await readJsonFile(manifestPath);
    const registry = await readJsonFile(describePath);

    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const manifestSections = new Set(manifest.sections ?? []);
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const registrySections = new Set((registry ?? []).filter((d: unknown) => !d.status ?? (d.status !== 'planned' && d.status !== 'in progress')).map((d: unknown) => d.name));

    // Check for missing implemented modules
    // @ts-expect-error TS(2304): Cannot find name 'x'.
    const missingInManifest = Array.from(registrySections).filter(x => !manifestSections.has(x));
    // @ts-expect-error TS(2304): Cannot find name 'x'.
    const missingInRegistry = Array.from(manifestSections).filter(x => !registrySections.has(x));

    let failed = false;
    if (missingInManifest.length) {
      console.error('The following implemented modules/capabilities are missing from docs/docManifest.json sections:');
      for (const m of missingInManifest) console.error('  -', m);
      failed = true;
    }
    if (missingInRegistry.length) {
      console.error('The following docManifest sections are missing from the describe registry:');
      for (const m of missingInRegistry) console.error('  -', m);
      failed = true;
    }

    // Warn only for planned/in-progress features
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    if (manifest.planned && manifest.planned.length) {
      console.log('\nPlanned/in-progress features (for roadmap/backlog, not required for sync):');
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      for (const p of manifest.planned) console.log('  -', p);
    }

    if (failed) {
      printError('Doc/code sync check failed.', args['json']);
    } else {
      printResult('Doc/code sync check passed. All implemented modules are in sync.', args['json']);
    }
  } catch (e) {
    handleError(e, args['json']);
    printError(e, args['json']);
  }
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  process.exit(0);
}

main(); 