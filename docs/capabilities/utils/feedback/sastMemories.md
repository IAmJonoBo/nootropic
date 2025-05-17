# utils/feedback/sastMemories

Modular SAST feedback/memories logic for LLM/agent workflows. Now extends a shared, registry/describe/health-compliant base class (`BaseMemoryUtility`).

## Unified Feedback/Memory Architecture

- All feedback/memory utilities (SAST, Semgrep, SonarQube, plugin feedback) now extend a single, robust base class: `BaseMemoryUtility`.
- This ensures:
  - DRY, type-safe aggregation and deduplication
  - Zod schema validation at all dynamic boundaries
  - Registry/describe/health compliance for LLM/AI/automation workflows
  - Easy extension for new memory types or storage backends
- See `utils/feedback/BaseMemoryUtility.ts` for extension points and architecture.

## Methods/Functions

- **listAllSastMemories**: () => Promise<SastFeedbackMemory[]> - List all deduplicated SAST memories.
- **getMemoriesForFile**: (file: string) => Promise<SastFeedbackMemory[]> - Get all memories for a given file.
- **getMemoriesForRule**: (ruleId: string) => Promise<SastFeedbackMemory[]> - Get all memories for a given ruleId.
- **syncWithRemote**: (localMemories: SastFeedbackMemory[], remoteAdapter: unknown) => Promise<SastFeedbackMemory[]> - Sync local SAST memories with remote storage.
- **mergeWithRemote**: (local: SastFeedbackMemory[], remote: SastFeedbackMemory[]) => SastFeedbackMemory[] - Merge local and remote SAST memories.
- **deduplicateMemories**: (memories: SastFeedbackMemory[]) => SastFeedbackMemory[] - Deduplicate memories by id, tool, and context.

## Schema

```json
{
  "listAllSastMemories": {
    "input": { "type": "null", "description": "No input required" },
    "output": { "type": "array", "items": { "type": "object" }, "description": "Array of SastFeedbackMemory" }
  },
  "getMemoriesForFile": {
    "input": { "type": "object", "properties": { "file": { "type": "string" } }, "required": [ "file" ] },
    "output": { "type": "array", "items": { "type": "object" }, "description": "Array of SastFeedbackMemory" }
  },
  "getMemoriesForRule": {
    "input": { "type": "object", "properties": { "ruleId": { "type": "string" } }, "required": [ "ruleId" ] },
    "output": { "type": "array", "items": { "type": "object" }, "description": "Array of SastFeedbackMemory" }
  },
  "syncWithRemote": {
    "input": { "type": "object", "properties": { "localMemories": { "type": "array", "items": { "type": "object" } }, "remoteAdapter": { "type": "object" } }, "required": [ "localMemories", "remoteAdapter" ] },
    "output": { "type": "array", "items": { "type": "object" }, "description": "Array of SastFeedbackMemory" }
  },
  "mergeWithRemote": {
    "input": { "type": "object", "properties": { "local": { "type": "array", "items": { "type": "object" } }, "remote": { "type": "array", "items": { "type": "object" } } }, "required": [ "local", "remote" ] },
    "output": { "type": "array", "items": { "type": "object" }, "description": "Array of SastFeedbackMemory" }
  },
  "deduplicateMemories": {
    "input": { "type": "array", "items": { "type": "object" }, "description": "Array of SastFeedbackMemory" },
    "output": { "type": "array", "items": { "type": "object" }, "description": "Array of SastFeedbackMemory" }
  }
}
```

## Extension Points

- To add a new feedback/memory type, extend `BaseMemoryUtility` and provide a Zod schema and file path.
- All registry/describe/health logic is inherited and LLM/AI-friendly.

## References

- types/SastFeedbackMemory.js
- utils/feedback/BaseMemoryUtility.ts 