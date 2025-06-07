export declare class NootropicError extends Error {
  code: string;
  constructor(message: string, code: string);
}
export declare class ConfigurationError extends NootropicError {
  constructor(message: string);
}
export declare class ValidationError extends NootropicError {
  constructor(message: string);
}
