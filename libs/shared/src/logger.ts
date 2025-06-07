import pinoModule from "pino";
const pino = pinoModule.default;

export class Logger {
  private logger: any;

  constructor(context?: string) {
    this.logger = pino({
      name: context || "nootropic",
      level: process.env.LOG_LEVEL || "info",
    });
  }

  info(message: string, ...args: unknown[]): void {
    this.logger.info(message, ...args);
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (error instanceof Error) {
      this.logger.error({ err: error }, message, ...args);
    } else {
      this.logger.error(message, error, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    this.logger.warn(message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.logger.debug(message, ...args);
  }
}
