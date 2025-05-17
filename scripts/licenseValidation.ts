#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const REGISTRY_PATH = path.resolve('.nootropic-cache/describe-registry.json');

const usage = 'Usage: pnpm tsx scripts/licenseValidation.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

/**
 * licenseValidation.ts
 *
 * Validates OSS/commercial license compliance for all registered capabilities.
 *
 * Usage:
 *   pnpm tsx scripts/licenseValidation.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Prints a Markdown table of license compliance.
 *
 * Troubleshooting:
 *   - Ensure the describe registry is present and up to date.
 *   - Use --json for machine-readable output in CI/CD.
 *   - For errors, check for missing or invalid license fields in the registry.
 *
 * Example:
 *   pnpm tsx scripts/licenseValidation.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for licenseValidation script."
 *   - "List all scripts that check license compliance."
 *   - "How do I check license compliance for all capabilities?"
 *   - "What does licenseValidation do?"
 */

function isOssLicense(license: string) {
  // SPDX identifiers for common OSS licenses
  const oss = [
    'MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'MPL-2.0', 'AGPL-3.0', 'GPL-3.0', 'LGPL-3.0', 'Unlicense', 'CC0-1.0'
  ];
  return oss.includes(license);
}

function main() {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    if (!fs.existsSync(REGISTRY_PATH)) {
      printError('Describe registry not found: ' + REGISTRY_PATH, Boolean(args['json']));
      process.exit(1);
    }
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    let hasError = false;
    const summary = [];
    summary.push('| Name | License | OSS | Provenance | CloudOnly | OptInRequired |');
    summary.push('|------|---------|-----|------------|-----------|---------------|');
    for (const cap of registry) {
      const { name, license, isOpenSource, provenance, cloudOnly, optInRequired } = cap;
      let row = `| ${name ?? ''} | ${license ?? ''} | ${isOpenSource ? '✅' : '❌'} | ${provenance ?? ''} | ${cloudOnly ? '✅' : ''} | ${optInRequired ? '✅' : ''} |`;
      summary.push(row);
      // Check required fields
      if (!name || !license || typeof isOpenSource !== 'boolean' || !provenance) {
        hasError = true;
      }
      // OSS enforcement
      if (!isOpenSource || !isOssLicense(license)) {
        if (!cloudOnly && !optInRequired) {
          hasError = true;
        }
      }
    }
    if (args['json']) {
      printResult({ summary, hasError }, true);
    } else {
      console.log('\nLicense/OSS Compliance Table:');
      for (const line of summary) console.log(line);
      if (hasError) {
        printError('License/OSS compliance check failed. See errors above.', Boolean(args['json']));
      } else {
        printResult('License/OSS compliance check passed.', Boolean(args['json']));
      }
    }
    process.exit(hasError ? 1 : 0);
  } catch (e) {
    printError(e, Boolean(args['json']));
    process.exit(1);
  }
}

main(); 