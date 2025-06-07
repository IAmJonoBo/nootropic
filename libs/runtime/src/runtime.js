const DEFAULT_CONFIG = {
  debug: false,
  logLevel: "info",
  maxRetries: 3,
  timeout: 30000,
};
export class Runtime {
  constructor(config = {}) {
    this.context = {
      config: { ...DEFAULT_CONFIG, ...config },
      startTime: Date.now(),
      isRunning: false,
    };
  }
  start() {
    this.context.isRunning = true;
    this.context.startTime = Date.now();
  }
  stop() {
    this.context.isRunning = false;
  }
  getContext() {
    return { ...this.context };
  }
  getConfig() {
    return { ...this.context.config };
  }
  updateConfig(config) {
    this.context.config = { ...this.context.config, ...config };
  }
}
//# sourceMappingURL=runtime.js.map
