# adapterUtils

Utility for dynamic ESM import with fallback and error formatting. Useful for plugin/adapter loading.

**Usage:**

`import adapterUtilsCapability from 'ai-helpers/utils/plugin/adapterUtils'; await adapterUtilsCapability.tryDynamicImport('module');`

## Methods/Functions

- **tryDynamicImport**: (moduleName: string) => Promise<unknown | null> - Attempts to dynamically import a module, returns null on failure.

## Schema

```json
{
  "tryDynamicImport": {
    "input": {
      "type": "object",
      "properties": {
        "moduleName": {
          "type": "string"
        }
      },
      "required": [
        "moduleName"
      ]
    },
    "output": {
      "type": [
        "object",
        "null"
      ],
      "description": "Imported module or null on failure"
    }
  }
}
```
## References

- https://nodejs.org/api/esm.html#esm_dynamic_imports

