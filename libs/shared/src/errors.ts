export class NootropicError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "NootropicError";
  }
}

export class ConfigurationError extends NootropicError {
  constructor(message: string) {
    super(message, "CONFIG_ERROR");
    this.name = "ConfigurationError";
  }
}

export class ValidationError extends NootropicError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AgentError extends NootropicError {
  constructor(message: string, public cause?: unknown) {
    super(message, "AGENT_ERROR");
    this.name = "AgentError";
  }
}
