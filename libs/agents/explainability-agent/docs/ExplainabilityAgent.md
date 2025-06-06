# ExplainabilityAgent

## 1. Responsibilities

The **ExplainabilityAgent** is responsible for capturing, processing, and visualizing reasoning traces from LLM-driven workflows. Its primary duties include:

1. **Trace Correlation**

   * Align chain-of-thought (CoT) token logs from LLM calls with OpenTelemetry (OTEL) spans generated by ModelAdapter, CoderAgent, CriticAgent, and other agents.
   * Resolve unique identifiers (e.g., request IDs, span IDs, timestamp sequences) to create a unified timeline of reasoning steps and system events.

2. **Graph Generation**

   * Construct a directed acyclic graph (DAG) or tree structure representing the sequence of prompts, intermediate sub-prompts, LLM responses, static-analysis checks, and subsequent actions.
   * Annotate nodes with metadata such as agent name, model used, token counts, latency, success/failure status, and cost attributes (from OpenCost).

3. **Interactive Visualization Data**

   * Produce JSON structures (nodes, edges, and attributes) compatible with frontend graph visualization libraries (e.g., D3.js, Cytoscape.js) or VS Code Webview panels.
   * Implement pruning and summarization logic to collapse low-relevance or overly verbose branches, preserving a readable and navigable graph at different zoom levels.

4. **Privacy and Sensitivity Filtering**

   * Detect and redact any personally identifiable information (PII) or sensitive project-specific code fragments from CoT logs before exposing them to UI.
   * Enforce configurable redaction policies (e.g., mask email addresses, hide API keys, truncate long code snippets).

5. **Real-time Updates & Subscriptions**

   * Subscribe to ReflexionAdapter events (e.g., `ModelSwitched`, `CodeFixApplied`, `TaskRetryInitiated`) and incrementally update the explanation graph in real time.
   * Provide a WebSocket or gRPC endpoint for frontend clients (VS Code extension, Electron dashboard) to receive streaming updates.

6. **User Interaction & Drill-down**
   * Respond to user requests such as “Show me why this test failed” or “Highlight cost spikes,” by focusing on relevant subgraphs, highlighting nodes with errors or high cost, and displaying associated metadata.
   * Enable toggling between raw CoT text, summarized explanation, and visual graph views.

***

## 2. Inputs & Outputs

### 2.1 Inputs

1. **LLM Chain-of-Thought Logs**

   * Raw token-level logs or higher-level reasoning steps emitted by LLM calls (e.g., intermediate thoughts, function calls, self-reflection prompts).
   * May be captured from ModelAdapter, CoderAgent prompts, CriticAgent test-generation steps, and ReasoningAgent self-reflect loops.

2. **OTEL Spans & Metrics**

   * Tracing spans from OpenTelemetry instrumentation, including attributes:
     * `component` (e.g., `coder-agent`, `critic-agent`, `model-adapter`)
     * `model.name`, `tokens.in`, `tokens.out`
     * `latency.ms`, `cost.usd`
     * `status` (`OK` / `ERROR`)
   * Metrics such as CPU/GPU utilization, memory pressure, and queue wait times (when available).

3. **ReflexionAdapter Events**

   * Event streams indicating state transitions (e.g., model switches, retries, escalations).
   * Payloads include: event type, timestamp, associated task ID, and optional metadata (e.g., new model name, error reason).

4. **User Interaction Requests**
   * Queries from VS Code or Electron UI for specific tasks, e.g., “Expand reasoning for task T012” or “Prune nodes older than 5 minutes.”
   * Commands to toggle filtering criteria (e.g., show only cost > $0.01, show only error nodes).

### 2.2 Outputs

1. **Explanation JSON Structure**

   * A standardized JSON object containing:

     ```jsonc
     {
       "nodes": [
         {
           "id": "node-123",
           "timestamp": "2025-06-20T14:23:45.123Z",
           "agent": "CoderAgent",
           "type": "LLM_CALL",
           "model": "starcoder2-3b-4bit",
           "promptSummary": "...",
           "tokensIn": 120,
           "tokensOut": 250,
           "latencyMs": 310,
           "costUsd": 0.00012,
           "status": "OK",
         },
         {
           "id": "node-124",
           "timestamp": "2025-06-20T14:23:46.567Z",
           "agent": "CriticAgent",
           "type": "STATIC_ANALYSIS",
           "ruleId": "javascript.injection.detected",
           "severity": "HIGH",
           "status": "FOUND_VULNERABILITY",
         },
         // ...
       ],
       "edges": [
         {
           "from": "node-123",
           "to": "node-124",
           "relation": "NEXT_STEP",
         },
         {
           "from": "node-124",
           "to": "node-125",
           "relation": "TRIGGERED",
         },
         // ...
       ],
     }
     ```

   * **Nodes** represent discrete reasoning or system events (LLM calls, static checks, test runs, model switches).

   * **Edges** represent causal or temporal relations (e.g., “LLM response led to a static analysis step,” or “ModelAdapter switched model after CriticAgent failure”).

