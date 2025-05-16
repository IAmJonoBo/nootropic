# EnsembleAgent

Orchestrates multi-LLM code generation, modular voting/selection (majority, weighted, syntactic, semantic, behavioral, meta-LLM), self-debugging, and event-driven mutation/self-healing integration. Emits rationale/explanation and votingRationale events for each step. Implements Capability interface. Reference: arXiv:2503.15838v1, AutoGen, LangGraph.

**Usage:**

`import { EnsembleAgent, MajorityVotingStrategy } from 'ai-helpers/agents/EnsembleAgent'; const agent = new EnsembleAgent({ profile: { name: 'EnsembleAgent' }, votingStrategy: new MajorityVotingStrategy() }); await agent.runTask({ ... });`

## Methods/Functions

- **runTask**: (task: unknown) => Promise<AgentResult> - Run a task using ensemble modeling, modular voting/selection (majority, weighted, syntactic, semantic, behavioral, meta-LLM), self-debugging, and event-driven mutation/self-healing. Emits rationale/explanation and votingRationale events.
- **init**: () => Promise<void> - Initialize the agent.
- **shutdown**: () => Promise<void> - Shutdown the agent.
- **reload**: () => Promise<void> - Reload the agent.
- **health**: () => Promise<HealthStatus> - Health check for EnsembleAgent.

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
## Best Practices

- Use modular voting strategies (majority, weighted, semantic, meta-LLM)
- Emit rationale and voting events for every decision
- Support event-driven explainability and agent/LLM introspection
- Document event schemas and rationale in describe()

## References

- arXiv:2503.15838v1
- https://github.com/microsoft/AutoGen
- https://github.com/langchain-ai/langgraph
- README.md#ensemble-llm-code-generation--voting-strategies
- docs/ROADMAP.md#ensemble-agent

