# ObservabilityAdapter

## 1. Responsibilities

The **ObservabilityAdapter** provides a unified layer for collecting, processing, and exporting telemetry data (traces, metrics, and logs) across all nootropic components. Its core duties include:

1. **Automatic Instrumentation**

   * Wrap LLM calls, Temporal workflow activities, and critical agent operations with OpenTelemetry (OTEL) spans.
   * Capture metadata such as component name, model used, token counts, latency, and cost.

2. **Metrics Collection & Aggregation**

   * Record system-level metrics (CPU usage, GPU utilization, memory pressure) at configurable intervals.
   * Aggregate application-level counters (e.g., number of code generation attempts, number of successful autofixes).

3. **Span & Metric Export**

   * Export OTEL spans to configured backends (e.g., Jaeger for distributed tracing, Prometheus for metrics).
   * Tag spans with cost information via OpenCost integration to enable budget-aware decision making.

4. **Context Propagation**

   * Ensure trace context is propagated across asynchronous boundaries—between agents, between processes (e.g., CLI → Electron dashboard), and across HTTP/gRPC calls.
   * Inject necessary headers or metadata so that child spans are properly linked to parent spans in a single trace.

5. **Configuration & Endpoint Management**

   * Load endpoint URLs, authentication tokens, and scrape configurations from the global configuration.
   * Validate and fall back to defaults if endpoints are unreachable or misconfigured.

6. **Self‐Monitoring & Resilience**
   * Detect when OTEL exporters (Jaeger, Prometheus) are unavailable and buffer or drop telemetry according to policy.
   * Emit internal metrics (e.g., export failures, buffer saturation) to ensure the health of the observability subsystem.

***

## 2. Inputs & Outputs

### 2.1 Inputs

1. **Instrumentation Hooks**

   * Calls from various agents (CoderAgent, CriticAgent, ModelAdapter, MemoryAgent, etc.) invoking the ObservabilityAdapter to start or end spans around operations.
   * Asynchronous events (e.g., Temporal activity scheduling, LLM streaming callbacks) requiring context propagation for tracing.

2. **System Telemetry Sources**

   * Node.js process metrics: CPU load (`os.loadavg()`), memory usage (`process.memoryUsage()`), event‐loop delay.
   * GPU metrics via specialized libraries or CLI wrappers (e.g., `nvidia-smi` for NVIDIA GPUs).
   * Custom application counters (e.g., `codegen_attempts`, `autofix_count`) emitted by agents.

3. **Configuration Parameters**
   * Under the `observabilityAdapter` key in `~/.nootropic/config.json`:
     * `jaegerEndpoint`: HTTP/GRPC URL for Jaeger collector.
     * `prometheusEndpoint`: Pushgateway or metrics scrape endpoint.
     * `openCostEnabled`: Boolean to include cost metadata.
     * `metricEmitIntervalMs`: Interval for exporting metric snapshots.
     * `traceSampleRate`: Percentage of traces to sample (0.0–1.0).
     * `bufferSize`: Maximum queued telemetry items when exporters are down.

### 2.2 Outputs

1. **OpenTelemetry Spans**

   * Exported to Jaeger (or alternative OTEL‐compatible collector). Each span includes attributes such as:
     * `component`: e.g., `CoderAgent`, `ModelAdapter`
     * `operation`: e.g., `generateCode`, `inferModel`
     * `model.name`, `tokensIn`, `tokensOut`, `latencyMs`, `costUsd` (if `openCostEnabled`)
     * `taskID`, `workflowID` (for Temporal activities)

2. **Prometheus Metrics**

   * Counters (e.g., `nootropic_codegen_attempts_total`, `nootropic_autofix_applied_total`)
   * Gauges (e.g., `nootropic_cpu_usage_percent`, `nootropic_memory_usage_mb`, `nootropic_gpu_utilization_percent`)
   * Histograms/Timers (e.g., `nootropic_infer_latency_ms`)

3. **Internal Health Metrics**

   * Indicators for exporter health, buffer saturation level, and internal errors:
     * `observability_exporter_status` (0 = healthy, 1 = degraded)
     * `observability_buffer_size` (number of items currently queued)
     * `observability_export_failures_total`

