import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
import { ProjectContextService } from "@nootropic/context";
import { MemoryService } from "@nootropic/agents/memory-agent";
import { FeedbackService } from "./interfaces";
import { Feedback, TrainingData, Preferences } from "./types";
export interface Feedback {
  id: string;
  type: "success" | "failure" | "improvement" | "bug";
  content: string;
  metadata: {
    timestamp: number;
    source: string;
    context: any;
    severity: number;
    tags: string[];
    relatedItems?: string[];
  };
}
export interface FeedbackAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
  actionItems: {
    description: string;
    priority: number;
    assignedTo?: string;
  }[];
}
export declare class FeedbackServiceImpl implements FeedbackService {
  private readonly modelAdapter;
  private readonly storageAdapter;
  private readonly projectContext;
  private readonly memoryService;
  private readonly logger;
  constructor(
    modelAdapter: ModelAdapter,
    storageAdapter: StorageAdapter,
    projectContext: ProjectContextService,
    memoryService: MemoryService,
  );
  collectFeedback(feedback: Feedback): Promise<void>;
  scheduleTraining(data: TrainingData): Promise<void>;
  updatePreferences(prefs: Preferences): Promise<void>;
  analyzeFeedback(params: {
    type?: Feedback["type"];
    timeRange?: {
      start: number;
      end: number;
    };
    minSeverity?: number;
  }): Promise<FeedbackAnalysis>;
  private retrieveFeedback;
  private buildFeedbackQuery;
  private buildAnalysisPrompt;
  private parseAnalysisResponse;
}
