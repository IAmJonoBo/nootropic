import { PlannerService } from "@nootropic/agents/planner-agent";
import { CoderService } from "@nootropic/agents/coder-agent";
import { CriticService } from "@nootropic/agents/critic-agent";
import { ReasoningService } from "@nootropic/agents/reasoning-agent";
import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
import { ProjectContextService } from "@nootropic/context";
export interface ExecutionResult {
  success: boolean;
  steps: {
    id: string;
    status: "completed" | "failed" | "skipped";
    result?: any;
    error?: string;
  }[];
  summary: string;
}
export declare class ExecutorService {
  private readonly plannerService;
  private readonly coderService;
  private readonly criticService;
  private readonly reasoningService;
  private readonly modelAdapter;
  private readonly storageAdapter;
  private readonly projectContext;
  private readonly logger;
  constructor(
    plannerService: PlannerService,
    coderService: CoderService,
    criticService: CriticService,
    reasoningService: ReasoningService,
    modelAdapter: ModelAdapter,
    storageAdapter: StorageAdapter,
    projectContext: ProjectContextService,
  );
  executePlan(planId: string): Promise<ExecutionResult>;
  private executeSteps;
  private generateSummary;
}
