# ExplainabilityAgent

Provides detailed, LLM-friendly rationales and traces for any action or decision, supporting transparency and compliance. Enhancements: Hybrid LIME/SHAP pipelines, attention-based rationale highlighting, interactive traceback views (VS Code integration). Extension points: LIME/SHAP interpretability integration, LLM attention extraction, VS Code API integration for tracebacks. Best practices: Integrate LIME/SHAP for interpretability, extract and visualize LLM attention, support interactive tracebacks in developer tools, document extension points and rationale in describe().

**Usage:**

`import { ExplainabilityAgent } from 'nootropic/agents/ExplainabilityAgent';`

## Methods/Functions

- **runTask**: (task) => Promise<AgentResult> - Runs an explainability task with LIME/SHAP, attention, and traceback.
- **runLimeShapInterpretability**: () => Promise<{ lime: string; shap: string }> - Run LIME/SHAP interpretability passes.
- **extractAttentionHighlights**: () => Promise<string> - Extract attention-based rationale highlights.
- **showTracebackInVSCode**: () => Promise<string> - Show interactive traceback in VS Code (stub).

## References

- https://github.com/marcotcr/lime
- https://github.com/slundberg/shap
- https://code.visualstudio.com/api
- https://arxiv.org/abs/1706.03762
- README.md#explainabilityagent
- docs/ROADMAP.md#explainability-agent

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

