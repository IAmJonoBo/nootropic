# ReflexionAdapter

Summary

The ReflexionAdapter serves as the real-time event‐broker between nootropic's various agents and the underlying ReflexionStateMachine (RSM). It leverages Node.js's EventEmitter or gRPC streams (core concepts ￼ ￼) to emit, filter, buffer, and replay RSM events—such as ModelSwitched, CodeFixApplied, or PlanUpdated—to interested subscribers (e.g., Electron UI, ProjectMgrAgent) ￼ ￼. By implementing bounded event queues with buffer/ejection policies (best practices for message buffering ￼ ￼) and providing a "replay logs on restart" capability (log replay patterns ￼ ￼), ReflexionAdapter ensures robust, low‐latency event propagation even during transient disconnects or downtime ￼ ￼. Configuration parameters—such as maximum queue size, retention period, and debounce intervals—are loaded at startup, enabling dynamic tuning and back‐pressure control ￼ ￼. In the sections that follow, we outline its responsibilities, inputs/outputs, data structures, algorithms/workflow, integration points, configuration, metrics/instrumentation, testing strategies, edge cases, and future enhancements.

⸻

1. Responsibilities
2. Emit & Subscribe to RSM Events
   • Wrap ReflexionStateMachine transitions (e.g., onStateChange, onActionComplete) in OTEL‐instrumented EventEmitter or gRPC streams (Node.js EventEmitter patterns ￼ ￼).
   • Allow downstream components (Electron UI, ProjectMgrAgent, FeedbackAgent) to register listeners or gRPC subscribers for event types (e.g., ModelSwitched, CritiqueReady, PlanUpdated) ￼ ￼.
3. Filter & Classify Events
   • Based on event metadata (e.g., component: "CoderAgent", type: "PatchApplied", priority: "HIGH"), route events to selective subscribers to minimize unnecessary traffic ￼ ￼.
   • Support pattern‐based filters (e.g., subscribe only to events where taskID === "T012" or severity === "CRITICAL") ￼ ￼.
4. Buffer In‐Flight Events
   • Utilize a bounded in-memory ring buffer (size configurable, default 1000 events) to hold events when subscribers are temporarily disconnected or slow to consume ￼ ￼.
   • Implement back‐pressure policies (drop‐oldest or drop‐newest) when buffer capacity is exceeded ￼ ￼.
5. Replay Logs on Restart
   • Persist all buffered events to an append‐only log (e.g., ~/.nootropic/reflexion‐events.log) using a JSON‐lines format ￼ ￼.
   • On startup, read the log from the last checkpoint, replaying missed events to rebuild downstream agent state (log replay best practices ￼ ￼).
6. Handle Subscriber Lifecycle
   • Detect subscriber (Electron UI or ProjectMgrAgent) disconnects via EventEmitter's removeListener or gRPC's stream error callbacks ￼ ￼.
   • On reconnection, replay buffered events up to a retention TTL, then drop stale events (retention period best practices ￼ ￼).
7. Metrics, Instrumentation & Back‐Pressure
   • Track queue length (reflexionAdapter.buffer\_size gauge), enqueue/dequeue rates (reflexionAdapter.enqueue\_count counter), and dropped events (reflexionAdapter.drop\_count counter) via ObservabilityAdapter ￼ ￼.
   • If queue length exceeds high‐water mark (e.g., 80% of capacity), emit an OTEL event or span (reflexionAdapter.high\_buffer\_alert) to trigger back‐pressure strategies at the source (e.g., slow down RSM emissions) ￼ ￼.

⸻

2. Inputs & Outputs

2.1 Inputs

1. ReflexionStateMachine Transitions
   • RSM events encapsulated as objects:

interface RSMEvent {
eventID: string; // Unique UUID (e.g., "evt-20250605-01")
eventType: string; // e.g., "ModelSwitched", "CodeFixApplied"
component: string; // Originating agent (e.g., "ModelAdapter")
timestamp: string; // ISO‐8601 (UTC)
payload: any; // Arbitrary JSON payload (e.g., {modelID: "starcoder2-3b"})
}

