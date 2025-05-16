# pluginFeedback

Submit, list, and aggregate plugin feedback (rating, review, social memory).

**Usage:**

`import { submitPluginFeedback, listFeedbackForPlugin, aggregatePluginFeedback } from 'ai-helpers/utils/feedback/pluginFeedback';`

## Methods/Functions

- **submitPluginFeedback**: (feedback: PluginFeedback) => Promise<void> - Submit feedback for a plugin.
- **listFeedbackForPlugin**: (pluginName: string) => Promise<PluginFeedback[]> - List all feedback for a plugin.
- **aggregatePluginFeedback**: (pluginName: string) => Promise<PluginFeedbackAggregate> - Aggregate feedback for a plugin.

## Schema

```json
{
  "submitPluginFeedback": {
    "input": {
      "type": "object",
      "properties": {
        "pluginName": {
          "type": "string"
        },
        "user": {
          "type": "string"
        },
        "rating": {
          "type": "number",
          "minimum": 1,
          "maximum": 5
        },
        "review": {
          "type": "string"
        },
        "timestamp": {
          "type": "string"
        }
      },
      "required": [
        "pluginName",
        "user",
        "rating",
        "timestamp"
      ]
    },
    "output": {
      "type": "null",
      "description": "No output (side effect: feedback stored)"
    }
  },
  "listFeedbackForPlugin": {
    "input": {
      "type": "object",
      "properties": {
        "pluginName": {
          "type": "string"
        }
      },
      "required": [
        "pluginName"
      ]
    },
    "output": {
      "type": "array",
      "items": {
        "type": "object"
      },
      "description": "Array of PluginFeedback"
    }
  },
  "aggregatePluginFeedback": {
    "input": {
      "type": "object",
      "properties": {
        "pluginName": {
          "type": "string"
        }
      },
      "required": [
        "pluginName"
      ]
    },
    "output": {
      "type": "object",
      "description": "PluginFeedbackAggregate"
    }
  }
}
```
## References


