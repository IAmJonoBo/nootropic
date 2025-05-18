# pluginFeedback

Feedback/memory utility (base class). Subclasses provide type-specific logic.

**Usage:**

`import pluginFeedbackCapability from 'nootropic/utils/feedback/pluginFeedback';
const feedback = await pluginFeedbackCapability.run({ pluginName, user, rating, review });`

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

