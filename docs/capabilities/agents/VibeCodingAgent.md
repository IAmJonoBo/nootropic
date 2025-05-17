---
status: implemented
---
# VibeCodingAgent

Agent for real-time voice-to-code using Whisper and LLMs. Converts audio input to code.

**Usage:**

`import { VibeCodingAgent } from 'nootropic/agents/VibeCodingAgent'; const agent = new VibeCodingAgent({ profile: { name: 'VibeCodingAgent' } }); await agent.runTask({ ... });`

## Methods/Functions

- **runTask**: (task: { audio: string }) => Promise<{ result: string }> - Run a voice-to-code task and return the result.
- **init**: () => Promise<void> - Initialize the agent.
- **shutdown**: () => Promise<void> - Shutdown the agent.
- **reload**: () => Promise<void> - Reload the agent.
- **health**: () => Promise<HealthStatus> - Health check for VibeCodingAgent.

## Schema

```json
{
  "runTask": {
    "input": {
      "type": "object",
      "properties": {
        "audio": {
          "type": "string"
        }
      },
      "required": [
        "audio"
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

- https://medium.com/@niall.mcnulty/vibe-coding-b79a6d3f0caa
- https://www.ibm.com/think/topics/vibe-coding
- README.md#vibe-coding
- docs/ROADMAP.md#vibe-coding-agent

