import { LangChainAdapter } from './adapters/langchainAdapter.js';
import { CrewAIAdapter } from './adapters/crewAIAdapter.js';
import { SemanticKernelAdapter } from './adapters/semanticKernelAdapter.js';
import type { AgentOrchestrationEngine } from './types/AgentOrchestrationEngine.js';

// Extend this type as you add more engines
export type OrchestrationEngineName = 'langchain' | 'crewAI' | 'semanticKernel';

/**
 * Returns an instance of the requested orchestration engine adapter.
 * Extend this function to support additional engines.
 */
export function getOrchestrationEngine(engine: OrchestrationEngineName): AgentOrchestrationEngine {
  switch (engine) {
    case 'langchain':
      return new LangChainAdapter();
    case 'crewAI':
      return new CrewAIAdapter();
    case 'semanticKernel':
      return new SemanticKernelAdapter();
    default:
      throw new Error(`Unknown orchestration engine: ${engine}`);
  }
}

/**
 * To add a new orchestration engine:
 * 1. Implement the adapter class (e.g., CrewAIAdapter).
 * 2. Add a case to the switch above.
 * 3. Extend the OrchestrationEngineName type.
 */

export function describe() {
  return {
    name: 'OrchestrationEngine',
    description: 'Unified interface for agent orchestration.',
    methods: [
      {
        name: 'runAgentTask',
        signature: '(profile: AgentProfile, task: AgentTask, context?: AgentContext) => Promise<AgentResult>',
        description: 'Runs a task using the specified agent profile and context.'
      }
    ],
    usage: "const engine = getOrchestrationEngine('langchain'); const result = await engine.runAgentTask(profile, task, context);",
    schema: {
      runAgentTask: {
        input: {
          type: 'object',
          properties: {
            profile: { type: 'object', description: 'AgentProfile' },
            task: { type: 'object', description: 'AgentTask' },
            context: { type: ['object', 'null'], description: 'AgentContext (optional)' }
          },
          required: ['profile', 'task']
        },
        output: {
          type: 'object',
          properties: {
            output: {},
            success: { type: 'boolean' },
            logs: { type: 'array', items: { type: 'string' }, description: 'Optional logs' }
          },
          required: ['success']
        }
      }
    }
  };
} 