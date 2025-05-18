# FeedbackAgent

Aggregates, summarizes, and routes feedback from LLMs/humans, manages improvement suggestions. Enhancements: Automated self-critique (CRITIC), noise filtering, multi-agent aggregation, OpenTelemetry observability. Integrates SHIMI memory for distributed aggregation. Extension points: LLM/CRITIC backend for self-critique, advanced aggregation/voting strategies, OpenTelemetry/observability hooks, SHIMI memory for distributed rationale aggregation, LLM/human moderation for feedback approval. Best practices: Integrate LLM/CRITIC backend for self-critique, use advanced aggregation/voting, emit OpenTelemetry metrics, automate benchmarking and test coverage.

**Usage:**

`Instantiate and call startEventLoop() to run as a service. Optionally pass backendName for LLM/CRITIC backend.`

## Methods/Functions

- **runTask**: (task) => Promise<AgentResult> - Runs a feedback aggregation task with self-critique, noise filtering, and observability.
- **selfCritiqueLoop**: (feedback: string) => Promise<{ improved: string; confidence: number; rationale: string }> - Automated self-critique using CRITIC framework, with LLM extension point.
- **noiseFilter**: (feedbacks: string[]) => Promise<string[]> - Aggregate and filter feedback using multi-agent aggregation.
- **emitObservabilityMetrics**: (metrics?: { latency?: number; volume?: number; sentimentDrift?: number }) => Promise<void> - Emit OpenTelemetry metrics for feedback aggregation.
- **summarizeRationale**: (events: AgentEvent[]) => Promise<string> - Summarize rationale from aggregated events (LLM extension point).
- **moderateFeedback**: (summary: string) => Promise<{ status: string; reason?: string }> - Moderate feedback using LLM/human moderation (extension point).

## References

- https://arxiv.org/abs/2309.00864
- https://github.com/akira-ai/akira
- https://opentelemetry.io/
- https://arxiv.org/abs/2504.06135

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