2. **Pruned & Summarized Graph Fragments**

   * When users request high-level summaries (e.g., “Show only error bubbles”), the agent outputs a filtered JSON containing only nodes meeting specified criteria, along with adjusted edge sets.

3. **UI-Renderable Components**

   * Data structures enriched with UI hints (e.g., node color, size, tooltip text) to facilitate direct rendering in D3 or VS Code Webview. For example:

     ```jsonc
     {
       "id": "node-124",
       "label": "Semgrep: SQL Injection Detected",
       "color": "red",
       "tooltip": "Visit line 42 in users.js for details",
       "metadata": {
         /* full IssueReport info */
       },
     }
     ```

4. **Subscription Acknowledgments**
   * When a frontend subscribes to real-time updates, the agent returns a subscription ID and initial snapshot of the graph. Subsequent incremental updates are sent over WebSocket/gRPC.

***

## 3. Data Structures

The ExplainabilityAgent uses the following TypeScript interfaces (or analogous structures in other languages) to represent its internal state and outputs.

```ts
/** A single reasoning or system event in the explanation graph */
interface ExplanationNode {
  id: string;                     // Unique node identifier
  timestamp: string;              // ISO 8601 timestamp
  agent: string;                  // Agent that generated this node (e.g., "CoderAgent")
  type: "LLM_CALL" |
        "STATIC_ANALYSIS" |
        "TEST_RUN" |
        "MODEL_SWITCH" |
        "REFLEXION_ACTION" |
        "USER_QUERY" |
        "OTHER";
  model?: string;                 // If type === "LLM_CALL"
  promptSummary?: string;         // Truncated summary of the prompt
  tokensIn?: number;              // Number of input tokens
  tokensOut?: number;             // Number of output tokens
  latencyMs?: number;             // Latency for the step
  costUsd?: number;               // Cost attributed to this step (if available)
  status: "OK" | "ERROR" | "WARNING" | "SKIPPED";
  details?: Record<string, any>;  // Agent-specific metadata:
                                  // - For STATIC_ANALYSIS: ruleId, severity, file, line
                                  // - For TEST_RUN: testSuite, coverage
                                  // - For MODEL_SWITCH: oldModel, newModel, reason
}

/** Directed edge connecting two nodes */
interface ExplanationEdge {
  from: string;                   // Source node ID
  to: string;                     // Target node ID
  relation: "NEXT_STEP" |
            "TRIGGERED" |
            "REFLECTED" |
            "ESCALATED" |
            "USER_ACTION" |
            "OTHER";
}

/** Complete graph structure */
interface ExplanationGraph {
  nodes: ExplanationNode[];
  edges: ExplanationEdge[];
  lastUpdated: string;            // Timestamp of last update
}

/** Subscription request payload */
interface SubscriptionRequest {
  subscriptionId?: string;        // Optional: if re-subscribing
  filters?: {                     // Optional: filter criteria
    agentNames?: string[];        // Only include nodes from these agents
    nodeTypes?: string[];         // Only include certain node types
    status?: ("OK" | "ERROR" | "WARNING")[];
    minCostUsd?: number;          // Only include nodes with cost ≥ value
    timeRange?: {                 // Only include nodes within timeframe
      start: string;              // ISO 8601
      end: string;                // ISO 8601
    };
  };
}

/** Incremental update message */
interface GraphUpdate {
  addedNodes: ExplanationNode[];
  removedNodeIds: string[];
  addedEdges: ExplanationEdge[];
  removedEdgeIds: { from: string; to: string }[];
  timestamp: string;              // When this update was generated
}


⸻

4. Algorithms & Workflow

4.1 Trace Ingestion & Correlation
 1. Log Collection
 • Listen for LLM CoT logs emitted by ModelAdapter. Each log entry includes a unique requestId, timestamp, and token‐level details.
 • Capture OTEL spans with corresponding spanId, parentSpanId, attributes (e.g., component, model.name, latency.ms, cost.usd).
 2. Identifier Mapping
 • Maintain a mapping table keyed by requestId ↔ spanId. When a ModelAdapter call begins, generate a single OTEL span and annotate it with the same requestId.
 • For nested LLM calls (e.g., self-reflection loops), chain spans via parentSpanId, preserving the call stack.
 3. Node Creation
 • For each LLM CoT log:
 • Summarize the CoT text to a truncated “promptSummary” (e.g., first 200 characters of thought chain).
 • Create an ExplanationNode with type: "LLM_CALL", agent: "ModelAdapter", plus token and latency data from the corresponding OTEL span.
 • For each OTEL span unrelated to LLM (e.g., static analysis, test execution):
 • Create an ExplanationNode with type matching the agent (e.g., “STATIC_ANALYSIS”), copying relevant attributes (e.g., rule IDs, severity).
 4. Edge Construction
 • Whenever a new node is created, inspect its parentSpanId. If present, link from: parentNodeId, to: newNodeId with relation: "NEXT_STEP".
 • For event-driven transitions (e.g., ReflexionAdapter emits a ModelSwitched event), create edges with relation: "REFLECTED" between the triggering node and the new “MODEL_SWITCH” node.
 5. Pruning & Summarization
 • Periodically (or on user request), collapse subtrees where all nodes have status: "OK" and latencyMs < 50 & costUsd < 0.0001.
 • Replace collapsed subtrees with a single “summary node” labeled “Routine LLM calls (n=5, avg latency 30 ms)”.
 • Keep track of mapping from summary node ↔ original nodes for drill-down.

4.2 Incremental Update Propagation
 1. Subscription Management
 • When a frontend client issues a SubscriptionRequest, store its criteria in memory along with a generated subscriptionId.
 • Immediately send the current ExplanationGraph filtered according to the subscription’s criteria.
 2. Real-Time Event Handling
 • On receiving a ReflexionAdapter event (e.g., CodeFixApplied):
 1. Generate a new ExplanationNode with type: "REFLEXION_ACTION", including metadata such as taskID and diffSummary.
 2. Determine edges: if this event references a previous node (e.g., a failed CRITIC_AGENT node), add an edge relation: "TRIGGERED".
 3. Broadcast a GraphUpdate to all subscribers whose filters match the new node.
 3. User-Requested Drill-Down
 • If the user clicks on a summary node, fetch all collapsed nodes under that summary. Return a GraphUpdate removing the summary node and adding its children nodes and corresponding edges.
 4. Filtering on the Fly
 • If a subscriber updates its filter criteria (e.g., show only error nodes), compute the difference between the previous filtered graph and the newly filtered graph.
 • Send a GraphUpdate with removedNodeIds and removedEdgeIds for nodes/edges no longer matching, and addedNodes/addedEdges for newly included ones.

⸻

5. Integration Points
 1. ModelAdapter
 • Instrumentation: ModelAdapter wraps every LLM call (Tabby ML, Ollama, vLLM, llama.cpp) with an OTEL span tagged component: "model-adapter".
 • CoT Logging: It emits a CoT JSON event containing requestId, raw tokens, and truncated summaries. ExplainabilityAgent listens on a dedicated internal event bus (e.g., Kafka topic or in-memory RxJS subject).
 2. CoderAgent & CriticAgent
 • Both agents emit OTEL spans (coder.generate, critic.analysis) with attributes such as taskID, model.name, issues.count, and latencyMs.
 • ExplainabilityAgent subscribes to these spans (via OTEL Collector or direct SDK hook) and uses them to build graph nodes.
 3. ReasoningAgent
 • Emits sub-workflow events (e.g., recursive CoT calls, candidate plan generation, ensemble voting) as part of OTEL traces.
 • ExplainabilityAgent tags these events under agent: "ReasoningAgent", type: "LLM_CALL" or type: "REFLEXION_ACTION" depending on context.
 4. ReflexionAdapter
 • Emits high-level state-machine transitions and event metadata.
 • ExplainabilityAgent translates these into TYPE: "REFLEXION_ACTION" nodes and links them to the underlying LLM or static-analysis nodes.
 5. VS Code Extension & Electron Dashboard
 • Both frontends connect to ExplainabilityAgent’s WebSocket (or gRPC) endpoint at ws://localhost:9000/explain (configurable port).
 • They issue SubscriptionRequest messages and receive ExplanationGraph and GraphUpdate payloads.
 • Frontends render the graph using D3.js (Electron) or the VS Code Webview API, providing interactive tooltips and drill-down functionality.
 6. Storage & Caching
 • Optional: Persist recent snapshots of ExplanationGraph to a local SQLite or JSON file (~/.nootropic-cache/explain_graph.json) for offline analysis or postmortem.
 • Implement an LRU cache for node metadata (e.g., full CoT text) to reduce memory pressure, keeping only the latest 1,000 nodes in memory by default.

⸻

6. Configuration

All ExplainabilityAgent parameters are configurable under the explainabilityAgent key in ~/.nootropic/config.json. Example:

{
  "explainabilityAgent": {
    // Maximum depth of chain-of-thought to display before summarizing
    "maxCoTDepth": 5,

    // Pruning policy: only collapse subtrees where avg latency < threshold (ms)
    "pruneLatencyThresholdMs": 50,

    // Minimum cost (USD) per LLM call to include in full detail
    "minCostUsdDetail": 0.0001,

    // Time-to-live (minutes) for nodes before automatic archival/pruning
    "nodeTTLMinutes": 120,

    // Maximum number of nodes to keep in memory per task
    "maxNodesPerTask": 500,

    // Enable or disable PII redaction
    "redactPII": true,

    // Redaction regex patterns (strings interpreted as JS RegExp)
    "redactionPatterns": [
      "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
      "api_key\\s*=\\s*['\\\"][A-Za-z0-9_-]{20,}['\\\"]"
    ],

    // WebSocket/gRPC listening port
    "port": 9000,

    // Retention policy for persisted graphs (days)
    "persistRetentionDays": 7
  }
}

 • maxCoTDepth: Limits how many nested reasoning steps to show before summarizing.
 • pruneLatencyThresholdMs: If a subtree’s average latency is below this, collapse it into a summary node.
 • minCostUsdDetail: Only show detailed nodes for calls costing ≥ this amount; others are summarized.
 • nodeTTLMinutes: Automatically prune nodes older than this value, freeing memory.
 • maxNodesPerTask: Prevent infinite growth when a single task generates thousands of nodes.
 • redactPII: Toggles PII redaction.
 • redactionPatterns: Regex patterns used to scrub sensitive strings.
 • port: Port for WebSocket/gRPC server.
 • persistRetentionDays: How long snapshots are kept on disk before deletion.

⸻

7. Metrics & Instrumentation

The ExplainabilityAgent itself is instrumented to produce metrics for monitoring its own performance and health. It emits the following OpenTelemetry metrics and spans:
 1. Span: explain.ingest
 • Fired when a batch of OTEL spans or CoT logs is ingested.
 • Attributes:
 • batchSize (number of spans/logs processed)
 • ingestLatencyMs (time taken to process batch)
 • errors (boolean)
 2. Counter: explain.node_created
 • Increments each time a new ExplanationNode is created.
 3. Counter: explain.edge_created
 • Increments each time a new ExplanationEdge is created.
 4. Gauge: explain.nodes_in_memory
 • Reports the current number of nodes held in memory.
 5. Histogram: explain.graph_update_latency
 • Records the time between receiving an event (e.g., new OTEL span) and broadcasting the corresponding GraphUpdate to subscribers.
 6. Span: explain.prune
 • Fired when pruning or summarization occurs.
 • Attributes:
 • nodesPrunedCount
 • edgesPrunedCount
 • pruneLatencyMs
 7. Counter: explain.pii_redactions
 • Counts the number of PII items redacted across all CoT logs.
 8. Span: explain.persist_snapshot
 • Fired when the current graph snapshot is written to disk.
 • Attributes:
 • persistFileSizeBytes
 • persistLatencyMs

These metrics allow the ReflexionEngine or an external monitoring dashboard (e.g., Prometheus + Grafana) to detect performance bottlenecks—such as the ExplainabilityAgent falling behind under heavy load—and to trigger auto-scaling or alerting as needed.

⸻

8. Testing & Validation
 1. Unit Tests
 • Validate correlation logic between CoT logs and OTEL spans. Mock input logs and spans, and assert correct mapping to ExplanationNode and ExplanationEdge.
 • Test PII redaction using sample inputs containing email addresses, API keys, or other sensitive patterns.
 • Verify pruning logic by constructing a synthetic graph with low-latency nodes and asserting they collapse into summary nodes as expected.
 2. Integration Tests
 • Start a lightweight Temporal and Tabby ML environment. Trigger a simple CoderAgent workflow (e.g., “Create README.md”), capture CoT logs and spans, and confirm ExplainabilityAgent produces a correct graph.
 • Simulate a CriticAgent failure (e.g., inject a static analysis rule violation) and ensure the resulting REFLEXION_ACTION node appears, with correct edges linking back to the original LLM call.
 3. End-to-End UI Validation
 • Use a headless browser or VS Code extension testing framework to connect to the ExplainabilityAgent’s WebSocket endpoint, receive initial graph, and render it in a test Webview.
 • Programmatically click on a summary node to drill down, then assert that the client receives the expected GraphUpdate containing child nodes.
 4. Load Testing
 • Generate synthetic CoT logs at high throughput (e.g., 100 events/second) and OTEL spans (e.g., 500 spans/second) to simulate a busy multi-user environment.
 • Measure explain.ingest and explain.graph_update_latency metrics; ensure latency remains below a configurable SLA (e.g., <50 ms per update) under target load.

⸻

9. Edge Cases & Failure Modes
 1. Missing Span Correlation
 • If an OTEL span arrives without a matching CoT requestId, create a standalone ExplanationNode of type OTHER with a notice in details indicating missing correlation.
 • Later, if the CoT log appears with the matching requestId, retrospectively link the node via a GraphUpdate.
 2. Out-of-Order Events
 • OTEL spans and CoT logs may arrive out of chronological order. Buffer inbound events for a short window (e.g., 100 ms) and reorder them by timestamp before node creation.
 • If an event arrives after pruning, it may be omitted; log a warning but do not re-inflate summary nodes.
 3. Excessive Graph Size
 • If a single task’s graph exceeds maxNodesPerTask, automatically prune oldest nodes or collapse entire subtrees using summarization heuristics.
 • Notify the user via a special GraphUpdate node (e.g., “Graph truncated: over 500 nodes; summarizing routine steps”).
 4. PII Redaction Overreach
 • Over-zealous redaction patterns may remove non-sensitive text. Provide a “rollback” API for advanced users to override redaction on a per-node basis.
 • Maintain an audit log of redacted items to allow manual review if necessary.
 5. Broken WebSocket Connections
 • If a subscriber disconnects unexpectedly, queue up to N missed updates (configurable, e.g., maxQueuedUpdates: 100) and attempt to resend on reconnect.
 • If the queue overflows, send a “snapshotNeeded” event prompting the client to request a fresh graph snapshot.

⸻

10. Future Enhancements
 1. Natural-Language Explanation Summaries
 • Use a dedicated summarization model (e.g., GPT-4o or a fine-tuned Bloom) to generate human-readable summaries of complex reasoning chains, alongside the visual graph.
 2. Inter-agent Explanation Templates
 • Standardize CoT prompts across agents with metadata tags (e.g., {why}, {how}, {alternatives}) to make trace parsing more consistent and enable richer visualizations (e.g., “Show alternative plan branches tried by ReasoningAgent”).
 3. User Annotations & Collaboration
 • Let users annotate nodes or edges with comments, questions, or approvals. Persist annotations to Git or a shared database for team-wide review.
 4. Historical Comparison & Diff
 • Compare explanation graphs from two time points (e.g., before and after a major refactor) and visually highlight structural changes (new nodes added, average latency improvements, cost reductions).
 5. Multi-Task Aggregation
 • Aggregate graphs across multiple tasks (e.g., entire sprint) to identify systemic bottlenecks—such as consistently slow LLM calls or frequently failing autofix patches—and generate high-level dashboards.
 6. Fine-Grained Access Controls
 • Integrate with enterprise identity providers (OAuth, LDAP) to enforce role-based access (e.g., only QA engineers can view low-level code traces, while managers see only high-level cost/latency summaries).

⸻

11. Summary

The ExplainabilityAgent is a cornerstone of nootropic’s commitment to transparency and debuggability. By ingesting LLM chain-of-thought logs, correlating them with OTEL spans, and producing interactive explanation graphs, it empowers users to understand exactly how and why code was generated, refactored, or fixed. Its real-time subscriptions, pruning mechanisms, and privacy-preserving filters ensure that even complex, multi-step reasoning flows remain accessible, navigable, and secure. As nootropic evolves, ExplainabilityAgent will continue to enhance developer trust by providing clear, concise, and actionable insights into AI-driven workflows.

```
