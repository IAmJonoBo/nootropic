import { Adapter } from "@nootropic/shared";
/**
 * @todo Implement model adapter
 * - Add model routing
 * - Implement fallback strategy
 * - Add cost tracking
 * - Add performance monitoring
 */
export interface ModelConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}
export interface ModelResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
export declare class ModelAdapter implements Adapter {
  private readonly logger;
  initialize(config: unknown): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}
