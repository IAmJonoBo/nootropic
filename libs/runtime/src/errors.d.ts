/**
 * @todo Implement error handling
 * - Add custom error classes
 * - Add error codes
 * - Add error recovery strategies
 * - Add telemetry integration
 */
export declare class NootropicError extends Error {
  readonly code: string;
  readonly context?: Record<string, unknown> | undefined;
  constructor(
    message: string,
    code: string,
    context?: Record<string, unknown> | undefined,
  );
}
export declare class AgentError extends NootropicError {
  readonly agentId: string;
  constructor(
    message: string,
    agentId: string,
    context?: Record<string, unknown>,
  );
}
export declare class AdapterError extends NootropicError {
  readonly adapterId: string;
  constructor(
    message: string,
    adapterId: string,
    context?: Record<string, unknown>,
  );
}
export declare class RuntimeError extends Error {
  readonly code: string;
  readonly cause?: Error | undefined;
  constructor(message: string, code: string, cause?: Error | undefined);
}
export declare class ConfigurationError extends RuntimeError {
  constructor(message: string, cause?: Error);
}
export declare class ValidationError extends RuntimeError {
  constructor(message: string, cause?: Error);
}
export declare class InitializationError extends RuntimeError {
  constructor(message: string, cause?: Error);
}
export declare class ExecutionError extends RuntimeError {
  constructor(message: string, cause?: Error);
}
export declare class ResourceError extends RuntimeError {
  constructor(message: string, cause?: Error);
}
