#!/usr/bin/env tsx
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';
// @ts-expect-error TS(2724): '"../utils/automationHelpers.js"' has no exported ... Remove this comment to see the full error message
import { readJsonFile, writeJsonFile, handleError } from '../utils/automationHelpers.js';

// @ts-expect-error TS(6133): 'REGISTRY_PATH' is declared but its value is never... Remove this comment to see the full error message
const REGISTRY_PATH = '.nootropic-cache/describe-registry.json';
const DOCS_DIR = 'docs/capabilities';
// @ts-expect-error TS(6133): 'DOC_MANIFEST_PATH' is declared but its value is n... Remove this comment to see the full error message
const DOC_MANIFEST_PATH = 'docs/docManifest.json';
// @ts-expect-error TS(6133): 'LLM_DOCS_PATH' is declared but its value is never... Remove this comment to see the full error message
const LLM_DOCS_PATH = '.nootropic-cache/llm-docs.json';

// @ts-expect-error TS(6133): 'usage' is declared but its value is never read.
const usage = 'Usage: pnpm tsx scripts/generateDocsFromDescribe.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

/**
 * generateDocsFromDescribe.ts
 *
 * Generates per-capability documentation from the describe registry.
 *
 * Usage:
 *   pnpm tsx scripts/generateDocsFromDescribe.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Writes docs to the appropriate location.
 *
 * Troubleshooting:
 *   - Ensure the describe registry is up to date.
 *   - Use --json for machine-readable output in CI/CD.
 *   - For errors, check the output for missing describe modules or registry issues.
 *
 * Example:
 *   pnpm tsx scripts/generateDocsFromDescribe.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for generateDocsFromDescribe script."
 *   - "List all scripts that generate documentation."
 *   - "How do I regenerate capability docs?"
 *   - "What does generateDocsFromDescribe do?"
 */

function ensureDirForFile(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// @ts-expect-error TS(2355): A function whose declared type is neither 'void' n... Remove this comment to see the full error message
function renderCapabilityMd(cap: unknown): string {
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  let md = `# ${cap.name}\n\n`;
  // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
  if (cap.description) md += `${cap.description}\n\n`;
  // @ts-expect-error TS(2552): Cannot find name 'Usage'. Did you mean 'usage'?
  if (cap.usage) md += `**Usage:**\n\n\`${cap.usage}\`\n\n`;
  // @ts-expect-error TS(2304): Cannot find name 'cap'.
  if (cap.methods ?? cap.functions) {
    // @ts-expect-error TS(2304): Cannot find name 'md'.
    md += '## Methods/Functions\n\n';
    // @ts-expect-error TS(2304): Cannot find name 'cap'.
    const items = cap.methods ?? cap.functions;
    for (const m of items) {
      // @ts-expect-error TS(2304): Cannot find name 'md'.
      md += `- **${m.name}**: ${m.signature ?? ''} - ${m.description ?? ''}\n`;
    }
    md += '\n';
  }
  if (cap.schema) {
    md += '## Schema\n\n';
    // @ts-expect-error TS(2304): Cannot find name 'json'.
    md += '```json\n' + JSON.stringify(cap.schema, null, 2) + '\n```\n';
  }
  if (cap.bestPractices) {
    md += '## Best Practices\n\n';
    for (const bp of cap.bestPractices) {
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      md += `- ${bp}\n`;
    }
    md += '\n';
  }
  if (cap.references) {
    md += '## References\n\n';
    for (const ref of cap.references) {
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      md += `- ${ref}\n`;
    }
    md += '\n';
  }
  if (cap.aiUsageHint ?? cap.llmUsageHint) {
    md += '## AI/LLM Usage Hint\n\n';
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    if (cap.aiUsageHint) md += `- ${cap.aiUsageHint}\n`;
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    if (cap.llmUsageHint) md += `- ${cap.llmUsageHint}\n`;
    md += '\n';
  }
  return md;
}

function toStructuredDoc(cap: unknown) {
  return {
    name: cap.name,
    description: cap.description,
    usage: cap.usage,
    methods: cap.methods ?? cap.functions,
    schema: cap.schema,
    bestPractices: cap.bestPractices,
    references: cap.references,
    aiUsageHint: cap.aiUsageHint ?? cap.llmUsageHint,
  };
}

async function main() {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    if (!fs.existsSync(REGISTRY_PATH)) {
      printError('Describe registry not found: ' + REGISTRY_PATH, args['json']);
      process.exit(1);
    }
    if (!fs.existsSync(DOCS_DIR)) {
      fs.mkdirSync(DOCS_DIR, { recursive: true });
    }
    const registry = await readJsonFile(REGISTRY_PATH);
    const outFiles: string[] = [];
    const structuredDocs: unknown[] = [];
    for (const cap of registry) {
      const md = renderCapabilityMd(cap);
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      const outPath = path.join(DOCS_DIR, `${cap.name}.md`);
      ensureDirForFile(outPath);
      fs.writeFileSync(outPath, md, 'utf-8');
      outFiles.push(outPath);
      structuredDocs.push(toStructuredDoc(cap));
    }
    // Update docManifest.json
    let manifest: unknown = {};
    if (fs.existsSync(DOC_MANIFEST_PATH)) {
      manifest = await readJsonFile(DOC_MANIFEST_PATH);
    }
    manifest.generated = Array.from(new Set([...(manifest.generated ?? []), ...outFiles]));
    manifest.timestamp = new Date().toISOString();
    await writeJsonFile(DOC_MANIFEST_PATH, manifest);
    // Write machine-usable LLM/AI docs JSON
    ensureDirForFile(LLM_DOCS_PATH);
    fs.writeFileSync(LLM_DOCS_PATH, JSON.stringify(structuredDocs, null, 2), 'utf-8');
    // @ts-expect-error TS(2304): Cannot find name 'Generated'.
    console.log(`Generated ${outFiles.length} capability docs in ${DOCS_DIR}`);
    printResult('Docs generated successfully.', args['json']);
    if (args['json']) {
      printResult({ llmDocsPath: LLM_DOCS_PATH }, true);
    }
  } catch (e) {
    handleError(e, args['json']);
    printError(e, args['json']);
  }
}

main(); 