import { describe, it, expect } from 'vitest';
// @ts-ignore
import { getOrchestrationEngine } from '../orchestrationEngineSelector.js';
// @ts-ignore
import { LangChainAdapter } from '../adapters/langchainAdapter.js';
// @ts-ignore
import { CrewAIAdapter } from '../adapters/crewAIAdapter.js';
// @ts-ignore
import { SemanticKernelAdapter } from '../adapters/semanticKernelAdapter.js';

describe('Orchestration Engine Selector', () => {
  it('returns LangChainAdapter for langchain', () => {
    const engine = getOrchestrationEngine('langchain');
    expect(engine).toBeInstanceOf(LangChainAdapter);
  });
  it('returns CrewAIAdapter for crewAI', () => {
    const engine = getOrchestrationEngine('crewAI');
    expect(engine).toBeInstanceOf(CrewAIAdapter);
  });
  it('returns SemanticKernelAdapter for semanticKernel', () => {
    const engine = getOrchestrationEngine('semanticKernel');
    expect(engine).toBeInstanceOf(SemanticKernelAdapter);
  });
}); 