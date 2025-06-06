import { Injectable } from '@nestjs/common';
import { Logger } from '@nootropic/runtime';
import { AgentError } from '@nootropic/runtime';
import { ModelAdapter } from '@nootropic/adapters/model-adapter';
import { StorageAdapter } from '@nootropic/adapters/storage-adapter';
import { CriticService, TestSuite, FixResult } from './interfaces';
import { AnalysisResult, TestResult, Issue } from './types';

export interface CodeReviewResult {
  score: number;
  feedback: string[];
  suggestions: string[];
  issues: {
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    location?: {
      file: string;
      line: number;
      column: number;
    };
  }[];
}

@Injectable()
export class CriticServiceImpl implements CriticService {
  private readonly logger = new Logger(CriticServiceImpl.name);

  constructor(
    private readonly modelAdapter: ModelAdapter,
    private readonly storageAdapter: StorageAdapter
  ) {}

  async analyzeCode(code: string): Promise<AnalysisResult> {
    // TODO: Implement code analysis logic
    throw new Error('Method not implemented.');
  }

  async runTests(tests: TestSuite): Promise<TestResult> {
    // TODO: Implement test execution logic
    throw new Error('Method not implemented.');
  }

  async applyFixes(issues: Issue[]): Promise<FixResult> {
    // TODO: Implement fix application logic
    throw new Error('Method not implemented.');
  }

  async reviewCode(params: {
    code: string;
    language: string;
    context?: string;
  }): Promise<CodeReviewResult> {
    try {
      this.logger.info('Reviewing code', { language: params.language });

      // Generate review using model
      const prompt = this.buildReviewPrompt(params);
      const response = await this.modelAdapter.generateText(prompt, {
        provider: 'ollama',
        model: 'codellama',
        temperature: 0.3
      });

      // Parse review results
      const result = this.parseReviewResponse(response.text);

      // Store review results
      await this.storageAdapter.storeDocument({
        id: `review_${Date.now()}`,
        content: JSON.stringify(result),
        metadata: {
          type: 'code_review',
          language: params.language
        }
      });

      return result;
    } catch (error) {
      throw new AgentError('Failed to review code', { cause: error });
    }
  }

  private buildReviewPrompt(params: {
    code: string;
    language: string;
    context?: string;
  }): string {
    return `
      Review the following code:
      
      Language: ${params.language}
      ${params.context ? `Context:\n${params.context}` : ''}
      
      Code:
      \`\`\`${params.language}
      ${params.code}
      \`\`\`
      
      Please provide a comprehensive code review including:
      1. Overall score (0-100)
      2. Specific feedback points
      3. Improvement suggestions
      4. Any issues found (errors, warnings, suggestions)
      
      Format the response as:
      SCORE:
      // Score here
      
      FEEDBACK:
      // List of feedback points
      
      SUGGESTIONS:
      // List of suggestions
      
      ISSUES:
      // List of issues in format:
      // - type: error/warning/suggestion
      //   message: issue description
      //   location: {file, line, column} (if applicable)
    `;
  }

  private parseReviewResponse(response: string): CodeReviewResult {
    try {
      const scoreMatch = response.match(/SCORE:\s*(\d+)/);
      const feedbackMatch = response.match(/FEEDBACK:\s*([\s\S]*?)(?=SUGGESTIONS:|ISSUES:|$)/);
      const suggestionsMatch = response.match(/SUGGESTIONS:\s*([\s\S]*?)(?=ISSUES:|$)/);
      const issuesMatch = response.match(/ISSUES:\s*([\s\S]*?)$/);

      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      const feedback = feedbackMatch ? feedbackMatch[1].trim().split('\n').filter(Boolean) : [];
      const suggestions = suggestionsMatch ? suggestionsMatch[1].trim().split('\n').filter(Boolean) : [];
      
      const issues = issuesMatch
        ? issuesMatch[1]
            .trim()
            .split('\n')
            .filter(Boolean)
            .map(issue => {
              const typeMatch = issue.match(/type:\s*(error|warning|suggestion)/);
              const messageMatch = issue.match(/message:\s*([^\n]+)/);
              const locationMatch = issue.match(/location:\s*{([^}]+)}/);

              return {
                type: typeMatch ? typeMatch[1] as 'error' | 'warning' | 'suggestion' : 'suggestion',
                message: messageMatch ? messageMatch[1].trim() : issue.trim(),
                location: locationMatch
                  ? {
                      file: locationMatch[1].match(/file:\s*([^,]+)/)?.[1]?.trim() || '',
                      line: parseInt(locationMatch[1].match(/line:\s*(\d+)/)?.[1] || '0'),
                      column: parseInt(locationMatch[1].match(/column:\s*(\d+)/)?.[1] || '0')
                    }
                  : undefined
              };
            })
        : [];

      return {
        score,
        feedback,
        suggestions,
        issues
      };
    } catch (error) {
      throw new AgentError('Failed to parse review response', { cause: error });
    }
  }
} 