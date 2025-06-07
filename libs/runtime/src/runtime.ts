import { RuntimeConfig, RuntimeContext } from "./types.js";

const DEFAULT_CONFIG: RuntimeConfig = {
  debug: false,
  logLevel: "info",
  maxRetries: 3,
  timeout: 30000,
};

export class Runtime {
  private context: RuntimeContext;

  constructor(config: Partial<RuntimeConfig> = {}) {
    this.context = {
      config: { ...DEFAULT_CONFIG, ...config },
      startTime: Date.now(),
      isRunning: false,
    };
  }

  start(): void {
    this.context.isRunning = true;
    this.context.startTime = Date.now();
  }

  stop(): void {
    this.context.isRunning = false;
  }

  getContext(): RuntimeContext {
    return { ...this.context };
  }

  getConfig(): RuntimeConfig {
    return { ...this.context.config };
  }

  updateConfig(config: Partial<RuntimeConfig>): void {
    this.context.config = { ...this.context.config, ...config };
  }
}
