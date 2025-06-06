/**
 * @todo Implement constants
 * - Add configuration constants
 * - Define error codes
 * - Add telemetry constants
 * - Add capability constants
 */

export const CONFIG = {
  /**
   * @todo Define configuration constants
   * - Add environment variables
   * - Add default values
   * - Add validation
   */
  DEFAULT_MODEL: 'gpt-4',
  DEFAULT_STORAGE: 'chroma',
  TELEMETRY_ENABLED: true,
  MAX_RETRIES: 3,
  TIMEOUT_MS: 30000
} as const;

export const ERROR_CODES = {
  /**
   * @todo Define error codes
   * - Add error categories
   * - Add error messages
   * - Add recovery strategies
   */
  INITIALIZATION_ERROR: 'E001',
  CONNECTION_ERROR: 'E002',
  EXECUTION_ERROR: 'E003',
  VALIDATION_ERROR: 'E004'
} as const;

export const TELEMETRY = {
  /**
   * @todo Define telemetry constants
   * - Add metric names
   * - Add event types
   * - Add sampling rates
   */
  METRICS: {
    LATENCY: 'latency_ms',
    TOKENS: 'tokens_used',
    ERRORS: 'error_count'
  },
  EVENTS: {
    AGENT_START: 'agent.start',
    AGENT_END: 'agent.end',
    CAPABILITY_EXECUTE: 'capability.execute'
  }
} as const;