4. **Logs (Optional)**
   * Structured logs (JSON) emitted via console or file, indicating instrumentation events, export successes/failures, configuration warnings.

***

## 3. Data Structures

```ts
/** Configuration schema for ObservabilityAdapter */
interface ObservabilityConfig {
  jaegerEndpoint: string;           // e.g., "http://localhost:14268/api/traces"
  prometheusEndpoint: string;       // e.g., "http://localhost:9091/metrics"
  openCostEnabled: boolean;         // Include cost tags if true
  metricEmitIntervalMs: number;     // Milliseconds between metric exports
  traceSampleRate: number;          // Sampling rate 0.0–1.0 for traces
  bufferSize: number;               // Max buffered telemetry items
}

/** Internal telemetry buffer item */
interface TelemetryItem {
  type: "SPAN" | "METRIC";
  payload: any;                     // OTEL SpanData or Prometheus metric data
  timestamp: number;                // UNIX epoch ms
}

/** Example OTEL Span attributes */
interface SpanAttributes {
  component: string;                // Agent or adapter name
  operation: string;                // e.g., "generateCode"
  modelName?: string;               // e.g., "starcoder2-3b-4bit"
  tokensIn?: number;
  tokensOut?: number;
  latencyMs?: number;
  costUsd?: number;
  taskID?: string;
  workflowID?: string;
}

/** Prometheus metric descriptor */
interface PromMetric {
  name: string;                     // e.g., "nootropic_cpu_usage_percent"
  type: "COUNTER" | "GAUGE" | "HISTOGRAM";
  value: number | number[];         // Single value or histogram bucket counts
  labels?: Record<string, string>;  // e.g., { agent: "CoderAgent" }
}


⸻

4. Algorithms & Workflow

4.1 Initialization & Configuration
 1. Load Configuration
 • On startup, read ~/.nootropic/config.json under the observabilityAdapter key.
 • Validate fields: ensure endpoints are valid URLs, traceSampleRate ∈ [0.0, 1.0], bufferSize > 0.
 2. Initialize OTEL SDK
 • Configure OTEL Tracer Provider:
 • Set sampling strategy based on traceSampleRate.
 • Register a Jaeger exporter pointing at jaegerEndpoint.
 • Initialize Prometheus exporter:
 • Expose a metrics endpoint (if pushgateway) or set up a push to prometheusEndpoint at metricEmitIntervalMs.
 3. Set Up Buffer & Retry Logic
 • Allocate an in-memory ring buffer (FIFO) of size bufferSize for telemetry items when exporters are down.
 • Start a background task that periodically attempts to flush buffered items to the appropriate exporter.

4.2 Span Instrumentation
 1. Instrumentation API
 • Provide helper functions for agents to create spans:

function startSpan(name: string, attributes: SpanAttributes): Span { … }
function endSpan(span: Span): void { … }


 • Wrap asynchronous operations so that context is properly propagated:

const span = obsAdapter.startSpan("generateCode", { component: "CoderAgent", modelName, taskID });
try {
  const result = await generateCode();
  span.setAttribute("latencyMs", result.latencyMs);
  span.setAttribute("tokensIn", result.tokensIn);
  span.setAttribute("tokensOut", result.tokensOut);
  // If cost tracking enabled:
  if (config.openCostEnabled) {
    span.setAttribute("costUsd", result.costUsd);
  }
  span.setStatus({ code: SpanStatusCode.OK });
} catch (err) {
  span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
} finally {
  obsAdapter.endSpan(span);
}


 2. Context Propagation
 • Use OTEL context APIs (e.g., context.with() and propagate) to ensure child spans inherit parent context.
 • For HTTP/gRPC calls: inject OTEL context into request headers so downstream services can link spans.
 3. Span Export & Sampling
 • Upon endSpan, the OTEL SDK decides (based on traceSampleRate) whether to export the span.
 • Successful spans are transmitted to Jaeger; failed sends due to network issues are buffered up to bufferSize.

4.3 Metric Collection & Export
 1. Metric Definitions
 • Predefine key metrics:
 • Counters:
 • nootropic_codegen_attempts_total
 • nootropic_autofix_applied_total
 • model_selection_count
 • Gauges:
 • nootropic_cpu_usage_percent
 • nootropic_memory_usage_mb
 • nootropic_gpu_utilization_percent
 • observability_buffer_size
 • Histograms:
 • nootropic_infer_latency_ms
 2. System Metric Polling
 • Every metricEmitIntervalMs:
 1. Sample system metrics:
 • CPU usage via os.loadavg() or a library like pidusage.
 • Memory usage via process.memoryUsage().
 • GPU utilization via nvidia-smi parsing or GPU‐specific library.
 2. Update corresponding gauge metrics.
 3. Push or expose metrics:
 • If using a Pushgateway, send HTTP POST to prometheusEndpoint.
 • If using a pull‐model, ensure metrics are exposed on a local HTTP server at /metrics.
 3. Application Metric Emission
 • Expose API for agents to increment counters or observe histograms:

function incCounter(name: string, labels?: Record<string, string>): void { … }
function gaugeSet(name: string, value: number, labels?: Record<string, string>): void { … }
function observeHistogram(name: string, value: number, labels?: Record<string, string>): void { … }


 • Agents call those APIs on relevant events (e.g., incCounter("nootropic_codegen_attempts_total") on each codegen attempt).

4.4 Error Handling & Resilience
 1. Exporter Failures
 • If a span or metric fails to send (e.g., network error, Prometheus down):
 1. Catch the error and enqueue the telemetry item into the buffer.
 2. Increment observability_export_failures_total.
 3. If buffer is full, drop oldest items and increment observability_dropped_items_total.
 2. Buffer Flushing
 • Periodically (e.g., every 5 seconds), attempt to resend buffered items to their exporters.
 • On success, remove them from the buffer and decrement observability_buffer_size.
 • If repeated failures occur (e.g., > 10 consecutive attempts), emit an internal error log and set observability_exporter_status = 1 (degraded).
 3. Sampling Adjustments
 • Dynamically adjust traceSampleRate if CPU overhead from tracing becomes too high (e.g., CPU usage > 80%).
 • Provide a callback or expose an API to throttle sampling in real time.

⸻

5. Integration Points
 1. CoderAgent, CriticAgent, ModelAdapter, etc.
 • Each agent imports ObservabilityAdapter to instrument critical operations.
 • For example:

const span = obsAdapter.startSpan("CoderAgent.generate", { component: "CoderAgent", taskID });
// ... generation logic ...
obsAdapter.endSpan(span);


 2. Temporal Workflows
 • Wrap each Temporal activity and workflow step with OTEL spans.
 • Use Temporal’s OpenTelemetry integration (e.g., via @temporalio/otel) to automatically attach trace context to workflow executions.
 • When an activity fails or is retried, spans capture error details and event relationships.
 3. Electron Dashboard & VS Code Extension
 • Expose a telemetry‐status API for frontends to display:
 • Current trace export status (healthy/degraded).
 • Buffer utilization (so users know if they need to check connectivity).
 • Provide UI widgets (e.g., a small icon in the status bar) indicating whether the Jaeger and Prometheus endpoints are reachable.
 4. OpenCost Integration
 • If openCostEnabled is true, ObservabilityAdapter calculates cost estimates (e.g., based on GPU seconds at a $/minute rate) and tags spans accordingly.
 • Downstream ReflexionEngine can consume those cost tags to make budget‐aware decisions (e.g., switch to a cheaper model if cumulative cost ≥ threshold).
 5. NotificationAdapter
 • On critical failures (e.g., telemetry buffer overflow, exporter unreachable > configured threshold), ObservabilityAdapter can invoke NotificationAdapter to send alerts via Slack or email.

⸻

6. Configuration

All ObservabilityAdapter settings live under the observabilityAdapter key in ~/.nootropic/config.json:

{
  "observabilityAdapter": {
    // Jaeger collector endpoint (HTTP or gRPC)
    "jaegerEndpoint": "http://localhost:14268/api/traces",
    // Prometheus Pushgateway or scrape endpoint
    "prometheusEndpoint": "http://localhost:9091/metrics",
    // Include cost information in spans if true
    "openCostEnabled": true,
    // How often (ms) to emit system and application metrics
    "metricEmitIntervalMs": 5000,
    // Fraction of traces to sample for export (0.0 to 1.0)
    "traceSampleRate": 0.2,
    // Maximum number of telemetry items to buffer when exporters are down
    "bufferSize": 1000,
    // Internal threshold to mark exporter status degraded (number of consecutive failures)
    "exportFailureThreshold": 10,
    // Flag to expose a `/metrics` HTTP endpoint for pull-based Prometheus
    "exposeMetricsEndpoint": true,
    // Port for metrics HTTP server (if exposeMetricsEndpoint is true)
    "metricsPort": 9464
  }
}

 • jaegerEndpoint: URL where OTEL spans are sent.
 • prometheusEndpoint: URL or Pushgateway endpoint for metrics.
 • openCostEnabled: When enabled, ObservabilityAdapter tags spans with cost estimates.
 • metricEmitIntervalMs: Interval between metric emissions; should be tuned to balance freshness vs. overhead.
 • traceSampleRate: Percentage of traces to export; lower rates reduce overhead in high‐volume scenarios.
 • bufferSize: Max number of telemetry items held when exporters are down; too small may lead to data loss, too large uses more memory.
 • exportFailureThreshold: Number of consecutive export failures before marking status degraded and alerting.
 • exposeMetricsEndpoint & metricsPort: If true, spin up an HTTP server that serves metrics at http://localhost:<metricsPort>/metrics for Prometheus to scrape.

⸻

7. Metrics & Instrumentation

The ObservabilityAdapter itself emits the following telemetry:
 1. Span: observability.adapter.export
 • Fired whenever a batch of telemetry items (spans or metrics) is pushed to an exporter.
 • Attributes:
 • exportType: "SPAN" or "METRIC"
 • batchSize: number of items in the batch
 • exportDurationMs: time taken to send the batch
 • status: "OK" or "ERROR"
 2. Counter: observability.export_failures_total
 • Increments each time a telemetry item fails to export.
 3. Gauge: observability.buffer_size
 • Current number of items in the in-memory buffer.
 4. Gauge: observability_exporter_status
 • 0 if all exporters are healthy; 1 if any exporter has exceeded exportFailureThreshold.
 5. Histogram: observability.infer_latency_distribution_ms
 • Aggregates latencies for key operations within ObservabilityAdapter (e.g., serialization, HTTP send).
 6. Counters & Gauges Delegated from Agents
 • Via ObservabilityAdapter APIs, agents report their own metrics (e.g., nootropic_codegen_attempts_total, nootropic_cpu_usage_percent). These are exposed directly to Prometheus.

By exposing these metrics, external monitoring systems (Grafana, Kibana) or ReflexionEngine can detect telemetry pipeline health and intervene (e.g., scale resources, alert administrators) when thresholds are breached.

⸻

8. Testing & Validation
 1. Unit Tests
 • Configuration Validation: Supply malformed observabilityAdapter configurations and assert that initialization fails with descriptive errors.
 • Instrumentation API: Mock OTEL Tracer and assert that calling startSpan and endSpan produces correct span attributes.
 • Metric API: Validate counter increments, gauge sets, and histogram observations record correct values.
 2. Integration Tests
 • Jaeger Exporter: Start a local Jaeger collector; instrument a dummy operation, and verify that a span appears in Jaeger’s UI/HTTP API.
 • Prometheus Metrics: Start a local Prometheus Pushgateway or pull‐server; emit a set of test metrics, then query the /metrics endpoint (or Pushgateway) to confirm values.
 • OpenCost Tagging: Enable openCostEnabled; instrument a fake inference span with tokensIn and tokensOut. Verify that costUsd attribute is present and calculated by OpenCost.
 3. End‐to‐End Workflow Tests
 • Deploy a minimal nootropic stack (Tabby ML, Temporal, Chroma) locally with ObservabilityAdapter active.
 • Execute a sample CoderAgent code generation request. Confirm:
 1. Span hierarchy exists in Jaeger: root span “executeTask” → child span “ModelAdapter.infer” → child span “ObservabilityAdapter.export”.
 2. Prometheus metrics reflect incremented counters (e.g., nootropic_codegen_attempts_total).
 4. Resilience & Failure Tests
 • Exporter Unavailability: Point jaegerEndpoint to an unreachable address. Generate a batch of spans, then check that they are buffered and retried when the endpoint is restored.
 • Buffer Overflow: Configure bufferSize=5; simulate rapid export failures; assert that oldest buffered items drop and observability_dropped_items_total increments.
 • High Cardinality Metrics: Generate metrics with many unique label combinations (e.g., different taskID for each). Verify that the adapter logs a warning or throttles metric emission when cardinality exceeds safe thresholds.

⸻

9. Edge Cases & Failure Modes
 1. No OTLP Endpoint Available
 • If both jaegerEndpoint and prometheusEndpoint are unreachable at startup:
 • Adapter logs a warning and continues running in “no‐export” mode, dropping telemetry (or buffering if configured).
 • Emit an internal span observability.initialization_error.
 2. High Cardinality Labels
 • If agents pass high‐cardinality labels (e.g., unique taskID for every metric), metric cardinality may explode.
 • Adapter enforces a label whitelist or strips labels exceeding a threshold (configurable via maxLabelCardinality).
 3. Circular Context Propagation
 • If asynchronous operations inadvertently propagate the same context multiple times, spans may appear nested incorrectly.
 • Adapter detects repeated parent‐child relationships by tracking active span IDs and prevents duplicate nesting.
 4. Buffer Saturation & Memory Pressure
 • If telemetry generates faster than exports can handle (e.g., offline for extended periods), the buffer may fill:
 • When bufferSize is reached, new items are dropped, and observability_dropped_items_total increments.
 • Adapter emits a critical log and sets observability_exporter_status=1.
 5. Misconfigured Sampling Rate
 • If traceSampleRate=0.0, no spans are exported, leading to blind spots. Adapter logs a warning when sample rate = 0.
 • If traceSampleRate=1.0 on a high‐volume system, overhead may degrade performance; Adapter can throttle sampling automatically if CPU usage exceeds a threshold (configurable).
 6. Inconsistent Time Sync
 • If host system clock skews (e.g., NTP adjustments), span timestamps may be out of order. Adapter normalizes timestamps to monotonic counters when possible, but major skew results in gaps in Jaeger.

⸻

10. Future Enhancements
 1. Dynamic Sampling & Adaptive Throttling
 • Implement heuristics that adjust traceSampleRate based on observed system load or agent‐reported priorities (e.g., sample 100% of spans in error states, 10% otherwise).
 2. Multi‐Backend Export Strategy
 • Support simultaneous or fallback exports to multiple backends (e.g., send traces to both Jaeger and a cloud‐hosted OTEL collector).
 • Provide a “splitting” mechanism to route performance‐critical metrics to a lightweight store and detailed traces to a deeper analytics system.
 3. SLA Enforced Alerts
 • Define SLA rules in configuration (e.g., “if average LLM latency > 800 ms for 5 minutes, send alert”).
 • ObservabilityAdapter can evaluate these rules in real time and invoke NotificationAdapter when breached.
 4. Log Correlation & Fluent Integration
 • Integrate structured logs (e.g., via Winston or Bunyan) with OTEL trace context to enable seamless log‐trace correlation in external systems (e.g., Elastic).
 5. Platform‐Native Metrics (Cloud & Kubernetes)
 • When deployed on Kubernetes, automatically expose Pod and container metrics (CPU throttling, OOMKills) to Prometheus with correct service discovery.
 • Leverage Kubernetes downward API to tag metrics/spans with namespace, pod, and container labels.
 6. GraphQL Telemetry API
 • Expose a GraphQL‐based query endpoint to allow frontends (Electron, VS Code) to request historical telemetry (e.g., “Show last hour’s codegen latencies”).

⸻

11. Summary

The ObservabilityAdapter is the central telemetry backbone for nootropic, ensuring that every generation, inference, workflow execution, and system‐level metric is captured, aggregated, and exported in a consistent manner. By providing automatic instrumentation, context propagation, and resilient export mechanisms—including cost tagging via OpenCost—the adapter empowers ReflexionEngine and human operators to understand system behavior, detect anomalies, and make informed decisions about model selection, performance tuning, and resource allocation. Its configurable sampling, buffering, and resilience strategies ensure minimal overhead on developer machines while maintaining high‐fidelity observability. As nootropic evolves, the ObservabilityAdapter will continue to expand its capabilities—offering dynamic sampling, multi­backend exports, SLA alerts, and deeper integration with container orchestration platforms—so that developers always have clear, actionable insights into AI‐driven workflows.

```
