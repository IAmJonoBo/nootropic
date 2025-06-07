import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
import { CriticService, TestSuite, FixResult } from "./interfaces";
import { AnalysisResult, TestResult, Issue } from "./types";
export interface CodeReviewResult {
  score: number;
  feedback: string[];
  suggestions: string[];
  issues: {
    type: "error" | "warning" | "suggestion";
    message: string;
    location?: {
      file: string;
      line: number;
      column: number;
    };
  }[];
}
export declare class CriticServiceImpl implements CriticService {
  private readonly modelAdapter;
  private readonly storageAdapter;
  private readonly logger;
  constructor(modelAdapter: ModelAdapter, storageAdapter: StorageAdapter);
  analyzeCode(code: string): Promise<AnalysisResult>;
  runTests(tests: TestSuite): Promise<TestResult>;
  applyFixes(issues: Issue[]): Promise<FixResult>;
  reviewCode(params: {
    code: string;
    language: string;
    context?: string;
  }): Promise<CodeReviewResult>;
  private buildReviewPrompt;
  private parseReviewResponse;
}
