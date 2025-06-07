import pino from "pino";
export interface LoggerOptions {
  level?: string;
  pretty?: boolean;
}
export declare class Logger {
  private static instance;
  static initialize(options?: LoggerOptions): void;
  static getLogger(): pino.Logger;
}
