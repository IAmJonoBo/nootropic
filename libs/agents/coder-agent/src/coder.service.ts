import { Injectable } from '@nestjs/common';
import { Logger } from '@nootropic/runtime';
import { AgentError } from '@nootropic/runtime';
import { ModelAdapter } from '@nootropic/adapters/model-adapter';
import { StorageAdapter } from '@nootropic/adapters/storage-adapter';
import { ProjectContextService } from '@nootropic/context';
import { CoderService, Task, CodeContext } from './interfaces';
import { CodeResult, RefactorResult, TestResult } from './types';

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

@Injectable()
export class CoderServiceImpl implements CoderService {
  private readonly logger = new Logger(CoderServiceImpl.name);

  constructor(
    private readonly modelAdapter: ModelAdapter,
    private readonly storageAdapter: StorageAdapter,
    private readonly projectContext: ProjectContextService
  ) {}

  async generateCode(task: Task, context: CodeContext): Promise<CodeResult> {
    // TODO: Implement code generation logic
    throw new Error('Method not implemented.');
  }

  async refactorCode(file: string, instructions: string): Promise<RefactorResult> {
    // TODO: Implement code refactoring logic
    throw new Error('Method not implemented.');
  }

  async generateTests(file: string, coverage: number): Promise<TestResult> {
    // TODO: Implement test generation logic
    throw new Error('Method not implemented.');
  }

  async generateCodeFromDescription(params: {
    description: string;
    language: string;
    framework?: string;
    context?: string;
  }): Promise<CodeGenerationResult> {
    try {
      this.logger.info('Generating code', { params });

      // Get project context
      const context = await this.projectContext.getContext();

      // Generate code using model
      const prompt = this.buildCodeGenerationPrompt({
        ...params,
        projectContext: context
      });

      const response = await this.modelAdapter.generateText(prompt, {
        provider: 'ollama',
        model: 'codellama',
        temperature: 0.2
      });

      // Parse and validate generated code
      const result = this.parseCodeGenerationResponse(response.text);

      // Store generated code
      await this.storageAdapter.storeDocument({
        id: `code_${Date.now()}`,
        content: result.code,
        metadata: {
          type: 'generated_code',
          ...result.metadata
        }
      });

      return result;
    } catch (error) {
      throw new AgentError('Failed to generate code', { cause: error });
    }
  }

  private buildCodeGenerationPrompt(params: {
    description: string;
    language: string;
    framework?: string;
    context?: string;
    projectContext: any;
  }): string {
    return `
      Generate code for the following task:
      
      Description: ${params.description}
      Language: ${params.language}
      ${params.framework ? `Framework: ${params.framework}` : ''}
      
      ${params.context ? `Context:\n${params.context}` : ''}
      
      Project Context:
      ${JSON.stringify(params.projectContext, null, 2)}
      
      Please provide:
      1. The complete code implementation
      2. A brief explanation of the implementation
      3. Unit tests if applicable
      4. Any required dependencies
      
      Format the response as:
      CODE:
      \`\`\`${params.language}
      // Implementation here
      \`\`\`
      
      EXPLANATION:
      // Explanation here
      
      TESTS:
      \`\`\`${params.language}
      // Tests here
      \`\`\`
      
      DEPENDENCIES:
      // List of dependencies
    `;
  }

  private parseCodeGenerationResponse(response: string): CodeGenerationResult {
    try {
      const codeMatch = response.match(/CODE:\s*```[\s\S]*?```/);
      const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)(?=TESTS:|DEPENDENCIES:|$)/);
      const testsMatch = response.match(/TESTS:\s*```[\s\S]*?```/);
      const dependenciesMatch = response.match(/DEPENDENCIES:\s*([\s\S]*?)$/);

      if (!codeMatch) {
        throw new Error('No code found in response');
      }

      const code = codeMatch[0].replace(/CODE:\s*```\w*\n/, '').replace(/```$/, '');
      const explanation = explanationMatch ? explanationMatch[1].trim() : '';
      const tests = testsMatch ? testsMatch[0].replace(/TESTS:\s*```\w*\n/, '').replace(/```$/, '') : undefined;
      const dependencies = dependenciesMatch ? dependenciesMatch[1].trim().split('\n') : [];

      return {
        code,
        explanation,
        tests,
        metadata: {
          language: 'typescript', // Default to TypeScript
          dependencies
        }
      };
    } catch (error) {
      throw new AgentError('Failed to parse code generation response', { cause: error });
    }
  }
} 