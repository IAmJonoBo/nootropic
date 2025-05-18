#!/usr/bin/env tsx
import fs from 'fs';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../src/utils/cliHelpers.js';
const REGISTRY_PATH = '.nootropic-cache/describe-registry.json';
const OUTPUT_PATH = '.nootropic-cache/asyncapi-spec.yaml';
const ASYNCAPI_LLM_PATH = '.nootropic-cache/asyncapi-llm.json';
const usage = 'Usage: pnpm tsx scripts/generateAsyncApiSpec.ts [--help] [--json]';
const options = {
    json: { desc: 'Output in JSON format', type: 'boolean' },
};
function getPayloadRef(obj) {
    if (typeof obj === 'object' && obj !== null) {
        const o = obj;
        if ('message' in o && typeof o.message === 'object' && o.message !== null) {
            const m = o.message;
            if ('payload' in m && typeof m.payload === 'object' && m.payload !== null) {
                const p = m.payload;
                if ('$ref' in p && typeof p.$ref === 'string') {
                    return p.$ref.split('/').pop() ?? '';
                }
            }
        }
    }
    return '';
}
function toAsyncApiChannel(cap) {
    if (typeof cap !== 'object' || cap === null)
        return 'capability.unknown';
    const obj = cap;
    return `capability.${((obj['name'] ?? 'unknown').replace(/\s+/g, '_').toLowerCase())}`;
}
function main() {
    const { args, showHelp } = parseCliArgs({ options });
    if (showHelp)
        return printUsage(usage, options);
    try {
        if (!fs.existsSync(REGISTRY_PATH)) {
            console.error('Describe registry not found:', REGISTRY_PATH);
            process.exit(1);
        }
        const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
        const channels = {};
        const components = { schemas: {} };
        for (const capRaw of registry) {
            const cap = capRaw;
            const methodNames = cap.schema ? Object.keys(cap.schema) : [];
            const mainMethod = methodNames[0];
            if (!mainMethod)
                continue;
            const inputSchema = cap.schema?.[mainMethod]?.input ?? { type: 'object' };
            const outputSchema = cap.schema?.[mainMethod]?.output ?? { type: 'object' };
            const inputSchemaName = `${cap.name}Input`;
            const outputSchemaName = `${cap.name}Output`;
            components['schemas'][inputSchemaName] = inputSchema;
            components['schemas'][outputSchemaName] = outputSchema;
            const channel = toAsyncApiChannel(cap);
            channels[channel] = {
                subscribe: {
                    summary: cap.subscribe?.summary ?? '',
                    description: cap.subscribe?.description ?? '',
                    message: {
                        contentType: 'application/json',
                        payload: { $ref: `#/components/schemas/${getPayloadRef(cap.subscribe)}` }
                    }
                },
                publish: {
                    summary: cap.publish?.summary ?? '',
                    description: cap.publish?.description ?? '',
                    message: {
                        contentType: 'application/json',
                        payload: { $ref: `#/components/schemas/${getPayloadRef(cap.publish)}` }
                    }
                }
            };
        }
        const yaml = `asyncapi: 3.0.0
info:
  title: nootropic Capabilities AsyncAPI
  version: 0.1.0
  description: Auto-generated AsyncAPI spec from describe registry.
channels:
${Object.entries(channels).map(([c, v]) => {
            const ch = v;
            return `  ${c}:
    subscribe:
      summary: ${ch.subscribe?.summary ?? ''}
      description: ${ch.subscribe?.description ?? ''}
      message:
        contentType: application/json
        payload:
          $ref: '#/components/schemas/${getPayloadRef(ch.subscribe)}'`;
        }).join('\n')}
components:
  schemas:
${Object.entries(components['schemas']).map(([name, schema]) => `    ${name}: ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n      ')}`).join('\n')}
`;
        fs.writeFileSync(OUTPUT_PATH, yaml, 'utf-8');
        console.log(yaml);
        // Write machine-usable AsyncAPI JSON for LLM/AI workflows
        const asyncapiJson = {
            asyncapi: '3.0.0',
            info: {
                title: 'nootropic Capabilities AsyncAPI',
                version: '0.1.0',
                description: 'Auto-generated AsyncAPI spec from describe registry.'
            },
            channels,
            components
        };
        fs.writeFileSync(ASYNCAPI_LLM_PATH, JSON.stringify(asyncapiJson, null, 2), 'utf-8');
        if (args['json']) {
            printResult({ asyncapiLlmPath: ASYNCAPI_LLM_PATH }, true);
        }
        printResult('AsyncAPI spec generated successfully.', args['json']);
    }
    catch (e) {
        printError(e, args['json']);
    }
}
/**
 * generateAsyncApiSpec.ts
 *
 * Generates the AsyncAPI specification for the project.
 *
 * Usage:
 *   pnpm tsx scripts/generateAsyncApiSpec.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Writes AsyncAPI spec to the appropriate location.
 *
 * Troubleshooting:
 *   - Ensure all async events are registered and up to date.
 *   - Use --json for machine-readable output in CI/CD.
 *   - For errors, check for missing or invalid event definitions.
 *
 * Example:
 *   pnpm tsx scripts/generateAsyncApiSpec.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for generateAsyncApiSpec script."
 *   - "List all scripts that generate AsyncAPI specs."
 *   - "How do I regenerate the AsyncAPI spec?"
 *   - "What does generateAsyncApiSpec do?"
 */
main();
