# ReasoningLoopUtility

Advanced iterative code generation, explanation, and repair utility for agent workflows. Supports uncertainty-aware chain-of-thought, SCoT (structured reasoning), robust backtracking, pluggable LLM-driven explanation/repair, and event-driven feedback integration. Emits reasoningStep, explanation, and repair events for each step.

**Usage:**

`import { ReasoningLoopUtility } from 'nootropic/capabilities/ReasoningLoopUtility'; const util = new ReasoningLoopUtility(publishEvent); await util.runLoop(input);`

## Methods/Functions

- **runLoop**: (input: string, options?: { maxSteps?: number; allowBacktrack?: boolean; uncertaintyThreshold?: number; feedback?: (step: string, confidence: number, rationale: string) => Promise<'accept'|'revise'|'backtrack'>; emitEvent?: (event: { type: string; payload: unknown }) => Promise<void>; structuredReasoning?: boolean; uncertaintyFn?: (step: string, history: string[]) => Promise<number> | number; llmExplain?: (step: string, context: string[]) => Promise<string>; llmRepair?: (step: string, context: string[]) => Promise<string>; maxBacktrackSteps?: number }) => Promise<{ result: string; log: string[] }> - Runs an advanced iterative reasoning loop for code generation and repair. Supports uncertainty-aware CoT, SCoT, robust backtracking, and feedback integration.
- **generateStructuredPlan**: (input: string, llmExplain?: (step: string, context: string[]) => Promise<string>) => Promise<string> - Generates a structured plan (SCoT) for the input problem using LLM or template.
- **explainStep**: (step: string) => Promise<string> - Explains a reasoning step or decision (pluggable LLM or stub).
- **repairStep**: (step: string) => Promise<string> - Attempts to repair a failed or suboptimal step (pluggable LLM or stub).

## Schema

```json
{
  "runLoop": {
    "input": {
      "type": "object",
      "properties": {
        "input": {
          "type": "string"
        },
        "options": {
          "type": "object",
          "description": "Optional config for reasoning loop"
        }
      },
      "required": [
        "input"
      ]
    },
    "output": {
      "type": "object",
      "properties": {
        "result": {
          "type": "string"
        },
        "log": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": [
        "result",
        "log"
      ]
    }
  },
  "generateStructuredPlan": {
    "input": {
      "type": "object",
      "properties": {
        "input": {
          "type": "string"
        }
      },
      "required": [
        "input"
      ]
    },
    "output": {
      "type": "object",
      "properties": {
        "plan": {
          "type": "string"
        }
      },
      "required": [
        "plan"
      ]
    }
  },
  "explainStep": {
    "input": {
      "type": "object",
      "properties": {
        "step": {
          "type": "string"
        }
      },
      "required": [
        "step"
      ]
    },
    "output": {
      "type": "object",
      "properties": {
        "explanation": {
          "type": "string"
        }
      },
      "required": [
        "explanation"
      ]
    }
  },
  "repairStep": {
    "input": {
      "type": "object",
      "properties": {
        "step": {
          "type": "string"
        }
      },
      "required": [
        "step"
      ]
    },
    "output": {
      "type": "object",
      "properties": {
        "repaired": {
          "type": "string"
        }
      },
      "required": [
        "repaired"
      ]
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

- https://arxiv.org/abs/2201.11903
- https://arxiv.org/abs/2302.03494
- README.md#chain-of-thought-prompting--self-debugging-augmented-with-scot
- docs/ROADMAP.md#ensemble-llm-code-generation--voting-strategies

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

