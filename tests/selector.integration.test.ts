import { describe, it, expect } from 'vitest';
// @ts-ignore
import { getOrchestrationEngine } from '../orchestrationEngineSelector';
// @ts-ignore
import { LangChainAdapter } from './src/adapters/langchainAdapter.js';
// @ts-ignore
import { CrewAIAdapter } from './src/adapters/crewAIAdapter.js';
// @ts-ignore
import { SemanticKernelAdapter } from './src/adapters/semanticKernelAdapter.js';

describe('Orchestration Engine Selector', () => {
  it('returns LangChainAdapter for langchain', () => {
    const engine = getOrchestrationEngine('langchain');
    expect(engine?.constructor?.name).toBe(LangChainAdapter.name);
  });
  it('returns CrewAIAdapter for crewAI', () => {
    const engine = getOrchestrationEngine('crewAI');
    expect(engine?.constructor?.name).toBe(CrewAIAdapter.name);
  });
  it('returns SemanticKernelAdapter for semanticKernel', () => {
    const engine = getOrchestrationEngine('semanticKernel');
    expect(engine?.constructor?.name).toBe(SemanticKernelAdapter.name);
  });
}); 