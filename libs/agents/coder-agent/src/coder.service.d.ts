import { ModelAdapter } from "@nootropic/adapters/model-adapter";
import { StorageAdapter } from "@nootropic/adapters/storage-adapter";
import { ProjectContextService } from "@nootropic/context";
import { CoderService, Task, CodeContext } from "./interfaces";
import { CodeResult, RefactorResult, TestResult } from "./types";
export interface CodeGenerationResult {
  code: string;
  explanation: string;
  tests?: string;
  metadata: {
    language: string;
    framework?: string;
    dependencies?: string[];
  };
}
export declare class CoderServiceImpl implements CoderService {
  private readonly modelAdapter;
  private readonly storageAdapter;
  private readonly projectContext;
  private readonly logger;
  constructor(
    modelAdapter: ModelAdapter,
    storageAdapter: StorageAdapter,
    projectContext: ProjectContextService,
  );
  generateCode(task: Task, context: CodeContext): Promise<CodeResult>;
  refactorCode(file: string, instructions: string): Promise<RefactorResult>;
  generateTests(file: string, coverage: number): Promise<TestResult>;
  generateCodeFromDescription(params: {
    description: string;
    language: string;
    framework?: string;
    context?: string;
  }): Promise<CodeGenerationResult>;
  private buildCodeGenerationPrompt;
  private parseCodeGenerationResponse;
}
