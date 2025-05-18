# SupervisorAgent

Monitors other agents for health, compliance, and performance; can trigger self-healing or escalation. Enhancements: Hierarchical supervision, event-driven anomaly detection, self-healing workflows. Extension points for anomaly detection, self-healing, and observability.

**Usage:**

`import { SupervisorAgent } from 'nootropic/agents/SupervisorAgent';`

## Methods/Functions

- **runTask**: (task) => Promise<AgentResult> - Runs a supervision task with hierarchical supervision, anomaly detection, and self-healing.
- **superviseAgents**: (subAgents: string[]) => Promise<{ healthReports: Record<string, unknown> }> - Supervise sub-agents and aggregate health reports.
- **detectAnomalies**: (metrics: number[]) => Promise<{ anomaly: boolean; score: number }> - Detect anomalies in agent metrics (streaming Z-score).
- **selfHeal**: (agent: string) => Promise<{ healed: boolean; action: string }> - Self-heal misbehaving agents using remediation playbooks.

## References

- https://github.com/hwchase17/langchain
- https://arxiv.org/abs/2304.05128
- https://en.wikipedia.org/wiki/Anomaly_detection
- README.md#supervisoragent
- docs/ROADMAP.md#supervisor-agent

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

