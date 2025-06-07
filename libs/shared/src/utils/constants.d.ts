/**
 * @todo Implement constants
 * - Add configuration constants
 * - Define error codes
 * - Add telemetry constants
 * - Add capability constants
 */
export declare const CONFIG: {
  /**
   * @todo Define configuration constants
   * - Add environment variables
   * - Add default values
   * - Add validation
   */
  readonly DEFAULT_MODEL: "gpt-4";
  readonly DEFAULT_STORAGE: "chroma";
  readonly TELEMETRY_ENABLED: true;
  readonly MAX_RETRIES: 3;
  readonly TIMEOUT_MS: 30000;
};
export declare const ERROR_CODES: {
  /**
   * @todo Define error codes
   * - Add error categories
   * - Add error messages
   * - Add recovery strategies
   */
  readonly INITIALIZATION_ERROR: "E001";
  readonly CONNECTION_ERROR: "E002";
  readonly EXECUTION_ERROR: "E003";
  readonly VALIDATION_ERROR: "E004";
};
export declare const TELEMETRY: {
  /**
   * @todo Define telemetry constants
   * - Add metric names
   * - Add event types
   * - Add sampling rates
   */
  readonly METRICS: {
    readonly LATENCY: "latency_ms";
    readonly TOKENS: "tokens_used";
    readonly ERRORS: "error_count";
  };
  readonly EVENTS: {
    readonly AGENT_START: "agent.start";
    readonly AGENT_END: "agent.end";
    readonly CAPABILITY_EXECUTE: "capability.execute";
  };
};
