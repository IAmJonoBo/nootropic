#!/usr/bin/env tsx
// Feature Table Generator: Fully comprehensive for LLM/agent and human usability.
// - Includes all capabilities (agents, plugins, adapters, utilities, orchestration, etc.)
// - Description: Badges for [Schema], [Best Practices], [References], and event info if present.
// - Usage: Full usage string as code block (if present).
// - Key Methods: Up to 3 methods/functions with signature and description, '+N more' if applicable.
// - Events: If subscribesTo/emits/events, add to description.
// - Visual: Highly scannable for LLMs/humans.
import fs from 'fs';
const REGISTRY_PATH = '.nootropic-cache/describe-registry.json';
const OUTPUT_PATH = '.nootropic-cache/feature-table.md';
const FEATURE_TABLE_JSON_PATH = '.nootropic-cache/feature-table.json';
function escapeMd(s) {
    return String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}
function renderTable(registry) {
    const header = '| Capability | Description | Usage | Key Methods/Functions |';
    const divider = '|------------|-------------|-------|----------------------|';
    const rows = registry.map((cap) => {
        if (typeof cap !== 'object' || cap === null)
            return '| | | | |';
        const c = cap;
        const name = escapeMd(c['name'] ?? '');
        let desc = escapeMd(c['description'] ?? '');
        if (c['schema'])
            desc += ' [Schema]';
        if (c['bestPractices'])
            desc += ' 🏅';
        if (c['references'])
            desc += ' 🔗';
        if ((c['subscribesTo'] ?? c['emits']) || c['events']) {
            const subs = c['subscribesTo'] ? `Subscribes: ${c['subscribesTo'].join(', ')}` : '';
            const emits = c['emits'] ? `Emits: ${c['emits'].join(', ')}` : '';
            const events = c['events'] ? `Events: ${c['events'].join(', ')}` : '';
            desc += `\n${[subs, emits, events].filter(Boolean).join(' | ')}`;
        }
        let usage = c['usage'] ? `\n\n\`ts\n${c['usage']}\n\`` : '';
        let methods = '';
        const items = c['methods'] ?? c['functions'];
        if (Array.isArray(items) && items.length > 0) {
            methods = items.slice(0, 3).map((m) => {
                if (typeof m !== 'object' || m === null)
                    return '';
                const mm = m;
                return `**${escapeMd(mm['name'] ?? '')}**: \n${escapeMd(mm['signature'] ?? '')}\n${escapeMd(mm['description'] ?? '')}`;
            }).join('\n\n');
            if (items.length > 3)
                methods += `\n\n+${items.length - 3} more`;
        }
        return `| ${name} | ${desc} | ${usage} | ${methods} |`;
    });
    return [header, divider, ...rows].join('\n');
}
function toStructuredFeature(cap) {
    if (typeof cap !== 'object' || cap === null)
        return {};
    const c = cap;
    return {
        name: c['name'],
        description: c['description'],
        usage: c['usage'],
        methods: c['methods'] ?? c['functions'],
        schema: c['schema'],
        bestPractices: c['bestPractices'],
        references: c['references'],
        events: c['events'],
        subscribesTo: c['subscribesTo'],
        emits: c['emits'],
        aiUsageHint: c['aiUsageHint'] ?? c['llmUsageHint'],
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
