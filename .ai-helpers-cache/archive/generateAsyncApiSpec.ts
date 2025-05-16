#!/usr/bin/env tsx
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(6133): 'parseCliArgs' is declared but its value is never ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

// @ts-expect-error TS(6133): 'REGISTRY_PATH' is declared but its value is never... Remove this comment to see the full error message
const REGISTRY_PATH = '.nootropic-cache/describe-registry.json';
const OUTPUT_PATH = '.nootropic-cache/asyncapi-spec.yaml';
const ASYNCAPI_LLM_PATH = '.nootropic-cache/asyncapi-llm.json';

// @ts-expect-error TS(6133): 'usage' is declared but its value is never read.
const usage = 'Usage: pnpm tsx scripts/generateAsyncApiSpec.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

function toAsyncApiChannel(cap: unknown) {
  // Simple: capability.{name}
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  return `capability.${(cap.name ?? 'unknown').replace(/\s+/g, '_').toLowerCase()}`;
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
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      const inputSchemaName = `${cap.name}Input`;
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      const outputSchemaName = `${cap.name}Output`;
      components['schemas'][inputSchemaName] = inputSchema;
      components['schemas'][outputSchemaName] = outputSchema;
      // Channel
      const channel = toAsyncApiChannel(cap);
      channels[channel] = {
        subscribe: {
          summary: cap.name,
          description: cap.description,
          message: {
            contentType: 'application/json',
            // @ts-expect-error TS(2304): Cannot find name 'components'.
            payload: { $ref: `#/components/schemas/${outputSchemaName}` }
          }
        },
        publish: {
          summary: cap.name,
          description: cap.description,
          message: {
            contentType: 'application/json',
            // @ts-expect-error TS(2304): Cannot find name 'components'.
            payload: { $ref: `#/components/schemas/${inputSchemaName}` }
          }
        }
      };
    }
    const yaml = `asyncapi: 3.0.0
info:
  // @ts-expect-error TS(2304): Cannot find name 'AI'.
  title: nootropic Capabilities AsyncAPI
  version: 0.1.0
  // @ts-expect-error TS(2304): Cannot find name 'Auto'.
  description: Auto-generated AsyncAPI spec from describe registry.
channels:
// @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
${Object.entries(channels).map(([c, v]) => `  ${c}:
    subscribe:
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      summary: ${JSON.stringify(v.subscribe.summary)}
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      description: ${JSON.stringify(v.subscribe.description)}
      message:
        // @ts-expect-error TS(2304): Cannot find name 'application'.
        contentType: application/json
        payload:
          // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
          $ref: '#/components/schemas/${v.subscribe.message.payload.$ref.split('/').pop()}'
    publish:
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      summary: ${JSON.stringify(v.publish.summary)}
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      description: ${JSON.stringify(v.publish.description)}
      message:
        // @ts-expect-error TS(2304): Cannot find name 'application'.
        contentType: application/json
        payload:
          // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
          $ref: '#/components/schemas/${v.publish.message.payload.$ref.split('/').pop()}'`).join('\n')}
components:
  schemas:
// @ts-expect-error TS(2304): Cannot find name 'components'.
${Object.entries(components['schemas']).map(([name, schema]) => `    ${name}: ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n      ')}`).join('\n')}
`;
    // @ts-expect-error TS(2304): Cannot find name 'yaml'.
    fs.writeFileSync(OUTPUT_PATH, yaml, 'utf-8');
    // @ts-expect-error TS(2304): Cannot find name 'yaml'.
    console.log(yaml);

    // Write machine-usable AsyncAPI JSON for LLM/AI workflows
    const asyncapiJson = {
      asyncapi: '3.0.0',
      info: {
        title: 'nootropic Capabilities AsyncAPI',
        version: '0.1.0',
        description: 'Auto-generated AsyncAPI spec from describe registry.'
      },
      // @ts-expect-error TS(2304): Cannot find name 'channels'.
      channels,
      // @ts-expect-error TS(2304): Cannot find name 'components'.
      components
    };
    fs.writeFileSync(ASYNCAPI_LLM_PATH, JSON.stringify(asyncapiJson, null, 2), 'utf-8');
    // @ts-expect-error TS(2304): Cannot find name 'args'.
    if (args['json']) {
      printResult({ asyncapiLlmPath: ASYNCAPI_LLM_PATH }, true);
    }

    // @ts-expect-error TS(2304): Cannot find name 'args'.
    printResult('AsyncAPI spec generated successfully.', args['json']);
  } catch (e) {
    // @ts-expect-error TS(2304): Cannot find name 'args'.
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

// @ts-expect-error TS(2304): Cannot find name 'main'.
main(); 