import { describe, it, expect } from 'vitest';
import { getOrchestrationEngine } from '../orchestrationEngineSelector.js';
import { LangChainAdapter } from '../adapters/langchainAdapter.js';
import { CrewAIAdapter } from '../adapters/crewAIAdapter.js';
import { SemanticKernelAdapter } from '../adapters/semanticKernelAdapter.js';

// @ts-expect-error TS(2349): This expression is not callable.
describe('Orchestration Engine Selector', () => {
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  it('returns LangChainAdapter for langchain', () => {
    // @ts-expect-error TS(2304): Cannot find name 'engine'.
    const engine = getOrchestrationEngine('langchain');
    // @ts-expect-error TS(6133): 'engine' is declared but its value is never read.
    expect(engine).toBeInstanceOf(LangChainAdapter);
  });
  it('returns CrewAIAdapter for crewAI', () => {
    // @ts-expect-error TS(2304): Cannot find name 'engine'.
    const engine = getOrchestrationEngine('crewAI');
    // @ts-expect-error TS(6133): 'engine' is declared but its value is never read.
    expect(engine).toBeInstanceOf(CrewAIAdapter);
  });
  it('returns SemanticKernelAdapter for semanticKernel', () => {
    // @ts-expect-error TS(2304): Cannot find name 'engine'.
    const engine = getOrchestrationEngine('semanticKernel');
    // @ts-expect-error TS(6133): 'engine' is declared but its value is never read.
    expect(engine).toBeInstanceOf(SemanticKernelAdapter);
  });
}); 