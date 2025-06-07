import pinoModule from "pino";
const pino = pinoModule.default;

/**
 * @todo Implement logger utility
 * - Add log levels
 * - Configure output format
 * - Add telemetry integration
 * - Add file rotation
 */

export interface LoggerOptions {
  level?: string;
  pretty?: boolean;
}

export class Logger {
  private logger: any;

  constructor(context: string, options: LoggerOptions = {}) {
    const { level = "info", pretty = false } = options;

    this.logger = pino({
      name: context || "nootropic",
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
