#!/usr/bin/env tsx
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../src/utils/cliHelpers.js';
// @ts-ignore
import { readJsonFile, handleError } from '../src/utils/automationHelpers.js';
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
    if (showHelp)
        return printUsage(usage, options);
    try {
        const manifestPath = 'docs/docManifest.json';
        const describePath = '.nootropic-cache/describe-registry.json';
        const manifest = await readJsonFile(manifestPath);
        const registry = await readJsonFile(describePath);
        const manifestSections = new Set(typeof manifest === 'object' && manifest !== null && 'sections' in manifest && Array.isArray(manifest['sections'])
            ? manifest['sections']
            : []);
        const registrySections = new Set((registry ?? [])
            .filter((d) => {
            if (typeof d !== 'object' || d === null)
                return false;
            const obj = d;
            return !('status' in obj) || (obj['status'] !== 'planned' && obj['status'] !== 'in progress');
        })
            .map((d) => {
            if (typeof d !== 'object' || d === null)
                return '';
            return d['name'] ?? '';
        }));
        // Enhanced: Filter manifest sections to ignore planned/in-progress by status or naming
        function isPlannedOrStub(section) {
            if (typeof section !== 'string')
                return false;
            const lower = section.toLowerCase();
            return lower.includes('(planned)') || lower.includes('(in progress)') || lower.includes('todo-') || lower.includes('epic-') || lower.includes('review-') || lower.includes('archive-') || lower.includes('implement-') || lower.includes('automation-') || lower.includes('planned-') || lower.includes('stub') || lower.includes('draft');
        }
        // Get epics and stories slugs from manifest (if present)
        const epicsSlugs = Array.isArray(manifest.epics) ? manifest.epics.map((e) => e.slug) : [];
        const storiesSlugs = Array.isArray(manifest.stories) ? manifest.stories.map((s) => s.slug) : [];
        const ignoreSlugs = new Set([...epicsSlugs, ...storiesSlugs]);
        const filteredManifestSections = new Set(Array.from(manifestSections).filter(x => !isPlannedOrStub(x) && !ignoreSlugs.has(x)));
        // Debug: Print filtered manifest and registry sections
        console.log('DEBUG: filteredManifestSections:', Array.from(filteredManifestSections));
        console.log('DEBUG: registrySections:', Array.from(registrySections));
        // Check for missing implemented modules
        const missingInManifest = Array.from(registrySections).filter(x => !filteredManifestSections.has(x));
        const missingInRegistry = Array.from(filteredManifestSections).filter(x => typeof x === 'string' && !registrySections.has(x));
        let failed = false;
        if (missingInManifest.length) {
            console.error('The following implemented modules/capabilities are missing from docs/docManifest.json sections:');
            for (const m of missingInManifest)
                console.error('  -', m);
            failed = true;
        }
        if (missingInRegistry.length) {
            console.error('The following docManifest sections are missing from the describe registry:');
            for (const m of missingInRegistry)
                console.error('  -', m);
            failed = true;
        }
        // Warn only for planned/in-progress features
        const hasPlanned = typeof manifest === 'object' &&
            manifest !== null &&
            Object.prototype.hasOwnProperty.call(manifest, 'planned') &&
            Array.isArray(manifest['planned']);
        if (hasPlanned) {
            const plannedArr = manifest['planned'];
            console.log('Planned sections:');
            for (const p of plannedArr)
                console.log('  -', p);
        }
        // Debug: Print manifest.sections length and first 50 entries
        if (manifest && typeof manifest === 'object' && 'sections' in manifest) {
            const sectionsArr = manifest.sections;
            console.log('DEBUG: manifest.sections type:', typeof sectionsArr, Array.isArray(sectionsArr));
            console.log('DEBUG: manifest.sections length:', sectionsArr.length);
            console.log('DEBUG: manifest.sections first 50:', sectionsArr.slice(0, 50));
        }
        // Debug: Check why RAGPipelineUtility is excluded
        console.log('DEBUG: isPlannedOrStub("RAGPipelineUtility"):', isPlannedOrStub('RAGPipelineUtility'));
        console.log('DEBUG: ignoreSlugs has RAGPipelineUtility:', ignoreSlugs.has('RAGPipelineUtility'));
        if (failed) {
            printError('Doc/code sync check failed.', Boolean(args['json']));
        }
        else {
            printResult('Doc/code sync check passed. All implemented modules are in sync.', Boolean(args['json']));
        }
    }
    catch (e) {
        handleError(e, Boolean(args['json']));
        printError(String(e), Boolean(args['json']));
    }
    process.exit(0);
}
main();
