import { ProjectContextService } from "@nootropic/context";
import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
import {
  PlannerService,
  ProjectSpec,
  ReplanContext,
  ValidationResult,
} from "./interfaces";
import { TaskGraph } from "./types";
export interface PlanningResult {
  steps: PlanningStep[];
  estimatedDuration: number;
  requiredResources: string[];
}
export interface PlanningStep {
  id: string;
  description: string;
  agent: string;
  dependencies: string[];
  estimatedDuration: number;
}
/**
 * @todo Implement planner agent service
 * - Add task graph planning
 * - Implement critical path analysis
 * - Add resource optimization
 * - Add cost-aware scheduling
 */
export declare class PlannerServiceImpl implements PlannerService {
  private readonly modelAdapter;
  private readonly storageAdapter;
  private readonly projectContext;
  private readonly logger;
  constructor(
    modelAdapter: ModelAdapter,
    storageAdapter: StorageAdapter,
    projectContext: ProjectContextService,
  );
  initialize(): Promise<void>;
  execute(input: unknown): Promise<unknown>;
  cleanup(): Promise<void>;
  createPlan(goal: string): Promise<PlanningResult>;
  updatePlan(
    planId: string,
    updates: Partial<PlanningResult>,
  ): Promise<PlanningResult>;
  getPlan(planId: string): Promise<PlanningResult>;
  generatePlan(spec: ProjectSpec): Promise<TaskGraph>;
  replanSubtree(taskId: string, context: ReplanContext): Promise<TaskGraph>;
  validatePlan(graph: TaskGraph): Promise<ValidationResult>;
}
