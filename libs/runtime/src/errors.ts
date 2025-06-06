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
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'NootropicError';
  }
}

export class AgentError extends NootropicError {
  constructor(
    message: string,
    public readonly agentId: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'AGENT_ERROR', { agentId, ...context });
    this.name = 'AgentError';
  }
}

export class AdapterError extends NootropicError {
  constructor(
    message: string,
    public readonly adapterId: string,
    context?: Record<string, unknown>
  ) {
    super(message, 'ADAPTER_ERROR', { adapterId, ...context });
    this.name = 'AdapterError';
  }
}

export class InitializationError extends NootropicError {
  constructor(message: string) {
    super(message);
    this.name = 'InitializationError';
  }
}

export class ConfigurationError extends NootropicError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class ResourceError extends NootropicError {
  constructor(message: string) {
    super(message);
    this.name = 'ResourceError';
  }
}

export class ValidationError extends NootropicError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
} 