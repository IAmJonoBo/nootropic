#!/usr/bin/env tsx
// Feature Table Generator: Fully comprehensive for LLM/agent and human usability.
// - Includes all capabilities (agents, plugins, adapters, utilities, orchestration, etc.)
// - Description: Badges for [Schema], [Best Practices], [References], and event info if present.
// - Usage: Full usage string as code block (if present).
// - Key Methods: Up to 3 methods/functions with signature and description, '+N more' if applicable.
// - Events: If subscribesTo/emits/events, add to description.
// - Visual: Highly scannable for LLMs/humans.
// @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
import fs from 'fs';

// @ts-expect-error TS(6133): 'REGISTRY_PATH' is declared but its value is never... Remove this comment to see the full error message
const REGISTRY_PATH = '.nootropic-cache/describe-registry.json';
// @ts-expect-error TS(6133): 'OUTPUT_PATH' is declared but its value is never r... Remove this comment to see the full error message
const OUTPUT_PATH = '.nootropic-cache/feature-table.md';
// @ts-expect-error TS(6133): 'FEATURE_TABLE_JSON_PATH' is declared but its valu... Remove this comment to see the full error message
const FEATURE_TABLE_JSON_PATH = '.nootropic-cache/feature-table.json';

function escapeMd(s: string) {
  return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

// @ts-expect-error TS(2355): A function whose declared type is neither 'void' n... Remove this comment to see the full error message
function renderTable(registry: unknown[]): string {
  // @ts-expect-error TS(6133): 'header' is declared but its value is never read.
  const header = '| Capability | Description | Usage | Key Methods/Functions |';
  // @ts-expect-error TS(6133): 'divider' is declared but its value is never read.
  const divider = '|------------|-------------|-------|----------------------|';
  // @ts-expect-error TS(6133): 'cap' is declared but its value is never read.
  const rows = registry.map((cap: unknown) => {
    // @ts-expect-error TS(2588): Cannot assign to 'name' because it is a constant.
    const name = escapeMd(cap.name ?? '');
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let desc = escapeMd(cap.description ?? '');
    // @ts-expect-error TS(6133): 'cap' is declared but its value is never read.
    if (cap.schema) desc += ' [Schema]';
    // @ts-expect-error TS(2304): Cannot find name 'cap'.
    if (cap.bestPractices) desc += ' 🏅';
    // @ts-expect-error TS(2304): Cannot find name 'cap'.
    if (cap.references) desc += ' 🔗';
    // @ts-expect-error TS(2304): Cannot find name 'cap'.
    if ((cap.subscribesTo ?? cap.emits) || cap.events) {
      // @ts-expect-error TS(2304): Cannot find name 'cap'.
      const subs = cap.subscribesTo ? `Subscribes: ${cap.subscribesTo.join(', ')}` : '';
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      const emits = cap.emits ? `Emits: ${cap.emits.join(', ')}` : '';
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      const events = cap.events ? `Events: ${cap.events.join(', ')}` : '';
      // @ts-expect-error TS(2304): Cannot find name 'n$'.
      desc += `\n${[subs, emits, events].filter(Boolean).join(' | ')}`;
    }
    // @ts-expect-error TS(2304): Cannot find name 'n'.
    let usage = cap.usage ? `\n\n\`\`\`ts\n${cap.usage}\n\`\`\`` : '';
    let methods = '';
    // @ts-expect-error TS(2304): Cannot find name 'cap'.
    const items = cap.methods ?? cap.functions;
    if (Array.isArray(items) && items.length > 0) {
      // @ts-expect-error TS(6133): 'm' is declared but its value is never read.
      methods = items.slice(0, 3).map((m: unknown) => `**${escapeMd(m.name)}**: 
// @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
${escapeMd(m.signature ?? '')}
// @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
${escapeMd(m.description ?? '')}`).join('\n\n');
      // @ts-expect-error TS(2304): Cannot find name 'n'.
      if (items.length > 3) methods += `\n\n+${items.length - 3} more`;
    }
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    return `| ${name} | ${desc} | ${usage} | ${methods} |`;
  });
  return [header, divider, ...rows].join('\n');
}

function toStructuredFeature(cap: unknown) {
  return {
    name: cap.name,
    description: cap.description,
    usage: cap.usage,
    methods: cap.methods ?? cap.functions,
    schema: cap.schema,
    bestPractices: cap.bestPractices,
    references: cap.references,
    events: cap.events,
    subscribesTo: cap.subscribesTo,
    emits: cap.emits,
    aiUsageHint: cap.aiUsageHint ?? cap.llmUsageHint,
  };
}

function main() {
  const args = process.argv.slice(2);
  const jsonFlag = args.includes('--json');
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error('Describe registry not found:', REGISTRY_PATH);
    process.exit(1);
  }
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  // Support new registry format: { capabilities, pluginHealth, pluginErrors }
  const capabilities = Array.isArray(registry) ? registry : registry.capabilities;
  // @ts-expect-error TS(2304): Cannot find name 'Note'.
  const table = `> **Note:** This table is auto-generated from the describe registry. Plugin health and error status are available in the registry output. Follows 2025 OTel/GenAI SIG best practices.\n\n` + renderTable(capabilities);
  fs.writeFileSync(OUTPUT_PATH, table, 'utf-8');
  // Write machine-usable feature table JSON for LLM/AI workflows
  const structured = capabilities.map(toStructuredFeature);
  fs.writeFileSync(FEATURE_TABLE_JSON_PATH, JSON.stringify(structured, null, 2), 'utf-8');
  if (jsonFlag) {
    console.log(JSON.stringify({ featureTableJsonPath: FEATURE_TABLE_JSON_PATH }, null, 2));
  }
  console.log(table);
}

main(); 