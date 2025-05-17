#!/usr/bin/env tsx
// @ts-ignore
import registry from '../capabilities/registry.js';
// @ts-ignore
// import type { Capability } from '../capabilities/Capability.js';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const usage = 'Usage: pnpm tsx scripts/validateDescribeRegistry.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

/**
 * validateDescribeRegistry.ts
 *
 * Validates that all registered capabilities are compliant with describe/health requirements.
 *
 * Usage:
 *   pnpm tsx scripts/validateDescribeRegistry.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Fails if any capability is noncompliant.
 *
 * Troubleshooting:
 *   - Ensure all capabilities implement required describe/health methods.
 *   - Use --json for machine-readable output in CI/CD.
 *   - For errors, check for missing or invalid capability definitions.
 *
 * Example:
 *   pnpm tsx scripts/validateDescribeRegistry.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for validateDescribeRegistry script."
 *   - "List all scripts that validate describe/health compliance."
 *   - "How do I check describe/health compliance for all capabilities?"
 *   - "What does validateDescribeRegistry do?"
 */

(async () => {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    const capabilities = registry.list();
    let allValid = true;
    for (const cap of capabilities) {
      const errors: string[] = [];
      if (!cap || typeof cap.name !== 'string') {
        errors.push('Missing or invalid name');
      }
      if (typeof cap.describe !== 'function') {
        errors.push('Missing describe() method');
      } else {
        try {
          const desc = cap.describe();
          if (!desc || typeof desc !== 'object' || typeof desc.name !== 'string') {
            errors.push('describe() does not return valid CapabilityDescribe');
          }
        } catch (e) {
          errors.push('describe() throws: ' + String(e));
        }
      }
      if (typeof cap.health !== 'function') {
        errors.push('Missing health() method');
      }
      if (errors.length) {
        allValid = false;
        console.error(`[NONCOMPLIANT] ${cap?.name ?? '(unknown)'}: ${errors.join('; ')}`);
      } else {
        console.log(`[OK] ${cap.name}`);
      }
    }
    if (!allValid) {
      printError('Some capabilities are noncompliant. See above.', typeof args['json'] === 'boolean' ? args['json'] : undefined);
      process.exit(1);
    } else {
      printResult('All registered capabilities are compliant.', typeof args['json'] === 'boolean' ? args['json'] : undefined);
      process.exit(0);
    }
  } catch (e) {
    printError(e, typeof args['json'] === 'boolean' ? args['json'] : undefined);
    process.exit(1);
  }
})(); 