import { Injectable } from '@nestjs/common';
import { Logger } from '@nootropic/runtime';
import { AgentError } from '@nootropic/runtime';
import { ModelAdapter } from '@nootropic/adapters/model-adapter';
import { StorageAdapter } from '@nootropic/adapters/storage-adapter';
import { ProjectContextService } from '@nootropic/context';
import { ReasoningService, Context } from './interfaces';
import { Analysis, Problem, Reasoning } from './types';

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

@Injectable()
export class ReasoningServiceImpl implements ReasoningService {
  private readonly logger = new Logger(ReasoningServiceImpl.name);

  constructor(
    private readonly modelAdapter: ModelAdapter,
    private readonly storageAdapter: StorageAdapter,
    private readonly projectContext: ProjectContextService
  ) {}

  async analyzeProblem(problem: Problem): Promise<Analysis> {
    // TODO: Implement problem analysis logic
    throw new Error('Method not implemented.');
  }

  async proposeSolution(context: Context): Promise<Solution> {
    // TODO: Implement solution proposal logic
    throw new Error('Method not implemented.');
  }

  async validateReasoning(reasoning: Reasoning): Promise<Validation> {
    // TODO: Implement reasoning validation logic
    throw new Error('Method not implemented.');
  }

  async reason(params: {
    question: string;
    context?: any;
    constraints?: string[];
  }): Promise<ReasoningResult> {
    try {
      this.logger.info('Performing reasoning', { question: params.question });

      // Get project context
      const projectContext = await this.projectContext.getContext();

      // Generate reasoning using model
      const prompt = this.buildReasoningPrompt({
        ...params,
        projectContext
      });

      const response = await this.modelAdapter.generateText(prompt, {
        provider: 'ollama',
        model: 'mistral',
        temperature: 0.3
      });

      // Parse reasoning results
      const result = this.parseReasoningResponse(response.text);

      // Store reasoning results
      await this.storageAdapter.storeDocument({
        id: `reasoning_${Date.now()}`,
        content: JSON.stringify(result),
        metadata: {
          type: 'reasoning',
          question: params.question
        }
      });

      return result;
    } catch (error) {
      throw new AgentError('Failed to perform reasoning', { cause: error });
    }
  }

  private buildReasoningPrompt(params: {
    question: string;
    context?: any;
    constraints?: string[];
    projectContext: any;
  }): string {
    return `
      Analyze and reason about the following question:
      
      Question: ${params.question}
      
      ${params.context ? `Context:\n${JSON.stringify(params.context, null, 2)}` : ''}
      
      ${params.constraints?.length ? `Constraints:\n${params.constraints.join('\n')}` : ''}
      
      Project Context:
      ${JSON.stringify(params.projectContext, null, 2)}
      
      Please provide:
      1. A clear conclusion
      2. Step-by-step reasoning
      3. Confidence level (0-100)
      4. Alternative conclusions
      5. Key assumptions made
      
      Format the response as:
      CONCLUSION:
      // Main conclusion here
      
      REASONING:
      // List of reasoning steps
      
      CONFIDENCE:
      // Confidence score (0-100)
      
      ALTERNATIVES:
      // List of alternative conclusions
      
      ASSUMPTIONS:
      // List of assumptions made
    `;
  }

  private parseReasoningResponse(response: string): ReasoningResult {
    try {
      const conclusionMatch = response.match(/CONCLUSION:\s*([\s\S]*?)(?=REASONING:|CONFIDENCE:|ALTERNATIVES:|ASSUMPTIONS:|$)/);
      const reasoningMatch = response.match(/REASONING:\s*([\s\S]*?)(?=CONFIDENCE:|ALTERNATIVES:|ASSUMPTIONS:|$)/);
      const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/);
      const alternativesMatch = response.match(/ALTERNATIVES:\s*([\s\S]*?)(?=ASSUMPTIONS:|$)/);
      const assumptionsMatch = response.match(/ASSUMPTIONS:\s*([\s\S]*?)$/);

      const conclusion = conclusionMatch ? conclusionMatch[1].trim() : '';
      const reasoning = reasoningMatch ? reasoningMatch[1].trim().split('\n').filter(Boolean) : [];
      const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 0;
      const alternatives = alternativesMatch ? alternativesMatch[1].trim().split('\n').filter(Boolean) : [];
      const assumptions = assumptionsMatch ? assumptionsMatch[1].trim().split('\n').filter(Boolean) : [];

      return {
        conclusion,
        reasoning,
        confidence,
        alternatives,
        metadata: {
          context: {},
          assumptions,
          constraints: []
        }
      };
    } catch (error) {
      throw new AgentError('Failed to parse reasoning response', { cause: error });
    }
  }
} 