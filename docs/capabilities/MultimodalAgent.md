# MultimodalAgent

Agent for multimodal (image, audio, text) input/output. Supports Pix2Code, Whisper, and code-to-UI translation.

**Usage:**

`import { MultimodalAgent } from 'nootropic/agents/MultimodalAgent'; const agent = new MultimodalAgent({ profile: { name: 'MultimodalAgent' } }); await agent.runTask({ ... });`

## Methods/Functions

- **runTask**: (task: { type: "image" | "audio" | "text", data: string }) => Promise<{ result: string }> - Run a multimodal task (image, audio, or text) and return the result.
- **init**: () => Promise<void> - Initialize the agent.
- **shutdown**: () => Promise<void> - Shutdown the agent.
- **reload**: () => Promise<void> - Reload the agent.
- **health**: () => Promise<HealthStatus> - Health check for MultimodalAgent.

## Schema

```json
{
  "runTask": {
    "input": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "image",
            "audio",
            "text"
          ]
        },
        "data": {
          "type": "string"
        }
      },
      "required": [
        "type",
        "data"
      ]
    },
    "output": {
      "type": "object",
      "properties": {
        "result": {
          "type": "string"
        }
      },
      "required": [
        "result"
      ]
    }
  },
  "init": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "null",
      "description": "No output (side effect: initialization)"
    }
  },
  "shutdown": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "null",
      "description": "No output (side effect: shutdown)"
    }
  },
  "reload": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "null",
      "description": "No output (side effect: reload)"
    }
  },
  "health": {
    "input": {
      "type": "null",
      "description": "No input required"
    },
    "output": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string"
        },
        "timestamp": {
          "type": "string"
        }
      },
      "required": [
        "status",
        "timestamp"
      ]
    }
  }
}
```
## References

- https://github.com/Flame-Code-VLM/Flame-Code-VLM
- README.md#multimodal-llms--uicode-understanding
- docs/ROADMAP.md#multimodal-agent

