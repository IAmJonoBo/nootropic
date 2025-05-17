#!/usr/bin/env tsx
import fs from 'fs';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const REGISTRY_PATH = '.nootropic-cache/describe-registry.json';
const OUTPUT_PATH = '.nootropic-cache/openapi-spec.yaml';
const OPENAPI_LLM_PATH = '.nootropic-cache/openapi-llm.json';

const usage = 'Usage: pnpm tsx scripts/generateOpenApiSpec.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

function toOpenApiPath(cap: unknown) {
  if (typeof cap !== 'object' || cap === null) return '/capability/unknown';
  const obj = cap as Record<string, unknown>;
  return `/capability/${encodeURIComponent(obj['name'] as string ?? 'unknown')}`;
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
      const schemaName = `${cap.name}Response`;
      (components['schemas'] as Record<string, unknown>)[schemaName] = outputSchema;
      // Path
      const path = toOpenApiPath(cap);
      paths[path] = {
        get: {
          summary: typeof cap === 'object' && cap !== null && 'get' in cap && typeof (cap as { [key: string]: unknown }).get === 'object' ? JSON.stringify((cap as { [key: string]: any }).get.summary) : '',
          description: typeof cap === 'object' && cap !== null && 'get' in cap && typeof (cap as { [key: string]: unknown }).get === 'object' ? JSON.stringify((cap as { [key: string]: any }).get.description) : '',
          responses: {
            '200': {
              description: 'Capability description',
              content: {
                'application/json': {
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
  title: nootropic Capabilities API
  version: 0.1.0
  description: Auto-generated OpenAPI spec from describe registry.
paths:
${Object.entries(paths).map(([p, v]) => `  '${p}':
    get:
      // Index signature access justified: dynamic registry-driven data, safe for LLM/AI and automation
      summary: ${typeof v === 'object' && v !== null && 'get' in v && typeof (v as { [key: string]: unknown }).get === 'object' ? JSON.stringify((v as { [key: string]: any }).get.summary) : ''}
      description: ${typeof v === 'object' && v !== null && 'get' in v && typeof (v as { [key: string]: unknown }).get === 'object' ? JSON.stringify((v as { [key: string]: any }).get.description) : ''}
      responses:
        '200':
          description: Capability description
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/${typeof v === 'object' && v !== null && 'get' in v && typeof (v as { [key: string]: unknown }).get === 'object' && (v as { [key: string]: any }).get.responses && (v as { [key: string]: any }).get.responses['200'] && (v as { [key: string]: any }).get.responses['200'].content && (v as { [key: string]: any }).get.responses['200'].content['application/json'] && (v as { [key: string]: any }).get.responses['200'].content['application/json'].schema && (v as { [key: string]: any }).get.responses['200'].content['application/json'].schema.$ref ? (v as { [key: string]: any }).get.responses['200'].content['application/json'].schema.$ref.split('/').pop() : ''}'`).join('\n')}
components:
  schemas:
${Object.entries(components['schemas'] as Record<string, unknown>).map(([name, schema]) => `    ${name}: ${JSON.stringify(schema, null, 2).replace(/\n/g, '\n      ')}`).join('\n')}
`;
    fs.writeFileSync(OUTPUT_PATH, yaml, 'utf-8');
    console.log(yaml);
    printResult('OpenAPI spec generated successfully.', args['json']);
    // Write machine-usable OpenAPI JSON for LLM/AI workflows
    const openapiJson = {
      openapi: '3.1.0',
      info: {
        title: 'nootropic Capabilities API',
        version: '0.1.0',
        description: 'Auto-generated OpenAPI spec from describe registry.'
      },
      paths,
      components
    };
    fs.writeFileSync(OPENAPI_LLM_PATH, JSON.stringify(openapiJson, null, 2), 'utf-8');
    if (args['json']) {
      printResult({ openapiLlmPath: OPENAPI_LLM_PATH }, true);
    }
  } catch (e) {
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

main(); 