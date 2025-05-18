# EnsembleAgent

Orchestrates multi-LLM code generation, modular voting/selection (majority, weighted, syntactic, semantic, behavioral, meta-LLM), self-debugging, and event-driven mutation/self-healing integration. Advanced features: EnsLLM (multi-LLM candidate generation), structured voting (CodeBLEU, CrossHair), meta-LLM adjudication, self-debugging loop (LEDEX), efficiency-aware gating (SPIO). Extension points: voting strategies (majority, weighted, syntactic, semantic, behavioral, meta-LLM), LLM integration, self-debugging, event schemas, efficiency-aware routing. Best practices: Use modular voting strategies, emit rationale and voting events, support event-driven explainability, document event schemas, integrate efficiency-aware routing. Reference: arXiv:2503.15838v1, AutoGen, LangGraph.

**Usage:**

`import { EnsembleAgent, SemanticVotingStrategy } from 'nootropic/agents/EnsembleAgent'; const agent = new EnsembleAgent({ profile: { name: 'EnsembleAgent' }, votingStrategy: new SemanticVotingStrategy('nv-embed') }); await agent.runTask({ ... });`

## Methods/Functions

- **runTask**: (task: unknown) => Promise<AgentResult> - Run a task using ensemble modeling, modular voting/selection (majority, weighted, syntactic, semantic, behavioral, meta-LLM), self-debugging, and event-driven mutation/self-healing. Emits rationale/explanation and votingRationale events.
- **init**: () => Promise<void> - Initialize the agent.
- **shutdown**: () => Promise<void> - Shutdown the agent.
- **reload**: () => Promise<void> - Reload the agent.
- **health**: () => Promise<HealthStatus> - Health check for EnsembleAgent.
- **SemanticVotingStrategy**: new SemanticVotingStrategy(backendName?: string) - Semantic voting using embedding backend.

## Schema

```json
{
  "runTask": {
    "input": {
      "type": "any",
      "description": "Task input (problem, code, or prompt)"
    },
    "output": {
      "type": "object",
      "properties": {
        "result": {
          "type": "string"
        }
      },
      "required": [
        "result"
      ]
    }
  },
  "init": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "null",
      "description": "No output (side effect: initialization)"
    }
  },
  "shutdown": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "null",
      "description": "No output (side effect: shutdown)"
    }
  },
  "reload": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "null",
      "description": "No output (side effect: reload)"
    }
  },
  "health": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string"
        },
        "timestamp": {
          "type": "string"
        }
      },
      "required": [
        "status",
        "timestamp"
      ]
    }
  }
}
```
## References

- arXiv:2503.15838v1
- https://github.com/microsoft/AutoGen
- https://github.com/langchain-ai/langgraph
- README.md#ensemble-llm-code-generation--voting-strategies
- docs/ROADMAP.md#ensemble-agent

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