````[oai_citation:36‡opentelemetry.io](https://opentelemetry.io/docs/specs/semconv/general/events/?utm_source=chatgpt.com) [oai_citation:37‡mainak-saha.medium.com](https://mainak-saha.medium.com/agentic-ai-patterns-demystifying-react-reflexion-and-auto-gpt-93dcec305611?utm_source=chatgpt.com).


 2. Subscriber Registration Calls
 • From Electron UI or ProjectMgrAgent:

type EventFilter = (event: RSMEvent) => boolean;
function subscribe(eventType: string, filter: EventFilter, callback: (event: RSMEvent) => void): void;
```  [oai_citation:38‡nodejs.org](https://nodejs.org/en/learn/asynchronous-work/the-nodejs-event-emitter?utm_source=chatgpt.com) [oai_citation:39‡medium.com](https://medium.com/software-architecture-foundations/low-latency-event-driven-systems-with-grpc-and-cloudevents-ac479b0b4bdc?utm_source=chatgpt.com).


 3. Configuration Parameters
 • Loaded from ~/.nootropic/config.json:

{
  "reflexionAdapter": {
    "maxQueueSize": 1000,
    "eventRetentionHours": 48,
    "bufferPolicy": "dropOldest",   // or "dropNewest"
    "logFilePath": "~/.nootropic/reflexion-events.log",
    "highWaterMarkPercent": 80,
    "replayDebounceMs": 100
  }
}
```  [oai_citation:40‡naukri.com](https://www.naukri.com/code360/library/the-node-js-event-emitter?utm_source=chatgpt.com) [oai_citation:41‡hookdeck.com](https://hookdeck.com/webhooks/guides/what-causes-webhooks-downtime-how-handle-issues?utm_source=chatgpt.com).



2.2 Outputs
 1. Real‐Time Event Emission
 • Calls subscriberCallback(event) synchronously or via Node.js's process.nextTick to ensure non‐blocking  ￼ ￼.
 2. Buffered Event Storage
 • Maintains an in‐memory queue (Array<RSMEvent>) up to maxQueueSize  ￼ ￼.
 3. Persisted Event Log
 • Appends each enqueued event to reflexion‐events.log as a JSON line:

{"eventID":"evt-20250605-01","eventType":"ModelSwitched","component":"ModelAdapter","timestamp":"2025-06-05T12:00:00Z","payload":{"modelID":"starcoder2-3b"}}
```  [oai_citation:46‡stackoverflow.com](https://stackoverflow.com/questions/51440217/replay-a-log-file-with-nodejs-as-if-it-were-happening-in-real-time?utm_source=chatgpt.com) [oai_citation:47‡github.com](https://github.com/adamlundrigan/nodejs-logreplay?utm_source=chatgpt.com).


 4. Replay Emissions on Startup
 • After loading persisted log file, emits all events whose timestamp ≥ (now − eventRetentionHours) in chronological order  ￼ ￼.
 5. Metrics Exposed
 • Via ObservabilityAdapter:
 • reflexionAdapter.buffer_size (gauge)  ￼ ￼.
 • reflexionAdapter.enqueue_count (counter)  ￼ ￼.
 • reflexionAdapter.drop_count (counter)  ￼ ￼.
 • reflexionAdapter.replay_duration_ms (histogram)  ￼ ￼.

⸻

3. Data Structures

/** Core RSM event emitted by ReflexionStateMachine */
interface RSMEvent {
  eventID: string;
  eventType: string;
  component: string;
  timestamp: string;    // ISO-8601 UTC
  payload: any;
}

/** Subscriber record */
interface Subscriber {
  id: string;                  // Unique subscriber ID (UUID or auto-increment)
  eventType: string;           // e.g., "CodeFixApplied"
  filter: (event: RSMEvent) => boolean;
  callback: (event: RSMEvent) => void;
}

/** In-memory buffer: bounded queue of pending events */
class EventBuffer {
  private queue: RSMEvent[] = [];
  private maxSize: number;
  private policy: "dropOldest" | "dropNewest";

  constructor(maxSize: number, policy: "dropOldest" | "dropNewest") {
    this.maxSize = maxSize;
    this.policy = policy;
  }

  enqueue(event: RSMEvent): void {
    if (this.queue.length >= this.maxSize) {
      if (this.policy === "dropOldest") {
        this.queue.shift();    // Remove oldest  [oai_citation:58‡memtime.com](https://www.memtime.com/blog/buffer-time?utm_source=chatgpt.com) [oai_citation:59‡hookdeck.com](https://hookdeck.com/webhooks/guides/what-causes-webhooks-downtime-how-handle-issues?utm_source=chatgpt.com).
      } else {
        // Skip enqueuing newest event  [oai_citation:60‡memtime.com](https://www.memtime.com/blog/buffer-time?utm_source=chatgpt.com) [oai_citation:61‡hookdeck.com](https://hookdeck.com/webhooks/guides/what-causes-webhooks-downtime-how-handle-issues?utm_source=chatgpt.com).
        return;
      }
    }
    this.queue.push(event);
  }

  dequeue(): RSMEvent | undefined {
    return this.queue.shift();
  }

  size(): number {
    return this.queue.length;
  }
}

/** Plugin or external agent interface */
interface ReflexionAdapter {
  subscribe(subscriber: Subscriber): void;
  unsubscribe(subscriberID: string): void;
  emitEvent(event: RSMEvent): void;
  replayEvents(): Promise<void>;
}

 • RSMEvent encapsulates event metadata common across agents.
 • Subscriber defines how a component registers interest with an event type and optional predicate.
 • EventBuffer implements a bounded queue with drop policy, relying on buffer best practices  ￼ ￼.

⸻

4. Algorithms & Workflow

4.1 Initialization & Startup Replay
 1. Load Configuration
 • Read reflexionAdapter section from ~/.nootropic/config.json (queue size, retention, etc.)  ￼ ￼.
 2. Initialize EventBuffer
 • Instantiate new EventBuffer(maxQueueSize, bufferPolicy)  ￼ ￼.
 3. Load Persistent Log (Replay)
 • Open reflexion‐events.log; for each JSON line:
 • Parse into RSMEvent.
 • If event.timestamp ≥ cutoff (now − eventRetentionHours), enqueue into buffer.
 • After saturating buffer or end‐of‐file, chronologically emit buffered events to subscribers and clear buffer  ￼ ￼.
 4. Start Runner
 • Set up Node.js fs.watch or chokidar watcher on reflexion‐events.log to append new events in real time and enqueue them after debounce of replayDebounceMs  ￼ ￼.

4.2 Event Emission
 1. EmitEvent Invocation
 • Called by ReflexionStateMachine: adapter.emitEvent(event)  ￼ ￼.
 • Inside emitEvent:
 1. Instrument OTEL Span: span = tracer.startSpan("reflexionAdapter.emit", { attributes: {...} })  ￼ ￼.
 2. Persist to Log: Append JSON‐line to reflexion‐events.log asynchronously; on error, buffer to retry queue  ￼ ￼.
 3. Enqueue in EventBuffer: buffer.enqueue(event); if dropped, increment drop_count  ￼ ￼.
 4. Dispatch to Subscribers: For each Subscriber where eventType === subscriber.eventType && subscriber.filter(event), schedule subscriber.callback(event) via process.nextTick or immediate Promise to avoid blocking  ￼ ￼.
 5. Emit Metrics: Update enqueue_count, buffer_size, potentially trigger high_buffer_alert if capacity exceeded  ￼ ￼.
 6. Close Span: span.end().

4.3 Subscription Lifecycle
 1. subscribe(subscriber)
 • Generate a unique subscriberID, store in an in‐memory Map<subscriberID, Subscriber>.
 • Increment active_subscribers_count gauge  ￼ ￼.
 2. unsubscribe(subscriberID)
 • Remove from registry; decrement active_subscribers_count  ￼ ￼.
 3. Handle Subscriber Disconnects
 • In a gRPC streaming scenario, if stream.on('error') or stream.on('end') fires, automatically call unsubscribe(subscriberID) and log the disconnection  ￼ ￼.

4.4 Replay on Demand
 1. replayEvents()
 • Exposed API: Reads reflexion‐events.log from last known offset, enqueues retained events, and emits them to any new subscribers.
 • Debounced by replayDebounceMs to handle log file updates gracefully  ￼ ￼.
 2. Checkpoint Management
 • Maintain a separate pointer (e.g., reflexion_events.offset) to track last replayed byte in the log file  ￼ ￼.
 • On startup, initialize offset to 0 or persisted offset; after each successful replay batch, update offset in a small metadata file  ￼ ￼.

⸻

5. Integration Points
 1. ReflexionStateMachine
 • Calls ReflexionAdapter.emitEvent() whenever its internal state transitions or actions occur, passing along the event payload  ￼ ￼.
 2. Electron UI
 • On UI startup, registers via gRPC stream or EventEmitter listener to receive RSM events (subscribe({eventType: "*", filter: (...)})) for status indicators and logs  ￼ ￼.
 3. ProjectMgrAgent
 • Subscribes to PlanUpdated, TaskReady, and SprintCompleted events to adjust project timelines and update project-spec.md files accordingly  ￼ ￼.
 4. FeedbackAgent
 • Listens for CodeFixApplied and TestResultReady to correlate user feedback and test outcomes with RSM events for fine‐tuning  ￼ ￼.
 5. ObservabilityAdapter
 • ObservabilityAdapter instruments the internal spans/metrics generated by ReflexionAdapter, exposing them to Prometheus/Jaeger for dashboarding and alerts  ￼ ￼.
 6. Temporal Workflows
 • ReflexionAdapter is used within Temporal activities to reliably persist and replay events across workflow restarts, ensuring durable agent coordination  ￼ ￼.

⸻

6. Configuration

All ReflexionAdapter settings reside under the reflexionAdapter key in ~/.nootropic/config.json:

{
  "reflexionAdapter": {
    // Maximum number of events to hold in buffer
    "maxQueueSize": 1000,

    // Hours to retain events in persistent log for replay
    "eventRetentionHours": 48,

    // Policy when buffer is full: "dropOldest" or "dropNewest"
    "bufferPolicy": "dropOldest",

    // Path to append-only event log for replay
    "logFilePath": "~/.nootropic/reflexion-events.log",

    // Percentage threshold (0–100) to emit high-water mark alerts
    "highWaterMarkPercent": 80,

    // Debounce (ms) for replaying log updates
    "replayDebounceMs": 100,

    // Retention period for events in replay queue (ms)
    "replayRetentionMs": 172800000, // 48 hours in ms

    // Interval (ms) to flush in-memory buffer to disk
    "flushIntervalMs": 5000
  }
}

 • maxQueueSize: Limits memory usage; when exceeded, older events are dropped if bufferPolicy: dropOldest  ￼ ￼.
 • eventRetentionHours: Controls how far back the adapter can replay for late subscribers  ￼ ￼.
 • bufferPolicy: Determines buffer eviction strategy; "dropNewest" would skip adding new events instead  ￼ ￼.
 • logFilePath: Specifies where to append event JSON; must be writable by the process  ￼ ￼.
 • highWaterMarkPercent: Percentage of maxQueueSize at which to emit an alert via ObservabilityAdapter  ￼ ￼.
 • replayDebounceMs: Groups rapid file changes to avoid repeated replay triggers  ￼ ￼.
 • flushIntervalMs: Frequency to flush any buffered disk writes, ensuring durability without excessive I/O  ￼ ￼.

⸻

7. Metrics & Instrumentation

ReflexionAdapter is instrumented via ObservabilityAdapter to emit OpenTelemetry spans and metrics:
 1. Span: reflexionAdapter.emit
 • Fired on each call to emitEvent().
 • Attributes:
 • eventType (e.g., "ModelSwitched")  ￼ ￼.
 • component (originating agent)  ￼ ￼.
 • enqueueLatencyMs (time to append to buffer)  ￼ ￼.
 • persistLatencyMs (time to write to log)  ￼ ￼.
 2. Counter: reflexionAdapter.enqueue_count
 • Total number of events successfully enqueued.  ￼ ￼.
 3. Counter: reflexionAdapter.drop_count
 • Incremented when events are dropped due to buffer overflow under dropOldest/dropNewest policy  ￼ ￼.
 4. Gauge: reflexionAdapter.buffer_size
 • Current number of events in the in-memory buffer.  ￼ ￼.
 5. Histogram: reflexionAdapter.replay_duration_ms
 • Records durations for replaying buffered events after restart or on-demand; used to ensure replay is within SLA.  ￼ ￼.
 6. Counter: reflexionAdapter.subscribers_count
 • Number of active subscribers registered via subscribe().  ￼ ￼.
 7. Span: reflexionAdapter.replay
 • Fired when replayEvents() is invoked.
 • Attributes:
 • eventsReplayedCount  ￼ ￼.
 • replayLatencyMs  ￼ ￼.

These metrics help detect when event ingestion is lagging, when excessive drops occur, and when replay is taking too long, enabling automated alerts and dynamic scaling or flow‐control adjustments  ￼ ￼.

⸻

8. Testing & Validation

8.1 Unit Tests
 1. Buffer Behavior
 • Fill EventBuffer to maxQueueSize + 2 under bufferPolicy: "dropOldest"; verify that only the newest maxQueueSize events remain and drop_count increments accordingly  ￼ ￼.
 • Repeat under bufferPolicy: "dropNewest"; confirm earliest maxQueueSize events are preserved.
 2. Event Serialization & Persistence
 • Create a mock RSMEvent and call emitEvent().
 • Read the first line of reflexion‐events.log and assert it matches JSON‐stringified event  ￼ ￼.
 3. Replay Logic
 • Seed reflexion‐events.log with three events: one older than eventRetentionHours, two recent.
 • Invoke replayEvents(), verify only two recent events are emitted, and buffer size reflects those two  ￼ ￼.
 4. Subscriber Filtering
 • Register two subscribers: one for eventType: "CodeFixApplied", another with filter: (e) => e.payload.severity === "HIGH".
 • Emit multiple events with varying eventType and severity; verify only matching subscribers receive callbacks  ￼ ￼.

8.2 Integration Tests
 1. End‐to‐End Agent Coordination
 • Start a minimal ReflexionStateMachine instance.
 • Register ProjectMgrAgent subscriber to PlanUpdated and Electron UI subscriber to ModelSwitched.
 • Trigger RSM to switch model via ModelAdapter, causing ModelSwitched event. Confirm both subscribers receive events.  ￼ ￼.
 2. Crash & Restart Recovery
 • Emit three events, then forcibly terminate the process (simulated crash).
 • Restart ReflexionAdapter; confirm replayEvents() emits the two retained events (under retention policy) to newly registered subscribers  ￼ ￼.
 3. High‐Volume Throughput
 • Simulate rapid emission of 10,000 events.
 • Measure average emitEvent() latency (should remain < 5ms on average)  ￼ ￼.
 • Confirm buffer never exceeds maxQueueSize and drops are logged accordingly.

8.3 End‐to‐End Workflow Validation
 1. Temporal Workflow Integration
 • Set up a small Temporal workflow where ReflexionAdapter emits events at each activity completion.
 • Kill the workflow worker mid‐execution; restart it, and ensure workflow continues from last event via replay logic.
 2. Subscriber Disconnection & Backfilling
 • Register a long‐lived subscriber, then disconnect it (e.g., close gRPC stream).
 • Emit 50 events while disconnected; after reconnection, verify subscriber receives all 50 (or those within retention window).

⸻

9. Edge Cases & Failure Modes
 1. Subscriber Disconnects
 • If a subscriber's callback throws an uncaught error, wrap callback execution in a try/catch and unsubscribe that subscriber to prevent crash  ￼ ￼.
 • On gRPC stream error (e.g., network partition), automatically buffer events and attempt replay upon reconnect.
 2. Event Backlog Overflow
 • When EventBuffer is full, apply bufferPolicy. Under "dropOldest," older events are lost; under "dropNewest," new events are dropped.
 • Emit an OTEL span reflexionAdapter.drop_event with attributes: eventID, reason: "bufferOverflow", and policy  ￼ ￼.
 3. Corrupted Log File
 • If reflexion‐events.log contains malformed JSON (partial write or crash), catch parse errors in replayEvents(), skip corrupted lines, log warnings, and continue  ￼ ￼.
 4. Time Skew & Clock Drift
 • If system clock jumps (e.g., NTP sync), some events may appear "future‐dated" or "expired."
 • Mitigation: on replay, compare event timestamp to a monotonic clock if possible; drop events with timestamp > (now + skewThreshold) or < (now − eventRetentionHours)  ￼ ￼.
 5. File System Permissions
 • If the process lacks write access to logFilePath, catch errors on append and buffer events in memory until permissions are restored; emit a critical OTEL error span reflexionAdapter.logWriteError.  ￼ ￼.
 6. High‐Cardinality Filters
 • If too many unique filters (e.g., per‐taskID subscriptions), performance may degrade due to per‐event filter evaluations.
 • Mitigation: maintain an index (Map) of subscribers by eventType and pre‐filter to only those, then apply predicate; log a warning if distinct eventType subscriptions exceed a threshold  ￼ ￼.

⸻

10. Future Enhancements
 1. Distributed Event Bus with NATS/Redis
 • Migrate from in-process EventEmitter to an external message broker (e.g., NATS JetStream or Redis Streams) to support multi‐instance or clustered deployments  ￼ ￼.
 2. Schema‐Validated Events
 • Define and enforce an OpenAPI‐ or Protobuf‐based schema for RSMEvent payloads, rejecting malformed events at emit time using Zod or Protobuf validation  ￼ ￼.
 3. Hierarchical Event Topics & Pub/Sub
 • Implement topic‐based routing (e.g., reflexion.<component>.<eventType>) and allow wildcard subscriptions, similar to GNATS or MQTT patterns, for finer‐grained control  ￼ ￼.
 4. Automatic Subscriber Discovery
 • Use a plugin‐based registry (via PluginLoaderAdapter) to dynamically register subscribers without manual code changes, enabling third‐party integrations  ￼ ￼.
 5. Batching & Rate Limiting
 • Add support for batching events into a single gRPC frame or HTTP push to reduce network overhead, with configurable batch size and interval  ￼ ￼.

⸻

11. Summary

The ReflexionAdapter is the cornerstone of nootropic's reflexion-powered ecosystem, providing a highly resilient, low-latency event bus that guarantees reliable delivery of RSM events to diverse subscribers—whether in‐process (EventEmitter) or over networked gRPC streams  ￼ ￼. By employing bounded buffering, configurable drop policies, log‐based replay, and OTEL instrumentation, it handles transient subscriber disconnects, event backlog overflows, and process restarts gracefully  ￼ ￼. With thoughtfully defined data structures, subscription APIs, and integration hooks, ReflexionAdapter ensures that system state changes (model switches, code fixes, plan updates) propagate consistently to the UI, agents, and orchestration layers. As nootropic scales, planned enhancements—such as distributed brokers, topic‐based routing, and schema validation—will extend its capabilities, further solidifying its role as the glue connecting AI-driven agents into a coherent, self-healing workflow.
```
