#!/usr/bin/env tsx
import registry from '../capabilities/registry.js';
// import type { Capability } from '../capabilities/Capability.js';
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
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

// @ts-expect-error TS(2304): Cannot find name 'async'.
(async () => {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  const { args, showHelp } = parseCliArgs({ options });
  // @ts-expect-error TS(6133): 'showHelp' is declared but its value is never read... Remove this comment to see the full error message
  if (showHelp) return printUsage(usage, options);
  try {
    // @ts-expect-error TS(2304): Cannot find name 'capabilities'.
    const capabilities = registry.list();
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let allValid = true;
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    for (const cap of capabilities) {
      const errors: string[] = [];
      if (!cap ?? typeof cap.name !== 'string') {
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
        // @ts-expect-error TS(2304): Cannot find name 'allValid'.
        allValid = false;
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        console.error(`[NONCOMPLIANT] ${cap?.name ?? '(unknown)'}: ${errors.join('; ')}`);
      } else {
        // @ts-expect-error TS(2304): Cannot find name 'OK'.
        console.log(`[OK] ${cap.name}`);
      }
    }
    if (!allValid) {
      printError('Some capabilities are noncompliant. See above.', args['json']);
      process.exit(1);
    } else {
      printResult('All registered capabilities are compliant.', args['json']);
      process.exit(0);
    }
  } catch (e) {
    printError(e, args['json']);
    process.exit(1);
  }
})(); 