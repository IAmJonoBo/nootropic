/**
 * @todo Implement error handling
 * - Add custom error classes
 * - Add error codes
 * - Add error recovery strategies
 * - Add telemetry integration
 */

export class NootropicError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "NootropicError";
  }
}

export class AgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentError';
  }
}

export class AdapterError extends NootropicError {
  constructor(
    message: string,
    public readonly adapterId: string,
    context?: Record<string, unknown>,
  ) {
    super(message, "ADAPTER_ERROR", { adapterId, ...context });
    this.name = "AdapterError";
  }
}

export class RuntimeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "RuntimeError";
  }
}

export class ConfigurationError extends RuntimeError {
  constructor(message: string, cause?: Error) {
    super(message, "CONFIG_ERROR", cause);
    this.name = "ConfigurationError";
  }
}

export class ValidationError extends RuntimeError {
  constructor(message: string, cause?: Error) {
    super(message, "VALIDATION_ERROR", cause);
    this.name = "ValidationError";
  }
}

export class InitializationError extends RuntimeError {
  constructor(message: string, cause?: Error) {
    super(message, "INIT_ERROR", cause);
    this.name = "InitializationError";
  }
}

export class ExecutionError extends RuntimeError {
  constructor(message: string, cause?: Error) {
    super(message, "EXECUTION_ERROR", cause);
    this.name = "ExecutionError";
  }
}

export class ResourceError extends RuntimeError {
  constructor(message: string, cause?: Error) {
    super(message, "RESOURCE_ERROR", cause);
    this.name = "ResourceError";
  }
}
