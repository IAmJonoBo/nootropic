#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { parseCliArgs, printUsage, printResult, printError } from './src/utils/cliHelpers.js';
import { readJsonFile, writeJsonFile, handleError } from './src/utils/automationHelpers.js';
// @ts-ignore
import type { CapabilityDescribe } from './src/capabilities/Capability.js';
import capabilityRegistry from './src/capabilities/registry.js';

const REGISTRY_PATH = '.nootropic-cache/describe-registry.json';
const DOCS_DIR = 'docs/capabilities';
const DOC_MANIFEST_PATH = 'docs/docManifest.json';
const LLM_DOCS_PATH = '.nootropic-cache/llm-docs.json';

const usage = 'Usage: pnpm tsx scripts/generateDocsFromDescribe.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

// Add local DocManifest type
type DocManifest = {
  generated?: string[];
  timestamp?: string;
  planned?: string[];
  [key: string]: unknown;
};

/**
 * Script to generate per-capability documentation from the describe registry.
 * Usage: pnpm tsx scripts/generateDocsFromDescribe.ts [--help] [--json]
 * LLM/AI-usage: Ensures all capability docs are up to date for agent/plugin discovery and documentation automation.
 */

function ensureDirForFile(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function renderCapabilityMd(cap: CapabilityDescribe): string {
  let md = `# ${cap.name}\n\n`;
  if (cap.description) md += `${cap.description}\n\n`;
  if (cap.usage) md += `**Usage:**\n\n\`${cap.usage}\`\n\n`;
  if (cap.methods) {
    md += '## Methods/Functions\n\n';
    for (const m of cap.methods) {
      md += `- **${m.name}**: ${m.signature ?? ''} - ${m.description ?? ''}\n`;
    }
    md += '\n';
  }
  if (cap.schema) {
    md += '## Schema\n\n';
    md += '```json\n' + JSON.stringify(cap.schema, null, 2) + '\n```\n';
  }
  if (cap.references) {
    md += '## References\n\n';
    for (const ref of cap.references) {
      md += `- ${ref}\n`;
    }
    md += '\n';
  }
  if (cap.aiFriendlyDocs) {
    md += '## AI/LLM Usage Hint\n\n';
    if (cap.aiFriendlyDocs) md += `- LLM/AI-friendly documentation enabled.\n`;
    md += '\n';
  }
  return md;
}

function toStructuredDoc(cap: CapabilityDescribe): CapabilityDescribe {
  return { ...cap };
}

async function main() {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    if (!fs.existsSync(DOCS_DIR)) {
      fs.mkdirSync(DOCS_DIR, { recursive: true });
    }
    const registryDescribe = capabilityRegistry.aggregateDescribe();
    fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true });
    fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registryDescribe, null, 2), 'utf-8');
    if (!Array.isArray(registryDescribe)) throw new Error('Registry is not an array');
    // Use type guard: only process entries with name and description
    const registryDescribeArr: CapabilityDescribe[] = registryDescribe.filter((c: unknown): c is CapabilityDescribe => {
      if (typeof c !== 'object' || c === null) return false;
      const obj = c as Record<string, unknown>;
      return 'name' in obj && typeof obj['name'] === 'string' && 'description' in obj && typeof obj['description'] === 'string';
    });
    const outFiles: string[] = [];
    const structuredDocs: CapabilityDescribe[] = [];
    for (const cap of registryDescribeArr) {
      let desc: CapabilityDescribe;
      try {
        desc = cap;
      } catch (err: unknown) {
        console.warn(`Skipping ${cap.name}: error processing capability:`, err);
        continue;
      }
      const md = renderCapabilityMd(desc);
      const outPath = path.join(DOCS_DIR, `${desc.name}.md`);
      ensureDirForFile(outPath);
      fs.writeFileSync(outPath, md, 'utf-8');
      outFiles.push(outPath);
      structuredDocs.push(toStructuredDoc(desc));
    }
    // Update docManifest.json
    let manifest: DocManifest = {};
    if (fs.existsSync(DOC_MANIFEST_PATH)) {
      const manifestRaw = await readJsonFile(DOC_MANIFEST_PATH);
      manifest = (typeof manifestRaw === 'object' && manifestRaw !== null) ? manifestRaw as DocManifest : {};
    }
    manifest.generated = Array.from(new Set([...(manifest.generated ?? []), ...outFiles]));
    manifest.timestamp = new Date().toISOString();
    await writeJsonFile(DOC_MANIFEST_PATH, manifest);
    // Write machine-usable LLM/AI docs JSON
    ensureDirForFile(LLM_DOCS_PATH);
    fs.writeFileSync(LLM_DOCS_PATH, JSON.stringify(structuredDocs, null, 2), 'utf-8');
    console.log(`Generated ${outFiles.length} capability docs in ${DOCS_DIR}`);
    printResult('Docs generated successfully.', Boolean(args['json']));
    if (args['json']) {
      printResult({ llmDocsPath: LLM_DOCS_PATH }, true);
    }
  } catch (err: unknown) {
    handleError(err, Boolean(args['json']));
    printError(err, Boolean(args['json']));
  }
}

main(); 