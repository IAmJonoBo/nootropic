#!/usr/bin/env tsx
import fs from 'fs';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const REGISTRY_PATH = '.nootropic-cache/describe-registry.json';
const OUTPUT_PATH = '.nootropic-cache/asyncapi-spec.yaml';
const ASYNCAPI_LLM_PATH = '.nootropic-cache/asyncapi-llm.json';

const usage = 'Usage: pnpm tsx scripts/generateAsyncApiSpec.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

function toAsyncApiChannel(cap: unknown) {
  if (typeof cap !== 'object' || cap === null) return 'capability.unknown';
  const obj = cap as Record<string, unknown>;
  return `capability.${((obj['name'] as string ?? 'unknown').replace(/\s+/g, '_').toLowerCase())}`;
}

function main() {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    if (!fs.existsSync(REGISTRY_PATH)) {
      console.error('Describe registry not found:', REGISTRY_PATH);
      process.exit(1);
    }
    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    const channels: Record<string, unknown> = {};
    const components: Record<string, unknown> = { schemas: {} };
    for (const cap of registry) {
      // Use the first method's input/output schema for publish/subscribe
      const methodNames = Object.keys(cap.schema ?? {});
      let mainMethod = methodNames[0];
      if (!mainMethod) continue;
      const inputSchema = cap.schema[mainMethod]?.input ?? { type: 'object' };
      const outputSchema = cap.schema[mainMethod]?.output ?? { type: 'object' };
      // Add to components.schemas
      const inputSchemaName = `${cap.name}Input`;
      const outputSchemaName = `${cap.name}Output`;
      (components['schemas'] as Record<string, unknown>)[inputSchemaName] = inputSchema;
      (components['schemas'] as Record<string, unknown>)[outputSchemaName] = outputSchema;
      // Channel
      const channel = toAsyncApiChannel(cap);
      channels[channel] = {
        subscribe: {
          summary: typeof cap === 'object' && cap !== null && 'subscribe' in cap && typeof (cap as { [key: string]: unknown }).subscribe === 'object' ? JSON.stringify((cap as { [key: string]: any }).subscribe.summary) : '',
          description: typeof cap === 'object' && cap !== null && 'subscribe' in cap && typeof (cap as { [key: string]: unknown }).subscribe === 'object' ? JSON.stringify((cap as { [key: string]: any }).subscribe.description) : '',
          message: {
            contentType: 'application/json',
            payload: { $ref: `#/components/schemas/${typeof cap === 'object' && cap !== null && 'subscribe' in cap && typeof (cap as { [key: string]: unknown }).subscribe === 'object' && (cap as { [key: string]: any }).subscribe && (cap as { [key: string]: any }).subscribe.message && (cap as { [key: string]: any }).subscribe.message.payload && (cap as { [key: string]: any }).subscribe.message.payload.$ref ? (cap as { [key: string]: any }).subscribe.message.payload.$ref.split('/').pop() : ''}'` }
          }
        },
        publish: {
          summary: typeof cap === 'object' && cap !== null && 'publish' in cap && typeof (cap as { [key: string]: unknown }).publish === 'object' ? JSON.stringify((cap as { [key: string]: any }).publish.summary) : '',
          description: typeof cap === 'object' && cap !== null && 'publish' in cap && typeof (cap as { [key: string]: unknown }).publish === 'object' ? JSON.stringify((cap as { [key: string]: any }).publish.description) : '',
          message: {
            contentType: 'application/json',
            payload: { $ref: `#/components/schemas/${typeof cap === 'object' && cap !== null && 'publish' in cap && typeof (cap as { [key: string]: unknown }).publish === 'object' && (cap as { [key: string]: any }).publish && (cap as { [key: string]: any }).publish.message && (cap as { [key: string]: any }).publish.message.payload && (cap as { [key: string]: any }).publish.message.payload.$ref ? (cap as { [key: string]: any }).publish.message.payload.$ref.split('/').pop() : ''}'` }
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
${Object.entries(channels).map(([c, v]) => `  ${c}:
    subscribe:
      // Index signature access justified: dynamic registry-driven data, safe for LLM/AI and automation
      summary: ${typeof v === 'object' && v !== null && 'subscribe' in v && typeof (v as { [key: string]: unknown }).subscribe === 'object' ? JSON.stringify((v as { [key: string]: any }).subscribe.summary) : ''}
      description: ${typeof v === 'object' && v !== null && 'subscribe' in v && typeof (v as { [key: string]: unknown }).subscribe === 'object' ? JSON.stringify((v as { [key: string]: any }).subscribe.description) : ''}
      message:
        contentType: application/json
        payload:
          $ref: '#/components/schemas/${typeof v === 'object' && v !== null && 'subscribe' in v && typeof (v as { [key: string]: unknown }).subscribe === 'object' && (v as { [key: string]: any }).subscribe && (v as { [key: string]: any }).subscribe.message && (v as { [key: string]: any }).subscribe.message.payload && (v as { [key: string]: any }).subscribe.message.payload.$ref ? (v as { [key: string]: any }).subscribe.message.payload.$ref.split('/').pop() : ''}'`).join('\n')}
components:
  schemas:
${Object.entries(components['schemas'] as Record<string, unknown>).map(([name, schema]) => `    ${name}: ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n      ')}`).join('\n')}
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
  } catch (e) {
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