---
status: implemented
---
# examplePlugin

A sample plugin for nootropic. Demonstrates plugin lifecycle, dynamic event subscription, and hot-reload safety.

**Usage:**

`nootropic plugins run examplePlugin`

## Schema

```json
{
  "input": {
    "_def": {
      "items": [],
      "typeName": "ZodTuple",
      "rest": null
    },
    "~standard": {
      "version": 1,
      "vendor": "zod"
    }
  },
  "output": {
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
}
```
## Best Practices

- Validate all plugin inputs/outputs using Zod schemas
- Return structured errors for invalid input
- Reference schemas in describe() for discoverability
- Use appContext.subscribeToEvent with plugin name for dynamic subscription tracking
- Clean up all event subscriptions in shutdown() (handled by PluginManager)

## References

- https://github.com/nootropic/nootropic
- https://github.com/nootropic/nootropic/blob/main/README.md

