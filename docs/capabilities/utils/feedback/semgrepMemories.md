# utils/feedback/semgrepMemories

Modular Semgrep feedback/memories logic for LLM/agent workflows. Registry/LLM/AI-compliant.

## Methods/Functions

- **addSemgrepMemory**: (findingId: string, memory: Partial<SastFeedbackMemory>) => Promise<void> - Add a feedback/memory entry for a Semgrep finding.
- **listSemgrepMemories**: (findingId: string) => Promise<SastFeedbackMemory[]> - List all feedback/memories for a Semgrep finding.
- **applySemgrepMemories**: (findings: unknown[]) => Promise<unknown[]> - Apply memories/feedback to a list of findings.
- **llmTriageSemgrepFinding**: (finding: unknown, memories?: SastFeedbackMemory[]) => Promise<{ triage, rationale, memory }> - LLM-powered triage for a Semgrep finding.
- **contextAwareTriageSemgrepFinding**: (finding: unknown, memories?: SastFeedbackMemory[]) => Promise<{ triage, rationale, impact, memory }> - Context-aware, proactive agentic triage for a Semgrep finding.

## Schema

```json
{
  "addSemgrepMemory": {
    "input": {
      "type": "object",
      "properties": {
        "findingId": {
          "type": "string"
        },
        "memory": {
          "type": "object"
        }
      },
      "required": [
        "findingId",
        "memory"
      ]
    },
    "output": {
      "type": "null",
      "description": "No output (side effect: memory stored)"
    }
  },
  "listSemgrepMemories": {
    "input": {
      "type": "object",
      "properties": {
        "findingId": {
          "type": "string"
        }
      },
      "required": [
        "findingId"
      ]
    },
    "output": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of SastFeedbackMemory"
    }
  },
  "applySemgrepMemories": {
    "input": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of findings"
    },
    "output": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of findings with memories"
    }
  },
  "llmTriageSemgrepFinding": {
    "input": {
      "type": "object",
      "properties": {
        "finding": {
          "type": "object"
        },
        "memories": {
          "type": "array",
          "items": {
            "type": "object"
          }
        }
      },
      "required": [
        "finding"
      ]
    },
    "output": {
      "type": "object",
      "description": "{ triage, rationale, memory }"
    }
  },
  "contextAwareTriageSemgrepFinding": {
    "input": {
      "type": "object",
      "properties": {
        "finding": {
          "type": "object"
        },
        "memories": {
          "type": "array",
          "items": {
            "type": "object"
          }
        }
      },
      "required": [
        "finding"
      ]
    },
    "output": {
      "type": "object",
      "description": "{ triage, rationale, impact, memory }"
    }
  }
}
```
## References

- types/SastFeedbackMemory.js

