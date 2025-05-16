// telemetry.ts
// OpenTelemetry setup for nootropic agent framework (2025 best practices)
// See: https://opentelemetry.io/blog/2025/ai-agent-observability/, https://uptrace.dev/blog/opentelemetry-ai-systems, https://voltagent.dev/docs/

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { metrics, trace } from '@opentelemetry/api';

// Config: opt-in via env/config
// @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
const ENABLE_OTEL = process.env.AIHELPERS_OTEL === '1';

let sdk: NodeSDK | undefined;

/**
 * Initialize OpenTelemetry tracing and metrics for the agent framework.
 * - Uses GenAI/OTel semantic conventions for AI/LLM/agent events
 * - Propagates context across async/event-driven boundaries
 * - Sanitizes sensitive data before export (see collector config)
 * - Extensible: users can override exporters, add custom spans, etc.
 */
export function initTelemetry(serviceName = 'nootropic') {
  if (!ENABLE_OTEL) return;
  if (sdk) return; // Already initialized
  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
    // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
    traceExporter: new OTLPTraceExporter(),
    // @ts-expect-error TS(2741): Property 'collect' is missing in type 'PeriodicExp... Remove this comment to see the full error message
    metricReader: new PeriodicExportingMetricReader({
      // @ts-expect-error TS(2741): Property 'export' is missing in type 'OTLPMetricEx... Remove this comment to see the full error message
      exporter: new OTLPMetricExporter(),
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });
  // @ts-expect-error TS(2339): Property 'start' does not exist on type 'NodeSDK'.
  sdk.start();
  // Optionally: add hooks for custom spans, context propagation, privacy, etc.
  // See OTel/GenAI SIG for AI/LLM/agent semantic conventions
}

/**
 * Shutdown OpenTelemetry SDK (for graceful shutdown in tests/CLI)
 */
export async function shutdownTelemetry() {
  // @ts-expect-error TS(2339): Property 'shutdown' does not exist on type 'NodeSD... Remove this comment to see the full error message
  if (sdk) await sdk.shutdown();
}

/**
 * Get the global OTel Meter for custom metrics (ensure initTelemetry is called first)
 */
export function getMeter(name = 'nootropic', version = '1.0.0') {
  return metrics.getMeter(name, version);
}

/**
 * Get the global OTel Tracer for custom spans (ensure initTelemetry is called first)
 */
export function getTracer(name = 'nootropic', version = '1.0.0') {
  return trace.getTracer(name, version);
}

// Usage:
// import { initTelemetry } from './telemetry';
// initTelemetry(); // Call once at app/agent/plugin startup if OTel is enabled 