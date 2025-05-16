import { describe, it, expect } from 'vitest';
import { getOrchestrationEngine } from '../orchestrationEngineSelector';
import { LangChainAdapter } from '../adapters/langchainAdapter';
import { CrewAIAdapter } from '../adapters/crewAIAdapter';
import { SemanticKernelAdapter } from '../adapters/semanticKernelAdapter';
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
