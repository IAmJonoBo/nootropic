#!/usr/bin/env tsx
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';
// @ts-ignore
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
    const describePath = '.nootropic-cache/describe-registry.json';
    const manifest = await readJsonFile(manifestPath);
    const registry = await readJsonFile(describePath);

    const manifestSections = new Set(
      typeof manifest === 'object' && manifest !== null && 'sections' in manifest && Array.isArray((manifest as Record<string, unknown>)['sections'])
        ? (manifest as Record<string, unknown>)['sections'] as unknown[]
        : []
    );
    const registrySections = new Set(
      ((registry ?? []) as unknown[])
        .filter((d: unknown) => {
          if (typeof d !== 'object' || d === null) return false;
          const obj = d as Record<string, unknown>;
          return !('status' in obj) || (obj['status'] !== 'planned' && obj['status'] !== 'in progress');
        })
        .map((d: unknown) => {
          if (typeof d !== 'object' || d === null) return '';
          return (d as Record<string, unknown>)['name'] as string ?? '';
        })
    );

    // Check for missing implemented modules
    const missingInManifest = Array.from(registrySections).filter(x => !manifestSections.has(x));
    const missingInRegistry = Array.from(manifestSections).filter(x => typeof x === 'string' && !registrySections.has(x));

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
    const hasPlanned =
      typeof manifest === 'object' &&
      manifest !== null &&
      Object.prototype.hasOwnProperty.call(manifest, 'planned') &&
      Array.isArray((manifest as Record<string, unknown>)['planned']);
    if (hasPlanned) {
      const plannedArr = (manifest as Record<string, unknown>)['planned'] as unknown[];
      console.log('Planned sections:');
      for (const p of plannedArr) console.log('  -', p);
    }

    if (failed) {
      printError('Doc/code sync check failed.', Boolean(args['json']));
    } else {
      printResult('Doc/code sync check passed. All implemented modules are in sync.', Boolean(args['json']));
    }
  } catch (e) {
    handleError(e, Boolean(args['json']));
    printError(String(e), Boolean(args['json']));
  }
  process.exit(0);
}

main(); 