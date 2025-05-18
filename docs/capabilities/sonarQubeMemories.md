# sonarQubeMemories

Feedback/memory utility (base class). Subclasses provide type-specific logic.

**Usage:**

`import { addSonarQubeMemory, listSonarQubeMemories } from "nootropic/utils/feedback/sonarQubeMemories";
await addSonarQubeMemory("sonarqube:rule:file:42", { memoryType: "triage", rationale: "False positive", triage: "false_positive" });
const memories = await listSonarQubeMemories("sonarqube:rule:file:42");`

## Methods/Functions

- **add**: (memory: T) => Promise<void> - Add a memory entry.
- **list**: () => Promise<T[]> - List all memory entries.
- **deduplicate**: (memories: T[]) => T[] - Deduplicate memory entries.

## Schema

```json
{
  "_def": {
    "unknownKeys": "strip",
    "catchall": {
      "_def": {
        "typeName": "ZodNever"
      },
      "~standard": {
        "version": 1,
        "vendor": "zod"
      }
    },
    "typeName": "ZodObject"
  },
  "~standard": {
    "version": 1,
    "vendor": "zod"
  },
  "_cached": null
}
```
## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

