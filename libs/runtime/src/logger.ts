import pino from 'pino';

export interface LoggerOptions {
  level?: string;
  pretty?: boolean;
}

export class Logger {
  private static instance: pino.Logger;

  static initialize(options: LoggerOptions = {}): void {
    const { level = 'info', pretty = false } = options;

    this.instance = pino({
      level,
      transport: pretty ? {
        target: 'pino-pretty',
        options: {
          colorize: true
        }
      } : undefined
    });
  }

  static getLogger(): pino.Logger {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance;
  }
} 