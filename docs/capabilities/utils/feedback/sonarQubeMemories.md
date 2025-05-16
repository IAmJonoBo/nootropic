# utils/feedback/sonarQubeMemories

Modular SonarQube feedback/memories logic for LLM/agent workflows. Registry/LLM/AI-compliant.

## Methods/Functions

- **addSonarQubeMemory**: (findingId: string, memory: Partial<SastFeedbackMemory>) => Promise<void> - Add a feedback/memory entry for a SonarQube finding.
- **listSonarQubeMemories**: (findingId: string) => Promise<SastFeedbackMemory[]> - List all feedback/memories for a SonarQube finding.
- **applySonarQubeMemories**: (findings: unknown[]) => Promise<unknown[]> - Apply memories/feedback to a list of findings.

## Schema

```json
{
  "addSonarQubeMemory": {
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
  "listSonarQubeMemories": {
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
  "applySonarQubeMemories": {
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
  }
}
```
## References

- types/SastFeedbackMemory.js

