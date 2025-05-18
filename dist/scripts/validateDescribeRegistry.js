#!/usr/bin/env tsx
// @ts-ignore
import registry from '../src/capabilities/registry.js';
// @ts-ignore
// import type { Capability } from '../capabilities/Capability.js';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../src/utils/cliHelpers.js';
const usage = 'Usage: pnpm tsx scripts/validateDescribeRegistry.ts [--help] [--json] [--test]';
const options = {
    json: { desc: 'Output in JSON format', type: 'boolean' },
    test: { desc: 'Run comprehensive tests on the registry', type: 'boolean' },
};
/**
 * validateDescribeRegistry.ts
 *
 * Validates that all registered capabilities are compliant with describe/health requirements.
 *
 * Usage:
 *   pnpm tsx scripts/validateDescribeRegistry.ts [--help] [--json] [--test]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *   --test   Run comprehensive tests on the registry
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
    if (showHelp)
        return printUsage(usage, options);
    try {
        const capabilities = registry.list();
        let allValid = true;
        for (const cap of capabilities) {
            const errors = [];
            if (!cap || typeof cap.name !== 'string') {
                errors.push('Missing or invalid name');
            }
            if (typeof cap.describe !== 'function') {
                errors.push('Missing describe() method');
            }
            else {
                try {
                    const desc = cap.describe();
                    if (!desc || typeof desc !== 'object' || typeof desc.name !== 'string') {
                        errors.push('describe() does not return valid CapabilityDescribe');
                    }
                }
                catch (e) {
                    errors.push('describe() throws: ' + String(e));
                }
            }
            if (typeof cap.health !== 'function') {
                errors.push('Missing health() method');
            }
            if (errors.length) {
                allValid = false;
                console.error(`[NONCOMPLIANT] ${cap?.name ?? '(unknown)'}: ${errors.join('; ')}`);
            }
            else {
                console.log(`[OK] ${cap.name}`);
            }
        }
        if (!allValid) {
            printError('Some capabilities are noncompliant. See above.', typeof args['json'] === 'boolean' ? args['json'] : undefined);
            process.exit(1);
        }
        else {
            printResult('All registered capabilities are compliant.', typeof args['json'] === 'boolean' ? args['json'] : undefined);
            if (args['test']) {
                // Test registry.get()
                const first = capabilities[0];
                if (first) {
                    const byName = registry.get(first.name);
                    console.log('[TEST] registry.get():', byName ? 'OK' : 'FAIL', byName?.name);
                }
                // Test registry.list()
                const all = registry.list();
                console.log('[TEST] registry.list():', Array.isArray(all) && all.length > 0 ? 'OK' : 'FAIL', 'Count:', all.length);
                // Test registry.aggregateDescribe()
                const descs = registry.aggregateDescribe();
                console.log('[TEST] registry.aggregateDescribe():', Array.isArray(descs) && descs.length === all.length ? 'OK' : 'FAIL', 'Count:', descs.length);
                // Print a sample describe output
                if (descs[0]) {
                    console.log('[TEST] Sample describe:', JSON.stringify(descs[0], null, 2));
                }
            }
            process.exit(0);
        }
    }
    catch (e) {
        printError(e, typeof args['json'] === 'boolean' ? args['json'] : undefined);
        process.exit(1);
    }
})();
