# Agent Intent/Plan Registry & Feedback Loop Guide

This system allows agents to register their current intent, plan steps, and submit feedback on context/mutation suggestions. All data is persisted for agent and future use.

## 1. Registering Intent/Plan (CLI)

```sh
pnpm tsx nootropic/agentIntentRegistry.ts register <agent> <intent> <planStep1> <planStep2> ...
```

Example:
```sh
pnpm tsx nootropic/agentIntentRegistry.ts register agentA "Refactor context engine" "Extract helpers" "Write tests"
```

## 2. Submitting Feedback (CLI)

```sh
pnpm tsx nootropic/agentIntentRegistry.ts feedback <agent> <suggestion> <rating> [comment]
```

Example:
```sh
pnpm tsx nootropic/agentIntentRegistry.ts feedback agentA "Add tests" 5 "Very useful suggestion!"
```

## 3. HTTP API

Register intent/plan:
```
POST http://localhost:4000/agent-intent
Content-Type: application/json

{
  "agent": "agentA",
  "intent": "Refactor context engine",
  "plan": ["Extract helpers", "Write tests"],
  "context": {"priority": "high"}
}
```

Submit feedback:
```
POST http://localhost:4000/agent-feedback
Content-Type: application/json

{
  "agent": "agentA",
  "suggestion": "Add tests",
  "rating": 5,
  "comment": "Very useful suggestion!"
}
```

Get all intents:
```
GET http://localhost:4000/agent-intents
```

Get all feedback:
```
GET http://localhost:4000/agent-feedback
```

## 4. WebSocket API

Register intent:
```
{
  "type": "registerIntent",
  "data": { "agent": "agentA", "intent": "Refactor context engine", "plan": ["Extract helpers", "Write tests"], "context": {"priority": "high"} }
}
```

Submit feedback:
```
{
  "type": "submitFeedback",
  "data": { "agent": "agentA", "suggestion": "Add tests", "rating": 5, "comment": "Very useful suggestion!" }
}
```

Get all intents:
```
{ "type": "getIntents" }
```

Get all feedback:
```
{ "type": "getFeedback" }
```

---

All data is stored in `nootropic/agentIntentRegistry.json` and `nootropic/agentFeedback.json` for agent and future use. 