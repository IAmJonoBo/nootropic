import { workflowZodSchema } from './workflowSchema.js';
import type { z } from 'zod';
type Step = z.infer<typeof workflowZodSchema>['steps'][number];
/**
 * Loads a workflow definition from a YAML or JSON file.
 * 'filePath' is the path to the workflow file.
 */
export declare function loadWorkflow(filePath: string): unknown;
/**
 * Validates a workflow definition using the Zod schema.
 * 'workflow' is the workflow object.
 */
export declare function validateWorkflow(workflow: unknown): z.SafeParseReturnType<{
    name: string;
    steps: {
        id: string;
        agent: string;
        input: Record<string, any>;
        type?: "task" | "approval" | "parallel" | "loop" | undefined;
        metadata?: Record<string, any> | undefined;
        output?: Record<string, any> | undefined;
        dependsOn?: string[] | undefined;
    }[];
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    name: string;
    steps: {
        type: "task" | "approval" | "parallel" | "loop";
        id: string;
        agent: string;
        input: Record<string, any>;
        metadata?: Record<string, any> | undefined;
        output?: Record<string, any> | undefined;
        dependsOn?: string[] | undefined;
    }[];
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
/**
 * Executes a workflow by composing steps in dependency order.
 * Enhanced: emits rationale/approval events, supports parallel/loop, and policy/mutation hooks.
 * All dynamic boundaries are Zod/type-guard validated. See docs/orchestration.md for details.
 * Options: preStep/postStep hooks, approvalHandler, rationaleHandler for LLM/AI explainability and governance.
 */
export declare function executeWorkflow(workflow: unknown, options?: {
    preStep?: (step: Step) => Promise<void> | void;
    postStep?: (step: Step, result: unknown) => Promise<void> | void;
    approvalHandler?: (step: Step) => Promise<unknown>;
    rationaleHandler?: (step: Step, rationale: string) => Promise<void>;
}): Promise<Record<string, unknown>>;
/**
 * Returns a description of the workflow composer for registry/discoverability.
 */
export declare function describe(): {
    name: string;
    description: string;
    functions: {
        name: string;
        signature: string;
        description: string;
    }[];
};
export {};
