import { Injectable } from '@nestjs/common';
import { Logger } from '@nootropic/shared';
import { AgentError } from '@nootropic/runtime';
import { PlannerService } from '@nootropic/agents/planner-agent';
import { CoderService } from '@nootropic/agents/coder-agent';
import { CriticService } from '@nootropic/agents/critic-agent';
import { ReasoningService } from '@nootropic/agents/reasoning-agent';
import { ModelAdapter } from '@nootropic/adapters/model-adapter';
import { StorageAdapter } from '@nootropic/adapters/storage-adapter';
import { ProjectContextService } from '@nootropic/context';

export interface ExecutionResult {
  success: boolean;
  steps: {
    id: string;
    status: 'completed' | 'failed' | 'skipped';
    result?: any;
    error?: string;
  }[];
  summary: string;
}

@Injectable()
export class ExecutorService {
  private readonly logger = new Logger(ExecutorService.name);

  constructor(
    private readonly plannerService: PlannerService,
    private readonly coderService: CoderService,
    private readonly criticService: CriticService,
    private readonly reasoningService: ReasoningService,
    private readonly modelAdapter: ModelAdapter,
    private readonly storageAdapter: StorageAdapter,
    private readonly projectContext: ProjectContextService
  ) {}

  async executePlan(planId: string): Promise<ExecutionResult> {
    try {
      this.logger.info('Executing plan', { planId });

      // Get plan
      const plan = await this.plannerService.getPlan(planId);
      if (!plan) {
        throw new AgentError('Plan not found', { planId });
      }

      // Execute steps
      const results = await this.executeSteps(plan.steps);

      // Generate summary
      const summary = await this.generateSummary(plan, results);

      return {
        success: results.every(step => step.status === 'completed'),
        steps: results,
        summary
      };
    } catch (error) {
      throw new AgentError('Failed to execute plan', { cause: error });
    }
  }

  private async executeSteps(steps: any[]): Promise<ExecutionResult['steps']> {
    const results: ExecutionResult['steps'] = [];

    for (const step of steps) {
      try {
        this.logger.info('Executing step', { stepId: step.id });

        // Check dependencies
        const dependencies = step.dependencies || [];
        const dependencyResults = results.filter(r => dependencies.includes(r.id));
        if (dependencyResults.some(r => r.status === 'failed')) {
          results.push({
            id: step.id,
            status: 'skipped',
            error: 'Dependencies failed'
          });
          continue;
        }

        // Execute step based on agent type
        let result;
        switch (step.agent) {
          case 'coder':
            result = await this.coderService.generateCode({
              description: step.description,
              language: 'typescript'
            });
            break;
          case 'critic':
            result = await this.criticService.reviewCode({
              code: step.code,
              language: 'typescript'
            });
            break;
          case 'reasoning':
            result = await this.reasoningService.reason({
              question: step.description
            });
            break;
          default:
            throw new Error(`Unknown agent type: ${step.agent}`);
        }

        results.push({
          id: step.id,
          status: 'completed',
          result
        });
      } catch (error) {
        this.logger.error('Step execution failed', { stepId: step.id, error });
        results.push({
          id: step.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return results;
  }

  private async generateSummary(plan: any, results: ExecutionResult['steps']): Promise<string> {
    try {
      const prompt = `
        Generate a summary of the plan execution:
        
        Plan:
        ${JSON.stringify(plan, null, 2)}
        
        Results:
        ${JSON.stringify(results, null, 2)}
        
        Please provide a concise summary of what was accomplished and any issues encountered.
      `;

      const response = await this.modelAdapter.generateText(prompt, {
        provider: 'ollama',
        model: 'mistral',
        temperature: 0.3
      });

      return response.text;
    } catch (error) {
      this.logger.error('Failed to generate summary', { error });
      return 'Failed to generate execution summary';
    }
  }
} 