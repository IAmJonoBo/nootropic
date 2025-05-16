// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
import yaml from 'js-yaml';
import { workflowZodSchema } from './workflowSchema.js';
// @ts-expect-error TS(2305): Module '"../utils.js"' has no exported member 'agg... Remove this comment to see the full error message
import { aggregateDescribeRegistry } from '../utils.js';

/**
 * Loads a workflow definition from a YAML or JSON file.
 * 'filePath' is the path to the workflow file.
 */
export function loadWorkflow(filePath: string): unknown {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf-8');
  if (ext === '.yaml' || ext === '.yml') {
    return yaml.load(content);
  }
  return JSON.parse(content);
}

/**
 * Validates a workflow definition using the Zod schema.
 * 'workflow' is the workflow object.
 */
export function validateWorkflow(workflow: unknown) {
  return workflowZodSchema.safeParse(workflow);
}

/**
 * Executes a workflow by composing steps in dependency order.
 * (Stub: actual agent execution is not implemented yet)
 * 'workflow' is the validated workflow object.
 */
export async function executeWorkflow(workflow: unknown) {
  // Validate first
  const parsed = workflowZodSchema.parse(workflow);
  // Aggregate describe registry to resolve agents/tools
  const registry = await aggregateDescribeRegistry();
  // Map of step results
  const results: Record<string, unknown> = {};
  // Simple dependency resolution (topological sort not implemented)
  for (const step of parsed.steps) {
    // Wait for dependencies (if any)
    if (step.dependsOn && step.dependsOn.length) {
      for (const dep of step.dependsOn) {
        // @ts-expect-error TS(2454): Variable 'results' is used before being assigned.
        if (!(dep in results)) throw new Error(`Dependency ${dep} not completed for step ${step.id}`);
      }
    }
    // Stub: resolve agent/tool from registry and "run" (just log for now)
    const agent = registry.find((r: unknown) => typeof r === 'object' && r !== null && 'name' in r && (r as { name: string }).name === step.agent);
    // @ts-expect-error TS(2304): Cannot find name 'Agent'.
    if (!agent) throw new Error(`Agent/tool '${step.agent}' not found in registry`);
    // In real implementation, invoke agent/tool with step.input
    // @ts-expect-error TS(2304): Cannot find name 'Stub'.
    results[step.id] = { output: `Stub output for ${step.agent}` };
  }
  return results;
}

/**
 * Returns a description of the workflow composer for registry/discoverability.
 */
export function describe() {
  return {
    name: 'composeWorkflows',
    description: 'Loader and runner for declarative agent workflows (YAML/JSON). Validates, composes, and executes workflows using the describe registry.',
    functions: [
      { name: 'loadWorkflow', signature: '(filePath: string) => unknown', description: 'Loads a workflow definition from YAML or JSON.' },
      { name: 'validateWorkflow', signature: '(workflow: unknown) => ZodResult', description: 'Validates a workflow using the Zod schema.' },
      { name: 'executeWorkflow', signature: '(workflow: unknown) => Promise<Record<string, unknown>>', description: 'Executes a workflow by composing steps in dependency order.' }
    ]
  };
} 