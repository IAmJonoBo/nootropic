export interface RuntimeConfig {
  debug: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  maxRetries: number;
  timeout: number;
}

export interface RuntimeContext {
  config: RuntimeConfig;
  startTime: number;
  isRunning: boolean;
}
