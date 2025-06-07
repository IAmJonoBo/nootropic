import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
import { ProjectContextService } from "@nootropic/context";
import { ReasoningService, Context } from "./interfaces";
import { Analysis, Problem, Reasoning } from "./types";
export interface ReasoningResult {
  conclusion: string;
  reasoning: string[];
  confidence: number;
  alternatives: string[];
  metadata: {
    context: any;
    assumptions: string[];
    constraints: string[];
  };
}
export declare class ReasoningServiceImpl implements ReasoningService {
  private readonly modelAdapter;
  private readonly storageAdapter;
  private readonly projectContext;
  private readonly logger;
  constructor(
    modelAdapter: ModelAdapter,
    storageAdapter: StorageAdapter,
    projectContext: ProjectContextService,
  );
  analyzeProblem(problem: Problem): Promise<Analysis>;
  proposeSolution(context: Context): Promise<Solution>;
  validateReasoning(reasoning: Reasoning): Promise<Validation>;
  reason(params: {
    question: string;
    context?: any;
    constraints?: string[];
  }): Promise<ReasoningResult>;
  private buildReasoningPrompt;
  private parseReasoningResponse;
}
