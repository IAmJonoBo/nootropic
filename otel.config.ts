/**
 * OpenTelemetry configuration for nootropic (2025 best practices)
 *
 * - Follows GenAI/AI Agent semantic conventions: https://github.com/open-telemetry/semantic-conventions/blob/main/docs/genai/README.md
 * - Baked-in instrumentation is opt-in via config.
 * - Extend this file to customize OTel exporters, resource attributes, and semantic conventions.
 *
 * See: https://opentelemetry.io/blog/2025/ai-agent-observability/
 */

export interface OTelConfig {
  /** Enable or disable baked-in OpenTelemetry instrumentation */
  enableInstrumentation: boolean;
  /** Optional: OTel exporter endpoint */
  exporterEndpoint?: string;
  /** Optional: Resource attributes (e.g., service.name, ai.agent.framework) */
  resourceAttributes?: Record<string, string>;
}

export const defaultOTelConfig: OTelConfig = {
  enableInstrumentation: false,
  exporterEndpoint: '',
  resourceAttributes: {
    'service.name': 'nootropic',
    'ai.agent.framework': 'nootropic',
    // Add more attributes as needed
  },
};

// Usage: import { defaultOTelConfig } from './otel.config'; 