import pino from "pino";
export class Logger {
  static initialize(options = {}) {
    const { level = "info", pretty = false } = options;
    this.instance = pino({
      level,
      transport: pretty
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
            },
          }
        : undefined,
    });
  }
  static getLogger() {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance;
  }
}
//# sourceMappingURL=logger.js.map
