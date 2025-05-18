/**
 * Initialize OpenTelemetry tracing and metrics for the agent framework.
 * - Uses GenAI/OTel semantic conventions for AI/LLM/agent events
 * - Propagates context across async/event-driven boundaries
 * - Sanitizes sensitive data before export (see collector config)
 * - Extensible: users can override exporters, add custom spans, etc.
 */
export declare function initTelemetry(serviceName?: string): void;
/**
 * Shutdown OpenTelemetry SDK (for graceful shutdown in tests/CLI)
 */
export declare function shutdownTelemetry(): Promise<void>;
/**
 * Get the global OTel Meter for custom metrics (ensure initTelemetry is called first)
 */
export declare function getMeter(name?: string, version?: string): import("@opentelemetry/api").Meter;
/**
 * Get the global OTel Tracer for custom spans (ensure initTelemetry is called first)
 */
export declare function getTracer(name?: string, version?: string): import("@opentelemetry/api").Tracer;
