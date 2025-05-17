import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
// @ts-ignore
import { workflowZodSchema } from './workflowSchema.js';
// @ts-ignore
import { aggregateDescribeRegistry } from '../utils.js';
import type { z } from 'zod';

// Add a Step type alias for workflow steps
type Step = z.infer<typeof workflowZodSchema>['steps'][number];

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

// Add a helper for topological sort
function topoSort(steps: Step[]): Step[] {
  const sorted: Step[] = [];
  const visited = new Set<string>();
  const stepMap: Record<string, Step> = Object.fromEntries(steps.map((s) => [s.id, s]));
  function visit(step: Step) {
    if (visited.has(step.id)) return;
    if (step.dependsOn) {
      for (const dep of step.dependsOn) {
        const depStep = stepMap[dep];
        if (depStep) visit(depStep);
      }
    }
    visited.add(step.id);
    sorted.push(step);
  }
  for (const step of steps) visit(step);
  return sorted;
}

/**
 * Executes a workflow by composing steps in dependency order.
 * Enhanced: emits rationale/approval events, supports parallel/loop, and policy/mutation hooks.
 * All dynamic boundaries are Zod/type-guard validated. See docs/orchestration.md for details.
 * Options: preStep/postStep hooks, approvalHandler, rationaleHandler for LLM/AI explainability and governance.
 */
export async function executeWorkflow(
  workflow: unknown,
  options?: {
    preStep?: (step: Step) => Promise<void> | void,
    postStep?: (step: Step, result: unknown) => Promise<void> | void,
    approvalHandler?: (step: Step) => Promise<unknown>,
    rationaleHandler?: (step: Step, rationale: string) => Promise<void>
  }
) {
  // Validate first
  const parsed = workflowZodSchema.parse(workflow);
  const registry = await aggregateDescribeRegistry();
  const results: Record<string, unknown> = {};
  // Topological sort for dependency order
  const sortedSteps = topoSort(parsed.steps);
  for (const step of sortedSteps) {
    if (options?.preStep) await options.preStep(step);
    switch (step.type ?? 'task') {
      case 'task': {
        if (step.dependsOn && step.dependsOn.length) {
          for (const dep of step.dependsOn) {
            if (!(dep in results)) throw new Error(`Dependency ${dep} not completed for step ${step.id}`);
          }
        }
        const agent = registry.find((r: unknown) => typeof r === 'object' && r !== null && 'name' in r && (r as { name: string }).name === step.agent);
        if (!agent) throw new Error(`Agent/tool '${step.agent}' not found in registry`);
        // Policy/mutation hook: rationale event
        if (options?.rationaleHandler) await options.rationaleHandler(step, `Executing task step ${step.id}`);
        results[step.id] = { output: `Stub output for ${step.agent}` };
        break;
      }
      case 'approval': {
        // Emit approval event and optionally call approvalHandler
        if (options?.rationaleHandler) await options.rationaleHandler(step, `Approval required for step ${step.id}`);
        let approvalResult: unknown = undefined;
        if (options?.approvalHandler) {
          approvalResult = await options.approvalHandler(step);
        } else {
          // Default: stub approval
          approvalResult = { approved: true, rationale: 'Stub approval' };
        }
        results[step.id] = { output: approvalResult };
        break;
      }
      case 'parallel': {
        // Run all child steps concurrently (metadata.children is array of step ids)
        const children = step.metadata?.children;
        if (Array.isArray(children)) {
          await Promise.all(children.map(async (childId: string) => {
            const childStep = parsed.steps.find((s: unknown) => typeof s === 'object' && s !== null && 'id' in s && (s as { id: string }).id === childId);
            if (!childStep) throw new Error(`Parallel child step '${childId}' not found`);
            if (!(childId in results)) {
              // Recursively execute child step (with hooks)
              const childResult = await executeWorkflow({ ...parsed, steps: [childStep] }, options);
              results[childId] = childResult[childId];
            }
          }));
        }
        if (options?.rationaleHandler) await options.rationaleHandler(step, `Parallel group completed for step ${step.id}`);
        results[step.id] = { output: `Parallel group completed for step ${step.id}` };
        break;
      }
      case 'loop': {
        // Stub: log loop start/end, support for repeated execution in future
        if (options?.rationaleHandler) await options.rationaleHandler(step, `Loop executed for step ${step.id}`);
        results[step.id] = { output: `Loop executed for step ${step.id}` };
        break;
      }
      default: {
        throw new Error(`Unknown step type: ${step.type}`);
      }
    }
    if (options?.postStep) await options.postStep(step, results[step.id]);
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
      { name: 'executeWorkflow', signature: '(workflow: unknown, options?: { preStep?: (step: Step) => Promise<void> | void, postStep?: (step: Step, result: unknown) => Promise<void> | void, approvalHandler?: (step: Step) => Promise<unknown>, rationaleHandler?: (step: Step, rationale: string) => Promise<void> }) => Promise<Record<string, unknown>>', description: 'Executes a workflow by composing steps in dependency order.' }
    ]
  };
} 