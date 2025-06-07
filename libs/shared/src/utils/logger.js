import pino from "pino";
export class Logger {
  constructor(context, options = {}) {
    this.context = context;
    const { level = "info", pretty = false } = options;
    this.logger = pino({
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
  /**
   * @todo Implement log methods
   * - Add structured logging
   * - Add telemetry hooks
   * - Add log rotation
   */
  info(message, ...args) {
    this.logger.info(`[${this.context}] ${message}`, ...args);
  }
  error(message, error) {
    this.logger.error(`[${this.context}] ${message}`, error);
  }
  warn(message, ...args) {
    this.logger.warn(`[${this.context}] ${message}`, ...args);
  }
  debug(message, ...args) {
    this.logger.debug(`[${this.context}] ${message}`, ...args);
  }
}
//# sourceMappingURL=logger.js.map
