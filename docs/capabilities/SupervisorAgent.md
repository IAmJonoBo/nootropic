# SupervisorAgent

> **Status:** Implemented (2024-06). See `agents/SupervisorAgent.ts` for source and extension points.

## Overview

The `SupervisorAgent` monitors other agents for health, compliance, and performance, and can trigger self-healing or escalation. It supports:
- **Hierarchical Supervision:** Aggregates health/status reports from sub-agents and delegates tasks. (TODO: Integrate sub-agent registry and delegation logic)
- **Event-Driven Anomaly Detection:** Streams agent metrics into an anomaly detector (e.g., streaming Z-score). (TODO: Integrate streaming anomaly detection)
- **Self-Healing Workflows:** Automatically restarts or reconfigures misbehaving agents using remediation playbooks. (TODO: Integrate remediation logic and playbook storage)
- **Event-driven:** Emits events for supervision, anomaly detection, and self-healing actions for observability and auditability. (TODO: Emit events for all actions)

## Usage

```ts
import { SupervisorAgent } from 'nootropic/agents/SupervisorAgent';
const agent = new SupervisorAgent({ profile: { name: 'SupervisorAgent' } });
const result = await agent.runTask({ subAgents: ['AgentA', 'AgentB'], metrics: [0.1, 0.2, 0.3] });
console.log(result);
```

- To run as a service: `agent.startEventLoop()`

## Extension Points
- **Sub-Agent Registry:** Integrate a registry for dynamic sub-agent discovery and delegation. (TODO: Integrate sub-agent registry)
- **Anomaly Detection:** Add advanced streaming anomaly detection and observability. (TODO: Integrate advanced anomaly detection)
- **Remediation Playbooks:** Expand remediation playbook storage and escalation logic. (TODO: Expand playbook logic)
- **Event Types:** Expand event schemas for richer supervision and compliance reporting. (TODO: Expand event schemas)
- **Benchmarking & Test Coverage:** Automate benchmarking and test coverage for all enhancements. (TODO: Add/expand tests and benchmarks)

## Best Practices
- Implement hierarchical supervision and health aggregation
- Integrate streaming anomaly detection for real-time monitoring
- Automate self-healing and escalation for robust agent workflows
- Emit events for all supervision, anomaly detection, and self-healing actions
- Automate benchmarking and test coverage for all enhancements
- Document extension points and rationale in describe()

## Research References
- [LangChain](https://github.com/hwchase17/langchain)
- [Anomaly Detection (Wikipedia)](https://en.wikipedia.org/wiki/Anomaly_detection)
- [Self-Healing Systems](https://arxiv.org/abs/2304.05128)

## LLM/AI Usage Hints
- Use `--json` flag for machine-readable output if running via CLI.
- All outputs are schema-validated and event-driven for agentic workflows.

## Troubleshooting
- If supervision or self-healing is not working as expected, check sub-agent registry and playbook logic or extend with advanced backends.
- For custom event handling, override event emission methods.

---

_Last updated: 2024-06_ 