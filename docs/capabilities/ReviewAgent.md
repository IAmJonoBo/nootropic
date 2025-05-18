# ReviewAgent

Reviews drafts and provides feedback. Event-driven. Enhancements: Sentiment-and-aspect analysis, multi-pass chain-of-thought (SCoT) review, ensemble scoring. Extension points: LLM/embedding backend for sentiment/aspect analysis, multi-model ensemble scoring (quantized LLMs, voting strategies), custom multi-pass review logic (SCoT, domain-specific passes), benchmarking and test coverage automation. Best practices: Integrate LLM/embedding backend for sentiment/aspect analysis, use multi-model ensemble for robust scoring, document extension points and rationale in describe(), automate benchmarking and test coverage for all enhancements.

**Usage:**

`Instantiate and call startEventLoop() to run as a service. Optionally pass backendName for LLM/embedding backend.`

## Methods/Functions

- **runTask**: (task, logger?) => Promise<AgentResult> - Reviews outputs using sentiment analysis, multi-pass SCoT, and ensemble scoring.
- **sentimentAndAspectAnalysis**: (content: string) => Promise<{ sentiment: string; aspects: Record<string, string> }> - LLM-powered sentiment and aspect analysis. Extension: HuggingFace, Ollama, or local LLM.
- **multiPassChainOfThought**: (content: string) => Promise<string[]> - Multi-pass chain-of-thought review. Extension: SCoT pipeline, LLM/embedding backend.
- **ensembleScoring**: (content: string) => Promise<number> - Aggregate scores from multiple models. Extension: quantized LLMs, voting/aggregation strategies.
- **listTools**: () => Promise<AgentTool[]> - Lists dynamically discovered tools/plugins.
- **getContext**: () => Promise<AgentContext> - Returns the agent context.
- **startEventLoop**: () => Promise<void> - Starts the event-driven runtime loop: subscribes to ReviewRequested and TaskAssigned events, processes them, and emits results.

## References

- https://huggingface.co/tasks/sentiment-analysis
- https://arxiv.org/abs/2305.10601
- https://arxiv.org/abs/2302.09664
- https://github.com/facebookresearch/llama
- https://github.com/nootropic/nootropic
- https://github.com/nootropic/nootropic/blob/main/README.md

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

