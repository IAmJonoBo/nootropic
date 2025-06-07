import pinoModule from "pino";
const pino = pinoModule.default;

export interface LoggerOptions {
  level?: string;
  pretty?: boolean;
}

export class Logger {
  private instance: any;

  constructor(context?: string) {
    this.instance = pino({
      name: context || "runtime",
      level: process.env["LOG_LEVEL"] || "info",
    });
  }

  info(message: string, ...args: unknown[]): void {
    this.instance.info(message, ...args);
  }

  error(message: string, error?: Error | unknown, ...args: unknown[]): void {
    if (error instanceof Error) {
      this.instance.error({ err: error }, message, ...args);
    } else {
      this.instance.error(message, error, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    this.instance.warn(message, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.instance.debug(message, ...args);
  }
} 