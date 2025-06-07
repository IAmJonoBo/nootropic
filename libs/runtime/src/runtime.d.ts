import { RuntimeConfig, RuntimeContext } from "./types";
export declare class Runtime {
  private context;
  constructor(config?: Partial<RuntimeConfig>);
  start(): void;
  stop(): void;
  getContext(): RuntimeContext;
  getConfig(): RuntimeConfig;
  updateConfig(config: Partial<RuntimeConfig>): void;
}
