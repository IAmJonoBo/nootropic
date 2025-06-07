export class NootropicError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "NootropicError";
  }
}
export class ConfigurationError extends NootropicError {
  constructor(message) {
    super(message, "CONFIG_ERROR");
    this.name = "ConfigurationError";
  }
}
export class ValidationError extends NootropicError {
  constructor(message) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
//# sourceMappingURL=errors.js.map
