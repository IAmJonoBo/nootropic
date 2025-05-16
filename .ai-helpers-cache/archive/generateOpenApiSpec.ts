#!/usr/bin/env tsx
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(6133): 'parseCliArgs' is declared but its value is never ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

// @ts-expect-error TS(6133): 'REGISTRY_PATH' is declared but its value is never... Remove this comment to see the full error message
const REGISTRY_PATH = '.nootropic-cache/describe-registry.json';
const OUTPUT_PATH = '.nootropic-cache/openapi-spec.yaml';
const OPENAPI_LLM_PATH = '.nootropic-cache/openapi-llm.json';

// @ts-expect-error TS(6133): 'usage' is declared but its value is never read.
const usage = 'Usage: pnpm tsx scripts/generateOpenApiSpec.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

function toOpenApiPath(cap: unknown) {
  // Simple: /capability/{name}
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  return `/capability/${encodeURIComponent(cap.name ?? 'unknown')}`;
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
    const paths: Record<string, unknown> = {};
    const components: Record<string, unknown> = { schemas: {} };
    for (const cap of registry) {
      // Use the first method's output schema as the main response schema
      const methodNames = Object.keys(cap.schema ?? {});
      let mainMethod = methodNames[0];
      if (!mainMethod) continue;
      const outputSchema = cap.schema[mainMethod]?.output ?? { type: 'object' };
      // Add to components.schemas
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      const schemaName = `${cap.name}Response`;
      components['schemas'][schemaName] = outputSchema;
      // Path
      const path = toOpenApiPath(cap);
      paths[path] = {
        get: {
          summary: cap.name,
          description: cap.description,
          responses: {
            '200': {
              description: 'Capability description',
              content: {
                'application/json': {
                  // @ts-expect-error TS(2304): Cannot find name 'components'.
                  schema: { $ref: `#/components/schemas/${schemaName}` }
                }
              }
            }
          }
        }
      };
    }
    const yaml = `openapi: 3.1.0
info:
  // @ts-expect-error TS(2304): Cannot find name 'AI'.
  title: nootropic Capabilities API
  version: 0.1.0
  // @ts-expect-error TS(2304): Cannot find name 'Auto'.
  description: Auto-generated OpenAPI spec from describe registry.
paths:
// @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
${Object.entries(paths).map(([p, v]) => `  '${p}':
    get:
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      summary: ${JSON.stringify(v.get.summary)}
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      description: ${JSON.stringify(v.get.description)}
      responses:
        '200':
          // @ts-expect-error TS(2304): Cannot find name 'Capability'.
          description: Capability description
          content:
            // @ts-expect-error TS(2304): Cannot find name 'application'.
            application/json:
              schema:
                // @ts-expect-error TS(2304): Cannot find name 'application'.
                $ref: '#/components/schemas/${v.get.responses['200'].content['application/json'].schema.$ref.split('/').pop()}'`).join('\n')}
components:
  schemas:
// @ts-expect-error TS(2304): Cannot find name 'components'.
${Object.entries(components['schemas']).map(([name, schema]) => `    ${name}: ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n      ')}`).join('\n')}
`;
    // @ts-expect-error TS(2304): Cannot find name 'yaml'.
    fs.writeFileSync(OUTPUT_PATH, yaml, 'utf-8');
    // @ts-expect-error TS(2304): Cannot find name 'yaml'.
    console.log(yaml);
    // @ts-expect-error TS(2304): Cannot find name 'args'.
    printResult('OpenAPI spec generated successfully.', args['json']);
    // Write machine-usable OpenAPI JSON for LLM/AI workflows
    const openapiJson = {
      openapi: '3.1.0',
      info: {
        title: 'nootropic Capabilities API',
        version: '0.1.0',
        description: 'Auto-generated OpenAPI spec from describe registry.'
      },
      // @ts-expect-error TS(2304): Cannot find name 'paths'.
      paths,
      // @ts-expect-error TS(2304): Cannot find name 'components'.
      components
    };
    fs.writeFileSync(OPENAPI_LLM_PATH, JSON.stringify(openapiJson, null, 2), 'utf-8');
    // @ts-expect-error TS(2304): Cannot find name 'args'.
    if (args['json']) {
      printResult({ openapiLlmPath: OPENAPI_LLM_PATH }, true);
    }
  } catch (e) {
    // @ts-expect-error TS(2304): Cannot find name 'args'.
    printError(e, args['json']);
  }
}

/**
 * generateOpenApiSpec.ts
 *
 * Generates the OpenAPI specification for the project.
 *
 * Usage:
 *   pnpm tsx scripts/generateOpenApiSpec.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Writes OpenAPI spec to the appropriate location.
 *
 * Troubleshooting:
 *   - Ensure all API endpoints are registered and up to date.
 *   - Use --json for machine-readable output in CI/CD.
 *   - For errors, check for missing or invalid endpoint definitions.
 *
 * Example:
 *   pnpm tsx scripts/generateOpenApiSpec.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for generateOpenApiSpec script."
 *   - "List all scripts that generate OpenAPI specs."
 *   - "How do I regenerate the OpenAPI spec?"
 *   - "What does generateOpenApiSpec do?"
 */

// @ts-expect-error TS(2304): Cannot find name 'main'.
main(); 