/**
 * @todo Implement error handling
 * - Add custom error classes
 * - Add error codes
 * - Add error recovery strategies
 * - Add telemetry integration
 */
export class NootropicError extends Error {
  constructor(message, code, context) {
    super(message);
    this.code = code;
    this.context = context;
    this.name = "NootropicError";
  }
}
export class AgentError extends NootropicError {
  constructor(message, agentId, context) {
    super(message, "AGENT_ERROR", { agentId, ...context });
    this.agentId = agentId;
    this.name = "AgentError";
  }
}
export class AdapterError extends NootropicError {
  constructor(message, adapterId, context) {
    super(message, "ADAPTER_ERROR", { adapterId, ...context });
    this.adapterId = adapterId;
    this.name = "AdapterError";
  }
}
export class RuntimeError extends Error {
  constructor(message, code, cause) {
    super(message);
    this.code = code;
    this.cause = cause;
    this.name = "RuntimeError";
  }
}
export class ConfigurationError extends RuntimeError {
  constructor(message, cause) {
    super(message, "CONFIG_ERROR", cause);
    this.name = "ConfigurationError";
  }
}
export class ValidationError extends RuntimeError {
  constructor(message, cause) {
    super(message, "VALIDATION_ERROR", cause);
    this.name = "ValidationError";
  }
}
export class InitializationError extends RuntimeError {
  constructor(message, cause) {
    super(message, "INIT_ERROR", cause);
    this.name = "InitializationError";
  }
}
export class ExecutionError extends RuntimeError {
  constructor(message, cause) {
    super(message, "EXECUTION_ERROR", cause);
    this.name = "ExecutionError";
  }
}
export class ResourceError extends RuntimeError {
  constructor(message, cause) {
    super(message, "RESOURCE_ERROR", cause);
    this.name = "ResourceError";
  }
}
//# sourceMappingURL=errors.js.map
