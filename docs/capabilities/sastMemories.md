# sastMemories

Deduplicates, lists, and syncs SAST feedback memories across tools. Canonical, registry-compliant.

**Usage:**

`import sastMemoriesCapability from 'ai-helpers/utils/feedback/sastMemories'; await sastMemoriesCapability.listAllSastMemories();`

## Methods/Functions

- **loadAllMemories**: () => Promise<SastFeedbackMemory[]> - Load all SAST feedback memories.
- **deduplicateMemories**: (memories: SastFeedbackMemory[]) => SastFeedbackMemory[] - Deduplicate memories by id, tool, and context.
- **listAllSastMemories**: () => Promise<SastFeedbackMemory[]> - List all deduplicated SAST memories.
- **getMemoriesForFile**: (file: string) => Promise<SastFeedbackMemory[]> - Get all memories for a given file.
- **getMemoriesForRule**: (ruleId: string) => Promise<SastFeedbackMemory[]> - Get all memories for a given ruleId.
- **syncWithRemote**: (localMemories: SastFeedbackMemory[], remoteAdapter: unknown) => Promise<SastFeedbackMemory[]> - Sync local SAST memories with remote storage.
- **mergeWithRemote**: (local: SastFeedbackMemory[], remote: SastFeedbackMemory[]) => SastFeedbackMemory[] - Merge local and remote SAST memories.

## Schema

```json
{
  "loadAllMemories": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of SastFeedbackMemory"
    }
  },
  "deduplicateMemories": {
    "input": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of SastFeedbackMemory"
    },
    "output": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of SastFeedbackMemory"
    }
  },
  "listAllSastMemories": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of SastFeedbackMemory"
    }
  },
  "getMemoriesForFile": {
    "input": {
      "type": "object",
      "properties": {
        "file": {
          "type": "string"
        }
      },
      "required": [
        "file"
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
  "getMemoriesForRule": {
    "input": {
      "type": "object",
      "properties": {
        "ruleId": {
          "type": "string"
        }
      },
      "required": [
        "ruleId"
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
  "syncWithRemote": {
    "input": {
      "type": "object",
      "properties": {
        "localMemories": {
          "type": "array",
          "items": {
            "type": "object"
          }
        },
        "remoteAdapter": {
          "type": "object"
        }
      },
      "required": [
        "localMemories",
        "remoteAdapter"
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
  "mergeWithRemote": {
    "input": {
      "type": "object",
      "properties": {
        "local": {
          "type": "array",
          "items": {
            "type": "object"
          }
        },
        "remote": {
          "type": "array",
          "items": {
            "type": "object"
          }
        }
      },
      "required": [
        "local",
        "remote"
      ]
    },
    "output": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of SastFeedbackMemory"
    }
  }
}
```
## References

- types/SastFeedbackMemory.js

