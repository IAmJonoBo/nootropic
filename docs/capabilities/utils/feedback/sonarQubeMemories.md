# utils/feedback/sonarQubeMemories

Modular SonarQube feedback/memories logic for LLM/agent workflows. Now extends a shared, registry/describe/health-compliant base class (`BaseMemoryUtility`).

## Unified Feedback/Memory Architecture

- All feedback/memory utilities (Semgrep, SonarQube, SAST, plugin feedback) now extend a single, robust base class: `BaseMemoryUtility`.
- This ensures:
  - DRY, type-safe aggregation and deduplication
  - Zod schema validation at all dynamic boundaries
  - Registry/describe/health compliance for LLM/AI/automation workflows
  - Easy extension for new memory types or storage backends
- See `utils/feedback/BaseMemoryUtility.ts` for extension points and architecture.

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

## Extension Points

- To add a new feedback/memory type, extend `BaseMemoryUtility` and provide a Zod schema and file path.
- All registry/describe/health logic is inherited and LLM/AI-friendly.

## References

- types/SastFeedbackMemory.js
- utils/feedback/BaseMemoryUtility.ts

