import pino from "pino";
export class Logger {
  constructor(context) {
    this.logger = pino({
      name: context || "nootropic",
      level: process.env.LOG_LEVEL || "info",
    });
  }
  info(message, ...args) {
    this.logger.info(message, ...args);
  }
  error(message, error, ...args) {
    if (error instanceof Error) {
      this.logger.error({ err: error }, message, ...args);
    } else {
      this.logger.error(message, error, ...args);
    }
  }
  warn(message, ...args) {
    this.logger.warn(message, ...args);
  }
  debug(message, ...args) {
    this.logger.debug(message, ...args);
  }
}
//# sourceMappingURL=logger.js.map
